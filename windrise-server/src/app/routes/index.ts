
import express from "express";
import { authRateLimiter } from "../middlewares/rateLimiter";
import { AuthRoutes } from "../modules/auth/auth.route";
import { UserRoutes } from "../modules/user/user.route";
import { ProductRoutes } from "../modules/product/product.routes";
import { OrderRoutes } from "../modules/order/order.routes";
import { PaymentRoutes } from "../modules/payment/payment.routes";
import { InventoryRoutes } from "../modules/inventory/inventory.routes";


const router = express.Router();

const moduleRoutes = [
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
    // middlewares: [authRateLimiter], // Apply only here
  },
  {
    path: "/product",
    route: ProductRoutes,
  },
  {
    path: "/order",
    route: OrderRoutes,
  },
  {
    path: "/payment",
    route: PaymentRoutes,
  },
  {
    path: "/inventory",
    route: InventoryRoutes,
  }
];

moduleRoutes.forEach((route) => {
  router.use(
    route.path,
    // ...(route.middlewares || []),
    route.route
  );
});

export default router;