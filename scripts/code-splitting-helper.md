# Code Splitting Automation Guide

## Pattern Overview

The code splitting pattern involves:
1. **Extract heavy logic** from `page.tsx` into a `*-content.tsx` file
2. **Update `page.tsx`** to be a lightweight wrapper with dynamic import
3. **Use dynamic dialogs** where applicable

## Step-by-Step Conversion Process

### Step 1: Identify the Page Type

**Table-Heavy Pages:**
- Contains `useReactTable`, `DataGrid`, or `TableComp`
- Has data fetching, pagination, sorting
- Usually has search/filter functionality

**Form Pages:**
- Create/edit forms
- Usually has form validation
- May have file uploads

**View/Detail Pages:**
- Shows details of a single entity
- May have tabs or sections

### Step 2: Create Content File

**File naming:** `{page-name}-content.tsx` (e.g., `transactions-content.tsx`)

**Template for Table Pages:**
```tsx
'use client';

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { Container } from '@/components/common/container';
// ... all imports from original page

export function {PageName}PageContent() {
  // Move ALL state from page.tsx here
  // Move ALL useEffects here
  // Move ALL handlers here
  // Move ALL table/form logic here
  
  return (
    <Fragment>
      <Container>
        {/* All the heavy UI components */}
      </Container>
      {/* Dialogs */}
    </Fragment>
  );
}
```

**Key Points:**
- Export as named export: `export function {Name}PageContent()`
- Keep ALL logic, state, and effects
- Remove Toolbar from content (keep in page.tsx)
- Keep Container wrappers
- Use dynamic dialogs: `DynamicTransactionDetailsDialog`, `DynamicCreateTicketDialog`, etc.

### Step 3: Update Page File

**Template:**
```tsx
'use client';

import dynamic from 'next/dynamic';
import { IconName } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import { PageSkeleton } from '@/components/ui/skeletons';

const {PageName}PageContent = dynamic(
  () => import('./{page-name}-content').then(mod => ({ default: mod.{PageName}PageContent })),
  {
    loading: () => <PageSkeleton />,
    ssr: false,
  }
);

export default function {PageName}Page() {
  return (
    <Container>
      <Toolbar>
        <ToolbarHeading
          title="{Page Title}"
          description="{Page description}"
          icon={IconName}
        />
      </Toolbar>
      <{PageName}PageContent />
    </Container>
  );
}
```

**Key Points:**
- Keep ONLY Toolbar and Container
- Use dynamic import with `PageSkeleton` loading state
- Set `ssr: false` for client-heavy components
- Keep the same export name for the page component

### Step 4: Update Dialog Imports

**Replace direct dialog imports with dynamic versions:**

```tsx
// Before
import { TransactionDetailsDialog } from './shared/transaction-details-dialog';
import { CreateTicketDialog } from './components/create-ticket-dialog';

// After
import { DynamicTransactionDetailsDialog as TransactionDetailsDialog } from '@/components/dialogs';
import { DynamicCreateTicketDialog as CreateTicketDialog } from '@/components/dialogs';
```

**Available Dynamic Dialogs:**
- `DynamicTransactionDetailsDialog`
- `DynamicChargebackDialog`
- `DynamicRefundDialog`
- `DynamicSuspiciousDialog`
- `DynamicCreateTicketDialog`
- `DynamicEditTicketDialog`
- `DynamicAddCardDialog`
- `DynamicEditCardDialog`
- `DynamicAddRiskDialog`
- `DynamicEditRiskDialog`
- `DynamicAddIpDialog`
- `DynamicEditIpDialog`
- `DynamicSearchDialog`

### Step 5: Checklist

- [ ] Content file created with all heavy logic
- [ ] Page file updated to lightweight wrapper
- [ ] Dynamic import configured with `PageSkeleton`
- [ ] `ssr: false` set for client-heavy components
- [ ] Dialog imports updated to use dynamic versions
- [ ] Toolbar kept in page.tsx (not in content)
- [ ] All state/effects moved to content file
- [ ] No linter errors

## Common Patterns

### Pattern 1: Simple Table Page
```tsx
// page.tsx - Lightweight wrapper
// {name}-content.tsx - All table logic
```

### Pattern 2: Table with Create Button
```tsx
// Move create button to content file
// Keep in same Container as AdvancedFilter
```

### Pattern 3: Form Page
```tsx
// Use FormSkeleton instead of PageSkeleton
// All form logic in content file
```

### Pattern 4: View/Detail Page
```tsx
// All detail rendering in content file
// May have tabs or sections
```

## File Locations

**Content files:** Same directory as `page.tsx`
**Example:**
- `app/(protected)/admin/transactions/transactions/page.tsx`
- `app/(protected)/admin/transactions/transactions/transactions-content.tsx`

## Testing Checklist

After conversion:
1. Page loads without errors
2. Loading skeleton appears briefly
3. All functionality works (tables, forms, dialogs)
4. No console errors
5. Performance improved (check Network tab for code splitting)

