import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Admin only routes
    const adminOnlyRoutes = ["/settings", "/employees"];
    const isAdminOnlyRoute = adminOnlyRoutes.some(route => path.startsWith(route));

    if (isAdminOnlyRoute && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Compliance route: Admin and Apoteker
    if (path.startsWith("/compliance") && token?.role !== "ADMIN" && token?.role !== "APOTEKER") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Cashier specific restriction: Cannot manage stock (Inventory)
    if (path.startsWith("/inventory") && token?.role === "STAFF") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (Auth.js routes)
     * - login (login page)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|login|_next/static|_next/image|favicon.ico).*)",
  ],
};
