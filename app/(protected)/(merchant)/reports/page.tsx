import { redirect } from 'next/navigation';

/**
 * Legacy route: /reports
 * Redirects to merchant-turnover report for backward compatibility
 */
export default function ReportsRedirect() {
  redirect('/reports/merchant-turnover');
}
