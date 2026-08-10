
import { Router } from "express";
import {  OrderController } from "./order.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";


const router = Router();

router.post("/",  OrderController.createOrderController);
router.get("/", auth(UserRole.ADMIN), OrderController.getAllOrdersController);
router.patch("/:orderId/status", auth(UserRole.ADMIN), OrderController.updateOrderStatusController);
router.get("/:id",  OrderController.getOrderByIdController);
export const OrderRoutes = router;

