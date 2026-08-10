import { StatusCodes } from "http-status-codes";
import prisma from "../../../shared/prisma";
import ApiError from "../../errors/ApiError";
import { CreateOrderDTO } from "./order.interface";

import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
} from "@prisma/client";
import { orderSearchableFields } from "./order.constant";

import { generateInvoice } from "@/app/utils/invoice";
import { saveInvoicePdf } from "@/app/utils/invoiceUrl";
import { buildOrderEmailHtml, sendEmail } from "@/app/utils/sendEmail";
import { DELIVERY_CHARGE } from "@/config/delivery.config";
import { parseDeliveryType } from "@/app/utils/parseDeliveryType";
import { SSLService } from "../sslCommerz/sslCommerz.service";
import { paginationHelper } from "@/app/helpers/paginationHelper";


                       
export const getTransactionId = () => {
  return "TXN_" + Date.now() + "_" + Math.floor(Math.random() * 10000);
};

export const generateOrderSerial = async (): Promise<string> => {
  let orderNo = '';
  let exists = true;
  let attempts = 0;
  const maxAttempts = 10;

  while (exists && attempts < maxAttempts) {
    orderNo = Math.floor(100000 + Math.random() * 900000).toString();
    const existing = await prisma.order.findUnique({ where: { orderNo } });
    exists = Boolean(existing);
    attempts++;
  }

  if (exists) {
    throw new Error('Unable to generate a unique order number');
  }

  return orderNo;
};

// =========================
// Shared helper: fire-and-forget PDF + Email
// Called after both COD order creation AND online payment confirmation
// =========================
export async function sendOrderConfirmationAsync({
  result,
  orderSerialId,
  paymentMethod,
  paymentStatus,
  userEmail,
  checkoutEmail,
}: {
  result: any;
  orderSerialId: string;
  paymentMethod: "COD" | "ONLINE";
  paymentStatus: string;
  userEmail?: string;
  checkoutEmail?: string;
}) {
  setImmediate(async () => {
    try {
      const pdfBuffer = await generateInvoice({
        id: result.id,
        orderSerial: orderSerialId,

        name: result.name,
        phone: result.phone,
        address: result.address,
        state: result.state,

        checkoutEmail: result.checkoutEmail,

        paymentMethod:
          paymentMethod === "COD" ? "Cash on Delivery" : "SSLCommerz",
        paymentStatus,

        subtotal: result.subtotal,
        totalAmount: result.totalAmount,

        deliveryType: result.deliveryType,
        deliveryCharge: result.deliveryCharge,

        createdAt: result.createdAt,

        items: result.items.map((item: any) => ({
          productName: item.productName,
          price: item.price,
          quantity: item.quantity,
          total: item.total,
          color: item.color,
          size: item.size,
          sku: item.sku,
        })),
      });

      const emailToSend = userEmail || checkoutEmail || result.checkoutEmail;

      // Save PDF + send email in parallel (one email only)
      const [invoiceUrl] = await Promise.all([
        saveInvoicePdf(pdfBuffer, `invoice-${result.id}`),
        emailToSend
          ? sendEmail({
              to: emailToSend,
              subject:
                paymentMethod === "COD"
                  ? "Your Order Invoice"
                  : "Payment Successful — Your Order Invoice",
              html: buildOrderEmailHtml({
                ...result,
                paymentMethod:
                  paymentMethod === "COD" ? "Cash on Delivery" : "SSLCommerz",
                paymentStatus,
              }),
              attachments: [
                {
                  filename: `invoice-${result.id}.pdf`,
                  content: pdfBuffer,
                  contentType: "application/pdf",
                },
              ],
            })
          : Promise.resolve(),
      ]);

      // Update invoiceUrl in DB (non-blocking, already outside transaction)
      await Promise.all([
        prisma.order.update({
          where: { id: result.id },
          data: { invoiceUrl },
        }),
        prisma.payment.update({
          where: { id: result.payment.id },
          data: { invoiceUrl },
        }),
      ]);

      result.invoiceUrl = invoiceUrl;
      result.payment.invoiceUrl = invoiceUrl;
    } catch (err) {
      // Log but don't crash — order is already confirmed
      console.error(`[Order ${result.id}] Post-processing failed:`, err);
    }
  });
}

