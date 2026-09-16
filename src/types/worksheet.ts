export interface WorksheetRead {
  id: string;
  workbook_id: string;
  name: string;
  sheet_type: "original" | "child";
  position: number | null;
  content_updated_at: string;
}

export interface CellData {
  row: number;
  column: number;
  value: unknown;
  formula: string | null;
  calculated_value: unknown;
  number_format: string;
  bold: boolean;
  italic: boolean;
  font_color: string | null;
  fill_color: string | null;
  horizontal_alignment: string | null;
  vertical_alignment: string | null;
  borders: Record<string, string | null>;
}

export interface WorksheetData {
  id: string;
  name: string;
  max_row: number;
  max_column: number;
  cells: CellData[];
  merged_cells: string[];
  column_widths: Record<string, number>;
  row_heights: Record<string, number>;
}

export interface CellEdit {
  row: number;
  column: number;
  value: unknown;
  // Optional and PATCH-semantic on the backend (see cell_editor.py): a field left out of
  // an edit is untouched on the existing cell, not reset to a blank default. The autosave
  // diff (univer/adapter.ts) always sends every field below together as one full snapshot
  // of the touched cell's current formatting, so in practice its own edits behave like a
  // full replace of that cell's style — but nothing here requires a caller to do that.
  number_format?: string;
  bold?: boolean;
  italic?: boolean;
  font_color?: string | null;
  fill_color?: string | null;
  horizontal_alignment?: string | null;
  vertical_alignment?: string | null;
  borders?: Record<string, string | null>;
}

export interface WorksheetEditRequest {
  edits: CellEdit[];
}
