import React from 'react';
import {
    LayoutDashboard,
    FileSpreadsheet,
    FolderOpen,
    FileText,
    UserCheck
} from 'lucide-react';

export default function BottomNavBar({ activeView, setActiveView, lang = 'fr' }) {
    const navItems = [
        { id: 'dashboard', label: lang === 'fr' ? 'Accueil' : 'Home', icon: LayoutDashboard },
        { id: 'editor', label: lang === 'fr' ? 'Excel' : 'Excel', icon: FileSpreadsheet },
        { id: 'workbooks', label: lang === 'fr' ? 'Fichiers' : 'Files', icon: FolderOpen },
        { id: 'word_files', label: lang === 'fr' ? 'Word' : 'Word', icon: FileText },
        { id: 'profile', label: lang === 'fr' ? 'Profil' : 'Profile', icon: UserCheck }
    ];

    return (
        <nav
            className="mobile-bottom-nav"
            style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                height: '62px',
                background: '#0a034a',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'none', // Shown only on mobile via CSS
                alignItems: 'center',
                justifyContent: 'space-around',
                zIndex: 95,
                boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.25)',
                backdropFilter: 'blur(10px)'
            }}
        >
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                    <button
                        key={item.id}
                        onClick={() => setActiveView(item.id)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: isActive ? '#10B981' : 'rgba(255, 255, 255, 0.65)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '3px',
                            cursor: 'pointer',
                            fontSize: '0.675rem',
                            fontWeight: isActive ? 700 : 500,
                            padding: '4px 8px',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <div style={{
                            padding: '3px 10px',
                            borderRadius: '12px',
                            background: isActive ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                        </div>
                        <span>{item.label}</span>
                    </button>
                );
            })}
        </nav>
    );
}
