import XLSX from 'xlsx-js-style';
import JSZip from 'jszip';

/**
 * Reads xl/styles.xml from an XLSX ZIP buffer and returns an array of alignment objects
 * indexed by Excel style index (xfIndex). This is the ONLY reliable way to get alignment
 * data in the browser since xlsx-js-style does not resolve cell.s.alignment.
 */
async function extractStyleAlignments(arrayBuffer) {
    try {
        const zip = await JSZip.loadAsync(arrayBuffer);
        const stylesFile = zip.file('xl/styles.xml');
        if (!stylesFile) return { styleAlignments: [], cellXfMap: {} };

        const xml = await stylesFile.async('text');
        const domParser = new DOMParser();
        const doc = domParser.parseFromString(xml, 'text/xml');

        // cellXfs contains one <xf> per used style, indexed from 0
        const cellXfs = doc.querySelector('cellXfs');
        const styleAlignments = [];
        if (cellXfs) {
            const xfElements = Array.from(cellXfs.querySelectorAll('xf'));
            xfElements.forEach(xf => {
                const alignment = xf.querySelector('alignment');
                if (!alignment) { styleAlignments.push(null); return; }
                const h = alignment.getAttribute('horizontal');
                const v = alignment.getAttribute('vertical');
                const wrap = alignment.getAttribute('wrapText');
                styleAlignments.push({
                    horizontal: h || null,
                    vertical: v || null,
                    wrapText: wrap === '1' || wrap === 'true'
                });
            });
        }

        // Also read each sheet XML to get the actual xf index per cell address
        // because xlsx-js-style replaces cell.s (numeric) with a resolved object, losing the index
        const cellXfMap = {};
        const sheetFiles = [];
        zip.forEach((relativePath, file) => {
            if (relativePath.startsWith('xl/worksheets/sheet') && relativePath.endsWith('.xml')) {
                sheetFiles.push({ relativePath, file });
            }
        });

        // Sort sheets: sheet1.xml, sheet2.xml, etc.
        sheetFiles.sort((a, b) => {
            const na = parseInt(a.relativePath.match(/sheet(\d+)/)?.[1] || 0);
            const nb = parseInt(b.relativePath.match(/sheet(\d+)/)?.[1] || 0);
            return na - nb;
        });

        for (let i = 0; i < sheetFiles.length; i++) {
            const { relativePath, file } = sheetFiles[i];
            const sheetXml = await file.async('text');
            const sheetDoc = domParser.parseFromString(sheetXml, 'text/xml');

            // Extract per-cell xf style index from <c s="N"> attributes
            const cells = Array.from(sheetDoc.querySelectorAll('c'));
            const sheetCellMap = {};
            cells.forEach(c => {
                const addr = c.getAttribute('r');   // e.g. "A1"
                const s = c.getAttribute('s');       // e.g. "3" (xf index)
                if (addr && s !== null && s !== '') {
                    sheetCellMap[addr] = parseInt(s, 10);
                }
            });
            cellXfMap[i] = sheetCellMap; // keyed by sheet ORDER index
        }

        return { styleAlignments, cellXfMap };
    } catch (e) {
        console.warn('[fortuneExcelParser] Could not parse xl/styles.xml or sheets:', e);
        return { styleAlignments: [], cellXfMap: {} };
    }
}


/**
 * Enhanced helper to parse color objects from SheetJS / xlsx-js-style.
 * Supports string hex, RGB/ARGB objects, and Excel Theme Index fallback.
 */
