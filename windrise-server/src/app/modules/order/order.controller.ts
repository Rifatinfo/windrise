import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { orderService } from "./order.service";
import pick from "../../../shared/pick";
import { orderFilterableFields } from "./order.constant";
import ApiError from "../../errors/ApiError";

const createOrderController = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.id as string | undefined;
    const userEmail = req.user?.email ?? undefined;

    const order = await orderService.createOrderService({
      payload: req.body,
      userId,
      userEmail,
    });

    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: "Order placed successfully",
      data: order,
    });
  },
);

//=================== all order controllers can be added here =================//
const getAllOrdersController = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(req.query, orderFilterableFields);
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);

    const result = await orderService.getAllOrdersService(filters, options);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Orders fetched successfully",
      meta: result.meta,
      data: result.data,
    });
  },
);

const getMyOrdersController = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.id as string;
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);

    const result = await orderService.getMyOrdersService(userId, options);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "My orders fetched successfully",
      meta: result.meta,
      data: result.data,
    });
  },
);

const updateOrderStatusController = catchAsync(
  async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Status is required");
    }
    const result = await orderService.updateOrderStatusService(
      orderId as string,
      status,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Order status updated",
      data: result,
    });
  },
);

const updateOrderPaymentStatusController = catchAsync(
  async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const { paymentStatus } = req.body;

    if (!paymentStatus) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Payment status is required");
    }

    const result = await orderService.updateOrderPaymentStatusService(
      orderId as string,
      paymentStatus,
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Payment status updated",
      data: result,
    });
  },
);

const updateOrderInfoController = catchAsync(
  async (req: Request, res: Response) => {
    const { orderId } = req.params;

    const result = await orderService.updateOrderInfoService(
      orderId as string,
      req.body,
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Order information updated",
      data: result,
    });
  },
);

const getOrderTrackingController = catchAsync(
  async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const userId = req.user?.id as string;

    const result = await orderService.getOrderTrackingService(
      orderId as string,
      userId,
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Order tracking info fetched successfully",
      data: result,
    });
  },
);

const getOrderByIdController = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params; // orderId from  /orders/:id

    const result = await orderService.getOrderByIdService(id as string);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Order fetched successfully",
      data: result,
    });
  }
);

const getOrderByTransactionIdController = catchAsync(
  async (req: Request, res: Response) => {
    const { transactionId } = req.params;

    const result = await orderService.getOrderByTransactionIdService(
      transactionId as string,
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Order fetched successfully",
      data: result,
    });
  },
);

export const OrderController = {
  createOrderController,
  getAllOrdersController,
  getMyOrdersController,
  updateOrderStatusController,
  updateOrderPaymentStatusController,
  updateOrderInfoController,
  getOrderTrackingController,
  getOrderByIdController,
  getOrderByTransactionIdController,
};
