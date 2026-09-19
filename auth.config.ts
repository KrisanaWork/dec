import type { NextAuthConfig } from "next-auth";

export type UserRole = "admin" | "teacher" | "student";

function roleHome(role?: UserRole) {
  switch (role) {
    case "admin":
      return "/dashboard/admin";
    case "teacher":
      return "/dashboard/teacher";
    case "student":
      return "/dashboard/student";
    default:
      return "/login";
  }
}

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;

      const isDashboardRoute = pathname.startsWith("/dashboard");
      const isLoginRoute = pathname === "/login";

      if (isDashboardRoute) {
        return isLoggedIn;
      }

      if (isLoginRoute && isLoggedIn) {
        const role = auth.user.role as UserRole;

        return Response.redirect(new URL(roleHome(role), request.nextUrl));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
