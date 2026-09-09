import React, { useState } from 'react';
import { GitFork, RefreshCw, CheckCircle2, ArrowRight, Table, Layers, Plus } from 'lucide-react';

export default function SheetRelationsView() {
    const [syncingId, setSyncingId] = useState(null);
    const [relationships, setRelationships] = useState([
        {
            id: "rel-01",
            parentSheet: "Synthese_Generale",
            parentWorkbook: "Rapport_Trimestriel_Activites_2026.xlsx",
            childSheet: "Detail_Etudes_TIC",
            childWorkbook: "Rapport_Trimestriel_Activites_2026.xlsx",
            mappingRule: "Aggregation Somme & Filtrage par Division",
            lastSync: "2026-08-30 14:22",
            status: "Actif & Synchronisé"
        },
        {
            id: "rel-02",
            parentSheet: "Portfolio_General",
            parentWorkbook: "Suivi_Projets_Souverains_2026.xlsx",
            childSheet: "Projet_Excel_Word_SousFeuille",
            childWorkbook: "Suivi_Projets_Souverains_2026.xlsx",
            mappingRule: "Extraction Lignes Statistiques PRJ-01",
            lastSync: "2026-08-25 16:40",
            status: "Actif"
        }
    ]);

    const handleSync = (relId) => {
        setSyncingId(relId);
        setTimeout(() => {
            setSyncingId(null);
            setRelationships(prev => prev.map(r => r.id === relId ? { ...r, lastSync: new Date().toLocaleString(), status: "Actif & Synchronisé" } : r));
        }, 1500);
    };

    return (
        <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                        Gestion des Relations Feuilles Parente / Enfant
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Configurez et synchronisez la mise à jour automatique des données entre les feuilles sources et dérivées.
                    </p>
                </div>

                <button className="btn-teal">
                    <Plus size={16} /> Créer une Relation Parente-Enfant
                </button>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {relationships.map((rel) => (
                        <div
                            key={rel.id}
                            style={{
                                padding: '1.25rem',
                                borderRadius: '12px',
                                background: 'var(--bg-primary)',
                                border: '1px solid var(--border-color)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1 }}>
                                {/* Parent Sheet Card */}
                                <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(37,74,123,0.3)', border: '1px solid var(--color-blue-500)', minWidth: '220px' }}>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--color-blue-300)', textTransform: 'uppercase', fontWeight: 700 }}>Feuille Parente</div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFF' }}>{rel.parentSheet}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{rel.parentWorkbook}</div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--color-teal-400)' }}>
                                    <ArrowRight size={22} />
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Rule: {rel.mappingRule}</span>
                                </div>

                                {/* Child Sheet Card */}
                                <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(49,151,149,0.15)', border: '1px solid var(--color-teal-500)', minWidth: '220px' }}>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--color-teal-400)', textTransform: 'uppercase', fontWeight: 700 }}>Feuille Enfant</div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFF' }}>{rel.childSheet}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{rel.childWorkbook}</div>
                                </div>
                            </div>

                            {/* Status and Action */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1.5rem' }}>
                                <div style={{ textAlign: 'right' }}>
                                    <span className="badge badge-emerald">{rel.status}</span>
                                    <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '4px' }}>Dernière sync: {rel.lastSync}</div>
                                </div>

                                <button
                                    onClick={() => handleSync(rel.id)}
                                    disabled={syncingId === rel.id}
                                    className="btn-secondary"
                                    style={{ padding: '0.5rem 0.85rem' }}
                                >
                                    <RefreshCw size={14} className={syncingId === rel.id ? 'glow-effect' : ''} />
                                    {syncingId === rel.id ? 'Synchronisation...' : 'Synchroniser'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
