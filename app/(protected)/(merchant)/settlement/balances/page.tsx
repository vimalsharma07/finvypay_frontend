import { redirect } from 'next/navigation';

/**
 * Settlement Balances – not used on merchant side.
 * Redirects to All Settlements.
 */
export default function SettlementBalancesPage() {
  redirect('/settlement/all');
}
