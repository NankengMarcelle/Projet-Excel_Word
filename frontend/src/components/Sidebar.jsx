import React from 'react';
import {
    LayoutDashboard,
    FileSpreadsheet,
    FileText,
    Bell,
    Users,
    FolderOpen,
    UserCheck,
    LogOut,
    Star
} from 'lucide-react';

export default function Sidebar({ activeView, setActiveView, onOpenUploadModal, currentUser, userPhoto, lang = 'fr', setLang, onLogout }) {

    const navItems = [
        { id: 'dashboard', label: lang === 'fr' ? 'Tableau de bord' : 'Dashboard', icon: LayoutDashboard },
        { id: 'editor', label: lang === 'fr' ? 'Éditeur Excel' : 'Excel Editor', icon: FileSpreadsheet },
        { id: 'workbooks', label: lang === 'fr' ? 'Fichiers Excel & Propriétés' : 'Excel Files', icon: FolderOpen },
        { id: 'word_files', label: lang === 'fr' ? 'Fichiers Word (Convertis)' : 'Word Documents', icon: FileText },
        { id: 'notifications', label: lang === 'fr' ? 'Notifications' : 'Notifications', icon: Bell, badge: 3 },
        { id: 'profile', label: lang === 'fr' ? 'Mon Profil Agent' : 'My Profile', icon: UserCheck }
    ];

    return (
        <aside style={{
            width: '260px',
            minWidth: '260px',
            height: '100vh',
            position: 'sticky',
            top: 0,
            background: '#02006c', /* Strict #02006c Deep Imperial Navy */
            color: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '4px 0 25px rgba(2, 0, 108, 0.25)',
            zIndex: 100,
            overflow: 'hidden'
        }}>

            {/* Top Branding Section */}
            <div>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1.5rem 1.2rem 1.2rem 1.2rem',
                    position: 'relative'
                }}>
                    {/* Logo Container */}
                    <div style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '50%',
                        background: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid rgba(255, 255, 255, 0.4)',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                        marginBottom: '0.65rem'
                    }}>
                        <img
                            src="/antic_logo.png"
                            alt="ANTIC Logo"
                            style={{ width: '48px', height: '48px', objectFit: 'contain' }}
                        />
                    </div>

                    {/* ANTIC Name */}
                    <span style={{
                        fontSize: '1.25rem',
                        fontWeight: 800,
                        color: '#FFFFFF',
                        letterSpacing: '0.12em',
                        lineHeight: 1.2
                    }}>
                        ANTIC
                    </span>
                    <span style={{
                        fontSize: '0.675rem',
                        fontWeight: 600,
                        color: '#E0E7FF',
                        letterSpacing: '0.04em',
                        marginTop: '2px',
                        textAlign: 'center'
                    }}>
                        Agence Nationale des TIC (Cameroun)
                    </span>
                </div>

                {/* ─── FULL-WIDTH CAMEROON FLAG TRICOLOR RIBBON WITH CENTRAL STAR ─── */}
                <div style={{
                    width: '100%',
                    height: '6px',
                    display: 'flex',
                    position: 'relative',
                    margin: '0.2rem 0 1.2rem 0',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.25)'
                }}>
                    {/* Green Band */}
                    <div style={{ flex: 1, background: '#007A3D' }} />

                    {/* Red Band with Center Star */}
                    <div style={{
                        flex: 1,
                        background: '#CE1126',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Star
                            size={8}
                            color="#FCD116"
                            fill="#FCD116"
                            style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)' }}
                        />
                    </div>

                    {/* Yellow Band */}
                    <div style={{ flex: 1, background: '#FCD116' }} />
                </div>

                {/* ─── FIXED ALIGNMENT NAVIGATION TABS LIST ─── */}
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', padding: '0 1rem' }}>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeView === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveView(item.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    width: '100%',
                                    padding: '0.75rem 0.9rem',
                                    borderRadius: '16px',
                                    border: 'none',
                                    background: isActive ? '#FFFFFF' : 'transparent',
                                    color: isActive ? '#02006c' : '#E0E7FF',
                                    fontWeight: isActive ? 800 : 600,
                                    fontSize: '0.825rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    textAlign: 'left',
                                    boxShadow: isActive ? '0 4px 15px rgba(0, 0, 0, 0.2)' : 'none'
                                }}
                            >
                                {/* FIXED ICON & TEXT ALIGNMENT GRID */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, minWidth: 0 }}>
                                    <div style={{ minWidth: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Icon size={18} color={isActive ? '#02006c' : '#E0E7FF'} />
                                    </div>
                                    <span style={{ textAlign: 'left', lineHeight: 1.2, wordBreak: 'break-word' }}>
                                        {item.label}
                                    </span>
                                </div>

                                {item.badge && (
                                    <span style={{
                                        background: isActive ? '#02006c' : 'rgba(255, 255, 255, 0.25)',
                                        color: '#FFFFFF',
                                        fontSize: '0.675rem',
                                        fontWeight: 800,
                                        padding: '2px 7px',
                                        borderRadius: '10px',
                                        marginLeft: '4px',
                                        flexShrink: 0
                                    }}>
                                        {item.badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom Section with Logout Only */}
            <div style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.15)',
                padding: '1.2rem'
            }}>
                {/* Logout Button */}
                <button
                    onClick={onLogout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.6rem',
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '14px',
                        border: 'none',
                        background: 'rgba(255, 255, 255, 0.15)',
                        color: '#FFFFFF',
                        fontSize: '0.825rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'background 0.2s ease'
                    }}
                >
                    <LogOut size={16} />
                    <span>{lang === 'fr' ? 'Déconnexion' : 'Log Out'}</span>
                </button>
            </div>

        </aside>
    );
}
