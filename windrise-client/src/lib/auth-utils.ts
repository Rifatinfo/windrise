
export type UserRole =
    | "ADMIN"
    | "CUSTOMER"
    | "SHOP_MANAGER"
    | "MEDIA_MANAGER"
    | "CUSTOMER_SUPPORT";

export type RouteConfig = {
    exact: string[],
    patterns: RegExp[],
}

// Public sign-in screens. A logged-in user hitting one is bounced to their
// dashboard, which is why /verify-otp belongs here: once the code has been
// accepted the session exists and the page has nothing left to do.
export const authRoutes = ["/login", "/register", "/forgot-password", "/verify-otp"];

export const commonProtectedRoutes: RouteConfig = {
    exact: ["/my-profile", "/settings", "/change-password", "/reset-password"],
    patterns: [], 
}

export const customerProtectedRoutes: RouteConfig = {
    // "/order-tracking" itself is deliberately public: guests look an order up
    // with its Order ID + the phone number on it. Only the /order-tracking/:id
    // view, which reads a signed-in customer's own order, stays protected.
    exact: ["/order-history", "/my-orders"],
    patterns: [
    /^\/order-tracking\/.+$/,   //  allow dynamic orderId
  ],
}

export const adminProtectedRoutes: RouteConfig = {
    patterns: [/^\/admin/], // Routes starting with /dashboard/*
    exact: [], // "/dashboard"
}

export const shopManagerProtectedRoutes: RouteConfig = {
    patterns: [/^\/dashboard/],
    exact: []
}

export const mediaManagerProtectedRoutes: RouteConfig = {
    patterns: [/^\/media-dashboard/],
    exact: []
}

export const isAuthRoute = (pathname: string) => {
    return authRoutes.some((route: string) => route === pathname);
}

export const isRouteMatches = (pathname: string, routes: RouteConfig): boolean => {
    if (routes.exact.includes(pathname)) {
        return true;
    }
    return routes.patterns.some((pattern: RegExp) => pattern.test(pathname))
    
}



export const getRouteOwner = (pathname: string): "ADMIN" | "SHOP_MANAGER" | "MEDIA_MANAGER" | "CUSTOMER" | "COMMON" | null => {
    if (isRouteMatches(pathname, adminProtectedRoutes)) {
        return "ADMIN"
    }
    if (isRouteMatches(pathname, shopManagerProtectedRoutes)) {
        return "SHOP_MANAGER"
    }
    if (isRouteMatches(pathname, mediaManagerProtectedRoutes)) {
        return "MEDIA_MANAGER"
    }
    if (isRouteMatches(pathname, customerProtectedRoutes)) {
        return "CUSTOMER"
    }
    if (isRouteMatches(pathname, commonProtectedRoutes)) {
        return "COMMON"
    }
    return null;
}


export const getDefaultDashboardRoute = (role: UserRole): string => {
    if (role === "ADMIN") {
        return "/admin"
    }
    if (role === "SHOP_MANAGER") {
        return "/dashboard"
    }
    if (role === "MEDIA_MANAGER") {
        return "/media-dashboard"
    }
    if (role === "CUSTOMER") {
        return "/my-profile"
    }
    return "/"
}

export const isValidRedirectForRole = (redirectPath: string, role: UserRole): boolean => {
    const routeOwner = getRouteOwner(redirectPath);

    if (routeOwner === null || routeOwner === "COMMON") {
        return true;
    }

    if (routeOwner === role) {
        return true;
    }

    // Dashboard routes are shared between ADMIN, SHOP_MANAGER, and MEDIA_MANAGER
    const dashboardRoles: UserRole[] = ["ADMIN", "SHOP_MANAGER", "MEDIA_MANAGER"];
    if (routeOwner && dashboardRoles.includes(routeOwner) && dashboardRoles.includes(role)) {
        return true;
    }

    return false;
}