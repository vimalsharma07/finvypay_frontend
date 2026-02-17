import { redirect } from 'next/navigation';

/**
 * Settlement Summary – not used on merchant side.
 * Redirects to All Settlements.
 */
export default function SettlementSummaryPage() {
  redirect('/settlement/all');
}
