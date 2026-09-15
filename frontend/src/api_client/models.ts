/**
 * API Models & Transformation Helpers (TypeScript)
 */

import { CellData, WorksheetData, ChildSheetCreateRequest } from './index';

export interface FortuneSheetCell {
    v?: string | number | boolean;
    m?: string;
    f?: string;
    ct?: { fa?: string; t?: string };
    bl?: number | boolean;
    it?: number | boolean;
    fc?: string;
    bg?: string;
    ht?: number | string;
    vt?: number | string;
    [key: string]: unknown;
}

export interface FortuneSheetMatrix {
    [row: number]: {
        [col: number]: FortuneSheetCell;
    };
}

export interface FortuneSheetSheet {
    id?: string;
    name: string;
    data?: (FortuneSheetCell | null)[][];
    celldata?: Array<{ r: number; c: number; v: FortuneSheetCell }>;
    config?: {
        merge?: Record<string, { r: number; c: number; rs: number; cs: number }>;
        columnlen?: Record<string, number>;
        rowlen?: Record<string, number>;
    };
}

/**
 * Formats a single local grid cell into FastAPI CellData schema
 */
export function formatCellToBackend(row: number, col: number, cell: FortuneSheetCell | null | undefined): CellData {
    if (!cell) {
        return {
            row,
            column: col,
            value: null,
            formula: null,
            calculated_value: null,
            number_format: 'General',
            bold: false,
            italic: false,
            font_color: null,
            fill_color: null,
            horizontal_alignment: 'left',
            vertical_alignment: 'middle',
            borders: {},
        };
    }

    return {
        row,
        column: col,
        value: cell.v !== undefined ? cell.v : null,
        formula: cell.f || null,
        calculated_value: cell.m || cell.v || null,
        number_format: cell.ct?.fa || 'General',
        bold: Boolean(cell.bl),
        italic: Boolean(cell.it),
        font_color: cell.fc || null,
        fill_color: cell.bg || null,
        horizontal_alignment: cell.ht === 0 ? 'center' : cell.ht === 2 ? 'right' : 'left',
        vertical_alignment: cell.vt === 0 ? 'middle' : cell.vt === 2 ? 'bottom' : 'top',
        borders: {},
    };
}

/**
 * Formats FastAPI CellData schema into local FortuneSheet cell object
 */
export function formatCellFromBackend(cellData: CellData): FortuneSheetCell {
    return {
        v: cellData.value !== null && cellData.value !== undefined ? (cellData.value as string | number) : '',
        m: cellData.calculated_value ? String(cellData.calculated_value) : String(cellData.value || ''),
        f: cellData.formula || undefined,
        ct: { fa: cellData.number_format || 'General', t: 'g' },
        bl: cellData.bold ? 1 : 0,
        it: cellData.italic ? 1 : 0,
        fc: cellData.font_color || undefined,
        bg: cellData.fill_color || undefined,
    };
}

/**
 * Transforms a full local sheet object into FastAPI WorksheetData schema
 */
export function formatWorksheetToBackend(sheet: FortuneSheetSheet, worksheetId: string): WorksheetData {
    const cells: CellData[] = [];

    if (Array.isArray(sheet.data)) {
        sheet.data.forEach((rowArray, r) => {
            if (Array.isArray(rowArray)) {
                rowArray.forEach((cellObj, c) => {
                    if (cellObj && (cellObj.v !== undefined || cellObj.f)) {
                        cells.push(formatCellToBackend(r, c, cellObj));
                    }
                });
            }
        });
    }

    const mergedCells: string[] = [];
    if (sheet.config?.merge) {
        Object.values(sheet.config.merge).forEach((m) => {
            mergedCells.push(`${m.r}:${m.c}:${m.r + m.rs - 1}:${m.c + m.cs - 1}`);
        });
    }

    return {
        id: worksheetId,
        name: sheet.name || 'Sheet1',
        max_row: sheet.data?.length || 100,
        max_column: sheet.data?.[0]?.length || 26,
        cells,
        merged_cells: mergedCells,
        column_widths: sheet.config?.columnlen || {},
        row_heights: sheet.config?.rowlen || {},
    };
}

/**
 * Constructs a ChildSheetCreateRequest object for FastAPI child sheet endpoint
 */
export function buildChildSheetCreatePayload(
    parentWorksheetId: string,
    childSheetName: string,
    selectedColumns: string[],
    conditions: Array<{ column: string; operator: string; value: unknown }> = []
): ChildSheetCreateRequest {
    return {
        parent_worksheet_id: parentWorksheetId,
        child_sheet_name: childSheetName,
        selected_columns: selectedColumns,
        filter_criteria: {
            logic: 'AND',
            conditions,
        },
    };
}
