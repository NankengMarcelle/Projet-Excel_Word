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
    onCreateNewWorkbook,
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
            background: 'radial-gradient(circle at 10% 10%, rgba(2, 0, 108, 0.02) 0%, transparent 40%), radial-gradient(circle at 90% 90%, rgba(16, 185, 129, 0.02) 0%, transparent 40%), #FAFAFC',
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
                    <h1 style={{ fontSize: '2.25rem', fontWeight: 800, background: 'linear-gradient(90deg, #0F172A 0%, #02006c 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.03em', margin: 0 }}>
                        {lang === 'fr' ? `Bonjour, ${currentUser?.name || 'Pierre Marcelle Nankeng'}.` : `Hello, ${currentUser?.name || 'Pierre Marcelle Nankeng'}.`}
                    </h1>
                    <p style={{ fontSize: '0.95rem', color: '#64748B', marginTop: '10px', margin: '10px 0 0 0', fontWeight: 400 }}>
                        {lang === 'fr'
                            ? "Gérez vos classeurs et générez des rapports Word institutionnels en toute simplicité."
                            : "Manage your Excel workbooks and generate institutional Word reports seamlessly."}
                    </p>
                </div>

                <button
                    onClick={onCreateNewWorkbook || onOpenUploadModal}
                    style={{
                        background: 'linear-gradient(135deg, #02006c 0%, #1e3a8a 100%)',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '0.85rem 1.35rem',
                        fontSize: '0.825rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 15px rgba(2, 0, 108, 0.2)',
                        transition: 'all 0.25s ease', // Enhanced smooth transition
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(2, 0, 108, 0.35)'; // Added glowing hover effect
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
                <div
                    style={{
                        background: '#FFFFFF',
                        padding: '1.5rem 2rem',
                        borderRadius: '20px',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02), 0 10px 20px -5px rgba(0, 0, 0, 0.03)',
                        border: '1px solid rgba(241, 245, 249, 0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.3s ease',
                        cursor: 'default'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <div>
                        <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#64748B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ padding: '6px', background: 'rgba(2, 0, 108, 0.08)', borderRadius: '8px', display: 'flex' }}>
                                <FileSpreadsheet size={16} color="#02006c" />
                            </div>
                            {lang === 'fr' ? "Fichiers Excel" : "Excel Files"}
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A', marginTop: '10px', letterSpacing: '-0.02em', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            {workbooks.length}
                            <span style={{ fontSize: '0.8rem', color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', letterSpacing: '0' }}>
                                <TrendingUp size={14} /> Actifs
                            </span>
                        </div>
                    </div>
                </div>

                <div
                    style={{
                        background: '#FFFFFF',
                        padding: '1.5rem 2rem',
                        borderRadius: '20px',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02), 0 10px 20px -5px rgba(0, 0, 0, 0.03)',
                        border: '1px solid rgba(241, 245, 249, 0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.3s ease',
                        cursor: 'default'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <div>
                        <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#64748B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ padding: '6px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', display: 'flex' }}>
                                <FileText size={16} color="#10B981" />
                            </div>
                            {lang === 'fr' ? "Rapports Word" : "Word Reports"}
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A', marginTop: '10px', letterSpacing: '-0.02em', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
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
                <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', margin: '0 0 1.25rem 0' }}>
                    {lang === 'fr' ? "Documents Récents" : "Recent Documents"}
                </h2>

                {workbooks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 0', color: '#94A3B8', fontSize: '0.9rem', background: '#F8FAFC', borderRadius: '16px', border: '1px dashed #E2E8F0' }}>
                        {lang === 'fr' ? "Aucun classeur trouvé. Importez-en un pour commencer." : "No workbooks found. Upload one to start."}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {workbooks.map((wb) => {
                            const isHovered = hoveredFile === wb.id;
                            return (
                                <div
                                    key={wb.id}
                                    onMouseEnter={() => setHoveredFile(wb.id)}
                                    onMouseLeave={() => setHoveredFile(null)}
                                    onClick={() => onSelectWorkbook(wb)}
                                    style={{
                                        padding: '1.15rem 1.5rem',
                                        borderRadius: '16px',
                                        background: isHovered ? '#FFFFFF' : 'transparent',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        boxShadow: isHovered ? '0 4px 15px rgba(0,0,0,0.04)' : 'none',
                                        border: isHovered ? '1px solid #E2E8F0' : '1px solid transparent',
                                        borderBottom: isHovered ? '1px solid transparent' : '1px solid #F1F5F9',
                                        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                        <div style={{
                                            width: '42px',
                                            height: '42px',
                                            borderRadius: '12px',
                                            background: isHovered ? 'rgba(2, 0, 108, 0.05)' : '#F1F5F9',
                                            color: isHovered ? '#02006c' : '#64748B',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.3s ease'
                                        }}>
                                            <FileSpreadsheet size={20} strokeWidth={2} />
                                        </div>

                                        <div>
                                            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0F172A', margin: 0, letterSpacing: '-0.01em' }}>{wb.name}</h3>
                                            <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '5px', display: 'flex', gap: '12px', fontWeight: 400 }}>
                                                <span>{wb.size || '1.2 MB'}</span>
                                                <span>•</span>
                                                <span>{wb.sheets?.length || 1} {lang === 'fr' ? 'feuilles' : 'sheets'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', opacity: isHovered ? 1 : 0, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', transform: isHovered ? 'translateX(0)' : 'translateX(10px)' }}>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onOpenConvertModal(wb);
                                            }}
                                            style={{
                                                background: '#FFFFFF',
                                                border: '1px solid #E2E8F0',
                                                color: '#0F172A',
                                                padding: '0.5rem 1.15rem',
                                                borderRadius: '10px',
                                                fontSize: '0.775rem',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                            }}
                                            onMouseOver={(e) => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.transform = 'scale(1.02)' }}
                                            onMouseOut={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.transform = 'scale(1)' }}
                                        >
                                            <FileText size={14} /> {lang === 'fr' ? "Convertir" : "Convert"}
                                        </button>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <ArrowRight size={16} color="#0F172A" />
                                        </div>
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
