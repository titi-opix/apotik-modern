import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Admin only routes
    const adminRoutes = ["/settings", "/employees", "/compliance"];
    const isAdminRoute = adminRoutes.some(route => path.startsWith(route));

    if (isAdminRoute && token?.role !== "ADMIN") {
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
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        // Pengecualian eksplisit untuk seeding dan debug agar tidak kena redirect
        if (
          pathname.startsWith("/api/auth") || 
          pathname.startsWith("/api/seed") || 
          pathname.startsWith("/api/debug") ||
          pathname === "/login"
        ) {
          return true;
        }
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
