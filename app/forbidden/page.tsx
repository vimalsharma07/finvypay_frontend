/**
 * 403 Forbidden Page
 * 
 * Displays when user doesn't have permission to access a resource
 */

'use client';

import { ErrorPage } from '@/components/common/error-page';
import { getRedirectPathByRole, getUserRole } from '@/lib/utils/menu-utils';

export default function ForbiddenPage() {
  const role = getUserRole();
  const dashboardPath = getRedirectPathByRole(role);

  return (
    <ErrorPage
      statusCode={403}
      title="Access Forbidden"
      message="You don't have permission to access this resource. Please contact your administrator if you believe this is an error."
      showHomeButton={true}
      showBackButton={true}
      homeButtonText="Go to Dashboard"
      backButtonText="Go Back"
      homeButtonHref={dashboardPath}
    />
  );
}

