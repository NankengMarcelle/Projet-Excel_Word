import type { ComputedCellValue } from "../univer/UniverSheetGrid";
import type { WorksheetRead } from "./worksheet";
import type { FilterConditionGroup } from "./filter";

export interface ChildSheetCreateRequest {
  parent_worksheet_id: string;
  child_sheet_name: string;
  // Inclusive 1-indexed row range of the parent sheet's header block — a plain single-row
  // header has header_start_row === header_end_row.
  header_start_row: number;
  header_end_row: number;
  selected_columns: number[];
  filter_criteria: FilterConditionGroup;
  // The parent's formula cells' *live*, Univer-recalculated values (see
  // UniverSheetGrid.getComputedValues) — patched in server-side over openpyxl's own cache,
  // which has no formula engine and can be stale or entirely missing. Optional/omittable:
  // an empty list is a plain no-op on the backend.
  computed_values?: ComputedCellValue[];
}

export interface SyncChildSheetRequest {
  computed_values?: ComputedCellValue[];
}

export interface SheetRelationshipRead {
  id: string;
  parent_worksheet_id: string;
  child_worksheet_id: string;
  header_start_row: number;
  header_end_row: number;
  selected_columns: number[];
  filter_criteria: FilterConditionGroup;
  last_synced_at: string | null;
}

// Mirrors the backend's WorksheetColumn: `index` is the real identifier (matches
// FilterConditionLeaf.column / selected_columns), `label` is a display-only hint resolved
// from the header block and never guaranteed unique on its own.
export interface WorksheetColumn {
  index: number;
  letter: string;
  label: string;
}

export interface ChildSheetCreateResponse {
  worksheet: WorksheetRead;
  relationship: SheetRelationshipRead;
}

export interface ChildSheetStatus {
  relationship_id: string;
  is_outdated: boolean;
  last_synced_at: string | null;
}
