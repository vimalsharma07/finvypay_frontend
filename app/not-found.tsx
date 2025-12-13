/**
 * 404 Not Found Page
 * 
 * Next.js automatically uses this file for 404 errors
 */

import { ErrorPage } from '@/components/common/error-page';

export default function NotFound() {
  return (
    <ErrorPage
      statusCode={404}
      title="Page Not Found"
      message="The page you're looking for doesn't exist or has been moved."
      showHomeButton={true}
      showBackButton={true}
      homeButtonText="Go to Home"
      backButtonText="Go Back"
    />
  );
}

