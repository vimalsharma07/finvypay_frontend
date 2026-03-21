/**
 * Build / parse routing `config` for API: flat AND list vs OR group wrapper.
 */

export type RoutingLeafCondition = {
  category: string;
  operator: string;
  value: unknown;
};

export function isRoutingLeafCondition(c: unknown): c is RoutingLeafCondition {
  return (
    typeof c === 'object' &&
    c !== null &&
    'category' in c &&
    'operator' in c &&
    'value' in c &&
    (c as { type?: string }).type !== 'group'
  );
}

export function parseRoutingConfig(config: unknown): {
  combineMode: 'AND' | 'OR';
  leaves: RoutingLeafCondition[];
} {
  if (!config || !Array.isArray(config) || config.length === 0) {
    return { combineMode: 'AND', leaves: [] };
  }

  const first = config[0] as Record<string, unknown> | undefined;
  if (
    config.length === 1 &&
    first &&
    first.type === 'group' &&
    first.logic === 'OR' &&
    Array.isArray(first.conditions)
  ) {
    const leaves = (first.conditions as unknown[]).filter(isRoutingLeafCondition);
    return { combineMode: 'OR', leaves };
  }

  const leaves = config.filter(isRoutingLeafCondition);
  return { combineMode: 'AND', leaves };
}

/**
 * Serialize UI leaf rows into API `config` JSON.
 * - AND: `[...leaves]` (evaluator ANDs top-level array entries)
 * - OR: `[{ type: 'group', logic: 'OR', conditions: [...leaves] }]`
 */
export function serializeRoutingConfig(
  leaves: RoutingLeafCondition[],
  combineMode: 'AND' | 'OR',
): unknown[] {
  if (combineMode === 'OR') {
    if (leaves.length === 0) return [];
    return [
      {
        type: 'group' as const,
        logic: 'OR' as const,
        conditions: leaves.map((l) => ({ ...l })),
      },
    ];
  }
  return leaves.map((l) => ({ ...l }));
}

/** Format range tuple or comma string for a single `value` string field (admin local state). */
export function rangeTupleToString(tuple: [number, number] | [string, string]): string {
  return `${tuple[0]},${tuple[1]}`;
}

export function stringToRangeTuple(
  s: string,
): [number, number] | null {
  const parts = String(s)
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
  if (parts.length !== 2) return null;
  const a = Number(parts[0]);
  const b = Number(parts[1]);
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  return [a, b];
}

/** Map API leaf to react-hook-form row (range → numeric tuple). */
export function leafConditionToFormRow(leaf: RoutingLeafCondition): {
  category: string;
  operator: string;
  value: string | number | string[] | [number, number];
} {
  const { category, operator, value } = leaf;
  if (
    (operator === 'between' || operator === 'not_between') &&
    Array.isArray(value) &&
    value.length === 2
  ) {
    return {
      category,
      operator,
      value: [Number(value[0]), Number(value[1])] as [number, number],
    };
  }
  if (Array.isArray(value)) {
    return { category, operator, value: value.map((v) => String(v)).join(',') };
  }
  if (value === null || value === undefined) {
    return { category, operator, value: '' };
  }
  return { category, operator, value: value as string | number };
}
