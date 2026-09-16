import type { IWorkbookData, IWorksheetData, ICellData, IRange, IStyleData, Nullable } from "@univerjs/presets";
import type { CellData, CellEdit, WorksheetData } from "../types/worksheet";

// Confirmed directly against Univer's own type definitions (node_modules/@univerjs/core) — these
// numeric codes are IDENTICAL to the ones the old Fortune-sheet adapter used (both apparently
// converged on the same OOXML-derived border-style numbering), so this mapping carries over
// unchanged from the Fortune-sheet integration.
const BORDER_STYLE_CODES: Record<string, number> = {
  thin: 1,
  hair: 2,
  dotted: 3,
  dashed: 4,
  dashDot: 5,
  dashDotDot: 6,
  double: 7,
  medium: 8,
  mediumDashed: 9,
  mediumDashDot: 10,
  mediumDashDotDot: 11,
  slantDashDot: 12,
  thick: 13,
};

// Univer's HorizontalAlign/VerticalAlign enums (1/2/3 = left/center/right and top/middle/bottom)
// also happen to match what Fortune-sheet used — same numbers carried over.
const HORIZONTAL_ALIGNMENT_CODES: Record<string, number> = {
  left: 1,
  center: 2,
  centerContinuous: 2,
  right: 3,
};

const VERTICAL_ALIGNMENT_CODES: Record<string, number> = {
  top: 1,
  center: 2,
  bottom: 3,
};

function columnLetterToIndex(letter: string): number {
  let index = 0;
  for (const char of letter) {
    index = index * 26 + (char.charCodeAt(0) - 64);
  }
  return index - 1; // 0-indexed
}

function parseCellRef(ref: string): { row: number; col: number } {
  const match = ref.match(/^([A-Z]+)(\d+)$/);
  if (!match) throw new Error(`Invalid cell reference: ${ref}`);
  return { col: columnLetterToIndex(match[1]), row: parseInt(match[2], 10) - 1 };
}

function normalizeColor(argbOrHex: string): string {
  // openpyxl returns 8-digit ARGB (e.g. "00FFFF00"); Univer wants a plain CSS hex color, same
  // as Fortune-sheet did.
  const hex = argbOrHex.length === 8 ? argbOrHex.slice(2) : argbOrHex;
  return `#${hex}`;
}

// Reverse of BORDER_STYLE_CODES, built by hand rather than by inverting the object: numeric
// codes are unique there so a naive invert would work, but doing it explicitly keeps this file
// readable without relying on iteration-order behavior.
const BORDER_STYLE_NAMES: Record<number, string> = {
  1: "thin",
  2: "hair",
  3: "dotted",
  4: "dashed",
  5: "dashDot",
  6: "dashDotDot",
  7: "double",
  8: "medium",
  9: "mediumDashed",
  10: "mediumDashDot",
  11: "mediumDashDotDot",
  12: "slantDashDot",
  13: "thick",
};

// Reverse of HORIZONTAL_ALIGNMENT_CODES/VERTICAL_ALIGNMENT_CODES — written by hand rather than
// inverted, since HORIZONTAL_ALIGNMENT_CODES maps two names ("center" and "centerContinuous")
// onto the same code (2); inverting that object would pick whichever key iterates last, not
// necessarily "center". Excel/openpyxl's own vocabulary uses "center" for both alignments (not
// Univer's internal "middle" for vertical), matching what the backend already reads back via
// plain openpyxl `cell.alignment.horizontal`/`.vertical` strings.
const HORIZONTAL_ALIGNMENT_NAMES: Record<number, string> = { 1: "left", 2: "center", 3: "right" };
const VERTICAL_ALIGNMENT_NAMES: Record<number, string> = { 1: "top", 2: "center", 3: "bottom" };

