import { StatusCodes } from "http-status-codes";

import prisma from "../../../shared/prisma";
import { OrderStatus, PaymentStatus } from "@prisma/client";




import ApiError from "../../errors/ApiError";


import { generateInvoice } from "@/app/utils/invoice";
import { saveInvoicePdf } from "@/app/utils/invoiceUrl";
import {  buildOrderEmailHtml, sendEmail } from "@/app/utils/sendEmail";
import { ISSLCommerz } from "../sslCommerz/sslCommerz.interface";
import { SSLService } from "../sslCommerz/sslCommerz.service";



export const successPayment = async (query: Record<string, string>) => {
  const { transactionId } = query;

  if (!transactionId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Transaction ID is required");
  }

  // ================= FIND PAYMENT ================= //
  const payment = await prisma.payment.findUnique({
    where: { transactionId },
    include: {
      order: {
        include: {
          items: true,
          user: true,
        },
      },
    },
  });

  if (!payment) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Payment not found");
  }

  const order = payment.order;

  // ================= ALREADY PAID (idempotency guard) ================= //
  if (payment.paymentStatus === PaymentStatus.PAID) {
    return {
      success: true,
      message: "Payment already processed",
      orderId: order.id,
      invoiceUrl: order.invoiceUrl,
    };
  }

  // ================= MARK AS PAID (parallel updates inside transaction) ================= //
  await prisma.$transaction(async (tx) => {
    await Promise.all([
      tx.payment.update({
        where: { id: payment.id },
        data: {
          paymentStatus: PaymentStatus.PAID,
          paidAt: new Date(),
        },
      }),
      tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: PaymentStatus.PAID,
          orderStatus: OrderStatus.CONFIRMED,
        },
      }),
    ]);
  });

  // ================= FIRE-AND-FORGET: PDF + EMAIL + INVOICE URL SAVE ================= //
  // Response is returned immediately — PDF generation runs in background
  setImmediate(async () => {
    try {
      // Use the order number generated when the order was created.
      const orderSerialId = order.orderNo;

      const pdfBuffer = await generateInvoice({
        id: order.id,
        orderSerial: orderSerialId,
        checkoutEmail: order.checkoutEmail,
        name: order.name,
        phone: order.phone,
        address: order.address,
        state: order.state,
        paymentMethod: "Online Payment (SSLCommerz)",
        paymentStatus: "PAID",
        deliveryType: order.deliveryType,
        deliveryCharge: Number(order.deliveryCharge),
        subtotal: order.subtotal,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        items: order.items.map((item) => ({
          productName: item.productName,
          price: item.price,
          quantity: item.quantity,
          total: item.total,
          color: item.color,
          size: item.size,
          sku: item.sku,
        })),
      });

      // Save PDF + update both records in parallel
      const [invoiceUrl] = await Promise.all([
        saveInvoicePdf(pdfBuffer, `invoice-${order.id}`),
        // DB updates and email kicked off after invoiceUrl is ready below
      ]);

      // FIX: check both registered user email AND guest checkoutEmail
      const emailToSend = order.user?.email ?? order.checkoutEmail ?? null;

      await Promise.all([
        // Save invoiceUrl to both payment and order in parallel
        prisma.payment.update({
          where: { id: payment.id },
          data: { invoiceUrl },
        }),
        prisma.order.update({
          where: { id: order.id },
          data: { invoiceUrl },
        }),
        // Send email (skipped silently if no address found)
        emailToSend
          ? sendEmail({
              to: emailToSend,
              subject: "Payment Successful — Your Order Invoice",
              html: buildOrderEmailHtml({
                ...order,
                paymentMethod: "Online (SSLCommerz)",
                paymentStatus: "PAID",
              }),
              attachments: [
                {
                  filename: `invoice-${order.id}.pdf`,
                  content: pdfBuffer,
                  contentType: "application/pdf",
                },
              ],
            })
          : Promise.resolve(),
      ]);
    } catch (err) {
      // Order is already confirmed — log but never crash
      console.error(`[Payment ${payment.id}] Post-processing failed:`, err);
    }
  });

  // Return immediately — don't wait for PDF/email
  return {
    success: true,
    message: "Payment processed successfully",
    orderId: order.id,
    // invoiceUrl will be null here (generated in background) — frontend
    // should poll or use a webhook if it needs the URL immediately
    invoiceUrl: order.invoiceUrl ?? null,
  };
};

/**===============================================
 *=============== FAIL PAYMENT =================
 =================================================*/
const failPayment = async (query: Record<string, string>) => {
    const { transactionId } = query;

    if (!transactionId) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Transaction ID missing");
    }

    const payment = await prisma.payment.findUnique({
        where: { transactionId },
    });

    if (!payment) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Payment not found");
    }

    //================ Prevent double update ================//
    if (payment.paymentStatus === PaymentStatus.PAID) {
        return { success: false, message: "Payment already completed" };
    }

    await prisma.$transaction(async (tx) => {
        await tx.payment.update({
            where: { id: payment.id },
            data: {
                paymentStatus: PaymentStatus.FAILED,
                failedAt: new Date(),
            },
        });

        await tx.order.update({
            where: { id: payment.orderId },
            data: {
                paymentStatus: PaymentStatus.FAILED,
                orderStatus: OrderStatus.PENDING
            },
        });
    });

    return { success: true, message: "Payment failed" };
};


/**===============================================
 *=============== CANCEL PAYMENT =================
 =================================================*/
const cancelPayment = async (query: Record<string, string>) => {
    const { transactionId } = query;

    if (!transactionId) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Transaction ID missing");
    }

    const payment = await prisma.payment.findUnique({
        where: { transactionId },
    });

    if (!payment) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Payment not found");
    }

    // Prevent double update
    if (payment.paymentStatus === PaymentStatus.PAID) {
        return { success: false, message: "Payment already completed" };
    }

    await prisma.$transaction(async (tx) => {
        await tx.payment.update({
            where: { id: payment.id },
            data: {
                paymentStatus: PaymentStatus.CANCELED,
                cancelledAt: new Date(),
            },
        });

        await tx.order.update({
            where: { id: payment.orderId },
            data: {
                paymentStatus: PaymentStatus.CANCELED,
                orderStatus: OrderStatus.PENDING,
            },
        });
    });

    return { success: true, message: "Payment cancelled" };
};

const initPayment = async (orderId: string) => {
    //============= 1 Find the order ==================//
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { payment: true, user: true ,  items: true,},
    });

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    const payment = order.payment;

    if (!payment) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Payment record not found for this order");
    }
    //=============== 3 Prepare SSLCommerz payload ==================//
    const sslPayload: ISSLCommerz = {
        name: order.name,
        email: (order.user as any)?.email || order.checkoutEmail,
        phone: order.phone,
        address: order.address,
        totalAmount: Number(payment.amount),
        transactionId: payment.transactionId,
    };


    //================ 4 Call SSLCommerz API ==================//
    const sslPayment = await SSLService.sslPaymentInit(sslPayload);

    //================ 5 Return payment URL ==================//
    return {
        paymentUrl: sslPayment.GatewayPageURL,
    };
};

export const PaymentService = {
    successPayment,
    failPayment,
    cancelPayment,
    initPayment
};