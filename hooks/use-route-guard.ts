/**
 * UI-Only Route Guard for Next.js
 * Protects routes based on role stored in auth-storage
 */

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth-storage";
import { getUserRole } from "@/lib/utils/menu-utils";
import { shouldDenyAccess } from "@/lib/utils/route-guard";
import { useAuth } from "./use-auth";

export function useRouteGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const { hasPermission } = useAuth();

  useEffect(() => {
    // PUBLIC ROUTES (do not guard)
    const publicRoutes = [
      "/",
      "/signin",
      "/signup",
      "/forgot-password",
      "/reset-password",
      "/verify-email",
      "/change-password",
      "/docs",
      // Error pages (keep these)
      "/error/404",
      "/error/500",
    ];
    const errorRoutes = ["/forbidden", "/not-found", "/error"];

    if (publicRoutes.includes(pathname) || errorRoutes.includes(pathname)) {
      return;
    }

    // 1️⃣ If user is NOT authenticated → redirect to signin
    if (!isAuthenticated()) {
      router.replace("/signin");
      return;
    }

    // 2️⃣ User is authenticated → get role
    const role = getUserRole();
    // 3️⃣ Deny access based on RBAC rules (role-based or permission-based)
    if (shouldDenyAccess(role, pathname, hasPermission)) {
      router.replace("/forbidden");
      return;
    }
  }, [pathname, router, hasPermission]);
}
