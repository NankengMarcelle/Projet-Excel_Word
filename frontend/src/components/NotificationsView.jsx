import React, { useState } from 'react';
import { Bell, Check, Trash2, ArrowUpRight, CheckCheck } from 'lucide-react';

export default function NotificationsView({ onSelectWorkbook, lang = 'fr' }) {
    const [filter, setFilter] = useState('all'); // 'all' or 'unread'

    const [notifications, setNotifications] = useState([
        {
            id: 'n1',
            title: lang === 'fr' ? 'Export Word disponible' : 'Word Export Available',
            message: lang === 'fr'
                ? 'Le document "Rapport_Trimestriel_Activites_2026.docx" a été généré avec succès.'
                : 'Document "Rapport_Trimestriel_Activites_2026.docx" was generated successfully.',
            time: lang === 'fr' ? 'Il y a 10 min' : '10 min ago',
            unread: true,
            actionText: lang === 'fr' ? 'Voir le document' : 'View document'
        },
        {
            id: 'n2',
            title: lang === 'fr' ? 'Synchronisation terminée' : 'Synchronization Complete',
            message: lang === 'fr'
                ? 'Les modifications sur "Budget_Previsionnel_2026_V3.xlsx" ont été enregistrées.'
                : 'Changes to "Budget_Previsionnel_2026_V3.xlsx" have been saved.',
            time: lang === 'fr' ? 'Il y a 45 min' : '45 min ago',
            unread: true,
            actionText: lang === 'fr' ? 'Ouvrir le classeur' : 'Open workbook'
        },
        {
            id: 'n3',
            title: lang === 'fr' ? 'Nouveau message de Joseph Mbarga' : 'New message from Joseph Mbarga',
            message: lang === 'fr'
                ? 'Agent Joseph Mbarga a rejoint la session de co-édition.'
                : 'Agent Joseph Mbarga joined the co-editing session.',
            time: lang === 'fr' ? 'Il y a 2h' : '2h ago',
            unread: true,
            actionText: lang === 'fr' ? 'Rejoindre' : 'Join'
        },
        {
            id: 'n4',
            title: lang === 'fr' ? 'Connexion de sécurité validée' : 'Security Login Verified',
            message: lang === 'fr'
                ? 'Session agent authentifiée pour Pierre Marcelle Nankeng.'
                : 'Agent session authenticated for Pierre Marcelle Nankeng.',
            time: lang === 'fr' ? 'Hier à 16:30' : 'Yesterday at 16:30',
            unread: false,
            actionText: lang === 'fr' ? 'Détails' : 'Details'
        },
        {
            id: 'n5',
            title: lang === 'fr' ? 'Archivage automatique' : 'Automatic Archiving',
            message: lang === 'fr'
                ? '3 rapports Word ont été archivés dans le sous-dossier institutionnel.'
                : '3 Word reports archived in the institutional subfolder.',
            time: '05/09/2026',
            unread: false,
            actionText: lang === 'fr' ? 'Consulter' : 'View'
        }
    ]);

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return n.unread;
        return true;
    });

    const unreadCount = notifications.filter(n => n.unread).length;

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    };

    const toggleRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: !n.unread } : n));
    };

    const deleteNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <div style={{
            padding: '2rem',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
        }}>

            {/* Header Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A' }}>
                        Notifications
                    </h1>
                    <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '2px' }}>
                        {lang === 'fr' ? "Vos activités récentes et alertes du système." : "Your recent activities and system alerts."}
                    </p>
                </div>

                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#02006c',
                            fontWeight: 700,
                            fontSize: '0.825rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <CheckCheck size={16} />
                        <span>{lang === 'fr' ? "Tout marquer comme lu" : "Mark all as read"}</span>
                    </button>
                )}
            </div>

            {/* Simple Filter Pills */}
            <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
                <button
                    onClick={() => setFilter('all')}
                    style={{
                        padding: '0.45rem 1rem',
                        borderRadius: '20px',
                        border: 'none',
                        background: filter === 'all' ? '#02006c' : 'transparent',
                        color: filter === 'all' ? '#FFFFFF' : '#64748B',
                        fontWeight: filter === 'all' ? 700 : 600,
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                    }}
                >
                    {lang === 'fr' ? 'Toutes' : 'All'} ({notifications.length})
                </button>

                <button
                    onClick={() => setFilter('unread')}
                    style={{
                        padding: '0.45rem 1rem',
                        borderRadius: '20px',
                        border: 'none',
                        background: filter === 'unread' ? '#02006c' : 'transparent',
                        color: filter === 'unread' ? '#FFFFFF' : '#64748B',
                        fontWeight: filter === 'unread' ? 700 : 600,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                >
                    <span>{lang === 'fr' ? 'Non lues' : 'Unread'}</span>
                    {unreadCount > 0 && (
                        <span style={{
                            background: filter === 'unread' ? '#FFFFFF' : '#02006c',
                            color: filter === 'unread' ? '#02006c' : '#FFFFFF',
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            padding: '1px 6px',
                            borderRadius: '10px'
                        }}>
                            {unreadCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Direct Notification List on Page */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {filteredNotifications.length === 0 ? (
                    <div style={{ padding: '3rem 2rem', textAlign: 'center', color: '#94A3B8' }}>
                        <Bell size={36} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                        <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{lang === 'fr' ? "Aucune notification pour le moment" : "No notifications at the moment"}</p>
                    </div>
                ) : (
                    filteredNotifications.map((notif) => (
                        <div
                            key={notif.id}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'space-between',
                                padding: '1rem 0',
                                borderBottom: '1px solid #E2E8F0',
                                background: 'transparent'
                            }}
                        >
                            {/* Left Content Area */}
                            <div style={{ display: 'flex', gap: '1rem', flex: 1, paddingRight: '1rem' }}>

                                {/* Unread Status Dot */}
                                <div style={{ marginTop: '6px' }}>
                                    <div style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        background: notif.unread ? '#02006c' : '#CBD5E1'
                                    }} />
                                </div>

                                {/* Text Details */}
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <h3 style={{ fontSize: '0.925rem', fontWeight: notif.unread ? 800 : 700, color: '#0F172A' }}>
                                            {notif.title}
                                        </h3>
                                        <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>• {notif.time}</span>
                                    </div>

                                    <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '3px', lineHeight: 1.5 }}>
                                        {notif.message}
                                    </p>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '8px' }}>
                                        <button
                                            onClick={() => alert(`Action "${notif.actionText}"`)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#02006c',
                                                fontSize: '0.775rem',
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                padding: 0
                                            }}
                                        >
                                            <span>{notif.actionText}</span>
                                            <ArrowUpRight size={14} />
                                        </button>

                                        <button
                                            onClick={() => toggleRead(notif.id)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#94A3B8',
                                                fontSize: '0.75rem',
                                                cursor: 'pointer',
                                                padding: 0
                                            }}
                                        >
                                            {notif.unread
                                                ? (lang === 'fr' ? 'Marquer comme lu' : 'Mark as read')
                                                : (lang === 'fr' ? 'Marquer comme non lu' : 'Mark as unread')}
                                        </button>
                                    </div>
                                </div>

                            </div>

                            {/* Delete Icon Button */}
                            <button
                                onClick={() => deleteNotification(notif.id)}
                                title={lang === 'fr' ? "Supprimer" : "Delete"}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#CBD5E1',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    borderRadius: '6px',
                                    transition: 'color 0.15s ease'
                                }}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))
                )}
            </div>

        </div>
    );
}
