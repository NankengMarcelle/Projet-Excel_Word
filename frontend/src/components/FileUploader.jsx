import React, { useState } from 'react';
import { UploadCloud, X, FileSpreadsheet, CheckCircle2, AlertCircle, Grid } from 'lucide-react';
import { parseExcelFile } from '../utils/fortuneExcelParser';

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
                if (s.alignment.wrapText) styleObj.wrapText = true;
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

    return { cellStyles, colWidths, rowHeights, hiddenRows, hiddenCols };
};

export default function FileUploader({ onClose, onUploadSuccess }) {
    const [dragOver, setDragOver] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.ods')) {
                setSelectedFile(file);
            } else {
                alert("Veuillez sélectionner un fichier Excel valide (.xlsx, .xls, .ods)");
            }
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmitUpload = async () => {
        if (!selectedFile) return;
        setIsUploading(true);

        try {
            const parsedWb = await parseExcelFile(selectedFile);
            const parsedSheets = parsedWb.sheets || [];
            let totalMerges = 0;
            parsedSheets.forEach(s => {
                totalMerges += (s.merges?.length || 0);
            });

            setIsUploading(false);
            if (onUploadSuccess) {
                onUploadSuccess({
                    id: `wb-${Date.now()}`,
                    name: selectedFile.name,
                    size: `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`,
                    lastModified: new Date().toLocaleDateString('fr-FR'),
                    updatedAt: new Date().toLocaleString(),
                    sheetsCount: parsedSheets.length,
                    parentSheet: parsedSheets[0]?.name || "Feuille1",
                    status: totalMerges > 0 ? `Fusionné (${totalMerges} cellules)` : "Conforme",
                    sheets: parsedSheets
                });
            }
            onClose();
        } catch (err) {
            console.error("Erreur lors de la lecture du fichier Excel :", err);
            setIsUploading(false);
            alert("Erreur lors de la lecture du fichier Excel.");
        }
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(11, 23, 39, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem'
        }}>
            <div className="glass-panel animate-fade-in" style={{
                width: '100%',
                maxWidth: '520px',
                background: 'var(--bg-secondary)',
                borderRadius: '16px',
                padding: '1.75rem'
            }}>
                {/* Modal Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <FileSpreadsheet size={22} color="var(--color-teal-400)" />
                        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Importer un Classeur Excel</h3>
                    </div>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Drag and Drop Zone */}
                <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    style={{
                        border: dragOver ? '2px dashed var(--color-teal-500)' : '2px dashed var(--border-color)',
                        background: dragOver ? 'rgba(49,151,149,0.1)' : 'var(--bg-primary)',
                        borderRadius: '12px',
                        padding: '2.5rem 1.5rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    onClick={() => document.getElementById('excel-file-input').click()}
                >
                    <UploadCloud size={48} color={dragOver ? 'var(--color-teal-400)' : 'var(--text-muted)'} style={{ margin: '0 auto 0.75rem' }} />
                    <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                        Glissez-déposez votre fichier Excel ici
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                        Formats supportés : .xlsx, .xls, .ods (Max: 25 Mo)
                    </p>

                    <input
                        id="excel-file-input"
                        type="file"
                        accept=".xlsx,.xls,.ods"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                    />

                    <button className="btn-secondary" style={{ pointerEvents: 'none' }}>
                        Parcourir les fichiers
                    </button>
                </div>

                {/* Selected file preview */}
                {selectedFile && (
                    <div style={{
                        marginTop: '1rem',
                        padding: '0.75rem 1rem',
                        background: 'var(--bg-primary)',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <FileSpreadsheet size={20} color="var(--color-teal-400)" />
                            <div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{selectedFile.name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{(selectedFile.size / 1024).toFixed(1)} KB</div>
                            </div>
                        </div>
                        <CheckCircle2 size={20} color="#34D399" />
                    </div>
                )}

                {/* Footer Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                    <button onClick={onClose} className="btn-secondary">Annuler</button>
                    <button
                        onClick={handleSubmitUpload}
                        disabled={!selectedFile || isUploading}
                        className="btn-teal"
                    >
                        {isUploading ? 'Importation...' : 'Valider & Ouvrir dans FortuneSheet'}
                    </button>
                </div>
            </div>
        </div>
    );
}
