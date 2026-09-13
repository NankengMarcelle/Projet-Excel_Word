import React, { useState } from 'react';
import {
    FileSpreadsheet,
    FileText,
    Upload,
    ArrowRight,
    TrendingUp,
    Shield
} from 'lucide-react';

export default function DashboardView({
    workbooks = [],
    conversions = [],
    onSelectWorkbook,
    onOpenConvertModal,
    onOpenUploadModal,
    currentUser = { name: 'Pierre Marcelle Nankeng' },
    lang = 'fr'
}) {
    const [hoveredFile, setHoveredFile] = useState(null);

    return (
        <div style={{
            padding: '2.5rem 3.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '2.5rem',
            background: '#FDFDFD',
            minHeight: 'calc(100vh - 65px)',
            width: '100%',
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>

            {/* ─── MINIMALIST WELCOME HEADER ─── */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                paddingBottom: '1.5rem',
                borderBottom: '1px solid #F1F5F9'
            }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em', margin: 0 }}>
                        {lang === 'fr' ? `Bonjour, ${currentUser?.name || 'Pierre Marcelle Nankeng'}.` : `Hello, ${currentUser?.name || 'Pierre Marcelle Nankeng'}.`}
                    </h1>
                    <p style={{ fontSize: '0.9rem', color: '#64748B', marginTop: '8px', margin: '8px 0 0 0', fontWeight: 400 }}>
                        {lang === 'fr'
                            ? "Gérez vos classeurs et générez des rapports Word institutionnels en toute simplicité."
                            : "Manage your Excel workbooks and generate institutional Word reports seamlessly."}
                    </p>
                </div>

                <button
                    onClick={onOpenUploadModal}
                    style={{
                        background: 'linear-gradient(135deg, #02006c 0%, #1e3a8a 100%)',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '0.75rem 1.25rem',
                        fontSize: '0.825rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 15px rgba(2, 0, 108, 0.2)',
                        transition: 'all 0.25s ease',
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(2, 0, 108, 0.35)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(2, 0, 108, 0.2)';
                    }}
                >
                    <Upload size={16} /> {lang === 'fr' ? "Nouveau Classeur" : "New Workbook"}
                </button>
            </div>

            {/* ─── AIRY METRICS STRIP ─── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                <div style={{
                    background: '#FFFFFF',
                    padding: '1.5rem 2rem',
                    borderRadius: '16px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02), 0 10px 15px -3px rgba(0, 0, 0, 0.03)',
                    border: '1px solid #F8FAFC',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'box-shadow 0.2s ease'
                }}>
                    <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 500, color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FileSpreadsheet size={16} color="#94A3B8" /> {lang === 'fr' ? "Fichiers Excel" : "Excel Files"}
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A', marginTop: '6px', letterSpacing: '-0.02em', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            {workbooks.length}
                            <span style={{ fontSize: '0.8rem', color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', letterSpacing: '0' }}>
                                <TrendingUp size={14} /> Actifs
                            </span>
                        </div>
                    </div>
                </div>

                <div style={{
                    background: '#FFFFFF',
                    padding: '1.5rem 2rem',
                    borderRadius: '16px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02), 0 10px 15px -3px rgba(0, 0, 0, 0.03)',
                    border: '1px solid #F8FAFC',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'box-shadow 0.2s ease'
                }}>
                    <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 500, color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FileText size={16} color="#94A3B8" /> {lang === 'fr' ? "Rapports Word" : "Word Reports"}
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A', marginTop: '6px', letterSpacing: '-0.02em', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            {conversions.length}
                            <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 500, letterSpacing: '0' }}>
                                Générés
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── SLEEK FILE LIST ─── */}
            <div style={{ marginTop: '0.5rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: '0 0 1.25rem 0' }}>
                    {lang === 'fr' ? "Documents Récents" : "Recent Documents"}
                </h2>

                {workbooks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 0', color: '#94A3B8', fontSize: '0.9rem', background: '#F8FAFC', borderRadius: '16px', border: '1px dashed #E2E8F0' }}>
                        {lang === 'fr' ? "Aucun classeur trouvé. Importez-en un pour commencer." : "No workbooks found. Upload one to start."}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {workbooks.map((wb) => {
                            const isHovered = hoveredFile === wb.id;
                            return (
                                <div
                                    key={wb.id}
                                    onMouseEnter={() => setHoveredFile(wb.id)}
                                    onMouseLeave={() => setHoveredFile(null)}
                                    onClick={() => onSelectWorkbook(wb)}
                                    style={{
                                        padding: '1.1rem 1.5rem',
                                        borderRadius: '12px',
                                        background: isHovered ? '#F8FAFC' : 'transparent',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s ease',
                                        borderBottom: isHovered ? '1px solid transparent' : '1px solid #F1F5F9'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: isHovered ? '#FFFFFF' : '#F1F5F9', boxShadow: isHovered ? '0 2px 5px rgba(0,0,0,0.05)' : 'none', color: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }}>
                                            <FileSpreadsheet size={18} strokeWidth={2.5} />
                                        </div>

                                        <div>
                                            <h3 style={{ fontSize: '0.925rem', fontWeight: 600, color: '#0F172A', margin: 0, letterSpacing: '-0.01em' }}>{wb.name}</h3>
                                            <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '4px', display: 'flex', gap: '12px', fontWeight: 400 }}>
                                                <span>{wb.size || '1.2 MB'}</span>
                                                <span>•</span>
                                                <span>{wb.sheets?.length || 1} {lang === 'fr' ? 'feuilles' : 'sheets'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s ease, transform 0.2s ease', transform: isHovered ? 'translateX(0)' : 'translateX(10px)' }}>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onOpenConvertModal(wb);
                                            }}
                                            style={{
                                                background: '#FFFFFF',
                                                border: '1px solid #E2E8F0',
                                                color: '#0F172A',
                                                padding: '0.45rem 1rem',
                                                borderRadius: '8px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                                            }}
                                            onMouseOver={(e) => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.background = '#F8FAFC'; }}
                                            onMouseOut={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#FFFFFF'; }}
                                        >
                                            <FileText size={14} /> {lang === 'fr' ? "Convertir" : "Convert"}
                                        </button>
                                        <ArrowRight size={16} color="#64748B" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