function denormalizeColor(color: Nullable<string>): string | null {
  // Reverse of normalizeColor, for sending a Univer-side color back to the backend as ARGB.
  // Univer's own color picker can hand back either "#RRGGBB" (our own normalizeColor's output,
  // round-tripping an untouched color) or "rgb(r, g, b)" (per IColorStyle's own doc comment) —
  // handle both. There's no alpha channel on either side, so a newly-picked color is always
  // written back fully opaque ("FF" prefix) rather than trying to match whatever alpha byte the
  // originally-imported file happened to have (openpyxl's own default for a bare 6-hex color is
  // "00", confirmed against this project's own test fixtures — Excel treats a cell's fill/font
  // alpha as effectively decorative either way, so this doesn't change how the color renders).
  if (!color) return null;
  if (color.startsWith("#")) {
    return `FF${color.slice(1).toUpperCase()}`;
  }
  const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/i);
  if (!match) return null;
  const [, r, g, b] = match;
  const hex = [r, g, b].map((n) => Number(n).toString(16).padStart(2, "0")).join("");
  return `FF${hex.toUpperCase()}`;
}

function buildCellValue(cell: CellData): ICellData {
  const value: ICellData = {};

  // Unlike the old Fortune-sheet adapter, no special-casing is needed here for a bare Excel
  // error literal (e.g. a broken "#REF!") embedded in formula text — confirmed directly (headless
  // Node spike against this exact real data): Univer's formula engine handles it natively,
  // propagating it as a proper error value, the same way real Excel does. Fortune-sheet's parser
  // had no grammar for that as input text and crashed; Univer just doesn't have that problem.
  if (cell.formula) {
    value.f = cell.formula;
    // Deliberately NOT setting v/t from calculated_value even when present — Univer computes
    // formula cells itself once loaded (confirmed live), and seeding a stale v here risks it
    // being treated as the authoritative value if a recalculation happens to be skipped for any
    // reason. Letting the formula engine own it end-to-end is simpler and was validated to work.
  } else if (cell.value !== null && cell.value !== undefined) {
    value.v = cell.value as string | number | boolean;
  }

  if (cell.number_format && cell.number_format !== "General") {
    value.s = { ...(typeof value.s === "object" ? value.s : {}), n: { pattern: cell.number_format } };
  }
  if (cell.bold) value.s = { ...(typeof value.s === "object" ? value.s : {}), bl: 1 };
  if (cell.italic) value.s = { ...(typeof value.s === "object" ? value.s : {}), it: 1 };
  if (cell.font_color) {
    value.s = { ...(typeof value.s === "object" ? value.s : {}), cl: { rgb: normalizeColor(cell.font_color) } };
  }
  if (cell.fill_color) {
    value.s = { ...(typeof value.s === "object" ? value.s : {}), bg: { rgb: normalizeColor(cell.fill_color) } };
  }

  const ht = cell.horizontal_alignment ? HORIZONTAL_ALIGNMENT_CODES[cell.horizontal_alignment] : undefined;
  if (ht) value.s = { ...(typeof value.s === "object" ? value.s : {}), ht };
  const vt = cell.vertical_alignment ? VERTICAL_ALIGNMENT_CODES[cell.vertical_alignment] : undefined;
  if (vt) value.s = { ...(typeof value.s === "object" ? value.s : {}), vt };

  const { top, bottom, left, right } = cell.borders;
  if (top || bottom || left || right) {
    const side = (styleName: string | null | undefined) =>
      styleName ? { s: BORDER_STYLE_CODES[styleName] ?? 1, cl: { rgb: "#000000" } } : undefined;
    value.s = {
      ...(typeof value.s === "object" ? value.s : {}),
      bd: { t: side(top), b: side(bottom), l: side(left), r: side(right) },
    };
  }

  return value;
}

// A cell can carry real signal (worth sending) purely through formatting — a border with no
// value/formula, for instance (the backend's own _cell_has_signal() already filters for exactly
// this before a cell ever reaches the frontend at all, so skipping on value/formula alone here
// would silently drop borders-/style-only cells that the backend deliberately kept).
function cellHasSignal(cell: CellData): boolean {
  return (
    cell.value !== null ||
    cell.formula !== null ||
    cell.bold ||
    cell.italic ||
    cell.font_color !== null ||
    cell.fill_color !== null ||
    cell.horizontal_alignment !== null ||
    cell.vertical_alignment !== null ||
    (cell.number_format !== "General" && cell.number_format !== "") ||
    Object.values(cell.borders).some((side) => side !== null)
  );
}

