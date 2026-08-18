import { StatusCodes } from "http-status-codes";

import prisma from "../../../shared/prisma";
import ApiError from "../../errors/ApiError";
import { CreateReturnDTO, UpdateReturnDTO } from "./returns.interface";

const createReturnService = async (payload: CreateReturnDTO) => {
  const order = await prisma.order.findUnique({ where: { id: payload.orderId } });
  if (!order) throw new ApiError(StatusCodes.NOT_FOUND, "Order not found");

  const existing = await prisma.orderReturn.findUnique({ where: { orderId: payload.orderId } });
  if (existing) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "A return already exists for this order");
  }

  return prisma.orderReturn.create({
    data: {
      orderId: payload.orderId,
      reason: payload.reason,
      note: payload.note,
      refundAmount: order.totalAmount,
    },
    include: { order: { select: { orderNo: true, name: true, totalAmount: true } } },
  });
};

const getAllReturnsService = async (status?: string) => {
  return prisma.orderReturn.findMany({
    where: status ? { status: status as any } : undefined,
    orderBy: { createdAt: "desc" },
    include: { order: { select: { orderNo: true, name: true, totalAmount: true, createdAt: true } } },
  });
};

const updateReturnService = async (id: string, payload: UpdateReturnDTO) => {
  const existing = await prisma.orderReturn.findUnique({ where: { id } });
  if (!existing) throw new ApiError(StatusCodes.NOT_FOUND, "Return not found");

  return prisma.orderReturn.update({
    where: { id },
    data: {
      ...(payload.status && { status: payload.status }),
      ...(payload.refundStatus && { refundStatus: payload.refundStatus }),
      ...(payload.refundAmount !== undefined && { refundAmount: payload.refundAmount }),
    },
    include: { order: { select: { orderNo: true, name: true, totalAmount: true } } },
  });
};

export const ReturnService = {
  createReturnService,
  getAllReturnsService,
  updateReturnService,
};
