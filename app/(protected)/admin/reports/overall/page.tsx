import { redirect } from 'next/navigation';

/**
 * Legacy route: /admin/reports/overall
 * Redirects to merchant-turnover report for backward compatibility
 */
export default function OverallReportsRedirect() {
  redirect('/admin/reports/merchant-turnover');
}
