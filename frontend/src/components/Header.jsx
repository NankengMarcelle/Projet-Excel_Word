import React from 'react';
import { Search, Bell, ShieldCheck } from 'lucide-react';

export default function Header({ currentUser, userPhoto, activeView, setActiveView, lang, setLang, onOpenUserProfile }) {
    const userName = currentUser?.name || 'PIERRE MARCELLE NANKENG';

    return (
        <header style={{
            height: '65px',
            background: '#FFFFFF',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
            position: 'sticky',
            top: 0,
            zIndex: 90,
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
        }}>

            {/* Left Search Pill Bar */}
            <div style={{ position: 'relative', width: '380px' }}>
                <Search size={16} color="#0a034a" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                    type="text"
                    placeholder={lang === 'fr' ? "Rechercher un classeur Excel, rapport Word..." : "Search workbook..."}
                    style={{
                        width: '100%',
                        padding: '0.55rem 1rem 0.55rem 2.6rem',
                        borderRadius: '30px',
                        border: '1px solid #CBD5E1',
                        background: '#F1F5F9',
                        fontSize: '0.825rem',
                        outline: 'none',
                        color: '#0a034a',
                        fontWeight: 600
                    }}
                />
            </div>

            {/* Right Controls: Language Selector, Notifications & User Profile Pill Container */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>

                {/* Language Selector (FR / EN) Pill */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#F1F5F9',
                    borderRadius: '20px',
                    padding: '2px',
                    border: '1px solid #CBD5E1'
                }}>
                    <button
                        onClick={() => setLang('fr')}
                        style={{
                            padding: '0.25rem 0.65rem',
                            borderRadius: '16px',
                            border: 'none',
                            background: lang === 'fr' ? '#0a034a' : 'transparent',
                            color: lang === 'fr' ? '#FFFFFF' : '#0a034a',
                            fontWeight: 800,
                            fontSize: '0.725rem',
                            cursor: 'pointer'
                        }}
                    >
                        FR
                    </button>
                    <button
                        onClick={() => setLang('en')}
                        style={{
                            padding: '0.25rem 0.65rem',
                            borderRadius: '16px',
                            border: 'none',
                            background: lang === 'en' ? '#0a034a' : 'transparent',
                            color: lang === 'en' ? '#FFFFFF' : '#0a034a',
                            fontWeight: 800,
                            fontSize: '0.725rem',
                            cursor: 'pointer'
                        }}
                    >
                        EN
                    </button>
                </div>

                {/* Notifications Icon Button */}
                <button
                    onClick={() => setActiveView('notifications')}
                    style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        border: '1px solid #CBD5E1',
                        background: activeView === 'notifications' ? '#0a034a' : '#F1F5F9',
                        color: activeView === 'notifications' ? '#FFFFFF' : '#0a034a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        position: 'relative'
                    }}
                >
                    <Bell size={18} color={activeView === 'notifications' ? '#FFFFFF' : '#0a034a'} />
                    <span style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#0a034a',
                        border: '1.5px solid #FFF'
                    }} />
                </button>

                {/* ─── USER PROFILE PILL CONTAINER WITH PERSISTENT PHOTO ─── */}
                <div
                    onClick={() => onOpenUserProfile ? onOpenUserProfile() : setActiveView('profile')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.35rem 0.9rem 0.35rem 0.4rem',
                        borderRadius: '30px',
                        background: '#F1F5F9',
                        border: '1px solid #CBD5E1',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#0a034a',
                        color: '#FFFFFF',
                        fontWeight: 800,
                        fontSize: '0.775rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                    }}>
                        {userPhoto ? (
                            <img src={userPhoto} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            currentUser?.avatar || 'PN'
                        )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0a034a', lineHeight: 1.1 }}>
                            {userName}
                        </span>
                        <span style={{ fontSize: '0.65rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <ShieldCheck size={11} color="#0a034a" /> ANTIC Worker
                        </span>
                    </div>
                </div>

            </div>

        </header>
    );
}
