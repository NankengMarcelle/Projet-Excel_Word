import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Info, Download, Eye, FileText, CheckCircle2, Clock, ShieldCheck, RefreshCw, ChevronRight, Upload, Plus } from 'lucide-react';
import WordDocumentPreviewModal from './WordDocumentPreviewModal';

export default function WorkbookManagementView({ workbooks, onSelectWorkbook, onOpenConvertModal, onOpenUploadModal, lang = 'fr' }) {
    const [previewWb, setPreviewWb] = useState(null);

    return (
        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#F8FAFC', minHeight: 'calc(100vh - 65px)', width: '100%' }}>

            {/* Page Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #E2E8F0',
                paddingBottom: '1.25rem'
            }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 800, color: '#02006c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <FileSpreadsheet size={16} color="#02006c" /> {lang === 'fr' ? "Fichiers Excel & Propriétés" : "Excel Files & Properties"}
                    </div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                        {lang === 'fr' ? "Gestion des Fichiers Excel" : "Excel File Management"}
                    </h1>
                    <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '2px' }}>
                        {lang === 'fr'
                            ? "Sélectionnez un fichier pour afficher ses métadonnées ou le convertir au format Word."
                            : "Select a file to view its metadata or convert it to Word format."}
                    </p>
                </div>

            </div>

            {/* Full Width Layout */}
            <div style={{ display: 'flex', width: '100%' }}>

                {/* Files List (Enumération style boîte de messages) */}
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>

                    {/* Header Row */}
                    <div style={{ display: 'flex', padding: '12px 16px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                        <div style={{ flex: 2, minWidth: 0 }}>{lang === 'fr' ? 'Nom du Fichier' : 'File Name'}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>{lang === 'fr' ? 'Date de MAJ' : 'Last Updated'}</div>
                        <div style={{ flex: 0.8, minWidth: 0 }}>{lang === 'fr' ? 'Feuilles' : 'Sheets'}</div>
                        <div style={{ flex: 0.8, minWidth: 0 }}>{lang === 'fr' ? 'Taille' : 'Size'}</div>
                        <div style={{ minWidth: '220px', textAlign: 'right' }}>{lang === 'fr' ? 'Actions' : 'Actions'}</div>
                    </div>

                    {/* Messages/Files List */}
                    <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '600px', overflowY: 'auto' }}>
                        {workbooks.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
                                {lang === 'fr' ? "Aucun fichier Excel importé." : "No Excel files imported."}
                            </div>
                        ) : (
                            workbooks.map((wb) => {
                                return (
                                    <div
                                        key={wb.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '12px 16px',
                                            borderBottom: '1px solid #EEF2F6',
                                            background: '#FFFFFF',
                                            transition: 'background 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}
                                    >
                                        <div style={{ flex: 2, minWidth: 0, display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                                            <FileSpreadsheet size={18} color="#02006c" style={{ minWidth: '18px', flexShrink: 0 }} />
                                            <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0F172A', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }} title={wb.name}>
                                                {wb.name}
                                            </span>
                                        </div>

                                        <div style={{ flex: 1, minWidth: 0, fontSize: '0.8rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Clock size={12} style={{ flexShrink: 0 }} />
                                            <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }} title={wb.lastUpdated || (lang === 'fr' ? 'Aujourd\'hui' : 'Today')}>
                                                {wb.lastUpdated || (lang === 'fr' ? 'Aujourd\'hui' : 'Today')}
                                            </span>
                                        </div>

                                        <div style={{ flex: 0.8, minWidth: 0, fontSize: '0.8rem', color: '#64748B', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                            <span style={{ fontWeight: 600, color: '#02006c' }}>{wb.sheets?.length || 1}</span> {lang === 'fr' ? 'feuille(s)' : 'sheet(s)'}
                                        </div>

                                        <div style={{ flex: 0.8, minWidth: 0, fontSize: '0.8rem', color: '#64748B', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                            {wb.size || (lang === 'fr' ? 'Inconnue' : 'Unknown')}
                                        </div>

                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', minWidth: '220px' }}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setPreviewWb(wb);
                                                }}
                                                className="btn-pill-light"
                                                style={{ fontSize: '0.75rem', padding: '4px 10px', background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#475569', display: 'flex', alignItems: 'center' }}
                                                title={lang === 'fr' ? 'Aperçu' : 'Preview'}
                                            >
                                                <Eye size={13} style={{ marginRight: '4px' }} />
                                                {lang === 'fr' ? 'Aperçu' : 'Preview'}
                                            </button>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onOpenConvertModal(wb);
                                                }}
                                                className="btn-pill-light"
                                                style={{ fontSize: '0.75rem', padding: '4px 10px', background: '#02006c', color: 'white', display: 'flex', alignItems: 'center', border: 'none' }}
                                                title={lang === 'fr' ? 'Exporter au format Word' : 'Export to Word'}
                                            >
                                                <Download size={13} style={{ marginRight: '4px' }} />
                                                Word
                                            </button>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onSelectWorkbook(wb);
                                                }}
                                                className="btn-pill-light"
                                                style={{ fontSize: '0.75rem', padding: '4px 10px', border: '1px solid #02006c', color: '#02006c', display: 'flex', alignItems: 'center', background: 'transparent' }}
                                                title={lang === 'fr' ? 'Éditer le classeur' : 'Edit Workbook'}
                                            >
                                                <FileSpreadsheet size={13} style={{ marginRight: '4px' }} />
                                                {lang === 'fr' ? 'Éditer' : 'Edit'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

            </div>

            {/* Preview Word Modal */}
            {previewWb && (
                <WordDocumentPreviewModal
                    workbook={previewWb}
                    sheetName={previewWb.sheets?.[0]?.name || (lang === 'fr' ? 'Feuille1' : 'Sheet1')}
                    onClose={() => setPreviewWb(null)}
                    onConfirmExport={(details) => alert(lang === 'fr' ? `Fichier Word généré avec succès !` : `Word file generated successfully!`)}
                    lang={lang}
                />
            )}

        </div>
    );
}
