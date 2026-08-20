
import express from "express";
import { authRateLimiter } from "../middlewares/rateLimiter";
import { AuthRoutes } from "../modules/auth/auth.route";
import { UserRoutes } from "../modules/user/user.route";
import { ProductRoutes } from "../modules/product/product.routes";
import { OrderRoutes } from "../modules/order/order.routes";
import { PaymentRoutes } from "../modules/payment/payment.routes";
import { InventoryRoutes } from "../modules/inventory/inventory.routes";
import { StatsRoutes } from "../modules/stats/stats.routes";
import { CouponRoutes } from "../modules/coupon/coupon.routes";
import { ReturnRoutes } from "../modules/returns/returns.routes";
import { MarketingRoutes } from "../modules/marketing/marketing.routes";
import { AnalyticsRoutes } from "../modules/analytics/analytics.routes";
import { SettingsRoutes } from "../modules/settings/settings.routes";


const router = express.Router();

const moduleRoutes = [
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/settings",
    route: SettingsRoutes,
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
  },
  {
    path: "/stats",
    route: StatsRoutes,
  },
  {
    path: "/coupon",
    route: CouponRoutes,
  },
  {
    path: "/return",
    route: ReturnRoutes,
  },
  {
    path: "/marketing",
    route: MarketingRoutes,
  },
  {
    path: "/analytics",
    route: AnalyticsRoutes,
  },
];

moduleRoutes.forEach((route) => {
  router.use(
    route.path,
    // ...(route.middlewares || []),
    route.route
  );
});

export default router;