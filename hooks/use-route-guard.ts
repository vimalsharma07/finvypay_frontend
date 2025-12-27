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
      // Public Profile routes
      "/public-profile/profiles/default",
      "/public-profile/profiles/creator",
      "/public-profile/profiles/company",
      "/public-profile/profiles/nft",
      "/public-profile/profiles/blogger",
      "/public-profile/profiles/crm",
      "/public-profile/profiles/gamer",
      "/public-profile/profiles/feeds",
      "/public-profile/profiles/plain",
      "/public-profile/profiles/modal",
      "/public-profile/projects/3-columns",
      "/public-profile/projects/2-columns",
      "/public-profile/works",
      "/public-profile/teams",
      "/public-profile/network",
      "/public-profile/activity",
      "/public-profile/campaigns/card",
      "/public-profile/campaigns/list",
      "/public-profile/empty",
      // My Account routes
      "/account/home/get-started",
      "/account/home/user-profile",
      "/account/home/company-profile",
      "/account/home/settings-sidebar",
      "/account/home/settings-enterprise",
      "/account/home/settings-plain",
      "/account/home/settings-modal",
      "/account/billing/basic",
      "/account/billing/enterprise",
      "/account/billing/plans",
      "/account/billing/history",
      "/account/security/get-started",
      "/account/security/overview",
      "/account/security/allowed-ip-addresses",
      "/account/security/privacy-settings",
      "/account/security/device-management",
      "/account/security/backup-and-recovery",
      "/account/security/current-sessions",
      "/account/security/security-log",
      "/account/members/team-starter",
      "/account/members/teams",
      "/account/members/team-info",
      "/account/members/members-starter",
      "/account/members/team-members",
      "/account/members/import-members",
      "/account/members/roles",
      "/account/members/permissions-toggle",
      "/account/members/permissions-check",
      "/account/integrations",
      "/account/notifications",
      "/account/api-keys",
      "/account/appearance",
      "/account/invite-a-friend",
      "/account/activity",
      // Network routes
      "/network/get-started",
      "/network/user-cards/mini-cards",
      "/network/user-cards/team-crew",
      "/network/user-cards/author",
      "/network/user-cards/nft",
      "/network/user-cards/social",
      "/network/user-table/team-crew",
      "/network/user-table/app-roster",
      "/network/user-table/market-authors",
      "/network/user-table/saas-users",
      "/network/user-table/store-clients",
      "/network/user-table/visitors",
      "/network/cooperations",
      "/network/leads",
      "/network/donators",
      // Authentication routes
      "/2fa",
      "/auth/welcome-message",
      "/auth/account-deactivated",
      "/error/404",
      "/error/500",
      // Store - Client routes
      "/store-client/home",
      "/store-client/search-results-grid",
      "/store-client/search-results-list",
      "/store-client/product-details",
      "/store-client/wishlist",
      "/store-client/checkout/order-summary",
      "/store-client/checkout/shipping-info",
      "/store-client/checkout/payment-method",
      "/store-client/checkout/order-placed",
      "/store-client/my-orders",
      "/store-client/order-receipt",
      // Store - Admin routes
      "/store-admin/dashboard",
      "/store-admin/inventory/all-products",
      "/store-admin/inventory/current-stock",
      "/store-admin/inventory/inbound-stock",
      "/store-admin/inventory/outbound-stock",
      "/store-admin/inventory/stock-planner",
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
