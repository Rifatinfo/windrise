
import express from "express";
import { authRateLimiter } from "../middlewares/rateLimiter";
import { AuthRoutes } from "../modules/auth/auth.route";
import { UserRoutes } from "../modules/user/user.route";


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