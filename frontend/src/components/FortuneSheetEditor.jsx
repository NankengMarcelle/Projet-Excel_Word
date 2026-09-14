import React, { useState, useRef, useEffect } from 'react';
import XLSX from 'xlsx-js-style';

const EMPTY_OBJ = {};
const EMPTY_SET = new Set();
import { parseExcelFile } from '../utils/fortuneExcelParser';
import {
    FileSpreadsheet,
    FileText,
    FileCode,
    Printer,
    Search,
    Upload,
    Check,
    Plus,
    Bold,
    Italic,
    Underline,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Edit3,
    ChevronDown,
    PaintBucket,
    Sigma,
    Equal,
    EyeOff,
    Eye,
    Copy,
    ClipboardPaste,
    Trash2,
    Filter,
    RefreshCw,
    Layers,
    Save,
    Grid,
    CheckCircle2,
    Undo2,
    Redo2
} from 'lucide-react';
import WordDocumentPreviewModal from './WordDocumentPreviewModal';
import ColorPickerPopover from './ColorPickerPopover';
import SheetToolsFilterModal from './SheetToolsFilterModal';

// Clean empty 26x50 cell matrix
const createEmptySheetData = (rows = 50, cols = 26) => {
    const matrix = [];
    for (let r = 0; r < rows; r++) {
        const row = [];
        for (let c = 0; c < cols; c++) row.push('');
        matrix.push(row);
    }
    return matrix;
};

// Custom Floating Tooltip Component
function CustomTooltip({ text, position = 'bottom', children }) {
    const [isVisible, setIsVisible] = useState(false);

    if (!text) return children;

    return (
        <div
            style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && (
                <div style={{
                    position: 'absolute',
                    top: position === 'bottom' ? 'calc(100% + 8px)' : 'auto',
                    bottom: position === 'top' ? 'calc(100% + 8px)' : 'auto',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#02006c',
                    color: '#FFFFFF',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    boxShadow: '0 10px 25px rgba(2, 0, 108, 0.35)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    zIndex: 99999,
                    pointerEvents: 'none'
                }}>
                    {text}
                    <div style={{
                        position: 'absolute',
                        top: position === 'bottom' ? '-4px' : 'auto',
                        bottom: position === 'top' ? '-4px' : 'auto',
                        left: '50%',
                        transform: 'translateX(-50%) rotate(45deg)',
                        width: '8px',
                        height: '8px',
                        background: '#02006c',
                        borderTop: position === 'bottom' ? '1px solid rgba(255, 255, 255, 0.25)' : 'none',
                        borderLeft: position === 'bottom' ? '1px solid rgba(255, 255, 255, 0.25)' : 'none',
                        borderBottom: position === 'top' ? '1px solid rgba(255, 255, 255, 0.25)' : 'none',
                        borderRight: position === 'top' ? '1px solid rgba(255, 255, 255, 0.25)' : 'none'
                    }} />
                </div>
            )}
        </div>
    );
}

// 105 Web & Google Fonts List
const ALL_FONTS = [
    "Inter", "Plus Jakarta Sans", "Roboto", "Open Sans", "Lato", "Montserrat", "Poppins", "Oswald", "Raleway", "Nunito",
    "Ubuntu", "Merriweather", "Playfair Display", "PT Sans", "Lora", "Rubik", "Mukta", "Kanit", "Work Sans", "Fira Sans",
    "Noto Sans", "Quicksand", "Barlow", "Inconsolata", "Dosis", "Titillium Web", "PT Serif", "Libre Baskerville", "Arimo", "Cabin",
    "Pacifico", "Dancing Script", "Caveat", "Comfortaa", "Lobster", "Sacramento", "Satisfy", "Arial", "Calibri", "Times New Roman",
    "Georgia", "Courier New", "Trebuchet MS", "Verdana", "Tahoma", "Impact", "Comic Sans MS", "Palatino", "Garamond", "Bookman",
    "Avant Garde", "Helvetica", "Century Gothic", "Segoe UI", "Geneva", "Optima", "Monaco", "Perpetua", "Rockwell", "Baskerville",
    "Big Caslon", "Bodoni MT", "Copperplate", "Didot", "Futura", "Gill Sans", "Goudy Old Style", "Hoefler Text", "Lucida Bright", "Lucida Fax",
    "Palatino Linotype", "Brush Script MT", "Lucida Calligraphy", "Apple Chancery", "Bradley Hand", "Lucida Handwriting", "Snell Roundhand", "Zapfino", "Andale Mono", "Consolas",
    "Courier", "Fixedsys", "Lucida Console", "MS Gothic", "MS Serif", "Symbol", "Abyssinica SIL", "DejaVu Sans", "DejaVu Serif", "Liberation Mono",
    "Liberation Sans", "Liberation Serif", "Acumin Pro", "Apercu", "Avenir", "Avenir Next", "Bambino", "Circular", "DIN", "Founders Grotesk",
    "Futura PT", "Gotham", "Graphik", "GT America", "GT Walsheim", "Proxima Nova", "Sailec", "SF Pro Display", "SF Pro Text"
];

const PRESET_FONT_SIZES = [8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 24, 28, 32, 36, 40, 48, 56, 72];