/** Read direction: our backend's WorksheetData -> a Univer IWorksheetData. */
export function backendToUniverWorksheetData(sheet: WorksheetData): IWorksheetData {
  const cellData: Record<number, Record<number, ICellData>> = {};
  for (const cell of sheet.cells) {
    if (!cellHasSignal(cell)) continue;
    const r = cell.row - 1;
    const c = cell.column - 1;
    if (!cellData[r]) cellData[r] = {};
    cellData[r][c] = buildCellValue(cell);
  }

  const mergeData: IRange[] = sheet.merged_cells.map((range) => {
    const [start, end] = range.split(":");
    const s = parseCellRef(start);
    const e = parseCellRef(end ?? start);
    return { startRow: s.row, endRow: e.row, startColumn: s.col, endColumn: e.col };
  });

  // openpyxl reports column width in Excel "character units" and row height in points — Univer's
  // columnData[i].w / rowData[i].h both want pixels. Same conversion as the Fortune-sheet
  // adapter used (approximate, not pixel-exact, but was good enough there and this is the same
  // underlying openpyxl data).
  const columnData: Record<number, { w: number }> = {};
  for (const [letter, width] of Object.entries(sheet.column_widths)) {
    columnData[columnLetterToIndex(letter)] = { w: Math.round(width * 7 + 5) };
  }
  const rowData: Record<number, { h: number }> = {};
  for (const [rowNumber, height] of Object.entries(sheet.row_heights)) {
    rowData[Number(rowNumber) - 1] = { h: Math.round(height * (96 / 72)) };
  }

  return {
    id: sheet.id,
    name: sheet.name,
    rowCount: Math.max(sheet.max_row + 20, 100),
    columnCount: Math.max(sheet.max_column + 10, 26),
    cellData,
    mergeData,
    columnData,
    rowData,
  } as IWorksheetData;
}

export function backendToUniverWorkbookData(sheets: WorksheetData[], workbookId: string): IWorkbookData {
  const sheetEntries = sheets.map((s) => backendToUniverWorksheetData(s));
  return {
    id: workbookId,
    name: workbookId,
    appVersion: "0.25.1",
    locale: "enUS",
    styles: {},
    sheetOrder: sheetEntries.map((s) => s.id),
    sheets: Object.fromEntries(sheetEntries.map((s) => [s.id, s])),
  } as IWorkbookData;
}

/**
 * Write direction: a per-cell snapshot (value/formula + every tracked style attribute) taken
 * per worksheet id, and the diff between two of them.
 *
 * Style tracking exists alongside value tracking (not as a separate pass) because a cell whose
 * *only* change was, say, a new fill color needs to show up as an edit too — the backend has no
 * way to know about a formatting change except by receiving it as part of a CellEdit (see
 * cell_editor.py). Deliberately one flat snapshot per cell, diffed as a whole (JSON.stringify
 * equality, not field-by-field): whenever anything about a cell changed, the edit sent to the
 * backend carries every style field together as that cell's current, complete formatting state
 * — not just the one field that changed. The backend's own CellEdit fields are individually
 * optional/PATCH-semantic (a field a *request* omits is left alone — see cell_editor.py), but
 * this adapter's choice is to never omit any of them once a cell is known to have changed, so in
 * practice every edit this app sends behaves like a full replace of that cell's formatting.
 */
export interface CellSnapshot {
  value: unknown;
  numberFormat: string;
  bold: boolean;
  italic: boolean;
  fontColor: string | null;
  fillColor: string | null;
  horizontalAlignment: string | null;
  verticalAlignment: string | null;
  borders: { top: string | null; bottom: string | null; left: string | null; right: string | null };
}

const EMPTY_SNAPSHOT: CellSnapshot = {
  value: null,
  numberFormat: "General",
  bold: false,
  italic: false,
  fontColor: null,
  fillColor: null,
  horizontalAlignment: null,
  verticalAlignment: null,
  borders: { top: null, bottom: null, left: null, right: null },
};

export type CellSnapshotMap = Record<string, CellSnapshot>;

function trackedCellValue(cell: ICellData | null | undefined): unknown {
  if (!cell) return null;
  // Same reasoning as the Fortune-sheet adapter: track a formula cell by its formula TEXT, not
  // its computed value, so a pure recalculation (formula unchanged, result changes) is never
  // mistaken for a user edit and re-saved.
  if (cell.f != null) return cell.f;
  return cell.v ?? null;
}

