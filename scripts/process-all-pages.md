# Automated Page Processing Script

This document tracks the systematic conversion of all pages to use dynamic imports.

## Pattern Applied

For each page:
1. Create `{name}-content.tsx` with all heavy logic
2. Update `page.tsx` to lightweight wrapper with dynamic import
3. Use `PageSkeleton` for loading state
4. Set `ssr: false` for client-heavy components

## Status

### ✅ Completed (14 pages)
- admin/user-management/admin/page.tsx
- admin/user-management/merchant/page.tsx
- admin/user-management/affiliate/page.tsx
- admin/transactions/transactions/page.tsx
- user/transactions/page.tsx
- admin/support/tickets/page.tsx
- user/support/page.tsx
- admin/acquirers/page.tsx

### 🔄 In Progress
- admin/risk-compliance/trusted-cards/page.tsx
- admin/risk-compliance/manage-risk/page.tsx
- admin/risk-compliance/ip-allowlist/page.tsx
- admin/roles-permissions/roles/page.tsx
- admin/roles-permissions/permissions/page.tsx

### 📋 Remaining (~65+ pages)
All other pages in app/(protected) that don't use dynamic imports yet.

## Next Steps

Continue processing pages in batches:
1. Risk-compliance pages (3)
2. Roles-permissions pages (2)
3. User routing/cascading pages
4. User risk-compliance pages
5. Admin master data pages
6. Admin applications pages
7. All create/edit form pages
8. All detail/view pages

