import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
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
    Save
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

export default function FortuneSheetEditor({ selectedWorkbook, onOpenConvertModal, onBackToDashboard }) {
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
        return {
            name: 'Nouveau_Classeur_Sans_Titre.xlsx',
            sheets: [{ name: 'Feuille1', data: createEmptySheetData(50, 26) }]
        };
    });

    useEffect(() => {
        if (selectedWorkbook) {
            setCurrentWorkbook(selectedWorkbook);
        } else {
            setCurrentWorkbook({
                name: 'Nouveau_Classeur_Sans_Titre.xlsx',
                sheets: [{ name: 'Feuille1', data: createEmptySheetData(50, 26) }]
            });
        }
    }, [selectedWorkbook]);

    const [activeSheetIndex, setActiveSheetIndex] = useState(0);

    // Multi-cell Range Selection
    const [selectionRange, setSelectionRange] = useState({
        start: { r: 0, c: 0 },
        end: { r: 0, c: 0 }
    });
    const [isMouseDown, setIsMouseDown] = useState(false);

    // Per-Cell Styles Map: { [`${r}_${c}`]: { bold, italic, underline, color, bg, fontFamily, fontSize, align } }
    const [cellStyles, setCellStyles] = useState({});

    // Row & Column heights / widths / hidden tracking
    const [rowHeights, setRowHeights] = useState({});
    const [colWidths, setColWidths] = useState({});
    const [hiddenRows, setHiddenRows] = useState(new Set());
    const [hiddenCols, setHiddenCols] = useState(new Set());
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

    const [isSheetToolsModalOpen, setIsSheetToolsModalOpen] = useState(false);

    const handleCreateChildSheet = ({ parentSheetName, childSheetName, colIndex, filterOperator, filterValue, selectedCols }) => {
        const currentSheets = currentWorkbook?.sheets || [];
        const parentSheet = currentSheets.find(s => s.name === parentSheetName);
        if (!parentSheet) return;

        const parentData = parentSheet.data || [];
        const rawHeaderRow = parentData[0] || [];

        // Filter rows from parent data (skip header row 0)
        const filteredRawRows = parentData.slice(1).filter(row => {
            const cellVal = String(row[colIndex] || '').trim().toLowerCase();
            const targetVal = String(filterValue || '').trim().toLowerCase();

            if (filterOperator === 'equals') return cellVal === targetVal;
            if (filterOperator === 'contains') return cellVal.includes(targetVal);
            if (filterOperator === 'startsWith') return cellVal.startsWith(targetVal);
            if (filterOperator === 'greaterThan') return parseFloat(cellVal) > parseFloat(targetVal);
            if (filterOperator === 'lessThan') return parseFloat(cellVal) < parseFloat(targetVal);
            if (filterOperator === 'notEmpty') return cellVal !== '';
            if (filterOperator === 'isEmpty') return cellVal === '';
            return true;
        });

        // Determine column projection indices
        const colIndicesToKeep = Array.isArray(selectedCols) && selectedCols.length > 0
            ? selectedCols
            : Array.from({ length: 15 }, (_, i) => i);

        // Project header row
        const projectedHeaderRow = colIndicesToKeep.map(cIdx => rawHeaderRow[cIdx] || '');

        // Project filtered data rows
        const projectedRows = filteredRawRows.map(row =>
            colIndicesToKeep.map(cIdx => row[cIdx] || '')
        );

        // Ensure empty rows padding up to 50 rows
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
            data: paddedRows
        };

        const updatedSheets = [...currentSheets, newChildSheet];
        setCurrentWorkbook({ ...currentWorkbook, sheets: updatedSheets });
        setActiveSheetIndex(updatedSheets.length - 1);
        setStatusMessage(`Feuille Enfant "${childSheetName}" créée (${colIndicesToKeep.length} colonne(s) conservée(s), ${projectedRows.length} ligne(s) filtrée(s)).`);
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

    const minR = Math.min(selectionRange.start.r, selectionRange.end.r);
    const maxR = Math.max(selectionRange.start.r, selectionRange.end.r);
    const minC = Math.min(selectionRange.start.c, selectionRange.end.c);
    const maxC = Math.max(selectionRange.start.c, selectionRange.end.c);

    const isCellSelected = (r, c) => r >= minR && r <= maxR && c >= minC && c <= maxC;

    const applyStyleToSelectedRange = (stylePatch) => {
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
            return next;
        });
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

    const applyFontFamily = (font) => {
        setFontFamily(font);
        applyStyleToSelectedRange({ fontFamily: font });
    };

    const applyFontSize = (sizeStr) => {
        setFontSizeNum(sizeStr);
        applyStyleToSelectedRange({ fontSize: `${sizeStr.replace(/px/g, '') || 13}px` });
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const data = new Uint8Array(evt.target.result);
                const wb = XLSX.read(data, { type: 'array' });
                const parsedSheets = wb.SheetNames.map(sheetName => {
                    const worksheet = wb.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
                    const rowCount = Math.max(jsonData.length, 50);
                    const colCount = Math.max(jsonData[0] ? jsonData[0].length : 0, 26);
                    const fullData = [];
                    for (let r = 0; r < rowCount; r++) {
                        const row = [];
                        for (let c = 0; c < colCount; c++) {
                            row.push(jsonData[r] && jsonData[r][c] !== undefined ? String(jsonData[r][c]) : '');
                        }
                        fullData.push(row);
                    }
                    return { name: sheetName, data: fullData };
                });
                setCurrentWorkbook({ name: file.name, sheets: parsedSheets });
                setStatusMessage(`Fichier "${file.name}" chargé.`);
                setTimeout(() => setStatusMessage(''), 4000);
            } catch (err) {
                console.error(err);
                setStatusMessage("Erreur de lecture du fichier. Assurez-vous qu'il s'agit d'un fichier Excel ou CSV valide.");
                setTimeout(() => setStatusMessage(''), 4000);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const sheets = currentWorkbook?.sheets || [{ name: 'Feuille1', data: createEmptySheetData(50, 26) }];
    const currentSheet = sheets[activeSheetIndex] || sheets[0];
    const sheetData = currentSheet.data || createEmptySheetData(50, 26);

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

            XLSX.writeFile(wb, exportFileName, { bookType });
            setStatusMessage(`Fichier "${exportFileName}" enregistré avec succès !`);
            setTimeout(() => setStatusMessage(''), 4000);
        } catch (err) {
            console.error("Save error:", err);
            setStatusMessage("Erreur lors de l'enregistrement du fichier.");
            setTimeout(() => setStatusMessage(''), 4000);
        }
    };

    // Keyboard shortcut Ctrl+S / Cmd+S for quick save
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
                e.preventDefault();
                handleSaveExcelWorkbook();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentWorkbook, sheets]);

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
        setCellInputValue(sheetData[r]?.[c] || '');
    };

    const handleCellMouseEnter = (r, c) => {
        if (isMouseDown) setSelectionRange(prev => ({ ...prev, end: { r, c } }));
    };

    const handleCellMouseUp = () => setIsMouseDown(false);

    const handleCellDoubleClick = (r, c) => {
        setEditingCell({ r, c });
        setCellInputValue(sheetData[r]?.[c] || '');
    };

    const handleCellValueChange = (val) => {
        setCellInputValue(val);
        const updatedData = [...sheetData.map(row => [...row])];
        if (!updatedData[selectionRange.start.r]) updatedData[selectionRange.start.r] = [];
        updatedData[selectionRange.start.r][selectionRange.start.c] = val;

        const updatedSheets = [...sheets];
        updatedSheets[activeSheetIndex] = { ...currentSheet, data: updatedData };
        setCurrentWorkbook({ ...currentWorkbook, sheets: updatedSheets });
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
        const updatedData = [...sheetData];
        updatedData.splice(minR, 0, Array(sheetData[0]?.length || 26).fill(''));
        updateSheetData(updatedData);
        setStatusMessage(`Ligne insérée au-dessus de la ligne ${minR + 1}`);
        setActiveMenu(null);
    };

    const handleInsertRowBelow = () => {
        const updatedData = [...sheetData];
        updatedData.splice(maxR + 1, 0, Array(sheetData[0]?.length || 26).fill(''));
        updateSheetData(updatedData);
        setStatusMessage(`Ligne insérée en-dessous de la ligne ${maxR + 1}`);
        setActiveMenu(null);
    };

    const handleDeleteRows = () => {
        updateSheetData(sheetData.filter((_, idx) => idx < minR || idx > maxR));
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
        updateSheetData(sheetData.map(row => { const r = [...row]; r.splice(minC, 0, ''); return r; }));
        setStatusMessage(`Colonne insérée avant la colonne ${getColLabel(minC)}`);
        setActiveMenu(null);
    };

    const handleInsertColumnAfter = () => {
        updateSheetData(sheetData.map(row => { const r = [...row]; r.splice(maxC + 1, 0, ''); return r; }));
        setStatusMessage(`Colonne insérée après la colonne ${getColLabel(maxC)}`);
        setActiveMenu(null);
    };

    const handleDeleteColumns = () => {
        updateSheetData(sheetData.map(row => row.filter((_, idx) => idx < minC || idx > maxC)));
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

    const updateSheetData = (newData) => {
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
            <div style={{ height: '48px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', padding: '0 1rem', gap: '0.6rem', position: 'relative', zIndex: 20 }}>

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

                {/* Text Alignments */}
                <button onClick={() => applyAlign('left')} style={{ padding: '5px 7px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFF', cursor: 'pointer' }}><AlignLeft size={14} /></button>
                <button onClick={() => applyAlign('center')} style={{ padding: '5px 7px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFF', cursor: 'pointer' }}><AlignCenter size={14} /></button>
                <button onClick={() => applyAlign('right')} style={{ padding: '5px 7px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFF', cursor: 'pointer' }}><AlignRight size={14} /></button>

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

                <input type="text" value={cellInputValue} onChange={(e) => handleCellValueChange(e.target.value)} placeholder="Éditer la cellule active..." style={{ flex: 1, height: '30px', padding: '0 0.75rem', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.825rem', outline: 'none', fontFamily: fontFamily }} />
            </div>

            {/* Grid Table Canvas */}
            <div style={{ flex: 1, overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem', userSelect: 'none' }}>
                    <thead>
                        <tr style={{ background: '#F1F5F9', position: 'sticky', top: 0, zIndex: 10 }}>
                            <th style={{ padding: '6px', border: '1px solid #CBD5E1', width: '45px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, background: '#E2E8F0' }}>#</th>
                            {(sheetData[0] || Array(26).fill('')).map((_, cIdx) => {
                                if (hiddenCols.has(cIdx)) return null;
                                const customW = colWidths[cIdx] ? `${colWidths[cIdx]}px` : '100px';
                                return (
                                    <th key={cIdx} style={{ padding: '6px 12px', border: '1px solid #CBD5E1', textAlign: 'center', fontWeight: 700, minWidth: customW, width: customW, fontSize: '0.75rem' }}>
                                        {getColLabel(cIdx)}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {sheetData.map((row, rIdx) => {
                            if (hiddenRows.has(rIdx)) return null;
                            const customH = rowHeights[rIdx] ? `${rowHeights[rIdx]}px` : '28px';

                            return (
                                <tr key={rIdx} style={{ height: customH }}>
                                    <td style={{ padding: '4px 6px', border: '1px solid #CBD5E1', textAlign: 'center', fontWeight: 700, color: '#64748B', background: '#F8FAFC', fontSize: '0.75rem' }}>
                                        {rIdx + 1}
                                    </td>
                                    {row.map((cellValue, cIdx) => {
                                        if (hiddenCols.has(cIdx)) return null;
                                        const selected = isCellSelected(rIdx, cIdx);
                                        const isEditingThisCell = editingCell && editingCell.r === rIdx && editingCell.c === cIdx;
                                        const customStyle = cellStyles[`${rIdx}_${cIdx}`] || {};
                                        return (
                                            <td
                                                key={cIdx}
                                                onMouseDown={() => handleCellMouseDown(rIdx, cIdx)}
                                                onMouseEnter={() => handleCellMouseEnter(rIdx, cIdx)}
                                                onDoubleClick={() => handleCellDoubleClick(rIdx, cIdx)}
                                                style={{
                                                    padding: isEditingThisCell ? 0 : '6px 10px',
                                                    border: selected ? '2px solid #02006c' : '1px solid #E2E8F0',
                                                    background: customStyle.bg ? customStyle.bg : (selected ? 'rgba(2, 0, 108, 0.12)' : '#FFFFFF'),
                                                    color: customStyle.color ? customStyle.color : '#0F172A',
                                                    fontWeight: customStyle.bold ? 800 : 400,
                                                    fontStyle: customStyle.italic ? 'italic' : 'normal',
                                                    textDecoration: customStyle.underline ? 'underline' : 'none',
                                                    textAlign: customStyle.align || 'left',
                                                    fontFamily: customStyle.fontFamily || 'Inter',
                                                    fontSize: customStyle.fontSize || '13px',
                                                    cursor: 'cell',
                                                    height: customH,
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                {isEditingThisCell ? (
                                                    <input
                                                        ref={inlineInputRef}
                                                        autoFocus
                                                        type="text"
                                                        value={cellInputValue}
                                                        onChange={(e) => handleCellValueChange(e.target.value)}
                                                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Tab') setEditingCell(null); }}
                                                        onBlur={() => setEditingCell(null)}
                                                        style={{ width: '100%', height: '100%', padding: '4px 8px', border: 'none', outline: '2px solid #02006c', background: '#FFF' }}
                                                    />
                                                ) : cellValue}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
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
                                onClick={() => setActiveSheetIndex(idx)}
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
                                    bottom: '45px',
                                    background: '#FFFFFF',
                                    border: '1.5px solid #02006c',
                                    borderRadius: '12px',
                                    boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
                                    padding: '6px 0',
                                    width: '190px',
                                    zIndex: 99999
                                }}>
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