const createOrderService = async ({
  payload,
  userId,
  userEmail,
}: {
  payload: CreateOrderDTO;
  userId?: string;
  userEmail?: string;
}) => {
  const {
    deliveryInfo,
    billingInfo,
    cartItems,
    paymentMethod,
    deliveryType,
    checkoutEmail,
  } = payload;

  // =========================
  // Basic Validation
  // =========================

  if (!cartItems || cartItems.length === 0) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Cart is empty");
  }

  const deliveryCharge = DELIVERY_CHARGE[deliveryType];

  if (deliveryCharge === undefined) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid delivery option");
  }

  const orderSerialId = await generateOrderSerial();

  // =========================
  // PREPARE DATA OUTSIDE TRANSACTION
  // Batch fetch all products + variants in ONE round-trip (2 DB calls instead of 2*N)
  // =========================

  const productIds = cartItems.map((item) => item.productId);

  const [allProducts, allVariants] = await Promise.all([
    prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { images: true },
    }),
    prisma.variant.findMany({
      where: { productId: { in: productIds } },
    }),
  ]);

  const productMap = new Map(allProducts.map((p) => [p.id, p]));

  // Validate and prepare order items (pure CPU work, no DB)
  let subtotal = 0;
  const preparedOrderItems = cartItems.map((item) => {
    const product = productMap.get(item.productId);

    if (!product) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Product not found");
    }

    const variant = allVariants.find(
      (v) =>
        v.productId === item.productId &&
        v.color === item.color &&
        v.size === item.size,
    );

    if (!variant) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Variant not found");
    }

    if (variant.quantity < item.quantity) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Insufficient stock for ${product.name} ${item.color} ${item.size}`,
      );
    }

    const price = product.salePrice ?? product.regularPrice;
    const total = price * item.quantity;
    subtotal += total;

    return {
      productId: product.id,
      productName: product.name,
      variantId: variant.id,
      price,
      quantity: item.quantity,
      total,
      color: item.color,
      size: item.size,
      sku: product.sku,
      productImage: product.images?.[0]?.url || null,
    };
  });

  const totalAmount = subtotal + deliveryCharge;

  // =========================
  // FAST TRANSACTION: only DB writes inside, no PDF/email
  // All stock decrements run in parallel
  // =========================

  const result = await prisma.$transaction(async (tx) => {
    // Create Order
    const order = await tx.order.create({
      data: {
        orderNo: orderSerialId,
        user: userId ? { connect: { id: userId } } : undefined,

        name: deliveryInfo.name,
        phone: deliveryInfo.phone,
        state: deliveryInfo.state,
        address: deliveryInfo.address,

        billingName: billingInfo?.name ?? null,
        billingPhone: billingInfo?.phone ?? null,
        billingEmail: billingInfo?.email ?? null,
        billingState: billingInfo?.state ?? null,
        billingAddress: billingInfo?.address ?? null,

        deliveryCharge,

        checkoutEmail: userEmail ?? checkoutEmail,

        deliveryType: parseDeliveryType(deliveryType),

        subtotal,
        totalAmount,

        paymentMethod:
          paymentMethod === "ONLINE" ? PaymentMethod.ONLINE : PaymentMethod.COD,

        orderStatus: "PENDING",
        paymentStatus: "UNPAID",

        items: {
          create: preparedOrderItems,
        },
      },
      include: {
        items: true,
      },
    });

    const createdOrder = order as typeof order & { items: typeof preparedOrderItems };

    // Run ALL stock decrements in parallel
    await Promise.all(
      cartItems.flatMap((item) => [
        tx.variant.updateMany({
          where: {
            productId: item.productId,
            color: item.color,
            size: item.size,
          },
          data: { quantity: { decrement: item.quantity } },
        }),
        tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { decrement: item.quantity } },
        }),
      ]),
    );

    // Create Payment record
    const payment = await tx.payment.create({
      data: {
        orderId: order.id,
        orderNo: orderSerialId,
        transactionId: getTransactionId(),
        paymentStatus: PaymentStatus.UNPAID,
        amount: totalAmount,
        currency: "BDT",
        paymentMethod: paymentMethod === "ONLINE" ? "SSLCommerz" : "COD",
        invoiceUrl: null,
      },
    });

    return {
      ...createdOrder,
      payment,
      deliveryType,
      deliveryCharge,
      items: createdOrder.items,
    };
  });

  // =========================
  // AFTER TRANSACTION — fire-and-forget (never blocks the response)
  // COD: send confirmation email immediately
  // ONLINE: email is sent from your payment callback/IPN after payment succeeds
  // =========================

  if (paymentMethod === "COD") {
    sendOrderConfirmationAsync({
      result,
      orderSerialId,
      paymentMethod: "COD",
      paymentStatus: "UNPAID",
      userEmail,
      checkoutEmail,
    });

    return {
      order: result,
      deliveryCharge: result.deliveryCharge,
    };
  }

  // ================== Online Payment ==================
  // NOTE: Call sendOrderConfirmationAsync() from your SSLCommerz IPN/callback
  // handler once payment is confirmed, passing paymentMethod: "ONLINE" and
  // paymentStatus: "PAID". Do NOT send email here — payment isn't confirmed yet.

  if (paymentMethod === "ONLINE" && result.payment) {
    const sslPayload = {
      transactionId: result.payment.transactionId,
      totalAmount: Number(result.payment.amount),
      name: result.name,
      email: userEmail ?? result.checkoutEmail ?? "",
      phone: result.phone,
      address: result.address,
    };
    const sslResponse = await SSLService.sslPaymentInit(sslPayload);
    return { order: result, paymentUrl: sslResponse.GatewayPageURL };
  }

  return {
    order: result,
    deliveryCharge: result.deliveryCharge,
  };
};




const getAllOrdersService = async (params: any, options: any) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;
  const andConditions: Prisma.OrderWhereInput[] = [];
  // ============ Search  =============//
  if (searchTerm) {
    andConditions.push({
      OR: orderSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  //=================== Filters  =================//
  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereCondition: Prisma.OrderWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const orders = await prisma.order.findMany({
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    where: whereCondition,
    include: {
      items: true,
      payment: true,
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });
  const total = await prisma.order.count({ where: whereCondition });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: orders,
  };
};

const updateOrderStatusService = async (
  orderId: string,
  status: OrderStatus,
) => {
  return prisma.order.update({
    where: { id: orderId },
    data: { orderStatus: status },
  });
};

const getOrderTrackingService = async (orderId: string, userId: string) => {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId, //  user can see only own order
    },
    
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  return {
    orderStatus: order.orderStatus,
    createdAt: order.createdAt,
  };
};

const getOrderByIdService = async (orderId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      // ── Order items with product thumbnail + variant details ──────────────
      items: {
        include: {
          product: {
            select: {
              thumbnailImage: true,   // Product.thumbnailImage
              salePrice: true,
              regularPrice: true,
            },
          },
          variant: {                  // Variant (color / size / sku)
            select: {
              color: true,
              size: true,
            },
          },
        },
      },
      // ── Authenticated user (optional — guest orders have no user) ─────────
      user: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });
 
  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Order not found");
  }
 
  // ── Shape response to exactly match your schema field names ───────────────
  return {
    id:             order.id,
    orderNo:        order.orderNo,
    createdAt:      order.createdAt.toISOString(),
    updatedAt:      order.updatedAt.toISOString(),
 
    // Delivery / contact info (stored flat on Order)
    name:           order.name,
    phone:          order.phone,
    state:          order.state,
    address:        order.address,
    orderNote:      order.orderNote   ?? null,
    checkoutEmail:  order.checkoutEmail ?? null,

    // Billing info
    billingName:    order.billingName   ?? null,
    billingPhone:   order.billingPhone  ?? null,
    billingEmail:   order.billingEmail  ?? null,
    billingState:   order.billingState  ?? null,
    billingAddress: order.billingAddress ?? null,
 
    // Financials
    subtotal:       order.subtotal,
    totalAmount:    order.totalAmount,
    deliveryCharge: order.deliveryCharge ? Number(order.deliveryCharge) : 0,
    deliveryType:   order.deliveryType  ?? null,   // "inside_dhaka" | "outside_dhaka"
 
    // Status
    orderStatus:    order.orderStatus,    // PENDING | PROCESSING | …
    paymentStatus:  order.paymentStatus,  // UNPAID | PAID | …
    paymentMethod:  order.paymentMethod,  // ONLINE | COD
    invoiceUrl:     order.invoiceUrl ?? null,
 
    // User (null for guests)
    user: order.user
      ? { id: order.user.id, email: order.user.email }
      : null,
 
    // Order items — use the stored snapshot fields (productName, price, total)
    // so the receipt is always accurate even if the product changes later.
    items: order.items.map((item) => ({
      id:           item.id,
      productId:    item.productId,
      productName:  item.productName,           // snapshot field on OrderItem
      price:        item.price,                 // snapshot
      quantity:     item.quantity,
      total:        item.total,                 // snapshot
      color:        item.color  ?? null,
      size:         item.size   ?? null,
      sku:          item.sku    ?? null,
      variantId:    item.variantId ?? null,
      productImage: item.productImage           // snapshot image URL
                    ?? item.product?.thumbnailImage
                    ?? null,
    })),
 
    // Shipment tracking history
   
  };
};
 

export const orderService = {
  createOrderService,
  getAllOrdersService,
  updateOrderStatusService,
  getOrderTrackingService,
  getOrderByIdService
};