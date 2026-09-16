export type FilterOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "greater_than"
  | "less_than"
  | "greater_or_equal"
  | "less_or_equal"
  | "is_empty"
  | "is_not_empty"
  | "in";

export interface FilterConditionLeaf {
  column: string;
  operator: FilterOperator;
  value?: unknown;
}

export interface FilterConditionGroup {
  logic: "AND" | "OR";
  conditions: FilterNode[];
}

export type FilterNode = FilterConditionLeaf | FilterConditionGroup;

export function isFilterGroup(node: FilterNode): node is FilterConditionGroup {
  return "logic" in node;
}
