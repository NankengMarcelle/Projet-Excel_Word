import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Info, Download, Eye, FileText, CheckCircle2, Clock, ShieldCheck, RefreshCw, ChevronRight, Upload, Plus } from 'lucide-react';
import WordDocumentPreviewModal from './WordDocumentPreviewModal';

export default function WorkbookManagementView({ workbooks, onSelectWorkbook, onOpenConvertModal, onOpenUploadModal, lang = 'fr' }) {
    const [selectedWbDetails, setSelectedWbDetails] = useState(workbooks[0] || null);
    const [previewWb, setPreviewWb] = useState(null);

    // Auto update selected details when workbooks change
    useEffect(() => {
        if (workbooks && workbooks.length > 0) {
            setSelectedWbDetails(workbooks[0]);
        }
    }, [workbooks]);

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

            {/* 2 Column Layout */}
            <div style={{ display: 'flex', gap: '1.5rem' }}>

                {/* Left Files List */}
                <div style={{ flex: 1.3, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {workbooks.map((wb) => {
                        const isSelected = selectedWbDetails?.id === wb.id;

                        return (
                            <div
                                key={wb.id}
                                onClick={() => setSelectedWbDetails(wb)}
                                style={{
                                    padding: '1.25rem',
                                    borderRadius: '18px',
                                    background: isSelected ? 'rgba(2, 0, 108, 0.04)' : '#FFFFFF',
                                    border: isSelected ? '2px solid #02006c' : '1px solid #E2E8F0',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 2px 8px rgba(2, 0, 108, 0.04)'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '42px',
                                        height: '42px',
                                        borderRadius: '12px',
                                        background: 'rgba(2, 0, 108, 0.08)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#02006c'
                                    }}>
                                        <FileSpreadsheet size={22} />
                                    </div>

                                    <div>
                                        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#02006c' }}>
                                            {wb.name}
                                        </h3>
                                        <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px', display: 'flex', gap: '12px' }}>
                                            <span>{lang === 'fr' ? 'Taille' : 'Size'} : <strong>{wb.size || '1.2 MB'}</strong></span>
                                            <span>{lang === 'fr' ? 'Feuilles' : 'Sheets'} : <strong>{wb.sheets?.length || 1}</strong></span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onSelectWorkbook(wb);
                                        }}
                                        className="btn-pill-light"
                                        style={{ fontSize: '0.775rem', padding: '0.4rem 0.8rem' }}
                                    >
                                        {lang === 'fr' ? 'Éditer' : 'Edit'}
                                    </button>

                                    <ChevronRight size={18} color="#94A3B8" />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Right Detailed File Properties Panel */}
                {selectedWbDetails && (
                    <div style={{
                        flex: 0.9,
                        background: '#FFFFFF',
                        borderRadius: '20px',
                        border: '1px solid #E2E8F0',
                        padding: '1.75rem',
                        boxShadow: '0 8px 30px rgba(2, 0, 108, 0.06)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.25rem'
                    }}>
                        <div style={{ borderBottom: '1px solid #EEF2F6', paddingBottom: '1rem' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#02006c', textTransform: 'uppercase' }}>
                                {lang === 'fr' ? "Fiche Métadonnées Fichier" : "File Metadata Sheet"}
                            </div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#02006c', marginTop: '2px' }}>
                                {selectedWbDetails.name}
                            </h2>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.825rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.4rem' }}>
                                <span style={{ color: '#64748B' }}>{lang === 'fr' ? "Nom Fichier :" : "File Name:"}</span>
                                <strong style={{ color: '#0F172A' }}>{selectedWbDetails.name}</strong>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.4rem' }}>
                                <span style={{ color: '#64748B' }}>{lang === 'fr' ? "Taille du Fichier :" : "File Size:"}</span>
                                <strong style={{ color: '#0F172A' }}>{selectedWbDetails.size || '1.2 MB'}</strong>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.4rem' }}>
                                <span style={{ color: '#64748B' }}>{lang === 'fr' ? "Feuilles :" : "Sheets:"}</span>
                                <strong style={{ color: '#0F172A' }}>{selectedWbDetails.sheets?.map(s => s.name).join(', ') || (lang === 'fr' ? 'Feuille 1' : 'Sheet 1')}</strong>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.4rem' }}>
                                <span style={{ color: '#64748B' }}>{lang === 'fr' ? "Statut :" : "Status:"}</span>
                                <span className="badge badge-navy" style={{ fontSize: '0.7rem' }}>
                                    <ShieldCheck size={13} /> {lang === 'fr' ? "Synchro Auto Active" : "Auto Sync Active"}
                                </span>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                            <button
                                onClick={() => setPreviewWb(selectedWbDetails)}
                                style={{
                                    background: '#02006c',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    borderRadius: '14px',
                                    padding: '0.75rem',
                                    fontWeight: 800,
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    boxShadow: '0 4px 15px rgba(2, 0, 108, 0.2)'
                                }}
                            >
                                <Eye size={17} /> {lang === 'fr' ? "Prévisualiser & Générer Word (.docx)" : "Preview & Generate Word (.docx)"}
                            </button>

                            <button
                                onClick={() => onSelectWorkbook(selectedWbDetails)}
                                className="btn-pill-light"
                                style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
                            >
                                <FileSpreadsheet size={17} /> {lang === 'fr' ? "Ouvrir dans l'Éditeur Tableur" : "Open in Spreadsheet Editor"}
                            </button>
                        </div>

                    </div>
                )}

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
