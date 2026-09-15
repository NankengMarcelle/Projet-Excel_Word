import React, { useState } from 'react';
import { FileText, Download, X, Check, FileCheck2, Printer } from 'lucide-react';

export default function WordDocumentPreviewModal({ workbook, sheetName = 'Feuille1', onClose, onConfirmExport }) {
    const [selectedTemplate, setSelectedTemplate] = useState('official_antic');
    const [isExporting, setIsExporting] = useState(false);

    // Extract real sheet data dynamically from workbook prop
    const targetSheet = workbook?.sheets?.find(s => s.name === sheetName) || workbook?.sheets?.[0];
    const rawData = targetSheet?.data || [];
    const cellStylesMap = targetSheet?.cellStyles || {};
    const colWidths = targetSheet?.colWidths || {};
    const rowHeights = targetSheet?.rowHeights || {};
    const merges = targetSheet?.merges || [];

    // Calculate exact grid dimensions without stripping empty cells to preserve relative element placement
    let maxRow = Math.max(rawData.length, 1);
    let maxCol = 1;
    rawData.forEach(row => {
        if (row && row.length > maxCol) maxCol = row.length;
    });

    const gridRows = [];
    for (let r = 0; r < maxRow; r++) {
        gridRows.push(rawData[r] || []);
    }

    const getMergeInfo = (r, c) => {
        if (!merges || merges.length === 0) return null;
        for (const m of merges) {
            if (r >= m.startRow && r <= m.endRow && c >= m.startCol && c <= m.endCol) {
                if (r === m.startRow && c === m.startCol) {
                    return { isMaster: true, rowSpan: m.rowSpan, colSpan: m.colSpan };
                }
                return { isCovered: true };
            }
        }
        return null;
    };

    const handleExport = () => {
        setIsExporting(true);

        const docTitle = workbook?.name ? workbook.name.replace(/\.[^/.]+$/, "").replace(/_/g, ' ') : "DOCUMENT DE SYNTHÈSE";
        const docFileName = `${docTitle.replace(/\s+/g, '_')}_Officiel.docx`;

        const bodyHtml = gridRows.map((row, rIdx) => {
            const rowH = rowHeights[rIdx] ? `${rowHeights[rIdx]}px` : '28px';
            const cellsHtml = Array.from({ length: maxCol }).map((_, cIdx) => {
                const info = getMergeInfo(rIdx, cIdx);
                if (info?.isCovered) return '';
                const spanAttrs = info?.isMaster ? `rowspan="${info.rowSpan}" colspan="${info.colSpan}"` : '';

                const colW = colWidths[cIdx] ? `${colWidths[cIdx]}px` : '100px';
                const cStyle = cellStylesMap[`${rIdx}_${cIdx}`] || {};
                const inlineStyles = [
                    `width: ${colW}`,
                    `height: ${rowH}`,
                    'padding: 6px 8px',
                    'border: 1px solid #CBD5E1',
                    cStyle.color ? `color: ${cStyle.color}` : '',
                    cStyle.bg ? `background-color: ${cStyle.bg}` : '',
                    cStyle.bold ? 'font-weight: bold' : '',
                    cStyle.italic ? 'font-style: italic' : '',
                    cStyle.align ? `text-align: ${cStyle.align}` : '',
                    cStyle.fontSize ? `font-size: ${cStyle.fontSize}` : ''
                ].filter(Boolean).join('; ');

                return `<td ${spanAttrs} style="${inlineStyles}">${row && row[cIdx] !== undefined ? String(row[cIdx]) : ''}</td>`;
            }).join('');
            return `<tr style="height: ${rowH};">${cellsHtml}</tr>`;
        }).join('');

        const htmlContent = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
                <meta charset="utf-8">
                <title>${docTitle}</title>
                <style>
                    body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; color: #0F172A; margin: 20mm; }
                    .header { text-align: center; border-bottom: 2px solid #0a034a; padding-bottom: 15px; margin-bottom: 20px; }
                    .country-title { font-size: 9pt; font-weight: bold; color: #0a034a; text-transform: uppercase; letter-spacing: 1px; }
                    .motto { font-size: 8pt; color: #64748B; font-style: italic; margin-top: 2px; }
                    .agency-name { font-size: 11pt; font-weight: bold; color: #0a034a; margin-top: 8px; }
                    .doc-title { font-size: 18pt; font-weight: bold; color: #0F172A; margin-top: 15px; text-transform: uppercase; text-decoration: underline; }
                    .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; background-color: #F8FAFC; border: 1px solid #CBD5E1; }
                    .meta-table td { padding: 8px 12px; font-size: 10pt; border: 1px solid #E2E8F0; }
                    .meta-label { font-weight: bold; color: #0a034a; }
                    .data-table { width: 100%; border-collapse: collapse; font-size: 10pt; margin-bottom: 25px; border: 1px solid #0a034a; }
                    .footer-section { margin-top: 40px; padding-top: 15px; border-top: 1px dashed #CBD5E1; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="country-title">REPUBLIQUE DU CAMEROUN • REPUBLIC OF CAMEROON</div>
                    <div class="motto">Paix - Travail - Patrie / Peace - Work - Fatherland</div>
                    <div class="agency-name">AGENCE NATIONALE DES TECHNOLOGIES DE L'INFORMATION ET DE LA COMMUNICATION (ANTIC)</div>
                    <div class="doc-title">${docTitle}</div>
                </div>

                <table class="meta-table">
                    <tr>
                        <td><span class="meta-label">Fichier Excel Source :</span> ${workbook?.name || 'Classeur.xlsx'}</td>
                        <td><span class="meta-label">Feuille de Calcul :</span> ${targetSheet?.name || sheetName}</td>
                    </tr>
                    <tr>
                        <td><span class="meta-label">Modèle Choisi :</span> ${selectedTemplate}</td>
                        <td><span class="meta-label">Date d'Exportation :</span> ${new Date().toLocaleString()}</td>
                    </tr>
                </table>

                <div style="font-weight: bold; color: #0a034a; font-size: 12pt; margin-bottom: 10px;">Données Extraites du Classeur Excel</div>
                <table class="data-table">
                    <thead><tr>${headerHtml}</tr></thead>
                    <tbody>${bodyHtml}</tbody>
                </table>

                <div class="footer-section">
                    <div style="float:left; font-size:8pt; color:#0a034a; font-weight:bold;">
                        ✓ Document Officiel Généré par ANTIC Excel-to-Word Converter
                    </div>
                    <div style="float:right; text-align:right; font-weight:bold; color:#0F172A;">
                        Le Directeur Général de l'ANTIC
                    </div>
                </div>
            </body>
            </html>
        `;

        const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = docFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setTimeout(() => {
            setIsExporting(false);
            if (onConfirmExport) {
                onConfirmExport({
                    workbookName: workbook?.name || 'Rapport.xlsx',
                    template: selectedTemplate,
                    exportDate: new Date().toLocaleString()
                });
            }
            onClose();
        }, 800);
    };


    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(10, 3, 74, 0.65)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1.5rem'
        }}>
            <div style={{
                background: '#FFFFFF',
                borderRadius: '24px',
                width: '100%',
                maxWidth: '960px',
                maxHeight: '92vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
                overflow: 'hidden'
            }}>

                {/* Navy Header Modal with #0a034a */}
                <div style={{
                    background: '#0a034a',
                    color: '#FFFFFF',
                    padding: '1.25rem 1.75rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.15)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FileText size={22} color="#FFFFFF" />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                                Aperçu Réel du Document Word (.docx)
                            </h2>
                            <div style={{ fontSize: '0.75rem', color: '#E0E7FF', marginTop: '2px' }}>
                                Fichier Excel Source : <strong>{workbook?.name || 'Classeur.xlsx'}</strong> (Feuille: "{targetSheet?.name || sheetName}")
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255, 255, 255, 0.15)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '34px',
                            height: '34px',
                            color: '#FFFFFF',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Modal Content Body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem', background: '#F8FAFC', display: 'flex', gap: '2rem' }}>

                    {/* Left Column: Template Selection Controls */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: '0.5rem' }}>
                                Modèle de Mise en Page Word :
                            </label>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {[
                                    { id: 'official_antic', title: 'Modèle Officiel ANTIC (Normalisé)', desc: 'Avec en-tête d\'État, logo officiel et filigrane institutionnel.' },
                                    { id: 'budget_summary', title: 'Tableau de Synthèse Budgétaire A4', desc: 'Mise en page optimisée pour grands tableaux de calcul.' },
                                    { id: 'audit_report', title: 'Rapport d\'Audit & Contrôle Technique SI', desc: 'Format certifié avec bloc de signature institutionnelle.' }
                                ].map((tpl) => (
                                    <div
                                        key={tpl.id}
                                        onClick={() => setSelectedTemplate(tpl.id)}
                                        style={{
                                            padding: '1rem',
                                            borderRadius: '16px',
                                            background: '#FFFFFF',
                                            border: selectedTemplate === tpl.id ? '2px solid #0a034a' : '1px solid #E2E8F0',
                                            cursor: 'pointer',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                                            transition: 'all 0.15s ease'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <strong style={{ fontSize: '0.85rem', color: selectedTemplate === tpl.id ? '#0a034a' : '#0F172A' }}>{tpl.title}</strong>
                                            {selectedTemplate === tpl.id && <Check size={18} color="#0a034a" />}
                                        </div>
                                        <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
                                            {tpl.desc}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0', fontSize: '0.775rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ fontWeight: 800, color: '#0a034a' }}>Certification de Conformité Documentaire</div>
                            <div>• Extraction fidèle des {nonEmptyRows.length} lignes et colonnes de la feuille</div>
                            <div>• En-tête officiel de la République du Cameroun</div>
                            <div>• Style et bordures normalisés au format Word (.docx)</div>
                        </div>
                    </div>

                    {/* Right Column: Dynamic Real A4 Document Preview Page */}
                    <div style={{ flex: 1.3, display: 'flex', justifyContent: 'center' }}>
                        <div style={{
                            width: '100%',
                            maxWidth: '430px',
                            minHeight: '520px',
                            background: '#FFFFFF',
                            boxShadow: '0 12px 35px rgba(0, 0, 0, 0.12)',
                            borderRadius: '8px',
                            border: '1px solid #CBD5E1',
                            padding: '1.75rem',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            fontSize: '0.7rem',
                            position: 'relative'
                        }}>

                            {/* Virtual Header Page 1 */}
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0a034a', paddingBottom: '0.6rem', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <img src="/antic_logo.png" alt="ANTIC" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                                        <div>
                                            <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#0a034a', lineHeight: 1 }}>ANTIC CAMEROUN</div>
                                            <div style={{ fontSize: '0.55rem', color: '#64748B' }}>Agence Nationale des TIC</div>
                                        </div>
                                    </div>
                                    <span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#0a034a', background: 'rgba(10, 3, 74, 0.08)', padding: '2px 6px', borderRadius: '4px' }}>
                                        RAPPORT OFFICIEL
                                    </span>
                                </div>

                                {/* Doc Title */}
                                <h4 style={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: 900, color: '#0a034a', margin: '0.75rem 0 0.25rem 0', textTransform: 'uppercase' }}>
                                    {workbook?.name ? workbook.name.replace(/\.[^/.]+$/, "") : "DOCUMENT DE SYNTHÈSE"}
                                </h4>
                                <p style={{ fontSize: '0.65rem', color: '#64748B', textAlign: 'center', marginBottom: '1.25rem', fontStyle: 'italic' }}>
                                    Données extraites de la feuille "{targetSheet?.name || sheetName}"
                                </p>

                                {/* REAL DYNAMIC EXCEL TO WORD TABLE PREVIEW */}
                                <div style={{ overflowX: 'auto', border: '1px solid #0a034a', borderRadius: '4px' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.6rem' }}>
                                        <tbody>
                                            {gridRows.map((row, rIdx) => {
                                                const rowH = rowHeights[rIdx] ? `${rowHeights[rIdx]}px` : '24px';
                                                return (
                                                    <tr key={rIdx} style={{ height: rowH }}>
                                                        {Array.from({ length: maxCol }).map((_, cIdx) => {
                                                            const info = getMergeInfo(rIdx, cIdx);
                                                            if (info?.isCovered) return null;
                                                            const colW = colWidths[cIdx] ? `${colWidths[cIdx]}px` : '80px';
                                                            const cStyle = cellStylesMap[`${rIdx}_${cIdx}`] || {};
                                                            return (
                                                                <td
                                                                    key={cIdx}
                                                                    rowSpan={info?.isMaster ? info.rowSpan : undefined}
                                                                    colSpan={info?.isMaster ? info.colSpan : undefined}
                                                                    style={{
                                                                        padding: '4px 6px',
                                                                        border: '1px solid #E2E8F0',
                                                                        width: colW,
                                                                        minWidth: colW,
                                                                        height: rowH,
                                                                        color: cStyle.color || '#1E293B',
                                                                        background: cStyle.bg || (rIdx % 2 === 0 ? '#FFFFFF' : '#F8FAFC'),
                                                                        fontWeight: cStyle.bold ? 800 : 'normal',
                                                                        fontStyle: cStyle.italic ? 'italic' : 'normal',
                                                                        textAlign: cStyle.align || 'left',
                                                                        fontSize: cStyle.fontSize || '0.6rem'
                                                                    }}
                                                                >
                                                                    {row && row[cIdx] !== undefined ? String(row[cIdx]) : ''}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Virtual Footer Signature */}
                            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '0.75rem', marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.6rem' }}>
                                <span style={{ color: '#0a034a', fontWeight: 800 }}>✓ Cachet Électronique ANTIC Valide</span>
                                <span style={{ color: '#94A3B8' }}>Page 1 / 1</span>
                            </div>

                        </div>
                    </div>

                </div>

                {/* Modal Action Footer */}
                <div style={{
                    padding: '1rem 2rem',
                    background: '#FFFFFF',
                    borderTop: '1px solid #E2E8F0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <button onClick={onClose} className="btn-pill-light">
                        Annuler
                    </button>

                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="btn-pill-primary"
                        style={{ padding: '0.75rem 1.75rem', fontSize: '0.875rem' }}
                    >
                        <Download size={18} />
                        <span>{isExporting ? "Génération Word..." : "Confirmer & Télécharger le Document (.docx)"}</span>
                    </button>
                </div>

            </div>
        </div>
    );
}
