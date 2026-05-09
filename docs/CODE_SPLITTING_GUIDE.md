# Code Splitting & Dynamic Imports Guide

## Overview

This guide explains how to apply code splitting and dynamic imports throughout the frontend application to improve performance and reduce initial bundle size.

## Why Code Splitting?

**Current Issue:** Only charts were optimized, but many other components are heavy:
- Admin pages with large tables
- User pages with complex forms
- Dialog/Modal components
- Heavy feature components

**Benefits:**
- Reduced initial bundle size
- Faster page loads
- Better Time to Interactive (TTI)
- Improved Core Web Vitals

## Folder Structure

```
components/
  ui/
    skeletons/          # All skeleton components
      chart-skeleton.tsx
      table-skeleton.tsx
      index.ts
  charts/
    dynamic-apex-chart.tsx
    dynamic-recharts.tsx
  common/
    dynamic-page-content.tsx
    dynamic-table-comp.tsx
  dialogs/
    dynamic-search-dialog.tsx
```

## Implementation Patterns

### 1. Chart Components ✅ (Already Done)

**Use DynamicApexChart for all ApexCharts:**
```tsx
import { DynamicApexChart } from '@/components/charts/dynamic-apex-chart';

<DynamicApexChart
  options={options}
  series={options.series}
  type="area"
  height={200}
/>
```

### 2. Page Components (Inner Pages)

**Pattern: Split page content from page wrapper**

**Before:**
```tsx
// admin/user-management/admin/page.tsx
export default function AdminUsersPage() {
  // All logic and heavy components here
  return <TableComp ... />;
}
```

**After:**
```tsx
// admin/user-management/admin/page.tsx
'use client';

import dynamic from 'next/dynamic';
import { PageSkeleton } from '@/components/ui/skeletons';
import { Container } from '@/components/common/container';
import { Toolbar } from '@/layouts/demo1/components/toolbar';

// Dynamically import the heavy content
const AdminUsersPageContent = dynamic(
  () => import('./admin-users-content').then(mod => ({ default: mod.AdminUsersPageContent })),
  {
    loading: () => <PageSkeleton />,
    ssr: false,
  }
);

export default function AdminUsersPage() {
  return (
    <>
      <Container>
        <Toolbar>
          {/* Lightweight toolbar */}
        </Toolbar>
      </Container>
      <Container>
        <AdminUsersPageContent />
      </Container>
    </>
  );
}
```

**Create separate content file:**
```tsx
// admin/user-management/admin/admin-users-content.tsx
'use client';

import { TableComp } from '@/app/(protected)/components/table-comp';
// ... all heavy imports and logic

export function AdminUsersPageContent() {
  // All the heavy logic here
  return <TableComp ... />;
}
```

### 3. Table Components

**For pages with heavy tables, use dynamic imports:**

```tsx
import { DynamicTableComp } from '@/components/common/dynamic-table-comp';

// Or for entire table-heavy pages:
const TransactionsPageContent = dynamic(
  () => import('./transactions-content'),
  { loading: () => <TableCardSkeleton />, ssr: false }
);
```

### 4. Dialog/Modal Components

**For heavy dialogs:**
```tsx
import { DynamicSearchDialog } from '@/components/dialogs/dynamic-search-dialog';

// Or create your own:
const HeavyDialog = dynamic(
  () => import('./heavy-dialog'),
  { 
    loading: () => <Skeleton className="h-96 w-full" />,
    ssr: false 
  }
);
```

### 5. Form Components

**For complex forms:**
```tsx
import { FormSkeleton } from '@/components/ui/skeletons';

const ComplexForm = dynamic(
  () => import('./complex-form'),
  {
    loading: () => <FormSkeleton fields={8} />,
    ssr: false,
  }
);
```

## Pages That Need Code Splitting

### High Priority (Heavy Pages)

#### Admin Pages:
- ✅ `admin/user-management/admin/page.tsx` - Large table
- ✅ `admin/user-management/merchant/page.tsx` - Large table
- ✅ `admin/user-management/affiliate/page.tsx` - Large table
- ✅ `admin/transactions/transactions/page.tsx` - Very heavy with tables and dialogs
- ✅ `admin/acquirers/page.tsx` - Table heavy
- ✅ `admin/applications/all/page.tsx` - Table heavy
- ✅ `admin/support/tickets/page.tsx` - Table heavy
- ✅ `admin/roles-permissions/roles/page.tsx` - Table heavy
- ✅ `admin/risk-compliance/*/page.tsx` - Multiple heavy pages

#### User Pages:
- ✅ `user/transactions/page.tsx` - Table heavy
- ✅ `user/support/page.tsx` - Table heavy
- ✅ `user/routing/page.tsx` - Complex routing logic
- ✅ `user/cascading/page.tsx` - Complex cascading logic
- ✅ `user/risk-compliance/*/page.tsx` - Multiple heavy pages

### Medium Priority

- Form pages (create/edit pages)
- Detail/view pages with complex layouts
- Dashboard pages (already partially done)

## Implementation Checklist

### Phase 1: Critical Pages
- [ ] Admin user management pages
- [ ] Admin transactions page
- [ ] User transactions page
- [ ] User support page

### Phase 2: Heavy Tables
- [ ] All admin table pages
- [ ] All user table pages
- [ ] Risk compliance pages

### Phase 3: Forms & Dialogs
- [ ] Complex form pages
- [ ] Heavy dialog components
- [ ] Modal components

### Phase 4: Feature Components
- [ ] Routing components
- [ ] Cascading components
- [ ] Other feature-heavy components

## Best Practices

1. **Always provide loading states** - Use appropriate skeleton components
2. **Disable SSR for client-heavy components** - Set `ssr: false` for charts, tables, etc.
3. **Split at logical boundaries** - Split page content, not individual small components
4. **Keep lightweight wrappers** - Toolbars, headers should stay in main page
5. **Use named exports** - Makes dynamic imports cleaner
6. **Test loading states** - Ensure skeletons match actual content layout

## Example: Complete Page Refactor

**Before:**
```tsx
// page.tsx (500+ lines, heavy imports)
export default function HeavyPage() {
  // All logic, heavy components, etc.
}
```

**After:**
```tsx
// page.tsx (lightweight wrapper)
'use client';
import dynamic from 'next/dynamic';
import { PageSkeleton } from '@/components/ui/skeletons';

const HeavyPageContent = dynamic(
  () => import('./heavy-page-content'),
  { loading: () => <PageSkeleton />, ssr: false }
);

export default function HeavyPage() {
  return <HeavyPageContent />;
}

// heavy-page-content.tsx (all the heavy stuff)
'use client';
export function HeavyPageContent() {
  // All heavy logic and components
}
```

## Performance Impact

**Expected improvements:**
- Initial bundle size: **-30-50%** for admin/user pages
- Time to Interactive: **-40-60%** improvement
- First Contentful Paint: **-20-30%** improvement
- Better Core Web Vitals scores

## Monitoring

After implementation, monitor:
- Bundle sizes (use `npm run build:analyze`)
- Core Web Vitals
- Lighthouse scores
- Real user metrics

