/**
 * UI-Only Route Guard for Next.js
 * Protects routes based on role stored in auth-storage
 */

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth-storage";
import { getUserRole } from "@/lib/utils/menu-utils";
import { shouldDenyAccess } from "@/lib/utils/route-guard";

export function useRouteGuard() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // PUBLIC ROUTES (do not guard)
    const publicRoutes = ["/", "/signin", "/signup", "/forgot-password", "/reset-password", "/verify-email", "/change-password"];
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

    // 3️⃣ Deny access based on RBAC rules
    if (shouldDenyAccess(role, pathname)) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `[RouteGuard] Role "${role}" blocked from "${pathname}"`
        );
      }
      router.replace("/forbidden");
      return;
    }
  }, [pathname, router]);
}
