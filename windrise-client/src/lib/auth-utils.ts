
export type UserRole = "ADMIN" | "CUSTOMER" | "SHOP_MANAGER";

export type RouteConfig = {
    exact: string[],
    patterns: RegExp[],
}

export const authRoutes = ["/login", "/register", "/forgot-password"];

export const commonProtectedRoutes: RouteConfig = {
    exact: ["/my-profile", "/settings", "/change-password", "/reset-password"],
    patterns: [], 
}

export const customerProtectedRoutes: RouteConfig = {
    exact: ["/order-history", "/my-orders", "/order-tracking", "/order-history"],
    patterns: [
    /^\/order-tracking\/.*$/,   //  allow dynamic orderId
  ],
}

export const adminProtectedRoutes: RouteConfig = {
    patterns: [/^\/dashboard/], // Routes starting with /dashboard/*
    exact: [], // "/dashboard"
}

export const shopManagerProtectedRoutes: RouteConfig = {
    patterns: [/^\/dashboard/],
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

// export const getRouteOwner = (pathname: string): "ADMIN" |  "COMMON" | null => {
    
//     if (isRouteMatches(pathname, adminProtectedRoutes)) {
//         return "ADMIN";
//     }

//     if (isRouteMatches(pathname, commonProtectedRoutes)) {
//         return "COMMON";
//     }
//     return null;
// }

export const getRouteOwner = (pathname: string): "ADMIN" | "SHOP_MANAGER" | "CUSTOMER" | "COMMON" | null => {
    if (isRouteMatches(pathname, adminProtectedRoutes)) {
        return "ADMIN"
    }
    if (isRouteMatches(pathname, shopManagerProtectedRoutes)) {
        return "SHOP_MANAGER"
    }
    if (isRouteMatches(pathname, customerProtectedRoutes)) {
        return "CUSTOMER"
    }
    if (isRouteMatches(pathname, commonProtectedRoutes)) {
        return "COMMON"
    }
    return null;
}

// export const getDefaultDashboardRoute = (role: UserRole): string => {

//     if (role === "ADMIN") {
//         return "/dashboard";
//     }
//     if (role === "CUSTOMER") {
//         return "/checkout";
//     }
//     return "/";
// }

export const getDefaultDashboardRoute = (role: UserRole): string => {
    if (role === "ADMIN") {
        return "/admin"
    }
    if (role === "SHOP_MANAGER") {
        return "/dashboard"
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

    return false;
}