// A cell's `s` field can be either an inline style object or a string id into the *workbook's*
// shared style pool (`IWorkbookData.styles` — confirmed against ICellData's own type: `s?:
// Nullable<IStyleData | string>`). Univer interns styles this way once it's done its own
// processing, even though this adapter's read direction (buildCellValue, above) only ever
// writes inline objects at initial load. Snapshotting has to handle both, or a style-only edit
// made through Univer's own UI (which is exactly the case that produces an interned string id,
// not an inline object) would silently read back as "no style at all" and wipe the cell's real
// formatting in the very edit meant to change it.
export type StylePool = Record<string, Nullable<IStyleData>>;

function resolveStyle(cell: ICellData | null | undefined, styles: StylePool | undefined): IStyleData | undefined {
  const raw = cell?.s;
  if (!raw) return undefined;
  if (typeof raw === "string") {
    const resolved = styles?.[raw];
    return resolved ?? undefined;
  }
  return raw;
}

function snapshotCell(cell: ICellData | null | undefined, styles: StylePool | undefined): CellSnapshot {
  const s = resolveStyle(cell, styles);
  return {
    value: trackedCellValue(cell),
    numberFormat: s?.n?.pattern ?? "General",
    bold: s?.bl === 1,
    italic: s?.it === 1,
    fontColor: denormalizeColor(s?.cl?.rgb),
    fillColor: denormalizeColor(s?.bg?.rgb),
    horizontalAlignment: s?.ht != null ? (HORIZONTAL_ALIGNMENT_NAMES[s.ht] ?? null) : null,
    verticalAlignment: s?.vt != null ? (VERTICAL_ALIGNMENT_NAMES[s.vt] ?? null) : null,
    borders: {
      top: s?.bd?.t?.s != null ? (BORDER_STYLE_NAMES[s.bd.t.s] ?? null) : null,
      bottom: s?.bd?.b?.s != null ? (BORDER_STYLE_NAMES[s.bd.b.s] ?? null) : null,
      left: s?.bd?.l?.s != null ? (BORDER_STYLE_NAMES[s.bd.l.s] ?? null) : null,
      right: s?.bd?.r?.s != null ? (BORDER_STYLE_NAMES[s.bd.r.s] ?? null) : null,
    },
  };
}

/**
 * Extracts a flat "row_col -> snapshot" map from one worksheet's current cellData.
 *
 * `styles` is the *workbook-level* style pool (`IWorkbookData.styles`) — needed to resolve any
 * cell whose `s` is an interned string id rather than an inline object (see resolveStyle above).
 * Pass it whenever available; the initial baseline taken right after backendToUniverWorksheetData
 * has no such pool yet (every style there is still an inline object this adapter just built
 * itself), so it's optional.
 */
export function extractCellValues(worksheet: IWorksheetData, styles?: StylePool): CellSnapshotMap {
  const map: CellSnapshotMap = {};
  const cellData = (worksheet.cellData ?? {}) as Record<string | number, Record<string | number, ICellData>>;
  for (const [r, row] of Object.entries(cellData)) {
    for (const [c, cell] of Object.entries(row)) {
      map[`${r}_${c}`] = snapshotCell(cell, styles);
    }
  }
  return map;
}

export function diffCellValues(previous: CellSnapshotMap, current: CellSnapshotMap): CellEdit[] {
  const edits: CellEdit[] = [];
  const keys = new Set([...Object.keys(previous), ...Object.keys(current)]);
  for (const key of keys) {
    const prev = previous[key] ?? EMPTY_SNAPSHOT;
    const curr = current[key] ?? EMPTY_SNAPSHOT;
    if (JSON.stringify(prev) === JSON.stringify(curr)) continue;
    const [r, c] = key.split("_").map(Number);
    edits.push({
      row: r + 1,
      column: c + 1,
      value: curr.value,
      number_format: curr.numberFormat,
      bold: curr.bold,
      italic: curr.italic,
      font_color: curr.fontColor,
      fill_color: curr.fillColor,
      horizontal_alignment: curr.horizontalAlignment,
      vertical_alignment: curr.verticalAlignment,
      borders: curr.borders,
    });
  }
  return edits;
}