const parseColor = (colorObj) => {
    if (!colorObj) return null;
    if (typeof colorObj === 'string') {
        let clean = colorObj.replace(/^#/, '');
        if (clean.length === 8) clean = clean.substring(2);
        return `#${clean}`;
    }
    if (colorObj.rgb) {
        let hex = String(colorObj.rgb);
        if (hex.length === 8) hex = hex.substring(2);
        return `#${hex}`;
    }
    if (colorObj.theme !== undefined) {
        // Standard Excel theme color palette mapping
        const themePalette = ['#FFFFFF', '#000000', '#E7E6E6', '#44546A', '#4472C4', '#ED7D31', '#A5A5A5', '#FFC000', '#5B9BD5', '#70AD47'];
        return themePalette[colorObj.theme] || null;
    }
    return null;
};


/**
 * Robust helper to extract horizontal alignment from any SheetJS cell format.
 */
const extractHorizontalAlignment = (cell) => {
    if (!cell) return null;
    let h = null;

    if (cell.ht !== undefined && cell.ht !== null) {
        h = cell.ht;
    }

    if (!h && cell.s) {
        const s = cell.s;
        if (s.alignment) {
            h = s.alignment.horizontal || s.alignment.h || s.alignment.halign || s.alignment.align;
        }
        if (!h) {
            h = s.horizontal || s.h || s.halign || s.align || s.hAlign;
        }
    }

    if (!h && (cell.align || cell.halign || cell.h)) {
        h = cell.align || cell.halign || cell.h;
    }

    if (h !== undefined && h !== null) {
        const hStr = String(h).trim().toLowerCase();
        if (hStr.includes('center') || hStr.includes('centre') || hStr.includes('distributed') || hStr === '0') {
            return 'center';
        }
        if (hStr.includes('right') || hStr === '2' || hStr === '3') {
            return 'right';
        }
        if (hStr.includes('left') || hStr === '1') {
            return 'left';
        }
        if (hStr.includes('justify') || hStr === '4') {
            return 'justify';
        }
    }
    return null;
};


/**
 * Extracts cell styles, column widths, row heights, and hidden status from a SheetJS worksheet.
 * styleAlignments: array indexed by Excel xf style index, containing { horizontal, vertical, wrapText }
 * sheetCellXfMap: { "A1": 3, "B2": 0, ... } mapping cell address to raw xf style index from sheet XML
 */
const parseSheetStylesAndDimensions = (worksheet, styleAlignments = [], sheetCellXfMap = {}) => {
    const cellStyles = {};
    const colWidths = {};
    const rowHeights = {};
    const hiddenRows = [];
    const hiddenCols = [];

    if (worksheet['!cols'] && Array.isArray(worksheet['!cols'])) {
        worksheet['!cols'].forEach((col, idx) => {
            if (!col) return;
            let w = null;
            if (col.wpx && col.wpx > 0) w = col.wpx;
            else if (col.width && col.width > 0) w = Math.round(col.width * 7 + 8);
            else if (col.wch && col.wch > 0) w = Math.round(col.wch * 7 + 8);
            if (w) colWidths[idx] = Math.min(Math.max(w, 80), 220);
            // if (col.hidden || col.h || col.wpx === 0 || col.width === 0) hiddenCols.push(idx);
        });
    }

    if (worksheet['!rows'] && Array.isArray(worksheet['!rows'])) {
        worksheet['!rows'].forEach((row, idx) => {
            if (!row) return;
            let h = null;
            if (row.hpx && row.hpx > 0) h = row.hpx;
            else if (row.hpt && row.hpt > 0) h = Math.round(row.hpt * 1.15);
            if (h) rowHeights[idx] = Math.min(Math.max(h, 24), 45);
            // if (row.hidden || row.h || row.zeroHeight || row.hpx === 0 || row.hpt === 0) hiddenRows.push(idx);
        });
    }

    // Dynamic cell traversal across all populated worksheet keys
    Object.keys(worksheet).forEach(cellAddress => {
        if (cellAddress.startsWith('!')) return;
        const cell = worksheet[cellAddress];
        if (!cell) return;

        let R, C;
        try {
            const pos = XLSX.utils.decode_cell(cellAddress);
            R = pos.r;
            C = pos.c;
        } catch (e) {
            return;
        }

        const styleObj = {};

        // === ALIGNMENT FROM xl/styles.xml (via raw XML xf index per cell address) ===
        // sheetCellXfMap contains the raw 's' attribute from <c s="N"> in the sheet XML
        const styleIdx = sheetCellXfMap[cellAddress] !== undefined ? sheetCellXfMap[cellAddress] : null;
        const xmlAlignment = (styleIdx !== null && styleAlignments[styleIdx]) ? styleAlignments[styleIdx] : null;

        if (xmlAlignment?.horizontal && xmlAlignment.horizontal !== 'general') {
            const hLower = xmlAlignment.horizontal.toLowerCase();
            let alignVal = null;
            if (hLower === 'center' || hLower === 'centercontinuous' || hLower === 'distributed') alignVal = 'center';
            else if (hLower === 'right') alignVal = 'right';
            else if (hLower === 'left') alignVal = 'left';
            else if (hLower === 'justify') alignVal = 'justify';
            if (alignVal) {
                styleObj.align = alignVal;
                styleObj.ht = alignVal === 'center' ? '0' : (alignVal === 'right' ? '2' : '1');
            }
        }

        if (xmlAlignment?.vertical) {
            const vLower = xmlAlignment.vertical.toLowerCase();
            if (vLower === 'center' || vLower === 'middle') { styleObj.verticalAlign = 'middle'; styleObj.vt = '0'; }
            else if (vLower === 'top') { styleObj.verticalAlign = 'top'; styleObj.vt = '1'; }
            else if (vLower === 'bottom') { styleObj.verticalAlign = 'bottom'; styleObj.vt = '2'; }
        }

        if (xmlAlignment?.wrapText) styleObj.wrapText = true;

        // Fallback: try extractHorizontalAlignment from cell properties (older xlsx formats)
        if (!styleObj.align) {
            const alignVal = extractHorizontalAlignment(cell);
            if (alignVal) {
                styleObj.align = alignVal;
                styleObj.ht = alignVal === 'center' ? '0' : (alignVal === 'right' ? '2' : '1');
            }
        }

        if (cell.s) {
            const s = cell.s;

            // 1. Font styles (Family, Size, Bold, Italic, Underline, Color)
            const font = s.font || s.f;
            if (font) {
                if (font.bold || font.b) styleObj.bold = true;
                if (font.italic || font.i) styleObj.italic = true;
                if (font.underline || font.u) styleObj.underline = true;
                if (font.strike || font.s) styleObj.strike = true;

                const fontName = font.name || font.fontName;
                if (fontName) styleObj.fontFamily = fontName;

                const fontSize = font.sz || font.size || font.h;
                if (fontSize) styleObj.fontSize = `${fontSize}px`;

                const fontColor = font.color || font.c;
                if (fontColor) {
                    const c = parseColor(fontColor);
                    if (c) styleObj.color = c;
                }
            }

            // 2. Fill / Background Color
            const fill = s.fill || s.pattern;
            if (fill) {
                const fg = fill.fgColor || fill.fg || fill.bgColor || fill.bg;
                if (fg) {
                    const bg = parseColor(fg);
                    if (bg) styleObj.bg = bg;
                }
            } else if (s.fgColor || s.bgColor) {
                const bg = parseColor(s.fgColor || s.bgColor);
                if (bg) styleObj.bg = bg;
            }

            // 3. Vertical alignment & Wrap Text
            const align = s.alignment || s.align;
            if (align) {
                const vAlign = align.vertical || align.v || align.valign;
                if (vAlign !== undefined && vAlign !== null) {
                    const vLower = String(vAlign).toLowerCase();
                    if (vLower.includes('top')) { styleObj.verticalAlign = 'top'; styleObj.vt = '1'; }
                    else if (vLower.includes('center') || vLower.includes('middle')) { styleObj.verticalAlign = 'middle'; styleObj.vt = '0'; }
                    else if (vLower.includes('bottom')) { styleObj.verticalAlign = 'bottom'; styleObj.vt = '2'; }
                }

                if (align.wrapText || align.wrap) {
                    styleObj.wrapText = true;
                }
            }
        }



        // Fallback Right Alignment Detection for Numbers, Currency & Dates
        if (!styleObj.align && cell.v !== undefined && cell.v !== null && cell.v !== '') {
            const strVal = String(cell.w || cell.v).trim();
            if (!isNaN(strVal) || /^\d+(\.\d+)?%?$/.test(strVal) || /^\d[\d\s]*\s?(FCFA|€|\$|EUR|USD)$/i.test(strVal)) {
                styleObj.align = 'right';
                styleObj.ht = '2';
            }
        }



        if (Object.keys(styleObj).length > 0) {
            cellStyles[`${R}_${C}`] = styleObj;
        }
    });

    return { cellStyles, colWidths, rowHeights, hiddenRows, hiddenCols };
};

/**
 * High-fidelity parser for Excel / CSV files.
 * Preserves cell values, formatted text representations (cell.w), cell merges, font colors, sizes, families, alignments, and dimensions.
 */
export async function parseExcelFile(file) {
    // Step 1: Read file as ArrayBuffer (needed for both JSZip and XLSX)
    const arrayBuffer = await file.arrayBuffer();

    // Step 2: Extract alignment map directly from xl/styles.xml (the ONLY reliable source in browser)
    const { styleAlignments, cellXfMap } = await extractStyleAlignments(arrayBuffer);

    return new Promise((resolve, reject) => {
        try {
            const data = new Uint8Array(arrayBuffer);
            const wb = XLSX.read(data, {
                type: 'array',
                cellStyles: true,
                cellFormulas: true,
                cellDates: true,
                cellNF: true,
                sheetStubs: true
            });

            const parsedSheets = wb.SheetNames.map((sheetName, idx) => {
                const worksheet = wb.Sheets[sheetName];
                const rawMerges = worksheet['!merges'] || [];

                const merges = rawMerges
                    .filter(m => m && m.s && m.e && m.s.r !== undefined && m.s.c !== undefined && m.e.r !== undefined && m.e.c !== undefined)
                    .map(m => {
                        const startRow = Math.min(m.s.r, m.e.r);
                        const endRow = Math.max(m.s.r, m.e.r);
                        const startCol = Math.min(m.s.c, m.e.c);
                        const endCol = Math.max(m.s.c, m.e.c);
                        return {
                            startRow,
                            startCol,
                            endRow,
                            endCol,
                            rowSpan: endRow - startRow + 1,
                            colSpan: endCol - startCol + 1
                        };
                    });

                const sheetCellXfMap = cellXfMap[idx] || {};
                const { cellStyles, colWidths, rowHeights, hiddenRows, hiddenCols } = parseSheetStylesAndDimensions(worksheet, styleAlignments, sheetCellXfMap);



                const ref = worksheet['!ref'] || 'A1';
                const range = XLSX.utils.decode_range(ref);
                const targetRows = Math.max(range.e.r + 1, 100);
                const maxCols = Math.max(range.e.c + 1, 26);

                // HIGH-FIDELITY DIRECT CELL EXTRACTION:
                // Extract cell.w (Formatted text in Excel) or cell.v (Raw value) directly for every cell.
                const fullData = [];
                for (let r = 0; r < targetRows; r++) {
                    const row = [];
                    for (let c = 0; c < maxCols; c++) {
                        const cellAddress = XLSX.utils.encode_cell({ r, c });
                        const cell = worksheet[cellAddress];
                        let val = '';
                        if (cell) {
                            if (cell.w !== undefined && cell.w !== null && String(cell.w).trim() !== '') {
                                val = String(cell.w); // Formatted string representation from Excel
                            } else if (cell.v !== undefined && cell.v !== null) {
                                if (cell.t === 'd' && cell.v instanceof Date) {
                                    val = cell.v.toLocaleDateString('fr-FR');
                                } else {
                                    val = String(cell.v);
                                }
                            }
                        }
                        row.push(val);
                    }
                    fullData.push(row);
                }

                // Merged cells cleanup: Keep value only in top-left cell (startRow, startCol)
                merges.forEach(m => {
                    for (let r = m.startRow; r <= m.endRow; r++) {
                        for (let c = m.startCol; c <= m.endCol; c++) {
                            if (r === m.startRow && c === m.startCol) continue;
                            if (fullData[r] && fullData[r][c] !== undefined) {
                                fullData[r][c] = '';
                            }
                        }
                    }
                });

                return {
                    name: sheetName,
                    isParent: idx === 0,
                    data: fullData,
                    merges,
                    cellStyles,
                    colWidths,
                    rowHeights,
                    hiddenRows,
                    hiddenCols
                };
            });

            resolve({ name: file.name, sheets: parsedSheets });
        } catch (err) {
            console.error("Error parsing Excel file with high-fidelity parser:", err);
            reject(err);
        }
    });
}

