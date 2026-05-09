/**
 * 500 Internal Server Error Page
 * 
 * Displays when a server error occurs
 */

import { ErrorPage } from '@/components/common/error-page';

export default function ServerErrorPage() {
  return (
    <ErrorPage
      statusCode={500}
      title="Internal Server Error"
      message="Something went wrong on our end. We're working to fix the issue. Please try again later."
      showHomeButton={true}
      showBackButton={true}
      homeButtonText="Go Home"
      backButtonText="Go Back"
    />
  );
}

