import type { WorksheetRead } from "./worksheet";
import type { FilterConditionGroup } from "./filter";

export interface ChildSheetCreateRequest {
  parent_worksheet_id: string;
  child_sheet_name: string;
  selected_columns: string[];
  filter_criteria: FilterConditionGroup;
}

export interface SheetRelationshipRead {
  id: string;
  parent_worksheet_id: string;
  child_worksheet_id: string;
  selected_columns: string[];
  filter_criteria: FilterConditionGroup;
  last_synced_at: string | null;
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
