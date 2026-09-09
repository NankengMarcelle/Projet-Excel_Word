import React from 'react';
import { ShieldCheck, User, Mail, Building, Key, Award, Calendar, Clock, LogOut, X, CheckCircle2, Lock } from 'lucide-react';

export default function UserProfileModal({ currentUser, onClose, onLogout, lang = 'fr' }) {
    const isFr = lang === 'fr';

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 14, 27, 0.75)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1.5rem',
            animation: 'fadeIn 0.2s ease-out'
        }}>
            <div style={{
                background: '#FFFFFF',
                width: '100%',
                maxWidth: '540px',
                borderRadius: '24px',
                boxShadow: '0 25px 60px rgba(10, 25, 47, 0.3)',
                overflow: 'hidden',
                border: '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Header Banner */}
                <div style={{
                    background: 'linear-gradient(135deg, #0A192F 0%, #1E3A5F 100%)',
                    padding: '1.75rem 1.75rem 3.5rem 1.75rem',
                    color: '#FFFFFF',
                    position: 'relative'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            right: '1.25rem',
                            top: '1.25rem',
                            background: 'rgba(255, 255, 255, 0.15)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            color: '#FFFFFF',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <X size={18} />
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 700, color: '#22C55E' }}>
                        <ShieldCheck size={16} />
                        <span>PROFIL DE L'AGENT INSTITUTIONNEL ANTIC</span>
                    </div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '4px' }}>
                        Fiche d'Accréditation Utilisateur
                    </h2>
                </div>

                {/* Floating Avatar */}
                <div style={{
                    padding: '0 1.75rem',
                    marginTop: '-2.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    position: 'relative',
                    zIndex: 2
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #0A192F, #16A34A)',
                        border: '4px solid #FFFFFF',
                        color: '#FFFFFF',
                        fontWeight: 800,
                        fontSize: '1.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 20px rgba(10,25,47,0.2)'
                    }}>
                        {currentUser?.avatar || 'PN'}
                    </div>

                    <span className="badge badge-emerald" style={{ padding: '0.4rem 0.9rem', fontSize: '0.775rem' }}>
                        <CheckCircle2 size={14} /> Session Sécurisée AES-256
                    </span>
                </div>

                {/* User Details Form */}
                <div style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>
                            {currentUser?.name || 'PIERRE MARCELLE NANKENG'}
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>
                            {currentUser?.role || 'ANTIC Worker / Administrateur Système'}
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', background: '#F8FAFC', padding: '1.2rem', borderRadius: '16px', border: '1px solid #EEF2F6' }}>
                        <div>
                            <div style={{ fontSize: '0.725rem', color: '#94A3B8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Mail size={13} color="#0A192F" /> Email Professionnel
                            </div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                                p.nankeng@antic.cm
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: '0.725rem', color: '#94A3B8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Building size={13} color="#0A192F" /> Département
                            </div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                                Direction Générale / Sécurité
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: '0.725rem', color: '#94A3B8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Key size={13} color="#0A192F" /> Matricule Agent
                            </div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                                ANT-2026-8894
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: '0.725rem', color: '#94A3B8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Award size={13} color="#0A192F" /> Clé PKI S/MIME
                            </div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#15803D', marginTop: '2px' }}>
                                Valide (Certificat HW)
                            </div>
                        </div>
                    </div>

                    {/* Permissions & Roles */}
                    <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>
                            Habilitations & Droits d'Accès
                        </div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {['Édition Excel', 'Conversion Word', 'Validation Budgétaire', 'Gestion Utilisateurs', 'Supervision Synchro'].map((perm, i) => (
                                <span key={i} style={{ background: '#E0E7FF', color: '#1E1B4B', fontSize: '0.725rem', fontWeight: 700, padding: '4px 10px', borderRadius: '12px' }}>
                                    ✓ {perm}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #F1F5F9', marginTop: '0.5rem' }}>
                        <button
                            onClick={onClose}
                            className="btn-pill-light"
                        >
                            Fermer
                        </button>

                        {onLogout && (
                            <button
                                onClick={onLogout}
                                style={{
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    color: '#EF4444',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    borderRadius: '12px',
                                    padding: '0.55rem 1.1rem',
                                    fontSize: '0.825rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <LogOut size={15} /> Déconnexion
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
