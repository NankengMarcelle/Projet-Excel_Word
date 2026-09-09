import React from 'react';
import {
    FileSpreadsheet,
    FileText,
    Upload,
    RefreshCw,
    Plus,
    ShieldCheck,
    ArrowRight
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

    return (
        <div style={{
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.75rem',
            background: '#F8FAFC',
            minHeight: 'calc(100vh - 65px)',
            width: '100%'
        }}>

            {/* ─── INSTITUTIONAL WELCOME BANNER ─── */}
            <div style={{
                background: 'linear-gradient(135deg, #02006c 0%, #01004a 100%)',
                borderRadius: '20px',
                padding: '2rem 2.5rem',
                color: '#FFFFFF',
                boxShadow: '0 8px 25px rgba(2, 0, 108, 0.15)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ zIndex: 1, maxWidth: '650px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.725rem', fontWeight: 800, color: '#FCD116', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                        <ShieldCheck size={16} /> {lang === 'fr' ? "PLATEFORME NATIONALE ANTIC • CONVERTISSEUR EXCEL TO WORD" : "NATIONAL ANTIC PLATFORM • EXCEL TO WORD ENGINE"}
                    </div>

                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.25, letterSpacing: '-0.02em', margin: 0 }}>
                        {lang === 'fr' ? `Bienvenue, ${currentUser?.name || 'Pierre Marcelle Nankeng'}` : `Welcome, ${currentUser?.name || 'Pierre Marcelle Nankeng'}`}
                    </h1>

                    <p style={{ fontSize: '0.875rem', color: '#E0E7FF', marginTop: '6px', lineHeight: 1.5, margin: '6px 0 0 0' }}>
                        {lang === 'fr'
                            ? "Plateforme sécurisée d'édition de classeurs Excel (avec fusions) et de génération de rapports Word institutionnels."
                            : "Secure platform for editing Excel workbooks (with merged cells) and generating official Word reports."}
                    </p>
                </div>

                <div style={{ zIndex: 1 }}>
                    <button
                        onClick={onOpenUploadModal}
                        style={{
                            background: '#FCD116',
                            color: '#02006c',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '0.75rem 1.3rem',
                            fontSize: '0.85rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 12px rgba(252, 209, 22, 0.25)',
                            transition: 'transform 0.15s ease'
                        }}
                    >
                        <Upload size={18} /> {lang === 'fr' ? "Importer un Fichier Excel" : "Upload Excel File"}
                    </button>
                </div>
            </div>

            {/* ─── ESSENTIAL METRICS (2 CARDS) ─── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>

                {/* Metric 1: Total Workbooks */}
                <div style={{
                    background: '#FFFFFF',
                    padding: '1.25rem 1.5rem',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div>
                        <div style={{ fontSize: '0.775rem', fontWeight: 700, color: '#64748B' }}>{lang === 'fr' ? "Classeurs Excel Actifs" : "Active Excel Workbooks"}</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
                            {workbooks.length} <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700, marginLeft: '6px' }}>fichiers</span>
                        </div>
                    </div>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(2, 0, 108, 0.06)', color: '#02006c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileSpreadsheet size={22} />
                    </div>
                </div>

                {/* Metric 2: Converted Word Reports */}
                <div style={{
                    background: '#FFFFFF',
                    padding: '1.25rem 1.5rem',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div>
                        <div style={{ fontSize: '0.775rem', fontWeight: 700, color: '#64748B' }}>{lang === 'fr' ? "Rapports Word Générés" : "Generated Word Reports"}</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
                            {conversions.length} <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700, marginLeft: '6px' }}>100% Conformes</span>
                        </div>
                    </div>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText size={22} />
                    </div>
                </div>

            </div>

            {/* ─── RECENT EXCEL WORKBOOKS SECTION ─── */}
            <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>{lang === 'fr' ? "Classeurs Excel Récents" : "Recent Excel Workbooks"}</h2>
                        <p style={{ fontSize: '0.775rem', color: '#64748B', margin: '3px 0 0 0' }}>
                            {lang === 'fr'
                                ? "Sélectionnez un fichier pour modifier ses feuilles ou générer un rapport Word."
                                : "Select a file to edit worksheets or generate a Word report."}
                        </p>
                    </div>

                    <button
                        onClick={onOpenUploadModal}
                        className="btn-pill-primary"
                        style={{ fontSize: '0.775rem', padding: '0.45rem 0.9rem' }}
                    >
                        <Plus size={15} /> {lang === 'fr' ? "Nouveau Fichier" : "New File"}
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {workbooks.map((wb) => (
                        <div
                            key={wb.id}
                            onClick={() => onSelectWorkbook(wb)}
                            style={{
                                padding: '1rem 1.25rem',
                                borderRadius: '14px',
                                border: '1px solid #F1F5F9',
                                background: '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(2, 0, 108, 0.08)', color: '#02006c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <FileSpreadsheet size={20} />
                                </div>

                                <div>
                                    <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#02006c', margin: 0 }}>{wb.name}</h3>
                                    <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px', display: 'flex', gap: '12px' }}>
                                        <span>Taille : <strong>{wb.size || '1.2 MB'}</strong></span>
                                        <span>• {wb.sheets?.length || 1} {lang === 'fr' ? 'feuilles' : 'sheets'}</span>
                                        <span>• Statut : <strong style={{ color: '#059669' }}>{wb.status || 'Conforme'}</strong></span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onOpenConvertModal(wb);
                                    }}
                                    className="btn-pill-light"
                                    style={{ fontSize: '0.75rem', padding: '0.4rem 0.85rem' }}
                                >
                                    <FileText size={14} /> {lang === 'fr' ? "Convertir en Word" : "Convert to Word"}
                                </button>

                                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#F1F5F9', color: '#02006c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <ArrowRight size={15} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}

