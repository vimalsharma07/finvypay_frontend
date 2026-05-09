/**
 * Utility for formatting connector/acquirer account display names
 * Only shows merchant-created custom name when it exists
 */

export interface ConnectorLike {
  id: string | number;
  name?: string | null;
  customName?: string | null;
  /** Some API responses use snake_case */
  custom_name?: string | null;
}

/**
 * Format connector for dropdown/display.
 * - When merchant has a type label (customName): "Acquirer_3652556 - 2D Traffic"
 * - When no custom name: "Acquirer_3652556" only (no auto-generated labels)
 */
export function formatConnectorLabel(account: ConnectorLike): string {
  const name = account.name || `Connector ${account.id}`;
  const raw =
    account.customName ?? account.custom_name ?? null;
  const trimmed = typeof raw === 'string' ? raw.trim() : '';

  if (trimmed) {
    return `${name} - ${trimmed}`;
  }

  return name;
}

