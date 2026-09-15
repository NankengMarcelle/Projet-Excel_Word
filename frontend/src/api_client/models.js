/**
 * SheetFlow Backend Data Models & Helpers
 * Format conversions between Frontend Grid state and Backend FastAPI Schemas
 */

/**
 * @typedef {Object} CellData
 * @property {number} row - Index 0-based
 * @property {number} column - Index 0-based
 * @property {any} value - Cell value
 * @property {string} number_format - Format string (default 'General')
 * @property {boolean} bold - Font weight
 * @property {boolean} italic - Font style
 * @property {string|null} font_color - Hex or RGB
 * @property {string|null} fill_color - Hex or RGB
 * @property {string|null} horizontal_alignment - 'left' | 'center' | 'right'
 * @property {string|null} vertical_alignment - 'top' | 'middle' | 'bottom'
 * @property {Object} borders - Border styles
 */

/**
 * Convert frontend grid cell into backend CellData
 */
export function formatCellToBackend(rowIdx, colIdx, rawValue, style = {}) {
    let hAlign = null;
    if (style.align) hAlign = style.align;
    else if (style.ht === '0') hAlign = 'center';
    else if (style.ht === '2') hAlign = 'right';
    else if (style.ht === '1') hAlign = 'left';

    let vAlign = null;
    if (style.verticalAlign) vAlign = style.verticalAlign;
    else if (style.vt === '0') vAlign = 'middle';
    else if (style.vt === '1') vAlign = 'top';
    else if (style.vt === '2') vAlign = 'bottom';

    return {
        row: Number(rowIdx),
        column: Number(colIdx),
        value: rawValue !== undefined && rawValue !== null ? rawValue : '',
        number_format: style.numberFormat || 'General',
        bold: Boolean(style.bold),
        italic: Boolean(style.italic),
        font_color: style.color || null,
        fill_color: style.bg || null,
        horizontal_alignment: hAlign,
        vertical_alignment: vAlign,
        borders: style.borders || {}
    };
}

/**
 * Convert backend CellData back to frontend grid style object
 */
export function formatCellFromBackend(cellData) {
    if (!cellData) return { value: '', style: {} };

    const style = {
        bold: Boolean(cellData.bold),
        italic: Boolean(cellData.italic),
        color: cellData.font_color || undefined,
        bg: cellData.fill_color || undefined,
        align: cellData.horizontal_alignment || undefined,
        verticalAlign: cellData.vertical_alignment || undefined,
        numberFormat: cellData.number_format || 'General'
    };

    return {
        value: cellData.value !== undefined ? cellData.value : '',
        style
    };
}

/**
 * Helper to transform full sheet grid to backend WorksheetData payload
 */
export function formatWorksheetToBackend(sheetId, sheetName, gridData = [], cellStyles = {}, merges = [], colWidths = {}, rowHeights = {}) {
    const cells = [];
    const maxRow = gridData.length;
    let maxCol = 0;

    gridData.forEach((row, rIdx) => {
        if (Array.isArray(row)) {
            if (row.length > maxCol) maxCol = row.length;
            row.forEach((val, cIdx) => {
                const styleKey = `${rIdx}_${cIdx}`;
                const style = cellStyles[styleKey] || {};
                if (val !== '' && val !== null && val !== undefined || Object.keys(style).length > 0) {
                    cells.push(formatCellToBackend(rIdx, cIdx, val, style));
                }
            });
        }
    });

    const formattedMerges = (merges || []).map(m => {
        const sR = m.startRow !== undefined ? m.startRow : m.s?.r;
        const eR = m.endRow !== undefined ? m.endRow : m.e?.r;
        const sC = m.startCol !== undefined ? m.startCol : m.s?.c;
        const eC = m.endCol !== undefined ? m.endCol : m.e?.c;
        return `${sR}:${sC}:${eR}:${eC}`;
    });

    return {
        id: sheetId,
        name: sheetName,
        max_row: maxRow,
        max_column: maxCol,
        cells,
        merged_cells: formattedMerges,
        column_widths: colWidths,
        row_heights: rowHeights
    };
}