export default function FortuneSheetEditor({ selectedWorkbook, onWorkbookChange, onOpenConvertModal, onBackToDashboard, onUploadSuccess, lang = 'fr' }) {
    const fileInputRef = useRef(null);
    const inlineInputRef = useRef(null);

    // Dynamically inject Google Fonts so all 105 fonts render live
    useEffect(() => {
        const linkId = 'google-fonts-sheet-loader';
        if (!document.getElementById(linkId)) {
            const link = document.createElement('link');
            link.id = linkId;
            link.rel = 'stylesheet';
            link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&family=Roboto:wght@400;700&family=Open+Sans:wght@400;700&family=Lato:wght@400;700&family=Montserrat:wght@400;700&family=Poppins:wght@400;700&family=Oswald:wght@400;700&family=Raleway:wght@400;700&family=Nunito:wght@400;700&family=Ubuntu:wght@400;700&family=Merriweather:wght@400;700&family=Playfair+Display:wght@400;700&family=Lora:wght@400;700&family=Rubik:wght@400;700&family=Kanit:wght@400;700&family=Work+Sans:wght@400;700&family=Fira+Sans:wght@400;700&family=Quicksand:wght@400;700&family=Inconsolata:wght@400;700&family=Caveat:wght@400;700&family=Comfortaa:wght@400;700&family=Lobster&display=swap';
            document.head.appendChild(link);
        }
    }, []);

    const [currentWorkbook, setCurrentWorkbook] = useState(() => {
        if (selectedWorkbook) return selectedWorkbook;
        try {
            const saved = localStorage.getItem('antic_active_workbook');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed && Array.isArray(parsed.sheets) && parsed.sheets.length > 0) {
                    return parsed;
                }
            }
        } catch (e) { }
        return {
            name: 'Nouveau_Classeur_Sans_Titre.xlsx',
            sheets: [{ name: 'Feuille1', data: createEmptySheetData(100, 26) }]
        };
    });

    const initRef = useRef(null);
    const emittedWbsRef = useRef(new WeakSet());

    useEffect(() => {
        if (selectedWorkbook) {
            // Absolute defense against parent property echoes
            if (emittedWbsRef.current.has(selectedWorkbook)) return;

            const currentWbId = selectedWorkbook.id || selectedWorkbook.name || 'loaded';
            if (initRef.current === currentWbId) return;
            initRef.current = currentWbId;

            const activeSheet = selectedWorkbook.sheets?.[0];
            if (activeSheet) {
                setCellStyles(activeSheet.cellStyles || EMPTY_OBJ);
                setCellFormulas(activeSheet.cellFormulas || EMPTY_OBJ);
                setColWidths(activeSheet.colWidths || EMPTY_OBJ);
                setRowHeights(activeSheet.rowHeights || EMPTY_OBJ);
                const safeHiddenRows = Array.isArray(activeSheet.hiddenRows) ? activeSheet.hiddenRows : (activeSheet.hiddenRows instanceof Set ? Array.from(activeSheet.hiddenRows) : []);
                setHiddenRows(safeHiddenRows.length > 0 ? new Set(safeHiddenRows) : EMPTY_SET);
                const safeHiddenCols = Array.isArray(activeSheet.hiddenCols) ? activeSheet.hiddenCols : (activeSheet.hiddenCols instanceof Set ? Array.from(activeSheet.hiddenCols) : []);
                setHiddenCols(safeHiddenCols.length > 0 ? new Set(safeHiddenCols) : EMPTY_SET);
            }
            setCurrentWorkbook(selectedWorkbook);
            setActiveSheetIndex(0);
        } else {
            try {
                const saved = localStorage.getItem('antic_active_workbook');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (parsed && Array.isArray(parsed.sheets) && parsed.sheets.length > 0) {
                        if (activeSheet) {
                            setCellStyles(activeSheet.cellStyles || EMPTY_OBJ);
                            setCellFormulas(activeSheet.cellFormulas || EMPTY_OBJ);
                            setColWidths(activeSheet.colWidths || EMPTY_OBJ);
                            setRowHeights(activeSheet.rowHeights || EMPTY_OBJ);
                            setHiddenRows(activeSheet.hiddenRows?.length > 0 ? new Set(activeSheet.hiddenRows) : EMPTY_SET);
                            setHiddenCols(activeSheet.hiddenCols?.length > 0 ? new Set(activeSheet.hiddenCols) : EMPTY_SET);
                        }
                        setCurrentWorkbook(parsed);
                        setActiveSheetIndex(0);
                    }
                }
            } catch (e) { }
        }
    }, [selectedWorkbook]);

    const [activeSheetIndex, setActiveSheetIndex] = useState(0);

    // Multi-cell Range Selection
    const [selectionRange, setSelectionRange] = useState({
        start: { r: 0, c: 0 },
        end: { r: 0, c: 0 }
    });
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [isFillDragging, setIsFillDragging] = useState(false);
    const [fillTarget, setFillTarget] = useState(null);

    // Per-Cell Styles Map: { [`${r}_${c}`]: { bold, italic, underline, color, bg, fontFamily, fontSize, align } }
    const [cellStyles, setCellStyles] = useState({});

    // Per-Cell Formulas Map: { [`${r}_${c}`]: "=1+2" }
    const [cellFormulas, setCellFormulas] = useState({});

    // Row & Column heights / widths / hidden tracking
    const [rowHeights, setRowHeights] = useState({});
    const [colWidths, setColWidths] = useState({});

    const executeFillHandle = (targetCell) => {
        if (!targetCell) return;
        const targetR = targetCell.r;
        const targetC = targetCell.c;

        const sourceMinR = Math.min(selectionRange.start.r, selectionRange.end.r);
        const sourceMaxR = Math.max(selectionRange.start.r, selectionRange.end.r);
        const sourceMinC = Math.min(selectionRange.start.c, selectionRange.end.c);
        const sourceMaxC = Math.max(selectionRange.start.c, selectionRange.end.c);

        const height = sourceMaxR - sourceMinR + 1;
        const width = sourceMaxC - sourceMinC + 1;

        const fillMinR = Math.min(sourceMinR, targetR);
        const fillMaxR = Math.max(sourceMaxR, targetR);
        const fillMinC = Math.min(sourceMinC, targetC);
        const fillMaxC = Math.max(sourceMaxC, targetC);

        const activeSheetData = currentWorkbook?.sheets?.[activeSheetIndex]?.data || [];
        const newSheetData = activeSheetData.map(r => [...r]);
        const newCellStyles = { ...cellStyles };
        const newCellFormulas = { ...cellFormulas }; // Track new formulas

        const shiftFormula = (formulaStr, rDiff, cDiff) => {
            return formulaStr.replace(/(\$?)([A-Z]+)(\$?)(\d+)/g, (match, colAbs, col, rowAbs, row) => {
                let newCol = col;
                let newRow = parseInt(row, 10);

                if (!colAbs) {
                    let colNum = 0;
                    for (let i = 0; i < col.length; i++) {
                        colNum = colNum * 26 + (col.charCodeAt(i) - 64);
                    }
                    colNum = Math.max(1, colNum + cDiff);
                    newCol = '';
                    let temp = colNum;
                    while (temp > 0) {
                        let mod = (temp - 1) % 26;
                        newCol = String.fromCharCode(65 + mod) + newCol;
                        temp = Math.floor((temp - 1) / 26);
                    }
                }

                if (!rowAbs) {
                    newRow = Math.max(1, newRow + rDiff);
                }

                return `${colAbs}${newCol}${rowAbs}${newRow}`;
            });
        };

        for (let r = fillMinR; r <= fillMaxR; r++) {
            for (let c = fillMinC; c <= fillMaxC; c++) {
                if (r >= sourceMinR && r <= sourceMaxR && c >= sourceMinC && c <= sourceMaxC) continue;

                const sourceR = sourceMinR + ((r - sourceMinR) % height + height) % height;
                const sourceC = sourceMinC + ((c - sourceMinC) % width + width) % width;
                const rDiff = r - sourceR;
                const cDiff = c - sourceC;

                const sourceVal = newSheetData[sourceR] && newSheetData[sourceR][sourceC] !== undefined ? String(newSheetData[sourceR][sourceC]) : '';
                const sourceStyle = cellStyles[`${sourceR}_${sourceC}`];
                const sourceFormula = cellFormulas[`${sourceR}_${sourceC}`];

                if (!newSheetData[r]) newSheetData[r] = Array(26).fill('');

                if (sourceFormula) {
                    const shiftedFormula = shiftFormula(sourceFormula, rDiff, cDiff);
                    newCellFormulas[`${r}_${c}`] = shiftedFormula;
                    // Don't statically copy the evaluated sourceVal. We set it up to be evaluated dynamically later.
                    newSheetData[r][c] = shiftedFormula;
                } else {
                    delete newCellFormulas[`${r}_${c}`];
                    newSheetData[r][c] = sourceVal;
                }

                if (sourceStyle) {
                    newCellStyles[`${r}_${c}`] = { ...sourceStyle };
                } else {
                    delete newCellStyles[`${r}_${c}`];
                }
            }
        }

        setCellStyles(newCellStyles);
        setCellFormulas(newCellFormulas);
        const calculatedData = recalcAllFormulas(newSheetData, newCellFormulas);

        const updatedSheets = (currentWorkbook?.sheets || []).map((s, i) => {
            if (i === activeSheetIndex) {
                return { ...s, data: calculatedData, cellStyles: newCellStyles, cellFormulas: newCellFormulas };
            }
            return s;
        });
        setCurrentWorkbook({ ...currentWorkbook, sheets: updatedSheets });

        setSelectionRange({
            start: { r: fillMinR, c: fillMinC },
            end: { r: fillMaxR, c: fillMaxC }
        });

        setStatusMessage(`Cellules étirées et remplies avec succès.`);
        setTimeout(() => setStatusMessage(''), 3000);
    };

    useEffect(() => {
        const handleMouseUp = () => {
            setIsMouseDown(false);
            if (isFillDragging && fillTarget) {
                executeFillHandle(fillTarget);
                setIsFillDragging(false);
                setFillTarget(null);
            }
        };
        window.addEventListener('mouseup', handleMouseUp);
        return () => window.removeEventListener('mouseup', handleMouseUp);
    }, [isFillDragging, fillTarget, selectionRange, cellStyles, currentWorkbook, activeSheetIndex]);


    useEffect(() => {
        const sheets = currentWorkbook?.sheets || [];
        const activeSheet = sheets[activeSheetIndex] || sheets[0];
        if (activeSheet) {
            setCellStyles(activeSheet.cellStyles || EMPTY_OBJ);
            setColWidths(activeSheet.colWidths || EMPTY_OBJ);
            setRowHeights(activeSheet.rowHeights || EMPTY_OBJ);

            const rawHiddenRows = activeSheet.hiddenRows;
            const safeHiddenRows = Array.isArray(rawHiddenRows) ? rawHiddenRows : (rawHiddenRows instanceof Set ? Array.from(rawHiddenRows) : []);
            setHiddenRows(safeHiddenRows.length > 0 ? new Set(safeHiddenRows) : EMPTY_SET);

            const rawHiddenCols = activeSheet.hiddenCols;
            const safeHiddenCols = Array.isArray(rawHiddenCols) ? rawHiddenCols : (rawHiddenCols instanceof Set ? Array.from(rawHiddenCols) : []);
            setHiddenCols(safeHiddenCols.length > 0 ? new Set(safeHiddenCols) : EMPTY_SET);
        }
    }, [activeSheetIndex]); // Only update styles when switching sheets, NOT on every keystroke

    const [lastAutoSaveTime, setLastAutoSaveTime] = useState('');

    useEffect(() => {
        if (currentWorkbook) {
            // Always call onWorkbookChange with full in-memory data (including cellStyles)
            const serializableSheets = (currentWorkbook.sheets || []).map((s, i) => {
                const isCurrent = i === activeSheetIndex;
                return {
                    ...s,
                    colWidths: isCurrent ? colWidths : (s.colWidths || {}),
                    rowHeights: isCurrent ? rowHeights : (s.rowHeights || {}),
                    cellStyles: isCurrent ? cellStyles : (s.cellStyles || {}),
                    hiddenRows: Array.isArray(s.hiddenRows) ? s.hiddenRows : (s.hiddenRows instanceof Set ? Array.from(s.hiddenRows) : []),
                    hiddenCols: Array.isArray(s.hiddenCols) ? s.hiddenCols : (s.hiddenCols instanceof Set ? Array.from(s.hiddenCols) : [])
                };
            });
            const serializableWb = { ...currentWorkbook, sheets: serializableSheets };
            emittedWbsRef.current.add(serializableWb); // Register as an intentional emission
            if (onWorkbookChange) onWorkbookChange(serializableWb);

            // Save to localStorage WITHOUT cellStyles (too large — causes QuotaExceededError).
            // cellStyles are re-extracted from the file on each upload, so they don't need persistence.
            try {
                const lightSheets = serializableSheets.map(s => ({
                    ...s,
                    cellStyles: {}  // strip styles from localStorage payload
                }));
                const lightWb = { ...currentWorkbook, sheets: lightSheets };
                localStorage.setItem('antic_active_workbook', JSON.stringify(lightWb));
                const now = new Date();
                setLastAutoSaveTime(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
            } catch (err) {
                // Silently ignore quota errors — cellStyles intentionally excluded but file may still exceed quota
            }
        }
    }, [currentWorkbook, colWidths, rowHeights, cellStyles, activeSheetIndex]);

    // Undo / Redo History Stack
    const [historyStack, setHistoryStack] = useState([]);
    const [futureStack, setFutureStack] = useState([]);

    const pushHistory = (wbState = currentWorkbook) => {
        if (!wbState) return;
        const stateToSave = JSON.parse(JSON.stringify(wbState));
        if (stateToSave.sheets && stateToSave.sheets[activeSheetIndex]) {
            stateToSave.sheets[activeSheetIndex].cellStyles = JSON.parse(JSON.stringify(cellStyles));
            stateToSave.sheets[activeSheetIndex].cellFormulas = JSON.parse(JSON.stringify(cellFormulas));
            stateToSave.sheets[activeSheetIndex].colWidths = JSON.parse(JSON.stringify(colWidths));
            stateToSave.sheets[activeSheetIndex].rowHeights = JSON.parse(JSON.stringify(rowHeights));
        }
        setHistoryStack(prev => [...prev.slice(-30), stateToSave]);
        setFutureStack([]);
    };

    const handleUndo = () => {
        if (historyStack.length === 0) return;
        const previousState = historyStack[historyStack.length - 1];

        const currentStateToSave = JSON.parse(JSON.stringify(currentWorkbook));
        if (currentStateToSave.sheets && currentStateToSave.sheets[activeSheetIndex]) {
            currentStateToSave.sheets[activeSheetIndex].cellStyles = JSON.parse(JSON.stringify(cellStyles));
            currentStateToSave.sheets[activeSheetIndex].cellFormulas = JSON.parse(JSON.stringify(cellFormulas));
            currentStateToSave.sheets[activeSheetIndex].colWidths = JSON.parse(JSON.stringify(colWidths));
            currentStateToSave.sheets[activeSheetIndex].rowHeights = JSON.parse(JSON.stringify(rowHeights));
        }
        setFutureStack(prev => [...prev, currentStateToSave]);
        setHistoryStack(prev => prev.slice(0, prev.length - 1));

        setCurrentWorkbook(previousState);
        const activeSheet = previousState.sheets?.[activeSheetIndex];
        if (activeSheet) {
            setCellStyles(activeSheet.cellStyles || EMPTY_OBJ);
            setCellFormulas(activeSheet.cellFormulas || EMPTY_OBJ);
            setColWidths(activeSheet.colWidths || EMPTY_OBJ);
            setRowHeights(activeSheet.rowHeights || EMPTY_OBJ);
        }
        setStatusMessage("Modification annulée");
        setTimeout(() => setStatusMessage(''), 2000);
    };

    const handleRedo = () => {
        if (futureStack.length === 0) return;
        const nextState = futureStack[futureStack.length - 1];

        const currentStateToSave = JSON.parse(JSON.stringify(currentWorkbook));
        if (currentStateToSave.sheets && currentStateToSave.sheets[activeSheetIndex]) {
            currentStateToSave.sheets[activeSheetIndex].cellStyles = JSON.parse(JSON.stringify(cellStyles));
            currentStateToSave.sheets[activeSheetIndex].cellFormulas = JSON.parse(JSON.stringify(cellFormulas));
            currentStateToSave.sheets[activeSheetIndex].colWidths = JSON.parse(JSON.stringify(colWidths));
            currentStateToSave.sheets[activeSheetIndex].rowHeights = JSON.parse(JSON.stringify(rowHeights));
        }
        setHistoryStack(prev => [...prev, currentStateToSave]);
        setFutureStack(prev => prev.slice(0, prev.length - 1));

        setCurrentWorkbook(nextState);
        const activeSheet = nextState.sheets?.[activeSheetIndex];
        if (activeSheet) {
            setCellStyles(activeSheet.cellStyles || EMPTY_OBJ);
            setCellFormulas(activeSheet.cellFormulas || EMPTY_OBJ);
            setColWidths(activeSheet.colWidths || EMPTY_OBJ);
            setRowHeights(activeSheet.rowHeights || EMPTY_OBJ);
        }
        setStatusMessage("Modification rétablie");
        setTimeout(() => setStatusMessage(''), 2000);
    };

    // Column & Row Interactive Drag-Resizing State
    const [resizingCol, setResizingCol] = useState(null); // { cIdx, startX, startWidth }
    const [resizingRow, setResizingRow] = useState(null); // { rIdx, startY, startHeight }

    const handleColResizeStart = (e, cIdx) => {
        e.stopPropagation();
        e.preventDefault();
        const startWidth = colWidths[cIdx] || 100;
        setResizingCol({ cIdx, startX: e.clientX, startWidth });
    };

    const handleRowResizeStart = (e, rIdx) => {
        e.stopPropagation();
        e.preventDefault();
        const startHeight = rowHeights[rIdx] || 28;
        setResizingRow({ rIdx, startY: e.clientY, startHeight });
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (resizingCol) {
                const diff = e.clientX - resizingCol.startX;
                const newW = Math.max(5, resizingCol.startWidth + diff);
                setColWidths(prev => ({ ...prev, [resizingCol.cIdx]: newW }));
            }
            if (resizingRow) {
                const diff = e.clientY - resizingRow.startY;
                const newH = Math.max(5, resizingRow.startHeight + diff);
                setRowHeights(prev => ({ ...prev, [resizingRow.rIdx]: newH }));
            }
        };

        const handleMouseUp = () => {
            if (resizingCol || resizingRow) {
                pushHistory();
                setResizingCol(null);
                setResizingRow(null);
            }
        };

        if (resizingCol || resizingRow) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [resizingCol, resizingRow]);

    const [hiddenRows, setHiddenRows] = useState(EMPTY_SET);
    const [hiddenCols, setHiddenCols] = useState(EMPTY_SET);
    const [frozenRow, setFrozenRow] = useState(false);
    const [frozenCol, setFrozenCol] = useState(false);

    // Active Popover Menus
    const [activeMenu, setActiveMenu] = useState(null); // 'row' | 'col' | 'textColor' | 'bgColor' | 'sigma' | null

    // Recent colors history
    const [recentColors, setRecentColors] = useState(['#000000', '#FFC000', '#FF0000', '#002060', '#92D050']);

    const [editingCell, setEditingCell] = useState(null);
    const [cellInputValue, setCellInputValue] = useState('');
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');

    // Format control states
    const [activeTextColor, setActiveTextColor] = useState('#000000');
    const [activeBgColor, setActiveBgColor] = useState('#FFFF00');
    const [fontFamily, setFontFamily] = useState('Inter');
    const [fontSizeNum, setFontSizeNum] = useState('13');

    // Sheet tabs state & operations
    const [copiedSheet, setCopiedSheet] = useState(null);
    const [activeSheetMenu, setActiveSheetMenu] = useState(null); // sheet index or null

    const handleAddSheet = () => {
        const currentSheets = currentWorkbook?.sheets || [];
        const newSheetName = `Feuille${currentSheets.length + 1}`;
        const newSheet = { name: newSheetName, data: createEmptySheetData(50, 26) };
        const updatedSheets = [...currentSheets, newSheet];
        setCurrentWorkbook({ ...currentWorkbook, sheets: updatedSheets });
        setActiveSheetIndex(updatedSheets.length - 1);
        setStatusMessage(`Feuille "${newSheetName}" ajoutée.`);
        setTimeout(() => setStatusMessage(''), 3000);
    };

    const [renameModal, setRenameModal] = useState({ isOpen: false, sheetIndex: null, newName: '' });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, sheetIndex: null, sheetName: '' });

    const handleRenameSheet = (index) => {
        const currentSheets = currentWorkbook?.sheets || [];
        const currentName = currentSheets[index]?.name || '';
        setRenameModal({ isOpen: true, sheetIndex: index, newName: currentName });
        setActiveSheetMenu(null);
    };

    const confirmRenameSheet = (e) => {
        if (e) e.preventDefault();
        if (!renameModal.newName || !renameModal.newName.trim()) return;
        const currentSheets = currentWorkbook?.sheets || [];
        const updatedSheets = [...currentSheets];
        updatedSheets[renameModal.sheetIndex] = { ...updatedSheets[renameModal.sheetIndex], name: renameModal.newName.trim() };
        setCurrentWorkbook({ ...currentWorkbook, sheets: updatedSheets });
        setStatusMessage(`Feuille renommée en "${renameModal.newName.trim()}".`);
        setTimeout(() => setStatusMessage(''), 3000);
        setRenameModal({ isOpen: false, sheetIndex: null, newName: '' });
    };

    const handleDeleteSheet = (index) => {
        const currentSheets = currentWorkbook?.sheets || [];
        if (currentSheets.length <= 1) {
            setStatusMessage("Impossible de supprimer la seule feuille du classeur.");
            setTimeout(() => setStatusMessage(''), 3000);
            setActiveSheetMenu(null);
            return;
        }
        setDeleteModal({ isOpen: true, sheetIndex: index, sheetName: currentSheets[index]?.name || '' });
        setActiveSheetMenu(null);
    };

    const confirmDeleteSheet = () => {
        const currentSheets = currentWorkbook?.sheets || [];
        const index = deleteModal.sheetIndex;
        if (index === null) return;
        const sheetToDelete = currentSheets[index]?.name;
        const updatedSheets = currentSheets.filter((_, i) => i !== index);
        setCurrentWorkbook({ ...currentWorkbook, sheets: updatedSheets });
        if (activeSheetIndex >= updatedSheets.length) {
            setActiveSheetIndex(updatedSheets.length - 1);
        }
        setStatusMessage(`Feuille "${sheetToDelete}" supprimée.`);
        setTimeout(() => setStatusMessage(''), 3000);
        setDeleteModal({ isOpen: false, sheetIndex: null, sheetName: '' });
    };

    const handleCopySheet = (index) => {
        const currentSheets = currentWorkbook?.sheets || [];
        const sheetToCopy = currentSheets[index];
        if (sheetToCopy) {
            setCopiedSheet(JSON.parse(JSON.stringify(sheetToCopy)));
            setStatusMessage(`Feuille "${sheetToCopy.name}" copiée dans le presse-papier.`);
            setTimeout(() => setStatusMessage(''), 3000);
        }
        setActiveSheetMenu(null);
    };

    const handlePasteSheet = () => {
        if (!copiedSheet) return;
        const currentSheets = currentWorkbook?.sheets || [];
        const newSheetName = `${copiedSheet.name}_copie`;
        const newSheet = { ...JSON.parse(JSON.stringify(copiedSheet)), name: newSheetName };
        const updatedSheets = [...currentSheets, newSheet];
        setCurrentWorkbook({ ...currentWorkbook, sheets: updatedSheets });
        setActiveSheetIndex(updatedSheets.length - 1);
        setStatusMessage(`Feuille "${newSheetName}" collée avec succès.`);
        setTimeout(() => setStatusMessage(''), 3000);
        setActiveSheetMenu(null);
    };

    const [isSheetToolsModalOpen, setIsSheetToolsModalOpen] = useState(false);

    const handleCreateChildSheet = ({ parentSheetName, childSheetName, colIndex, filterOperator, filterValue, selectedCols }) => {
        const currentSheets = currentWorkbook?.sheets || [];
        const parentSheet = currentSheets.find(s => s.name === parentSheetName);
        if (!parentSheet) return;

        const parentData = parentSheet.data || [];
        const rawHeaderRow = parentData[0] || [];

        const filteredRawRowsWithIndex = [];
        for (let r = 1; r < parentData.length; r++) {
            const row = parentData[r];
            const cellVal = String(row[colIndex] || '').trim().toLowerCase();
            const targetVal = String(filterValue || '').trim().toLowerCase();
            let keep = false;

            if (filterOperator === 'equals') keep = cellVal === targetVal;
            else if (filterOperator === 'contains') keep = cellVal.includes(targetVal);
            else if (filterOperator === 'startsWith') keep = cellVal.startsWith(targetVal);
            else if (filterOperator === 'greaterThan') keep = parseFloat(cellVal) > parseFloat(targetVal);
            else if (filterOperator === 'lessThan') keep = parseFloat(cellVal) < parseFloat(targetVal);
            else if (filterOperator === 'notEmpty') keep = cellVal !== '';
            else if (filterOperator === 'isEmpty') keep = cellVal === '';
            else keep = true;

            if (keep) {
                filteredRawRowsWithIndex.push({ row, originalR: r });
            }
        }

        const colIndicesToKeep = Array.isArray(selectedCols) && selectedCols.length > 0
            ? selectedCols
            : Array.from({ length: 15 }, (_, i) => i);

        // Map ColWidths
        const newColWidths = {};
        colIndicesToKeep.forEach((oldCIdx, newCIdx) => {
            if (parentSheet.colWidths?.[oldCIdx]) {
                newColWidths[newCIdx] = parentSheet.colWidths[oldCIdx];
            }
        });

        // Map RowHeights
        const newRowHeights = {};
        if (parentSheet.rowHeights?.[0]) newRowHeights[0] = parentSheet.rowHeights[0];
        filteredRawRowsWithIndex.forEach((item, newRowCounter) => {
            if (parentSheet.rowHeights?.[item.originalR]) {
                newRowHeights[newRowCounter + 1] = parentSheet.rowHeights[item.originalR];
            }
        });

        // Map CellStyles & CellFormulas
        const newCellStyles = {};
        const newCellFormulas = {};
        const oldStyles = parentSheet.cellStyles || {};
        const oldFormulas = parentSheet.cellFormulas || {};

        colIndicesToKeep.forEach((oldCIdx, newCIdx) => {
            if (oldStyles[`0_${oldCIdx}`]) newCellStyles[`0_${newCIdx}`] = oldStyles[`0_${oldCIdx}`];
            if (oldFormulas[`0_${oldCIdx}`]) newCellFormulas[`0_${newCIdx}`] = oldFormulas[`0_${oldCIdx}`];
        });
        filteredRawRowsWithIndex.forEach((item, newRowCounter) => {
            const newR = newRowCounter + 1;
            colIndicesToKeep.forEach((oldCIdx, newCIdx) => {
                if (oldStyles[`${item.originalR}_${oldCIdx}`]) {
                    newCellStyles[`${newR}_${newCIdx}`] = oldStyles[`${item.originalR}_${oldCIdx}`];
                }
                if (oldFormulas[`${item.originalR}_${oldCIdx}`]) {
                    newCellFormulas[`${newR}_${newCIdx}`] = oldFormulas[`${item.originalR}_${oldCIdx}`];
                }
            });
        });

        // Map Merges (Header Row specifically to preserve table layouts)
        const newMerges = [];
        (parentSheet.merges || []).forEach(m => {
            let sR = m.startRow !== undefined ? m.startRow : m.s?.r;
            let eR = m.endRow !== undefined ? m.endRow : m.e?.r;
            let sC = m.startCol !== undefined ? m.startCol : m.s?.c;
            let eC = m.endCol !== undefined ? m.endCol : m.e?.c;

            if (sR === 0 && eR === 0) {
                let newStartC = -1;
                let newEndC = -1;
                colIndicesToKeep.forEach((oldC, idx) => {
                    if (oldC === sC) newStartC = idx;
                    if (oldC === eC) newEndC = idx;
                });
                if (newStartC !== -1 && newEndC !== -1 && newStartC < newEndC) {
                    newMerges.push({ startRow: 0, endRow: 0, startCol: newStartC, endCol: newEndC, rowSpan: 1, colSpan: newEndC - newStartC + 1 });
                }
            }
        });

        const projectedHeaderRow = colIndicesToKeep.map(cIdx => rawHeaderRow[cIdx] || '');
        const projectedRows = filteredRawRowsWithIndex.map(item => colIndicesToKeep.map(cIdx => item.row[cIdx] || ''));

        const emptyRowsNeeded = Math.max(0, 49 - projectedRows.length);
        const paddedRows = [projectedHeaderRow, ...projectedRows];
        for (let i = 0; i < emptyRowsNeeded; i++) {
            paddedRows.push(Array(colIndicesToKeep.length).fill(''));
        }

        const newChildSheet = {
            name: childSheetName,
            type: 'child',
            parentSheetName,
            filterRule: { colIndex, filterOperator, filterValue, selectedCols: colIndicesToKeep },
            data: paddedRows,
            cellStyles: newCellStyles,
            cellFormulas: newCellFormulas,
            colWidths: newColWidths,
            rowHeights: newRowHeights,
            merges: newMerges
        };

        const parentIndex = currentSheets.findIndex(s => s.name === parentSheetName);
        const insertIndex = parentIndex !== -1 ? parentIndex + 1 : currentSheets.length;

        const updatedSheets = [...currentSheets];
        updatedSheets.splice(insertIndex, 0, newChildSheet);

        setCurrentWorkbook({ ...currentWorkbook, sheets: updatedSheets });
        setActiveSheetIndex(insertIndex);
        setStatusMessage(`Feuille Enfant "${childSheetName}" créée (styles préservés).`);
        setTimeout(() => setStatusMessage(''), 4000);
    };

    const handleSyncChildSheets = (parentSheetName) => {
        const currentSheets = currentWorkbook?.sheets || [];
        const targetParentName = parentSheetName || currentWorkbook?.sheets[activeSheetIndex]?.name;
        const parentSheet = currentSheets.find(s => s.name === targetParentName);
        if (!parentSheet) return;

        const parentData = parentSheet.data || [];
        const headerRow = parentData[0] || [];
        let updatedCount = 0;

        const updatedSheets = currentSheets.map(sheet => {
            if (sheet.type === 'child' && sheet.parentSheetName === targetParentName && sheet.filterRule) {
                const { colIndex, filterOperator, filterValue } = sheet.filterRule;
                const filteredRows = parentData.slice(1).filter(row => {
                    const cellVal = String(row[colIndex] || '').trim().toLowerCase();
                    const targetVal = String(filterValue).trim().toLowerCase();

                    if (filterOperator === 'equals') return cellVal === targetVal;
                    if (filterOperator === 'contains') return cellVal.includes(targetVal);
                    if (filterOperator === 'startsWith') return cellVal.startsWith(targetVal);
                    if (filterOperator === 'greaterThan') return parseFloat(cellVal) > parseFloat(targetVal);
                    if (filterOperator === 'lessThan') return parseFloat(cellVal) < parseFloat(targetVal);
                    return true;
                });

                const emptyRowsNeeded = Math.max(0, 49 - filteredRows.length);
                const paddedRows = [headerRow, ...filteredRows];
                for (let i = 0; i < emptyRowsNeeded; i++) {
                    paddedRows.push(Array(26).fill(''));
                }

                updatedCount++;
                return { ...sheet, data: paddedRows };
            }
            return sheet;
        });

        setCurrentWorkbook({ ...currentWorkbook, sheets: updatedSheets });
        setStatusMessage(`Synchronisation 1-voie effectuée : ${updatedCount} feuille(s) enfant(s) mise(s) à jour depuis "${targetParentName}".`);
        setTimeout(() => setStatusMessage(''), 4000);
    };

    const sheets = currentWorkbook?.sheets || [];
    const currentSheet = sheets[activeSheetIndex] || sheets[0] || { name: 'Feuille1', data: createEmptySheetData(50, 26), merges: [] };
    const sheetData = currentSheet.data || createEmptySheetData(50, 26);

    const minR = Math.min(selectionRange.start.r, selectionRange.end.r);
    const maxR = Math.max(selectionRange.start.r, selectionRange.end.r);
    const minC = Math.min(selectionRange.start.c, selectionRange.end.c);
    const maxC = Math.max(selectionRange.start.c, selectionRange.end.c);

    const isCellSelected = (r, c) => r >= minR && r <= maxR && c >= minC && c <= maxC;

    // Helper: Determine if cell is master, covered, or unmerged
    const getMergeInfo = (r, c, merges = []) => {
        if (!merges || !Array.isArray(merges) || merges.length === 0) return null;
        for (const rawM of merges) {
            if (!rawM) continue;
            const startRow = rawM.startRow !== undefined ? rawM.startRow : rawM.s?.r;
            const endRow = rawM.endRow !== undefined ? rawM.endRow : rawM.e?.r;
            const startCol = rawM.startCol !== undefined ? rawM.startCol : rawM.s?.c;
            const endCol = rawM.endCol !== undefined ? rawM.endCol : rawM.e?.c;

            if (startRow === undefined || endRow === undefined || startCol === undefined || endCol === undefined) continue;

            if (r >= startRow && r <= endRow && c >= startCol && c <= endCol) {
                if (r === startRow && c === startCol) {
                    let actualRowSpan = 0;
                    for (let i = startRow; i <= endRow; i++) {
                        if (!currentSheet.hiddenRows?.includes(i)) actualRowSpan++;
                    }
                    let actualColSpan = 0;
                    for (let i = startCol; i <= endCol; i++) {
                        if (!currentSheet.hiddenCols?.includes(i)) actualColSpan++;
                    }
                    return {
                        isMaster: true,
                        rowSpan: actualRowSpan || 1, // Fallback to 1 if fully hidden (should not render anyway)
                        colSpan: actualColSpan || 1,
                        realRowSpan: endRow - startRow + 1, // Store original for unmerge logic
                        realColSpan: endCol - startCol + 1
                    };
                }
                return { isCovered: true };
            }
        }
        return null;
    };

    // Action: Merge & Center or Unmerge selected range
    const handleToggleMergeSelection = (forceUnmerge = false) => {
        pushHistory(); // Capture precise state BEFORE the merge action
        const currentMerges = currentSheet.merges || [];
        const isMultiCell = minR !== maxR || minC !== maxC;

        // Check if current selection overlaps an existing merge range
        const existingIdx = currentMerges.findIndex(rawM => {
            const sR = rawM.startRow !== undefined ? rawM.startRow : rawM.s?.r;
            const eR = rawM.endRow !== undefined ? rawM.endRow : rawM.e?.r;
            const sC = rawM.startCol !== undefined ? rawM.startCol : rawM.s?.c;
            const eC = rawM.endCol !== undefined ? rawM.endCol : rawM.e?.c;
            if (sR === undefined) return false;
            return minR >= sR && maxR <= eR && minC >= sC && maxC <= eC;
        });

        if (existingIdx !== -1 || forceUnmerge) {
            if (existingIdx !== -1) {
                const updatedMerges = currentMerges.filter((_, idx) => idx !== existingIdx);
                const updatedSheets = [...sheets];
                updatedSheets[activeSheetIndex] = { ...currentSheet, merges: updatedMerges };
                setCurrentWorkbook({ ...currentWorkbook, sheets: updatedSheets });
                setStatusMessage("Cellules défusionnées avec succès.");
                setTimeout(() => setStatusMessage(''), 3000);
            } else {
                setStatusMessage("Aucune cellule fusionnée à cet emplacement.");
                setTimeout(() => setStatusMessage(''), 3000);
            }
            return;
        }

        if (!isMultiCell) {
            setStatusMessage("Veuillez sélectionner plusieurs cellules pour les fusionner.");
            setTimeout(() => setStatusMessage(''), 3000);
            return;
        }

        // Add new merge range
        const newMerge = {
            startRow: minR,
            startCol: minC,
            endRow: maxR,
            endCol: maxC,
            rowSpan: maxR - minR + 1,
            colSpan: maxC - minC + 1
        };

        const filteredMerges = currentMerges.filter(rawM => {
            const sR = rawM.startRow !== undefined ? rawM.startRow : rawM.s?.r;
            const eR = rawM.endRow !== undefined ? rawM.endRow : rawM.e?.r;
            const sC = rawM.startCol !== undefined ? rawM.startCol : rawM.s?.c;
            const eC = rawM.endCol !== undefined ? rawM.endCol : rawM.e?.c;
            if (sR === undefined) return true;
            return !(sR >= minR && eR <= maxR && sC >= minC && eC <= maxC);
        });

        const updatedMerges = [...filteredMerges, newMerge];
        const updatedSheets = [...sheets];
        updatedSheets[activeSheetIndex] = { ...currentSheet, merges: updatedMerges };

        const nextWorkbook = { ...currentWorkbook, sheets: updatedSheets };
        setCurrentWorkbook(nextWorkbook);

        // this will also save but we have our latest merges saved. Pass true to skip pushing history again
        applyStyleToSelectedRange({ align: 'center' }, true);

        setStatusMessage(`Cellules ${getColLabel(minC)}${minR + 1}:${getColLabel(maxC)}${maxR + 1} fusionnées.`);
        setTimeout(() => setStatusMessage(''), 3000);
    };
    const applyStyleToSelectedRange = (stylePatch, skipHistory = false) => {
        if (!skipHistory) {
            pushHistory(); // Save the state before style modification
        }
        let finalStyles = null;
        setCellStyles(prev => {
            const next = { ...prev };
            for (let r = minR; r <= maxR; r++) {
                for (let c = minC; c <= maxC; c++) {
                    const key = `${r}_${c}`;
                    next[key] = {
                        ...next[key],
                        ...stylePatch
                    };
                }
            }
            finalStyles = next;
            return next;
        });

        // Sync styles immediately to currentWorkbook so they persist on tab switch, undo, or data edit
        if (finalStyles) {
            const updatedSheets = [...sheets];
            updatedSheets[activeSheetIndex] = { ...currentSheet, cellStyles: finalStyles };
            const nextWorkbook = { ...currentWorkbook, sheets: updatedSheets };
            setCurrentWorkbook(nextWorkbook);
        }
    };

    const toggleBold = () => {
        const isCurrentBold = cellStyles[`${minR}_${minC}`]?.bold;
        applyStyleToSelectedRange({ bold: !isCurrentBold });
    };

    const toggleItalic = () => {
        const isCurrentItalic = cellStyles[`${minR}_${minC}`]?.italic;
        applyStyleToSelectedRange({ italic: !isCurrentItalic });
    };

    const toggleUnderline = () => {
        const isCurrentUnderline = cellStyles[`${minR}_${minC}`]?.underline;
        applyStyleToSelectedRange({ underline: !isCurrentUnderline });
    };

    const applyTextColor = (color) => {
        setActiveTextColor(color);
        applyStyleToSelectedRange({ color });
        if (color !== 'transparent' && !recentColors.includes(color)) {
            setRecentColors(prev => [color, ...prev.slice(0, 9)]);
        }
    };

    const applyBgColor = (bg) => {
        setActiveBgColor(bg);
        applyStyleToSelectedRange({ bg });
        if (bg !== 'transparent' && !recentColors.includes(bg)) {
            setRecentColors(prev => [bg, ...prev.slice(0, 9)]);
        }
    };

    const applyAlign = (align) => applyStyleToSelectedRange({ align });
    const applyVerticalAlign = (verticalAlign) => applyStyleToSelectedRange({ verticalAlign });
    const toggleWrapText = () => {
        const isCurrentWrap = cellStyles[`${minR}_${minC}`]?.wrapText;
        applyStyleToSelectedRange({ wrapText: !isCurrentWrap });
    };

    const applyBorders = (borderType) => {
        setCellStyles(prev => {
            const next = { ...prev };
            for (let r = minR; r <= maxR; r++) {
                for (let c = minC; c <= maxC; c++) {
                    const key = `${r}_${c}`;
                    if (borderType === 'none') {
                        const styleCopy = { ...next[key] };
                        delete styleCopy.border;
                        delete styleCopy.borderTop;
                        delete styleCopy.borderBottom;
                        delete styleCopy.borderLeft;
                        delete styleCopy.borderRight;
                        next[key] = styleCopy;
                    } else if (borderType === 'all') {
                        next[key] = {
                            ...next[key],
                            border: '1px solid #000000',
                            borderTop: '1px solid #000000',
                            borderBottom: '1px solid #000000',
                            borderLeft: '1px solid #000000',
                            borderRight: '1px solid #000000'
                        };
                    }
                }
            }
            return next;
        });
    };

    const applyFontFamily = (font) => {
        setFontFamily(font);
        applyStyleToSelectedRange({ fontFamily: font });
    };

    const applyFontSize = (sizeStr) => {
        setFontSizeNum(sizeStr);
        applyStyleToSelectedRange({ fontSize: `${sizeStr.replace(/px/g, '') || 13}px` });
    };

    const parseColor = (colorObj) => {
        if (!colorObj) return null;
        if (typeof colorObj === 'string') return colorObj.startsWith('#') ? colorObj : `#${colorObj}`;
        if (colorObj.rgb) {
            let hex = colorObj.rgb;
            if (hex.length === 8) hex = hex.substring(2);
            return `#${hex}`;
        }
        return null;
    };

    const parseSheetStylesAndDimensions = (worksheet) => {
        const cellStyles = {};
        const colWidths = {};
        const rowHeights = {};

        const hiddenRows = [];
        const hiddenCols = [];

        if (worksheet['!cols'] && Array.isArray(worksheet['!cols'])) {
            worksheet['!cols'].forEach((col, idx) => {
                if (!col) return;
                if (col.wpx) colWidths[idx] = col.wpx;
                else if (col.width) colWidths[idx] = Math.round(col.width * 7.5 + 5);
                else if (col.wch) colWidths[idx] = Math.round(col.wch * 7.5 + 5);
                if (col.hidden || col.h || col.wpx === 0 || col.width === 0) hiddenCols.push(idx);
            });
        }

        if (worksheet['!rows'] && Array.isArray(worksheet['!rows'])) {
            worksheet['!rows'].forEach((row, idx) => {
                if (!row) return;
                if (row.hpx) rowHeights[idx] = row.hpx;
                else if (row.hpt) rowHeights[idx] = Math.round(row.hpt * 1.33);
                if (row.hidden || row.h || row.zeroHeight || row.hpx === 0 || row.hpt === 0) hiddenRows.push(idx);
            });
        }

        const ref = worksheet['!ref'] || 'A1';
        const range = XLSX.utils.decode_range(ref);
        for (let R = range.s.r; R <= range.e.r; ++R) {
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                const cell = worksheet[cellAddress];
                if (!cell || !cell.s) continue;

                const styleObj = {};
                const s = cell.s;

                if (s.font) {
                    if (s.font.bold) styleObj.bold = true;
                    if (s.font.italic) styleObj.italic = true;
                    if (s.font.underline) styleObj.underline = true;
                    if (s.font.name) styleObj.fontFamily = s.font.name;
                    if (s.font.sz || s.font.size) styleObj.fontSize = `${s.font.sz || s.font.size}px`;
                    const fontColor = parseColor(s.font.color);
                    if (fontColor) styleObj.color = fontColor;
                }

                const bgColor = parseColor(s.fgColor || s.fill?.fgColor || s.fill?.bgColor);
                if (bgColor && bgColor !== '#FFFFFF') styleObj.bg = bgColor;

                if (s.alignment) {
                    let alignVal = s.alignment.horizontal;
                    if (alignVal) {
                        const lower = String(alignVal).toLowerCase();
                        if (lower.includes('center') || lower.includes('centre')) alignVal = 'center';
                        else if (lower.includes('right')) alignVal = 'right';
                        else if (lower.includes('justify')) alignVal = 'justify';
                        else alignVal = 'left';
                        styleObj.align = alignVal;
                    }
                    if (s.alignment.vertical) {
                        const vLower = String(s.alignment.vertical).toLowerCase();
                        if (vLower.includes('top')) styleObj.verticalAlign = 'top';
                        else if (vLower.includes('center') || vLower.includes('middle')) styleObj.verticalAlign = 'middle';
                        else if (vLower.includes('bottom')) styleObj.verticalAlign = 'bottom';
                    }
                }

                if (!styleObj.align && cell.v !== undefined && cell.v !== null && cell.v !== '') {
                    const strVal = String(cell.v).trim();
                    if (!isNaN(strVal) || /^\d+(\.\d+)?%?$/.test(strVal) || /^\d[\d\s]*\s?FCFA$/i.test(strVal)) {
                        styleObj.align = 'right';
                    }
                }

                if (Object.keys(styleObj).length > 0) {
                    cellStyles[`${R}_${C}`] = styleObj;
                }
            }
        }

        return { cellStyles, colWidths, rowHeights };
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const newWb = await parseExcelFile(file);
            const parsedSheets = newWb.sheets || [];
            newWb.id = `wb-${Date.now()}`;
            newWb.name = file.name;
            newWb.size = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;

            const firstSheet = parsedSheets[0];
            if (firstSheet) {
                setCellStyles(firstSheet.cellStyles || EMPTY_OBJ);
                setColWidths(firstSheet.colWidths || EMPTY_OBJ);
                setRowHeights(firstSheet.rowHeights || EMPTY_OBJ);
                setHiddenRows(firstSheet.hiddenRows?.length > 0 ? new Set(firstSheet.hiddenRows) : EMPTY_SET);
                setHiddenCols(firstSheet.hiddenCols?.length > 0 ? new Set(firstSheet.hiddenCols) : EMPTY_SET);
            }

            if (onUploadSuccess) {
                onUploadSuccess(newWb);
            } else {
                setCurrentWorkbook(newWb);
                setActiveSheetIndex(0);
                try {
                    localStorage.setItem('antic_active_workbook', JSON.stringify(newWb));
                    if (onWorkbookChange) onWorkbookChange(newWb);
                } catch (err) { }
            }
            setStatusMessage(`Fichier "${file.name}" chargé avec succès (${parsedSheets.length} feuille(s)).`);
            setTimeout(() => setStatusMessage(''), 4000);
        } catch (err) {
            console.error(err);
            setStatusMessage("Erreur de lecture du fichier Excel.");
            setTimeout(() => setStatusMessage(''), 4000);
        }
    };


    const handleSaveExcelWorkbook = () => {
        try {
            const wb = XLSX.utils.book_new();
            const allSheets = currentWorkbook?.sheets || [];

            allSheets.forEach(sheet => {
                const rawData = sheet.data || [];
                let lastRowIndex = rawData.length - 1;
                while (lastRowIndex >= 0 && rawData[lastRowIndex].every(val => val === '' || val === null || val === undefined)) {
                    lastRowIndex--;
                }
                const cleanData = rawData.slice(0, Math.max(lastRowIndex + 1, 1));
                const ws = XLSX.utils.aoa_to_sheet(cleanData);

                // High-fidelity cell styles & alignment export:
                const sheetStyles = sheet.cellStyles || {};
                Object.keys(sheetStyles).forEach(key => {
                    const [rStr, cStr] = key.split('_');
                    const r = parseInt(rStr, 10);
                    const c = parseInt(cStr, 10);
                    const cellAddress = XLSX.utils.encode_cell({ r, c });
                    if (!ws[cellAddress]) {
                        ws[cellAddress] = { v: '', t: 's' };
                    }
                    const st = sheetStyles[key];
                    if (st) {
                        const styleObj = {};
                        // Font
                        styleObj.font = {};
                        if (st.bold) styleObj.font.bold = true;
                        if (st.italic) styleObj.font.italic = true;
                        if (st.underline) styleObj.font.underline = true;
                        if (st.fontFamily) styleObj.font.name = st.fontFamily;
                        if (st.fontSize) styleObj.font.sz = parseInt(st.fontSize, 10) || 11;
                        if (st.color) {
                            const hex = String(st.color).replace('#', '');
                            styleObj.font.color = { rgb: hex };
                        }

                        // Background Fill
                        if (st.bg && st.bg !== '#FFFFFF' && st.bg !== 'transparent') {
                            const hexBg = String(st.bg).replace('#', '');
                            styleObj.fill = { fgColor: { rgb: hexBg } };
                        }

                        // Alignment (Horizontal & Vertical & Wrap)
                        styleObj.alignment = {};
                        const hAlign = st.align || (st.ht === '0' ? 'center' : (st.ht === '2' ? 'right' : (st.ht === '1' ? 'left' : null)));
                        if (hAlign) styleObj.alignment.horizontal = hAlign;

                        const vAlign = st.verticalAlign || (st.vt === '0' ? 'center' : (st.vt === '1' ? 'top' : (st.vt === '2' ? 'bottom' : null)));
                        if (vAlign) styleObj.alignment.vertical = vAlign;

                        if (st.wrapText) styleObj.alignment.wrapText = true;

                        ws[cellAddress].s = styleObj;
                    }
                });

                // Attach Merged Ranges (High-Fidelity Merges)
                const merges = sheet.merges || [];
                if (merges.length > 0) {
                    ws['!merges'] = merges.map(m => {
                        const startRow = m.startRow !== undefined ? m.startRow : m.s?.r;
                        const endRow = m.endRow !== undefined ? m.endRow : m.e?.r;
                        const startCol = m.startCol !== undefined ? m.startCol : m.s?.c;
                        const endCol = m.endCol !== undefined ? m.endCol : m.e?.c;
                        return {
                            s: { r: Math.min(startRow, endRow), c: Math.min(startCol, endCol) },
                            e: { r: Math.max(startRow, endRow), c: Math.max(startCol, endCol) }
                        };
                    });
                }

                // Attach Column Widths
                const colWidthsObj = sheet.colWidths || {};
                const colsArr = [];
                Object.keys(colWidthsObj).forEach(cIdx => {
                    const w = colWidthsObj[cIdx];
                    if (w) colsArr[parseInt(cIdx, 10)] = { wpx: w };
                });
                if (colsArr.length > 0) ws['!cols'] = colsArr;

                XLSX.utils.book_append_sheet(wb, ws, sheet.name || 'Feuille');
            });

            const originalName = currentWorkbook?.name || 'Document_Excel.xlsx';
            const extMatch = originalName.match(/\.([a-zA-Z0-9]+)$/);
            const ext = extMatch ? extMatch[1].toLowerCase() : 'xlsx';
            let bookType = 'xlsx';
            if (ext === 'xls') bookType = 'biff8';
            else if (ext === 'xlsm') bookType = 'xlsm';
            else if (ext === 'xlsb') bookType = 'xlsb';
            else if (ext === 'csv') bookType = 'csv';
            else if (ext === 'ods') bookType = 'ods';
            else if (ext === 'html' || ext === 'htm') bookType = 'html';
            else bookType = 'xlsx';

            const exportFileName = extMatch ? originalName : `${originalName}.xlsx`;

            XLSX.writeFile(wb, exportFileName, { bookType, cellStyles: true });
            setStatusMessage(`Fichier "${exportFileName}" enregistré avec succès avec tous ses styles et fusions !`);
            setTimeout(() => setStatusMessage(''), 4000);
        } catch (err) {
            console.error("Save error:", err);
            setStatusMessage("Erreur lors de l'enregistrement du fichier.");
            setTimeout(() => setStatusMessage(''), 4000);
        }
    };


    // Keyboard shortcuts (Ctrl+S, Ctrl+Z, Ctrl+Y, Ctrl+C, Ctrl+V)
    useEffect(() => {
        const handleKeyDown = async (e) => {
            if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
                e.preventDefault();
                handleSaveExcelWorkbook();
            } else if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
                e.preventDefault();
                handleUndo();
            } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) {
                e.preventDefault();
                handleRedo();
            } else if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
                if (editingCell) return;
                e.preventDefault();
                const minR = Math.min(selectionRange.start.r, selectionRange.end.r);
                const maxR = Math.max(selectionRange.start.r, selectionRange.end.r);
                const minC = Math.min(selectionRange.start.c, selectionRange.end.c);
                const maxC = Math.max(selectionRange.start.c, selectionRange.end.c);
                const data = currentSheet.data || [];
                let tsv = '';
                for (let r = minR; r <= maxR; r++) {
                    const rowVals = [];
                    for (let c = minC; c <= maxC; c++) {
                        let val = data[r][c] || '';
                        if (typeof val === 'string' && (val.includes('\t') || val.includes('\n'))) {
                            val = `"${val.replace(/"/g, '""')}"`;
                        }
                        rowVals.push(val);
                    }
                    tsv += rowVals.join('\t') + '\n';
                }
                navigator.clipboard.writeText(tsv).then(() => {
                    setStatusMessage("Cellules copiées !");
                    setTimeout(() => setStatusMessage(''), 1500);
                });
            } else if ((e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'V')) {
                if (editingCell) return;
                e.preventDefault();
                pushHistory(); // Save state before paste
                try {
                    const tsv = await navigator.clipboard.readText();
                    if (!tsv) return;
                    const lines = tsv.split('\n').filter((l, i, arr) => !(i === arr.length - 1 && l === ''));
                    const startR = Math.min(selectionRange.start.r, selectionRange.end.r);
                    const startC = Math.min(selectionRange.start.c, selectionRange.end.c);
                    const updatedSheets = [...sheets];
                    const updatedData = [...(currentSheet.data || [])].map(row => [...row]);

                    for (let i = 0; i < lines.length; i++) {
                        const tr = startR + i;
                        if (tr >= updatedData.length) break;
                        const cols = lines[i].split('\t');
                        for (let j = 0; j < cols.length; j++) {
                            const tc = startC + j;
                            if (tc >= 26) break;
                            let val = cols[j];
                            if (val.startsWith('"') && val.endsWith('"')) {
                                val = val.substring(1, val.length - 1).replace(/""/g, '"');
                            }
                            if (updatedData[tr]) updatedData[tr][tc] = val;
                        }
                    }
                    updatedSheets[activeSheetIndex] = { ...currentSheet, data: updatedData };
                    const nextWorkbook = { ...currentWorkbook, sheets: updatedSheets };

                    setCurrentWorkbook(nextWorkbook);
                    setStatusMessage("Données collées !");
                    setTimeout(() => setStatusMessage(''), 1500);
                } catch (err) { }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentWorkbook, sheets, activeSheetIndex, currentSheet, selectionRange, editingCell]);

    const getColLabel = (index) => {
        let label = '';
        let i = index;
        while (i >= 0) {
            label = String.fromCharCode((i % 26) + 65) + label;
            i = Math.floor(i / 26) - 1;
        }
        return label;
    };

    const handleCellMouseDown = (r, c) => {
        setIsMouseDown(true);
        setSelectionRange({ start: { r, c }, end: { r, c } });
        setCellInputValue(cellFormulas[`${r}_${c}`] || sheetData[r]?.[c] || '');
    };

    const handleCellMouseEnter = (r, c) => {
        if (isMouseDown) setSelectionRange(prev => ({ ...prev, end: { r, c } }));
    };

    const handleCellMouseUp = () => setIsMouseDown(false);

    const handleCellDoubleClick = (r, c) => {
        pushHistory(); // Save state right before editing starts
        setEditingCell({ r, c });
        setCellInputValue(cellFormulas[`${r}_${c}`] || sheetData[r]?.[c] || '');
    };

    const getColIndexFromLabel = (label) => {
        let idx = 0;
        for (let i = 0; i < label.length; i++) {
            idx = idx * 26 + (label.charCodeAt(i) - 64);
        }
        return idx - 1;
    };

    const resolveFormula = (formulaStr, currentData) => {
        if (!formulaStr || !formulaStr.toString().startsWith('=')) return formulaStr;
        let expression = formulaStr.substring(1).toUpperCase();

        // Handle common aggregations: SUM(A1:B2)
        const funcRegex = /\b(SUM|SOMME|AVERAGE|MOYENNE|MAX|MIN|COUNT|NB|PRODUCT|PRODUIT)\(([A-Z]+)(\d+):([A-Z]+)(\d+)\)/g;
        expression = expression.replace(funcRegex, (match, func, startCol, startRow, endCol, endRow) => {
            const sc = getColIndexFromLabel(startCol);
            const sr = parseInt(startRow, 10) - 1;
            const ec = getColIndexFromLabel(endCol);
            const er = parseInt(endRow, 10) - 1;

            let values = [];
            for (let r = Math.min(sr, er); r <= Math.max(sr, er); r++) {
                for (let c = Math.min(sc, ec); c <= Math.max(sc, ec); c++) {
                    const val = parseFloat(currentData[r]?.[c]);
                    if (!isNaN(val)) values.push(val);
                }
            }
            if (values.length === 0) return '0';
            let res = 0;
            if (func === 'SUM' || func === 'SOMME') res = values.reduce((a, b) => a + b, 0);
            if (func === 'AVERAGE' || func === 'MOYENNE') res = values.reduce((a, b) => a + b, 0) / values.length;
            if (func === 'MAX') res = Math.max(...values);
            if (func === 'MIN') res = Math.min(...values);
            if (func === 'COUNT' || func === 'NB') res = values.length;
            if (func === 'PRODUCT' || func === 'PRODUIT') res = values.reduce((a, b) => a * b, 1);
            return res.toString();
        });

        // Intercept function like SUM(A1, B1) specifically 
        const funcCommaRegex = /\b(SUM|SOMME|PRODUCT|PRODUIT)\(([A-Z]+\d+),([A-Z]+\d+)\)/g;
        expression = expression.replace(funcCommaRegex, (match, func, cell1, cell2) => {
            if (func === 'PRODUCT' || func === 'PRODUIT') return cell1 + '*' + cell2;
            return cell1 + '+' + cell2;
        });

        // Resolve single cell references: A1, B12
        const refRegex = /\b([A-Z]+)(\d+)\b/g;
        expression = expression.replace(refRegex, (match, colStr, rowStr) => {
            const c = getColIndexFromLabel(colStr);
            const r = parseInt(rowStr, 10) - 1;
            const rawRaw = currentData[r]?.[c];
            const val = parseFloat(rawRaw);
            return isNaN(val) ? '0' : val.toString();
        });

        // Translate specific Excel operators to JS operators
        expression = expression.replace(/\^/g, '**'); // Puissance
        expression = expression.replace(/%/g, '/100'); // Pourcentage

        // Clean strictly numeric processing space before evaluation
        expression = expression.replace(/[^0-9+\-*/(). ]/g, '');

        try {
            if (expression) {
                const result = new Function(`return ${expression}`)();
                if (!isNaN(result) && result !== undefined && result !== null && result !== Infinity) {
                    return String(result);
                }
            }
            return formulaStr;
        } catch (e) {
            return formulaStr;
        }
    };

    const recalcAllFormulas = (dataToUpdate, currentFormulas) => {
        // Multi-pass dependency recalculation trick (2 passes for dependencies)
        for (let pass = 0; pass < 2; pass++) {
            Object.entries(currentFormulas).forEach(([key, formulaStr]) => {
                const [rStr, cStr] = key.split('_');
                const r = parseInt(rStr, 10);
                const c = parseInt(cStr, 10);
                if (dataToUpdate[r] && dataToUpdate[r][c] !== undefined) {
                    dataToUpdate[r][c] = resolveFormula(formulaStr, dataToUpdate);
                }
            });
        }
        return dataToUpdate;
    };

    const handleCellValueChange = (rawVal, computedVal = rawVal, formOverrides = null) => {
        setCellInputValue(rawVal);
        const r = selectionRange.start.r;
        const c = selectionRange.start.c;
        let updatedData = [...sheetData.map(row => [...row])];
        if (!updatedData[r]) updatedData[r] = [];

        updatedData[r][c] = computedVal;

        let activeFormulas = formOverrides || cellFormulas;
        updatedData = recalcAllFormulas(updatedData, activeFormulas);

        const updatedSheets = [...sheets];
        let sheetUpdate = { ...currentSheet, data: updatedData };
        if (formOverrides) {
            sheetUpdate.cellFormulas = formOverrides;
            setCellFormulas(formOverrides);
        }
        updatedSheets[activeSheetIndex] = sheetUpdate;
        setCurrentWorkbook({ ...currentWorkbook, sheets: updatedSheets });
    };

    const commitCellEdit = () => {
        if (!editingCell) return;
        let rawVal = cellInputValue;
        let newFormulas = { ...cellFormulas };
        let hasFormulaUpdate = false;

        if (typeof rawVal === 'string' && rawVal.trim().startsWith('=')) {
            newFormulas[`${editingCell.r}_${editingCell.c}`] = rawVal;
            hasFormulaUpdate = true;
        } else {
            if (newFormulas[`${editingCell.r}_${editingCell.c}`]) {
                delete newFormulas[`${editingCell.r}_${editingCell.c}`];
                hasFormulaUpdate = true;
            }
        }

        handleCellValueChange(rawVal, rawVal, hasFormulaUpdate ? newFormulas : null);
        setEditingCell(null);
    };

    const handleInsertFormula = (funcName) => {
        const rangeStr = minR === maxR && minC === maxC
            ? `${getColLabel(minC)}${minR + 1}`
            : `${getColLabel(minC)}${minR + 1}:${getColLabel(maxC)}${maxR + 1}`;
        const formulaStr = `=${funcName}(${rangeStr})`;

        let calcResult = formulaStr;
        const values = [];
        for (let r = minR; r <= maxR; r++) {
            for (let c = minC; c <= maxC; c++) {
                const val = parseFloat(sheetData[r]?.[c]);
                if (!isNaN(val)) values.push(val);
            }
        }
        if (values.length > 0) {
            if (funcName === 'SUM' || funcName === 'SOMME') calcResult = String(values.reduce((a, b) => a + b, 0));
            else if (funcName === 'AVERAGE' || funcName === 'MOYENNE') calcResult = String((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2));
            else if (funcName === 'MIN') calcResult = String(Math.min(...values));
            else if (funcName === 'MAX') calcResult = String(Math.max(...values));
            else if (funcName === 'COUNT' || funcName === 'NB') calcResult = String(values.length);
        }
        handleCellValueChange(calcResult);
        setStatusMessage(`Formule ${funcName} appliquée: ${formulaStr}`);
        setActiveMenu(null);
    };

    // ─── ROW OPERATIONS ───
    const handleInsertRowAbove = () => {
        const newMerges = (currentSheet.merges || []).map(m => {
            let sR = m.startRow !== undefined ? m.startRow : m.s?.r;
            let eR = m.endRow !== undefined ? m.endRow : m.e?.r;
            let sC = m.startCol !== undefined ? m.startCol : m.s?.c;
            let eC = m.endCol !== undefined ? m.endCol : m.e?.c;
            if (sR >= minR) { sR++; eR++; }
            else if (sR < minR && eR >= minR) { eR++; }
            return { startRow: sR, endRow: eR, startCol: sC, endCol: eC, rowSpan: eR - sR + 1, colSpan: eC - sC + 1 };
        });
        const updatedData = [...sheetData];
        updatedData.splice(minR, 0, Array(sheetData[0]?.length || 26).fill(''));

        pushHistory();
        const updatedSheets = [...sheets];
        updatedSheets[activeSheetIndex] = { ...currentSheet, data: updatedData, merges: newMerges };
        setCurrentWorkbook({ ...currentWorkbook, sheets: updatedSheets });
        setStatusMessage(`Ligne insérée au-dessus de la ligne ${minR + 1}`);
        setActiveMenu(null);
    };

    const handleInsertRowBelow = () => {
        const newMerges = (currentSheet.merges || []).map(m => {
            let sR = m.startRow !== undefined ? m.startRow : m.s?.r;
            let eR = m.endRow !== undefined ? m.endRow : m.e?.r;
            let sC = m.startCol !== undefined ? m.startCol : m.s?.c;
            let eC = m.endCol !== undefined ? m.endCol : m.e?.c;
            if (sR > maxR) { sR++; eR++; }
            else if (sR <= maxR && eR > maxR) { eR++; } // Enlarge if split
            return { startRow: sR, endRow: eR, startCol: sC, endCol: eC, rowSpan: eR - sR + 1, colSpan: eC - sC + 1 };
        });
        const updatedData = [...sheetData];
        updatedData.splice(maxR + 1, 0, Array(sheetData[0]?.length || 26).fill(''));

        pushHistory();
        const updatedSheets = [...sheets];
        updatedSheets[activeSheetIndex] = { ...currentSheet, data: updatedData, merges: newMerges };
        setCurrentWorkbook({ ...currentWorkbook, sheets: updatedSheets });
        setStatusMessage(`Ligne insérée en-dessous de la ligne ${maxR + 1}`);
        setActiveMenu(null);
    };

    const handleDeleteRows = () => {
        const deleteCount = maxR - minR + 1;
        const newMerges = (currentSheet.merges || []).map(m => {
            let sR = m.startRow !== undefined ? m.startRow : m.s?.r;
            let eR = m.endRow !== undefined ? m.endRow : m.e?.r;
            let sC = m.startCol !== undefined ? m.startCol : m.s?.c;
            let eC = m.endCol !== undefined ? m.endCol : m.e?.c;

            if (sR > maxR) { sR -= deleteCount; eR -= deleteCount; }
            else if (sR < minR && eR >= minR) { eR -= Math.min(eR, maxR) - minR + 1; }
            else if (sR >= minR && eR <= maxR) { return null; }
            else if (sR >= minR && sR <= maxR && eR > maxR) { sR = minR; eR -= deleteCount; }

            return { startRow: sR, endRow: eR, startCol: sC, endCol: eC, rowSpan: eR - sR + 1, colSpan: eC - sC + 1 };
        }).filter(Boolean).filter(m => m.rowSpan > 1 || m.colSpan > 1);

        const updatedSheets = [...sheets];
        updatedSheets[activeSheetIndex] = {
            ...currentSheet,
            data: sheetData.filter((_, idx) => idx < minR || idx > maxR),
            merges: newMerges
        };
        pushHistory();
        setCurrentWorkbook({ ...currentWorkbook, sheets: updatedSheets });
        setStatusMessage(`Ligne(s) ${minR + 1} à ${maxR + 1} supprimée(s)`);
        setActiveMenu(null);
    };

    const handleSetRowHeight = () => {
        const val = prompt("Entrez la hauteur de ligne souhaitée (en pixels):", "35");
        if (val && !isNaN(val)) {
            const h = parseInt(val, 10);
            const newHeights = { ...rowHeights };
            for (let r = minR; r <= maxR; r++) newHeights[r] = h;
            setRowHeights(newHeights);
            setStatusMessage(`Hauteur des lignes ${minR + 1}-${maxR + 1} définie à ${h}px`);
        }
        setActiveMenu(null);
    };

    const handleOptimalRowHeight = () => {
        const newHeights = { ...rowHeights };
        for (let r = minR; r <= maxR; r++) delete newHeights[r];
        setRowHeights(newHeights);
        setStatusMessage("Hauteur optimale de ligne appliquée");
        setActiveMenu(null);
    };

    const handleHideRows = () => {
        const next = new Set(hiddenRows);
        for (let r = minR; r <= maxR; r++) next.add(r);
        setHiddenRows(next);
        setStatusMessage(`Ligne(s) ${minR + 1}-${maxR + 1} masquée(s)`);
        setActiveMenu(null);
    };

    const handleShowRows = () => {
        const next = new Set(hiddenRows);
        for (let r = minR; r <= maxR; r++) next.delete(r);
        setHiddenRows(next);
        setStatusMessage(`Toutes les lignes masquées sont réaffichées`);
        setActiveMenu(null);
    };

    // ─── COLUMN OPERATIONS ───
    const handleInsertColumnBefore = () => {
        const newMerges = (currentSheet.merges || []).map(m => {
            let sR = m.startRow !== undefined ? m.startRow : m.s?.r;
            let eR = m.endRow !== undefined ? m.endRow : m.e?.r;
            let sC = m.startCol !== undefined ? m.startCol : m.s?.c;
            let eC = m.endCol !== undefined ? m.endCol : m.e?.c;
            if (sC >= minC) { sC++; eC++; }
            else if (sC < minC && eC >= minC) { eC++; }
            return { startRow: sR, endRow: eR, startCol: sC, endCol: eC, rowSpan: eR - sR + 1, colSpan: eC - sC + 1 };
        });
        pushHistory();
        const updatedSheets = [...sheets];
        updatedSheets[activeSheetIndex] = {
            ...currentSheet,
            data: sheetData.map(row => { const r = [...row]; r.splice(minC, 0, ''); return r; }),
            merges: newMerges
        };
        setCurrentWorkbook({ ...currentWorkbook, sheets: updatedSheets });
        setStatusMessage(`Colonne insérée avant la colonne ${getColLabel(minC)}`);
        setActiveMenu(null);
    };

    const handleInsertColumnAfter = () => {
        const newMerges = (currentSheet.merges || []).map(m => {
            let sR = m.startRow !== undefined ? m.startRow : m.s?.r;
            let eR = m.endRow !== undefined ? m.endRow : m.e?.r;
            let sC = m.startCol !== undefined ? m.startCol : m.s?.c;
            let eC = m.endCol !== undefined ? m.endCol : m.e?.c;
            if (sC > maxC) { sC++; eC++; }
            else if (sC <= maxC && eC > maxC) { eC++; }
            return { startRow: sR, endRow: eR, startCol: sC, endCol: eC, rowSpan: eR - sR + 1, colSpan: eC - sC + 1 };
        });
        pushHistory();
        const updatedSheets = [...sheets];
        updatedSheets[activeSheetIndex] = {
            ...currentSheet,
            data: sheetData.map(row => { const r = [...row]; r.splice(maxC + 1, 0, ''); return r; }),
            merges: newMerges
        };
        setCurrentWorkbook({ ...currentWorkbook, sheets: updatedSheets });
        setStatusMessage(`Colonne insérée après la colonne ${getColLabel(maxC)}`);
        setActiveMenu(null);
    };

    const handleDeleteColumns = () => {
        const deleteCount = maxC - minC + 1;
        const newMerges = (currentSheet.merges || []).map(m => {
            let sR = m.startRow !== undefined ? m.startRow : m.s?.r;
            let eR = m.endRow !== undefined ? m.endRow : m.e?.r;
            let sC = m.startCol !== undefined ? m.startCol : m.s?.c;
            let eC = m.endCol !== undefined ? m.endCol : m.e?.c;

            if (sC > maxC) { sC -= deleteCount; eC -= deleteCount; }
            else if (sC < minC && eC >= minC) { eC -= Math.min(eC, maxC) - minC + 1; }
            else if (sC >= minC && eC <= maxC) { return null; }
            else if (sC >= minC && sC <= maxC && eC > maxC) { sC = minC; eC -= deleteCount; }

            return { startRow: sR, endRow: eR, startCol: sC, endCol: eC, rowSpan: eR - sR + 1, colSpan: eC - sC + 1 };
        }).filter(Boolean).filter(m => m.rowSpan > 1 || m.colSpan > 1);

        const updatedSheets = [...sheets];
        updatedSheets[activeSheetIndex] = {
            ...currentSheet,
            data: sheetData.map(row => row.filter((_, idx) => idx < minC || idx > maxC)),
            merges: newMerges
        };
        pushHistory();
        setCurrentWorkbook({ ...currentWorkbook, sheets: updatedSheets });
        setStatusMessage(`Colonne(s) ${getColLabel(minC)} à ${getColLabel(maxC)} supprimée(s)`);
        setActiveMenu(null);
    };

    const handleSetColumnWidth = () => {
        const val = prompt("Entrez la largeur de colonne souhaitée (en pixels):", "140");
        if (val && !isNaN(val)) {
            const w = parseInt(val, 10);
            const newWidths = { ...colWidths };
            for (let c = minC; c <= maxC; c++) newWidths[c] = w;
            setColWidths(newWidths);
            setStatusMessage(`Largeur des colonnes ${getColLabel(minC)}-${getColLabel(maxC)} définie à ${w}px`);
        }
        setActiveMenu(null);
    };

    const handleOptimalColumnWidth = () => {
        const newWidths = { ...colWidths };
        for (let c = minC; c <= maxC; c++) delete newWidths[c];
        setColWidths(newWidths);
        setStatusMessage("Largeur optimale de colonne appliquée");
        setActiveMenu(null);
    };

    const handleHideColumns = () => {
        const next = new Set(hiddenCols);
        for (let c = minC; c <= maxC; c++) next.add(c);
        setHiddenCols(next);
        setStatusMessage(`Colonne(s) ${getColLabel(minC)}-${getColLabel(maxC)} masquée(s)`);
        setActiveMenu(null);
    };

    const handleShowColumns = () => {
        const next = new Set(hiddenCols);
        for (let c = minC; c <= maxC; c++) next.delete(c);
        setHiddenCols(next);
        setStatusMessage(`Colonnes masquées réaffichées`);
        setActiveMenu(null);
    };

    const handleFillUp = () => {
        const updatedData = [...sheetData.map(r => [...r])];
        const val = updatedData[maxR][minC];
        for (let r = minR; r <= maxR; r++) for (let c = minC; c <= maxC; c++) updatedData[r][c] = val;
        updateSheetData(updatedData);
        setStatusMessage("Remplissage vers le haut effectué");
        setActiveMenu(null);
    };

    const handleFillLeft = () => {
        const updatedData = [...sheetData.map(r => [...r])];
        const val = updatedData[minR][maxC];
        for (let r = minR; r <= maxR; r++) for (let c = minC; c <= maxC; c++) updatedData[r][c] = val;
        updateSheetData(updatedData);
        setStatusMessage("Remplissage vers la gauche effectué");
        setActiveMenu(null);
    };

    const handleFillRandom = () => {
        const updatedData = [...sheetData.map(r => [...r])];
        for (let r = minR; r <= maxR; r++) for (let c = minC; c <= maxC; c++) updatedData[r][c] = String(Math.floor(Math.random() * 90000) + 10000);
        updateSheetData(updatedData);
        setStatusMessage("Valeurs aléatoires générées");
        setActiveMenu(null);
    };

    const handleCreateNewFile = async () => {
        let fileName = 'Nouveau_Classeur.xlsx';

        // 1. Génération physique et téléchargement via la boîte de dialogue native du système (Save As)
        try {
            const wb = XLSX.utils.book_new();
            const emptyData = Array(50).fill(0).map(() => Array(26).fill(''));
            const ws = XLSX.utils.aoa_to_sheet(emptyData);
            XLSX.utils.book_append_sheet(wb, ws, "Feuille1");

            if (window.showSaveFilePicker) {
                const handle = await window.showSaveFilePicker({
                    suggestedName: fileName,
                    types: [{
                        description: 'Fichier Excel (.xlsx)',
                        accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
                    }],
                });
                fileName = handle.name;
                const writable = await handle.createWritable();
                const arrayBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
                await writable.write(arrayBuffer);
                await writable.close();
            } else {
                XLSX.writeFile(wb, fileName);
            }
        } catch (err) {
            console.error("Erreur de création, ou annulation par l'utilisateur :", err);
            return; // Annulé par l'utilisateur
        }

        // 2. Réinitialisation de l'état de l'application
        const newWb = {
            id: `new_${Date.now()}`,
            name: fileName,
            sheets: [{ name: 'Feuille1', data: createEmptySheetData(100, 26) }]
        };
        setCurrentWorkbook(newWb);
        setActiveSheetIndex(0);
        setCellStyles({});
        setCellFormulas({});
        setColWidths({});
        setRowHeights({});
        setHiddenRows(EMPTY_SET);
        setHiddenCols(EMPTY_SET);
        if (onWorkbookChange) onWorkbookChange(newWb);
        setStatusMessage(`Fichier ${fileName} créé avec succès.`);
        setTimeout(() => setStatusMessage(''), 3000);
    };

    const updateSheetData = (newData) => {
        pushHistory();
        const updatedSheets = [...sheets];
        updatedSheets[activeSheetIndex] = { ...currentSheet, data: newData };
        setCurrentWorkbook({ ...currentWorkbook, sheets: updatedSheets });
    };

    return (
        <div onMouseUp={handleCellMouseUp} style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 65px)', background: '#FFFFFF', position: 'relative' }}>

            {/* Header Bar */}
            <div style={{ height: '54px', background: '#02006c', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileSpreadsheet size={18} color="#FFFFFF" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>{currentWorkbook?.name || 'Nouveau_Classeur_Sans_Titre.xlsx'}</h1>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <button onClick={handleCreateNewFile} style={{ background: '#FFFFFF', color: '#02006c', border: 'none', borderRadius: '10px', padding: '0.45rem 0.85rem', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)', transition: 'all 0.2s ease' }}>
                        <Plus size={14} /><span>Nouveau</span>
                    </button>
                    <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.2)', margin: '0 4px' }} />
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx,.xls,.xlsm,.xlsb,.xltx,.xltm,.csv,.tsv,.ods,.xml,.htm,.html" style={{ display: 'none' }} />
                    <button onClick={() => fileInputRef.current?.click()} style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#FFF', border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: '10px', padding: '0.45rem 0.85rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Upload size={14} /><span>Ouvrir Fichier</span>
                    </button>
                    <CustomTooltip text="Enregistrer les modifications (Ctrl+S)">
                        <button onClick={handleSaveExcelWorkbook} style={{ background: '#10B981', color: '#FFF', border: '1px solid #059669', borderRadius: '10px', padding: '0.45rem 0.85rem', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)', transition: 'all 0.2s ease' }}>
                            <Save size={14} /><span>Enregistrer</span>
                        </button>
                    </CustomTooltip>
                    <CustomTooltip text="Exporter en PDF">
                        <button onClick={() => alert("Génération PDF en cours...")} style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#FFF', border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <FileCode size={18} />
                        </button>
                    </CustomTooltip>
                </div>
            </div>

            {/* Level 2 Formatting Toolbar */}
            <div style={{ minHeight: '48px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', flexWrap: 'wrap', padding: '0.4rem 1rem', gap: '0.5rem 0.6rem', position: 'relative', zIndex: 20 }}>

                {/* Undo / Redo Buttons */}
                <CustomTooltip text="Annuler (Ctrl+Z)">
                    <button onClick={handleUndo} disabled={historyStack.length === 0} style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFF', color: historyStack.length > 0 ? '#02006c' : '#94A3B8', cursor: historyStack.length > 0 ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center' }}>
                        <Undo2 size={15} />
                    </button>
                </CustomTooltip>
                <CustomTooltip text="Rétablir (Ctrl+Y)">
                    <button onClick={handleRedo} disabled={futureStack.length === 0} style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFF', color: futureStack.length > 0 ? '#10B981' : '#94A3B8', cursor: futureStack.length > 0 ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center' }}>
                        <Redo2 size={15} />
                    </button>
                </CustomTooltip>

                <div style={{ width: '1px', height: '22px', background: '#CBD5E1' }} />

                {/* Row Dropdown Menu */}
                <div style={{ position: 'relative' }}>
                    <CustomTooltip text="Options des Lignes">
                        <button onClick={() => setActiveMenu(activeMenu === 'row' ? null : 'row')} style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFF', color: '#02006c', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '14px' }}>
                                <div style={{ height: '2px', background: '#02006c' }} /><div style={{ height: '2px', background: '#02006c' }} /><div style={{ height: '2px', background: '#02006c' }} />
                            </div>
                            <ChevronDown size={14} />
                        </button>
                    </CustomTooltip>
                    {activeMenu === 'row' && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', background: '#FFF', border: '1px solid #CBD5E1', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', padding: '6px 0', width: '210px', zIndex: 100 }}>
                            <div onClick={handleInsertRowAbove} className="menu-item" style={{ padding: '8px 16px', fontSize: '0.8rem', cursor: 'pointer' }}>Insert Rows Above</div>
                            <div onClick={handleInsertRowBelow} className="menu-item" style={{ padding: '8px 16px', fontSize: '0.8rem', cursor: 'pointer' }}>Insert Rows Below</div>
                            <div onClick={handleDeleteRows} className="menu-item" style={{ padding: '8px 16px', fontSize: '0.8rem', cursor: 'pointer', color: '#DC2626' }}>Delete Rows</div>
                            <div style={{ height: '1px', background: '#E2E8F0', margin: '4px 0' }} />
                            <div onClick={handleSetRowHeight} className="menu-item" style={{ padding: '8px 16px', fontSize: '0.8rem', cursor: 'pointer' }}>Row Height...</div>
                            <div onClick={handleOptimalRowHeight} className="menu-item" style={{ padding: '8px 16px', fontSize: '0.8rem', cursor: 'pointer' }}>Optimal Height...</div>
                            <div style={{ height: '1px', background: '#E2E8F0', margin: '4px 0' }} />
                            <div onClick={handleHideRows} className="menu-item" style={{ padding: '8px 16px', fontSize: '0.8rem', cursor: 'pointer' }}>Hide Rows</div>
                            <div onClick={handleShowRows} className="menu-item" style={{ padding: '8px 16px', fontSize: '0.8rem', cursor: 'pointer' }}>Show Rows</div>
                            <div style={{ height: '1px', background: '#E2E8F0', margin: '4px 0' }} />
                            <div onClick={handleFillUp} className="menu-item" style={{ padding: '8px 16px', fontSize: '0.8rem', cursor: 'pointer' }}>Fill Up</div>
                            <div onClick={handleFillLeft} className="menu-item" style={{ padding: '8px 16px', fontSize: '0.8rem', cursor: 'pointer' }}>Fill Left</div>
                            <div onClick={handleFillRandom} className="menu-item" style={{ padding: '8px 16px', fontSize: '0.8rem', cursor: 'pointer' }}>Fill Random Number...</div>
                            <div style={{ height: '1px', background: '#E2E8F0', margin: '4px 0' }} />
                            <div onClick={() => { setFrozenRow(!frozenRow); setActiveMenu(null); }} className="menu-item" style={{ padding: '8px 16px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 700, color: '#02006c' }}>
                                {frozenRow ? 'Unfreeze First Row' : 'Freeze First Row'}
                            </div>
                        </div>
                    )}
                </div>

                {/* Column Dropdown Menu */}
                <div style={{ position: 'relative' }}>
                    <CustomTooltip text="Options des Colonnes">
                        <button onClick={() => setActiveMenu(activeMenu === 'col' ? null : 'col')} style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFF', color: '#02006c', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                            <div style={{ display: 'flex', gap: '2px', height: '14px' }}>
                                <div style={{ width: '2px', background: '#02006c' }} /><div style={{ width: '2px', background: '#02006c' }} /><div style={{ width: '2px', background: '#02006c' }} />
                            </div>
                            <ChevronDown size={14} />
                        </button>
                    </CustomTooltip>
                    {activeMenu === 'col' && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', background: '#FFF', border: '1px solid #CBD5E1', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', padding: '6px 0', width: '210px', zIndex: 100 }}>
                            <div onClick={handleInsertColumnBefore} className="menu-item" style={{ padding: '8px 16px', fontSize: '0.8rem', cursor: 'pointer' }}>Insert Columns Before</div>
                            <div onClick={handleInsertColumnAfter} className="menu-item" style={{ padding: '8px 16px', fontSize: '0.8rem', cursor: 'pointer' }}>Insert Columns After</div>
                            <div onClick={handleDeleteColumns} className="menu-item" style={{ padding: '8px 16px', fontSize: '0.8rem', cursor: 'pointer', color: '#DC2626' }}>Delete Columns</div>
                            <div style={{ height: '1px', background: '#E2E8F0', margin: '4px 0' }} />
                            <div onClick={handleSetColumnWidth} className="menu-item" style={{ padding: '8px 16px', fontSize: '0.8rem', cursor: 'pointer' }}>Column Width...</div>
                            <div onClick={handleOptimalColumnWidth} className="menu-item" style={{ padding: '8px 16px', fontSize: '0.8rem', cursor: 'pointer' }}>Optimal Width...</div>
                            <div style={{ height: '1px', background: '#E2E8F0', margin: '4px 0' }} />
                            <div onClick={handleHideColumns} className="menu-item" style={{ padding: '8px 16px', fontSize: '0.8rem', cursor: 'pointer' }}>Hide Columns</div>
                            <div onClick={handleShowColumns} className="menu-item" style={{ padding: '8px 16px', fontSize: '0.8rem', cursor: 'pointer' }}>Show Columns</div>
                            <div style={{ height: '1px', background: '#E2E8F0', margin: '4px 0' }} />
                            <div onClick={handleFillUp} className="menu-item" style={{ padding: '8px 16px', fontSize: '0.8rem', cursor: 'pointer' }}>Fill Up</div>
                            <div onClick={handleFillLeft} className="menu-item" style={{ padding: '8px 16px', fontSize: '0.8rem', cursor: 'pointer' }}>Fill Left</div>
                            <div onClick={handleFillRandom} className="menu-item" style={{ padding: '8px 16px', fontSize: '0.8rem', cursor: 'pointer' }}>Fill Random Number...</div>
                            <div style={{ height: '1px', background: '#E2E8F0', margin: '4px 0' }} />
                            <div onClick={() => { setFrozenCol(!frozenCol); setActiveMenu(null); }} className="menu-item" style={{ padding: '8px 16px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 700, color: '#02006c' }}>
                                {frozenCol ? 'Unfreeze First Column' : 'Freeze First Column'}
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ width: '1px', height: '22px', background: '#CBD5E1' }} />

                {/* 105 Fonts Select */}
                <select value={fontFamily} onChange={(e) => applyFontFamily(e.target.value)} style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFF', fontSize: '0.775rem', fontWeight: 700, maxWidth: '140px' }}>
                    {ALL_FONTS.map(font => <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>)}
                </select>

                {/* Font Size Input */}
                <input type="text" list="font-size-presets" value={fontSizeNum} onChange={(e) => applyFontSize(e.target.value)} style={{ width: '50px', padding: '4px 6px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFF', fontSize: '0.775rem', fontWeight: 800, textAlign: 'center', color: '#02006c' }} />
                <datalist id="font-size-presets">{PRESET_FONT_SIZES.map(s => <option key={s} value={String(s)} />)}</datalist>

                <div style={{ width: '1px', height: '22px', background: '#CBD5E1' }} />

                {/* B I U Buttons */}
                <CustomTooltip text="Gras"><button onClick={toggleBold} style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFF', cursor: 'pointer' }}><Bold size={15} /></button></CustomTooltip>
                <CustomTooltip text="Italique"><button onClick={toggleItalic} style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFF', cursor: 'pointer' }}><Italic size={15} /></button></CustomTooltip>
                <CustomTooltip text="Souligné"><button onClick={toggleUnderline} style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFF', cursor: 'pointer' }}><Underline size={15} /></button></CustomTooltip>

                {/* Text Color Picker */}
                <div style={{ position: 'relative' }}>
                    <button onClick={() => setActiveMenu(activeMenu === 'textColor' ? null : 'textColor')} style={{ padding: '4px 7px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFF', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                        <span style={{ fontWeight: 900, fontSize: '0.85rem', color: '#0F172A', lineHeight: 1 }}>A</span>
                        <div style={{ width: '16px', height: '4px', background: activeTextColor, borderRadius: '2px' }} />
                    </button>
                    {activeMenu === 'textColor' && (
                        <ColorPickerPopover type="text" title="Font Color" recentColors={recentColors} onSelectColor={applyTextColor} onClose={() => setActiveMenu(null)} />
                    )}
                </div>

                {/* Background Color Picker */}
                <div style={{ position: 'relative' }}>
                    <button onClick={() => setActiveMenu(activeMenu === 'bgColor' ? null : 'bgColor')} style={{ padding: '4px 7px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFF', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                        <PaintBucket size={15} color="#0F172A" />
                        <div style={{ width: '16px', height: '4px', background: activeBgColor, borderRadius: '2px' }} />
                    </button>
                    {activeMenu === 'bgColor' && (
                        <ColorPickerPopover type="bg" title="Background Color" recentColors={recentColors} onSelectColor={applyBgColor} onClose={() => setActiveMenu(null)} />
                    )}
                </div>

                <div style={{ width: '1px', height: '22px', background: '#CBD5E1' }} />

                {/* Horizontal Alignments (Gauche, Centre, Droite) */}
                <CustomTooltip text="Aligner à gauche">
                    <button
                        onClick={() => applyAlign('left')}
                        style={{
                            padding: '5px 7px',
                            borderRadius: '6px',
                            border: '1px solid #CBD5E1',
                            background: cellStyles[`${minR}_${minC}`]?.align === 'left' || !cellStyles[`${minR}_${minC}`]?.align ? '#E0E7FF' : '#FFF',
                            color: cellStyles[`${minR}_${minC}`]?.align === 'left' || !cellStyles[`${minR}_${minC}`]?.align ? '#02006c' : '#0F172A',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <AlignLeft size={15} />
                    </button>
                </CustomTooltip>

                <CustomTooltip text="Centrer le texte">
                    <button
                        onClick={() => applyAlign('center')}
                        style={{
                            padding: '5px 7px',
                            borderRadius: '6px',
                            border: '1px solid #CBD5E1',
                            background: cellStyles[`${minR}_${minC}`]?.align === 'center' ? '#E0E7FF' : '#FFF',
                            color: cellStyles[`${minR}_${minC}`]?.align === 'center' ? '#02006c' : '#0F172A',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <AlignCenter size={15} />
                    </button>
                </CustomTooltip>

                <CustomTooltip text="Aligner à droite">
                    <button
                        onClick={() => applyAlign('right')}
                        style={{
                            padding: '5px 7px',
                            borderRadius: '6px',
                            border: '1px solid #CBD5E1',
                            background: cellStyles[`${minR}_${minC}`]?.align === 'right' ? '#E0E7FF' : '#FFF',
                            color: cellStyles[`${minR}_${minC}`]?.align === 'right' ? '#02006c' : '#0F172A',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <AlignRight size={15} />
                    </button>
                </CustomTooltip>

                <div style={{ width: '1px', height: '22px', background: '#CBD5E1' }} />

                {/* Vertical Alignments (Haut, Milieu, Bas) */}
                <CustomTooltip text="Aligner en haut">
                    <button
                        onClick={() => applyVerticalAlign('top')}
                        style={{
                            padding: '5px 7px',
                            borderRadius: '6px',
                            border: '1px solid #CBD5E1',
                            background: cellStyles[`${minR}_${minC}`]?.verticalAlign === 'top' ? '#E0E7FF' : '#FFF',
                            color: cellStyles[`${minR}_${minC}`]?.verticalAlign === 'top' ? '#02006c' : '#0F172A',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="4" x2="21" y2="4" strokeWidth="3" />
                            <path d="M12 20V9" />
                            <path d="M8 13l4-4 4 4" stroke="#EA580C" strokeWidth="2.5" />
                        </svg>
                    </button>
                </CustomTooltip>

                <CustomTooltip text="Aligner au milieu (Vertical Center)">
                    <button
                        onClick={() => applyVerticalAlign('middle')}
                        style={{
                            padding: '5px 7px',
                            borderRadius: '6px',
                            border: '1px solid #CBD5E1',
                            background: cellStyles[`${minR}_${minC}`]?.verticalAlign === 'middle' || !cellStyles[`${minR}_${minC}`]?.verticalAlign ? '#E0E7FF' : '#FFF',
                            color: cellStyles[`${minR}_${minC}`]?.verticalAlign === 'middle' || !cellStyles[`${minR}_${minC}`]?.verticalAlign ? '#02006c' : '#0F172A',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12" strokeWidth="3" />
                            <path d="M12 5v3" />
                            <path d="M9 7l3 3 3-3" stroke="#EA580C" strokeWidth="2.5" />
                            <path d="M12 19v-3" />
                            <path d="M9 17l3-3 3 3" stroke="#EA580C" strokeWidth="2.5" />
                        </svg>
                    </button>
                </CustomTooltip>

                <CustomTooltip text="Aligner en bas">
                    <button
                        onClick={() => applyVerticalAlign('bottom')}
                        style={{
                            padding: '5px 7px',
                            borderRadius: '6px',
                            border: '1px solid #CBD5E1',
                            background: cellStyles[`${minR}_${minC}`]?.verticalAlign === 'bottom' ? '#E0E7FF' : '#FFF',
                            color: cellStyles[`${minR}_${minC}`]?.verticalAlign === 'bottom' ? '#02006c' : '#0F172A',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="20" x2="21" y2="20" strokeWidth="3" />
                            <path d="M12 4v11" />
                            <path d="M8 11l4 4 4-4" stroke="#EA580C" strokeWidth="2.5" />
                        </svg>
                    </button>
                </CustomTooltip>

                <div style={{ width: '1px', height: '22px', background: '#CBD5E1' }} />

                {/* Wrap Text Button (Renvoi à la ligne) */}
                <CustomTooltip text="Renvoi à la ligne automatique (Wrap Text)">
                    <button
                        onClick={toggleWrapText}
                        style={{
                            padding: '5px 7px',
                            borderRadius: '6px',
                            border: '1px solid #CBD5E1',
                            background: cellStyles[`${minR}_${minC}`]?.wrapText ? '#E0E7FF' : '#FFF',
                            color: cellStyles[`${minR}_${minC}`]?.wrapText ? '#02006c' : '#0F172A',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <path d="M3 12h14a3 3 0 1 1 0 6H11" />
                            <path d="M14 15l-3 3 3 3" stroke="#EA580C" strokeWidth="2.5" />
                            <line x1="3" y1="18" x2="7" y2="18" />
                        </svg>
                    </button>
                </CustomTooltip>

                <div style={{ width: '1px', height: '22px', background: '#CBD5E1' }} />

                {/* Bordures : Toutes les bordures & Sans bordures */}
                <CustomTooltip text="Toutes les bordures"><button onClick={() => applyBorders('all')} style={{ padding: '5px 7px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="12" y1="3" x2="12" y2="21" /><line x1="3" y1="12" x2="21" y2="12" /></svg></button></CustomTooltip>
                <CustomTooltip text="Effacer les bordures (Sans bordures)"><button onClick={() => applyBorders('none')} style={{ padding: '5px 7px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.8" strokeDasharray="3 2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="12" y1="3" x2="12" y2="21" /><line x1="3" y1="12" x2="21" y2="12" /></svg></button></CustomTooltip>

                <div style={{ width: '1px', height: '22px', background: '#CBD5E1' }} />

                {/* Merge / Unmerge Cells Button */}
                <CustomTooltip text="Fusionner / Défusionner les cellules sélectionnées">
                    <button
                        onClick={() => handleToggleMergeSelection()}
                        style={{
                            padding: '5px 8px',
                            borderRadius: '6px',
                            border: '1px solid #CBD5E1',
                            background: '#FFF',
                            color: '#02006c',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 700,
                            fontSize: '0.75rem'
                        }}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" stroke="#475569" /><rect x="8" y="8" width="8" height="8" fill="rgba(220, 38, 38, 0.15)" stroke="#DC2626" strokeWidth="2" /><path d="M10 12h4" stroke="#DC2626" strokeWidth="2" /></svg>
                        <span>Fusionner</span>
                    </button>
                </CustomTooltip>

                <div style={{ width: '1px', height: '22px', background: '#CBD5E1' }} />

                {/* Word Conversion Icon Button */}
                <CustomTooltip text="Convertir au format Word (.docx)">
                    <button
                        onClick={() => setIsPreviewModalOpen(true)}
                        style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '8px',
                            border: '1px solid #02006c',
                            background: '#02006c',
                            color: '#FFFFFF',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 4px rgba(2, 0, 108, 0.15)',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <FileText size={17} color="#FFFFFF" />
                    </button>
                </CustomTooltip>

                {/* Auto-Save Indicator */}
                {lastAutoSaveTime && (
                    <div style={{ fontSize: '0.675rem', color: '#10B981', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '6px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        <CheckCircle2 size={12} color="#10B981" />
                        <span>Enregistré à {lastAutoSaveTime}</span>
                    </div>
                )}

                {/* Sheet Tools Filter & Sync Icon Button */}
                <CustomTooltip text={`Sheet Tools - ${currentWorkbook?.sheets?.filter(s => s.type === 'child').length || 0} Feuille(s) Enfant(s)`}>
                    <button
                        onClick={() => setIsSheetToolsModalOpen(true)}
                        style={{
                            height: '34px',
                            padding: '0 8px',
                            borderRadius: '8px',
                            border: '1px solid #CBD5E1',
                            background: '#FFFFFF',
                            color: '#02006c',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <Filter size={17} color="#02006c" />
                        <span style={{
                            background: '#02006c',
                            color: '#FFF',
                            fontSize: '0.675rem',
                            fontWeight: 800,
                            padding: '1px 6px',
                            borderRadius: '6px'
                        }}>
                            {currentWorkbook?.sheets?.filter(s => s.type === 'child').length || 0}
                        </span>
                    </button>
                </CustomTooltip>
            </div>

            {/* Level 3 Formula Bar */}
            <div style={{ height: '42px', background: '#FFF', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', padding: '0 1rem', gap: '0.6rem', position: 'relative', zIndex: 15 }}>
                <div style={{ width: '74px', fontWeight: 800, color: '#02006c', fontSize: '0.775rem', textAlign: 'center', background: 'rgba(2, 0, 108, 0.08)', padding: '4px 0', borderRadius: '6px', border: '1px solid rgba(2, 0, 108, 0.2)' }}>
                    {minR === maxR && minC === maxC ? `${getColLabel(minC)}${minR + 1}` : `${getColLabel(minC)}${minR + 1}:${getColLabel(maxC)}${maxR + 1}`}
                </div>
                <span style={{ fontWeight: 900, color: '#02006c', fontSize: '0.95rem', fontStyle: 'italic' }}>f<sub style={{ fontSize: '0.65rem' }}>x</sub></span>

                {/* Sigma Dropdown Menu */}
                <div style={{ position: 'relative' }}>
                    <button onClick={() => setActiveMenu(activeMenu === 'sigma' ? null : 'sigma')} style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 800 }}>
                        <Sigma size={16} /><ChevronDown size={12} />
                    </button>
                    {activeMenu === 'sigma' && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', background: '#FFF', border: '1px solid #CBD5E1', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', padding: '6px 0', width: '140px', zIndex: 100 }}>
                            <div onClick={() => handleInsertFormula('SUM')} style={{ padding: '8px 16px', fontSize: '0.825rem', fontWeight: 600, cursor: 'pointer' }}>Sum</div>
                            <div onClick={() => handleInsertFormula('AVERAGE')} style={{ padding: '8px 16px', fontSize: '0.825rem', fontWeight: 600, cursor: 'pointer' }}>Average</div>
                            <div onClick={() => handleInsertFormula('MIN')} style={{ padding: '8px 16px', fontSize: '0.825rem', fontWeight: 600, cursor: 'pointer' }}>Min</div>
                            <div onClick={() => handleInsertFormula('MAX')} style={{ padding: '8px 16px', fontSize: '0.825rem', fontWeight: 600, cursor: 'pointer' }}>Max</div>
                            <div onClick={() => handleInsertFormula('COUNT')} style={{ padding: '8px 16px', fontSize: '0.825rem', fontWeight: 600, cursor: 'pointer' }}>Count</div>
                        </div>
                    )}
                </div>

                <button onClick={() => setCellInputValue('=')} style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFF', cursor: 'pointer' }}>
                    <Equal size={16} />
                </button>

                <input type="text" value={cellInputValue} onChange={(e) => handleCellValueChange(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') commitCellEdit(); }} placeholder="Éditer la cellule active..." style={{ flex: 1, height: '30px', padding: '0 0.75rem', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.825rem', outline: 'none', fontFamily: fontFamily }} />
            </div>

            {/* Grid Table Canvas */}
            <div style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>
                {(() => {
                    const isRowHidden = (r) => {
                        if (!hiddenRows) return false;
                        if (hiddenRows instanceof Set) return hiddenRows.has(r);
                        if (Array.isArray(hiddenRows)) return hiddenRows.includes(r);
                        return false;
                    };
                    const isColHidden = (c) => {
                        if (!hiddenCols) return false;
                        if (hiddenCols instanceof Set) return hiddenCols.has(c);
                        if (Array.isArray(hiddenCols)) return hiddenCols.includes(c);
                        return false;
                    };

                    return (
                        <table style={{ borderCollapse: 'collapse', fontSize: '0.825rem', userSelect: 'none', tableLayout: 'fixed', width: 'auto' }}>
                            <thead>
                                <tr style={{ background: '#F1F5F9', position: 'sticky', top: 0, zIndex: 10 }}>
                                    <th style={{ padding: '6px', border: '1px solid #CBD5E1', width: '45px', minWidth: '45px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, background: '#E2E8F0' }}>#</th>
                                    {(sheetData[0] || Array(26).fill('')).map((_, cIdx) => {
                                        if (isColHidden(cIdx)) return null;
                                        const customW = colWidths[cIdx] ? `${colWidths[cIdx]}px` : '90px';
                                        return (
                                            <th key={cIdx} style={{ padding: '6px 12px', border: '1px solid #CBD5E1', textAlign: 'center', fontWeight: 700, minWidth: customW, width: customW, maxWidth: customW, fontSize: '0.75rem', position: 'relative', userSelect: 'none', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {getColLabel(cIdx)}
                                                <div
                                                    onMouseDown={(e) => handleColResizeStart(e, cIdx)}
                                                    title="Glisser pour redimensionner la largeur"
                                                    style={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        right: 0,
                                                        width: '6px',
                                                        height: '100%',
                                                        cursor: 'col-resize',
                                                        zIndex: 5,
                                                        background: 'transparent'
                                                    }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.background = '#02006c'; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                                />
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {sheetData.map((row, rIdx) => {
                                    if (isRowHidden(rIdx)) return null;
                                    const customH = rowHeights[rIdx] ? `${rowHeights[rIdx]}px` : '28px';

                                    return (
                                        <tr key={rIdx} style={{ height: customH }}>
                                            <td style={{ padding: '4px 6px', border: '1px solid #CBD5E1', textAlign: 'center', fontWeight: 700, color: '#64748B', background: '#F8FAFC', fontSize: '0.75rem', position: 'relative', userSelect: 'none' }}>
                                                {rIdx + 1}
                                                <div
                                                    onMouseDown={(e) => handleRowResizeStart(e, rIdx)}
                                                    title="Glisser pour redimensionner la hauteur"
                                                    style={{
                                                        position: 'absolute',
                                                        bottom: 0,
                                                        left: 0,
                                                        width: '100%',
                                                        height: '6px',
                                                        cursor: 'row-resize',
                                                        zIndex: 5,
                                                        background: 'transparent'
                                                    }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.background = '#02006c'; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                                />
                                            </td>
                                            {(Array.isArray(row) ? row : Array(26).fill('')).map((cellValue, cIdx) => {
                                                if (isColHidden(cIdx)) return null;
                                                const mergeInfo = getMergeInfo(rIdx, cIdx, currentSheet.merges);
                                                if (mergeInfo?.isCovered) return null;

                                                const customW = colWidths[cIdx] ? `${colWidths[cIdx]}px` : '100px';
                                                const selected = isCellSelected(rIdx, cIdx);
                                                const isEditingThisCell = editingCell && editingCell.r === rIdx && editingCell.c === cIdx;
                                                const customStyle = cellStyles[`${rIdx}_${cIdx}`] || {};
                                                const isInPreview = isFillDragging && fillTarget && (
                                                    rIdx >= Math.min(minR, fillTarget.r) && rIdx <= Math.max(maxR, fillTarget.r) &&
                                                    cIdx >= Math.min(minC, fillTarget.c) && cIdx <= Math.max(maxC, fillTarget.c)
                                                );

                                                return (
                                                    <td
                                                        key={cIdx}
                                                        rowSpan={mergeInfo?.isMaster ? mergeInfo.rowSpan : undefined}
                                                        colSpan={mergeInfo?.isMaster ? mergeInfo.colSpan : undefined}
                                                        onMouseDown={() => handleCellMouseDown(rIdx, cIdx)}
                                                        onMouseEnter={() => {
                                                            if (isFillDragging) {
                                                                setFillTarget({ r: rIdx, c: cIdx });
                                                            } else if (isMouseDown) {
                                                                handleCellMouseEnter(rIdx, cIdx);
                                                            }
                                                        }}
                                                        onDoubleClick={() => handleCellDoubleClick(rIdx, cIdx)}
                                                        style={{
                                                            position: 'relative',
                                                            padding: isEditingThisCell ? 0 : '6px 10px',
                                                            border: isInPreview ? '2px dashed #02006c' : (selected ? '2px solid #02006c' : '1px solid #E2E8F0'),
                                                            background: isInPreview ? 'rgba(2, 0, 108, 0.2)' : (customStyle.bg ? customStyle.bg : (selected ? 'rgba(2, 0, 108, 0.12)' : '#FFFFFF')),
                                                            color: customStyle.color ? customStyle.color : '#0F172A',
                                                            fontWeight: customStyle.bold ? 800 : 400,
                                                            fontStyle: customStyle.italic ? 'italic' : 'normal',
                                                            textDecoration: customStyle.underline ? 'underline' : 'none',
                                                            textAlign: customStyle.align ? customStyle.align : (customStyle.ht === '0' ? 'center' : (customStyle.ht === '2' ? 'right' : (customStyle.ht === '1' ? 'left' : 'left'))),
                                                            verticalAlign: customStyle.verticalAlign ? customStyle.verticalAlign : (customStyle.vt === '0' ? 'middle' : (customStyle.vt === '1' ? 'top' : (customStyle.vt === '2' ? 'bottom' : 'middle'))),
                                                            fontFamily: customStyle.fontFamily || 'Inter',
                                                            fontSize: customStyle.fontSize || '13px',
                                                            cursor: isFillDragging ? 'crosshair' : 'cell',
                                                            minWidth: customW,
                                                            width: customW,
                                                            height: customH,
                                                            whiteSpace: customStyle.wrapText ? 'normal' : 'nowrap',
                                                            wordBreak: customStyle.wrapText ? 'break-word' : 'normal'
                                                        }}
                                                    >
                                                        {isEditingThisCell ? (
                                                            <input
                                                                ref={inlineInputRef}
                                                                autoFocus
                                                                type="text"
                                                                value={cellInputValue}
                                                                onChange={(e) => handleCellValueChange(e.target.value)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter' || e.key === 'Tab') {
                                                                        e.preventDefault();
                                                                        commitCellEdit();
                                                                    }
                                                                }}
                                                                onBlur={() => commitCellEdit()}
                                                                style={{ width: '100%', height: '100%', padding: '4px 8px', border: 'none', outline: '2px solid #02006c', background: '#FFF' }}
                                                            />
                                                        ) : cellValue}

                                                        {/* Fill Handle Square at Bottom-Right Corner of Selection */}
                                                        {rIdx === maxR && cIdx === maxC && !isEditingThisCell && (
                                                            <div
                                                                onMouseDown={(e) => {
                                                                    e.stopPropagation();
                                                                    setIsFillDragging(true);
                                                                    setFillTarget({ r: rIdx, c: cIdx });
                                                                }}
                                                                title="Cliquer et glisser pour étirer / recopier la cellule"
                                                                style={{
                                                                    position: 'absolute',
                                                                    bottom: '-4px',
                                                                    right: '-4px',
                                                                    width: '8px',
                                                                    height: '8px',
                                                                    background: '#02006c',
                                                                    border: '1.5px solid #FFFFFF',
                                                                    borderRadius: '1px',
                                                                    cursor: 'crosshair',
                                                                    zIndex: 35,
                                                                    boxShadow: '0 0 3px rgba(2, 0, 108, 0.6)'
                                                                }}
                                                            />
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    );
                })()}
            </div>

            {/* Bottom Tabs Bar with Full Sheet Management */}
            <div style={{ height: '40px', background: '#F1F5F9', borderTop: '1px solid #CBD5E1', display: 'flex', alignItems: 'center', padding: '0 1rem', gap: '0.5rem', position: 'relative', overflowX: 'auto' }}>
                {/* Plus (+) Add Sheet Button */}
                <CustomTooltip position="top" text="Ajouter une feuille">
                    <button
                        onClick={handleAddSheet}
                        style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            border: '1px solid #CBD5E1',
                            background: '#FFFFFF',
                            color: '#02006c',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontWeight: 800,
                            flexShrink: 0
                        }}
                    >
                        <Plus size={16} />
                    </button>
                </CustomTooltip>

                {/* Paste Sheet Button (if copied) */}
                {copiedSheet && (
                    <CustomTooltip position="top" text={`Coller la feuille (${copiedSheet.name})`}>
                        <button
                            onClick={handlePasteSheet}
                            style={{
                                padding: '0.25rem 0.65rem',
                                borderRadius: '6px',
                                border: '1px solid #02006c',
                                background: '#02006c',
                                color: '#FFFFFF',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                flexShrink: 0
                            }}
                        >
                            <ClipboardPaste size={14} />
                            <span>Coller ({copiedSheet.name})</span>
                        </button>
                    </CustomTooltip>
                )}

                <div style={{ height: '20px', width: '1px', background: '#CBD5E1', margin: '0 4px', flexShrink: 0 }} />

                {/* Sheets List Tabs */}
                {sheets.map((s, idx) => {
                    const isActive = idx === activeSheetIndex;
                    return (
                        <div key={idx} style={{ position: 'relative', flexShrink: 0 }}>
                            <div
                                onClick={() => {
                                    setSelectionRange({ start: { r: 0, c: 0 }, end: { r: 0, c: 0 } });
                                    setEditingCell(null);
                                    setActiveSheetIndex(idx);
                                }}
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    setActiveSheetMenu(activeSheetMenu === idx ? null : idx);
                                }}
                                title="Clic gauche pour sélectionner, clic droit ou flèche pour options (Renommer, Copier, Coller, Supprimer)"
                                style={{
                                    padding: '0.35rem 0.85rem',
                                    borderRadius: '8px 8px 0 0',
                                    border: '1px solid #CBD5E1',
                                    borderBottom: isActive ? '3px solid #02006c' : '1px solid #CBD5E1',
                                    background: isActive ? '#FFF' : '#E2E8F0',
                                    color: isActive ? '#02006c' : '#64748B',
                                    fontWeight: isActive ? 800 : 600,
                                    fontSize: '0.775rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <span>{s.name}</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveSheetMenu(activeSheetMenu === idx ? null : idx);
                                    }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '2px',
                                        color: isActive ? '#02006c' : '#94A3B8',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    <ChevronDown size={12} />
                                </button>
                            </div>

                            {/* Sheet Tab Context Dropdown Menu (Fixed position to prevent overflow clipping) */}
                            {activeSheetMenu === idx && (
                                <div style={{
                                    position: 'fixed',
                                    bottom: '65px',
                                    background: '#FFFFFF',
                                    border: '1.5px solid #02006c',
                                    borderRadius: '12px',
                                    boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
                                    padding: '6px 0',
                                    width: '190px',
                                    zIndex: 99999
                                }}>
                                    {s.type === 'child' && (
                                        <div
                                            onClick={() => {
                                                handleSyncChildSheets(s.parentSheetName);
                                                setActiveSheetMenu(null);
                                            }}
                                            style={{ padding: '7px 14px', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontWeight: 800 }}
                                        >
                                            <CheckCircle2 size={14} /> Actualiser (Sync Parent)
                                        </div>
                                    )}
                                    <div
                                        onClick={() => handleRenameSheet(idx)}
                                        style={{ padding: '7px 14px', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#1E293B', fontWeight: 600 }}
                                    >
                                        <Edit3 size={14} /> Renommer la feuille
                                    </div>
                                    <div
                                        onClick={() => handleCopySheet(idx)}
                                        style={{ padding: '7px 14px', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#1E293B', fontWeight: 600 }}
                                    >
                                        <Copy size={14} /> Copier la feuille
                                    </div>
                                    {copiedSheet && (
                                        <div
                                            onClick={handlePasteSheet}
                                            style={{ padding: '7px 14px', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#02006c', fontWeight: 700 }}
                                        >
                                            <ClipboardPaste size={14} /> Coller la feuille
                                        </div>
                                    )}
                                    <div style={{ height: '1px', background: '#E2E8F0', margin: '4px 0' }} />
                                    <div
                                        onClick={() => handleDeleteSheet(idx)}
                                        style={{ padding: '7px 14px', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#DC2626', fontWeight: 700 }}
                                    >
                                        <Trash2 size={14} /> Supprimer la feuille
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Mini Footer Bar */}
            <footer style={{
                height: '24px',
                background: '#F1F5F9',
                borderTop: '1px solid #CBD5E1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 1rem',
                fontSize: '0.675rem',
                color: '#64748B',
                fontWeight: 600,
                userSelect: 'none'
            }}>
                <span>© 2026 ANTIC — Plateforme Excel-to-Word</span>
                <span>Prêt • Feuille active: <strong style={{ color: '#02006c' }}>{currentSheet?.name}</strong> ({sheetData.length} Lignes × {sheetData[0]?.length || 26} Colonnes)</span>
            </footer>

            {/* Word Preview Modal */}
            {isPreviewModalOpen && (
                <WordDocumentPreviewModal workbook={currentWorkbook} sheetName={currentSheet.name} onClose={() => setIsPreviewModalOpen(false)} onConfirmExport={() => setStatusMessage("Document Word généré avec succès !")} />
            )}

            {/* Custom UI Modal - Rename Sheet (No Browser prompt) */}
            {renameModal.isOpen && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(2, 0, 108, 0.45)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 99999
                }}>
                    <form onSubmit={confirmRenameSheet} style={{
                        background: '#FFFFFF',
                        borderRadius: '16px',
                        padding: '24px',
                        width: '380px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
                        border: '1.5px solid #02006c',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px'
                    }}>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#02006c' }}>
                            Renommer la feuille
                        </h4>
                        <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B', display: 'block', marginBottom: '6px' }}>
                                Entrez le nouveau nom de la feuille :
                            </label>
                            <input
                                type="text"
                                autoFocus
                                value={renameModal.newName}
                                onChange={(e) => setRenameModal({ ...renameModal, newName: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: '10px',
                                    border: '1.5px solid #CBD5E1',
                                    fontSize: '0.9rem',
                                    fontWeight: 700,
                                    color: '#02006c',
                                    outline: 'none'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button
                                type="button"
                                onClick={() => setRenameModal({ isOpen: false, sheetIndex: null, newName: '' })}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    border: '1px solid #CBD5E1',
                                    background: '#FFF',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                style={{
                                    padding: '8px 18px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: '#02006c',
                                    color: '#FFF',
                                    fontSize: '0.8rem',
                                    fontWeight: 800,
                                    cursor: 'pointer'
                                }}
                            >
                                Enregistrer
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Custom UI Modal - Confirm Delete Sheet (No Browser confirm) */}
            {deleteModal.isOpen && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(2, 0, 108, 0.45)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 99999
                }}>
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: '16px',
                        padding: '24px',
                        width: '400px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
                        border: '1.5px solid #DC2626',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px'
                    }}>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#DC2626' }}>
                            Confirmer la suppression
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#334155', lineHeight: 1.5 }}>
                            Êtes-vous sûr de vouloir supprimer la feuille <strong>"{deleteModal.sheetName}"</strong> ? Cette action est irréversible.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button
                                type="button"
                                onClick={() => setDeleteModal({ isOpen: false, sheetIndex: null, sheetName: '' })}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    border: '1px solid #CBD5E1',
                                    background: '#FFF',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                onClick={confirmDeleteSheet}
                                style={{
                                    padding: '8px 18px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: '#DC2626',
                                    color: '#FFF',
                                    fontSize: '0.8rem',
                                    fontWeight: 800,
                                    cursor: 'pointer'
                                }}
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* SheetTools (xlam) Filter & Sync Modal */}
            {isSheetToolsModalOpen && (
                <SheetToolsFilterModal
                    workbook={currentWorkbook}
                    activeSheetIndex={activeSheetIndex}
                    onClose={() => setIsSheetToolsModalOpen(false)}
                    onCreateChildSheet={handleCreateChildSheet}
                    onSyncChildSheets={handleSyncChildSheets}
                />
            )}
        </div>
    );
}
