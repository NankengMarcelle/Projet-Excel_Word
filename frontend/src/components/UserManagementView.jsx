import React, { useState } from 'react';
import { Users, UserPlus, ShieldCheck, UserCheck, UserX, Search } from 'lucide-react';

export default function UserManagementView({ lang = 'fr' }) {
    const [users, setUsers] = useState([
        {
            id: "u-1",
            name: "PIERRE MARCELLE NANKENG",
            email: "p.nankeng@antic.cm",
            role: "ANTIC Worker",
            department: lang === 'fr' ? "Division Études & Dev TIC" : "Studies & IT Dev Division",
            status: lang === 'fr' ? "Actif" : "Active"
        },
        {
            id: "u-2",
            name: "NKWAIN REMI KUMA",
            email: "r.nkwain@antic.cm",
            role: "Administrator",
            department: lang === 'fr' ? "Direction Générale / DSI" : "General Directorate / IT Dept",
            status: lang === 'fr' ? "Actif" : "Active"
        },
        {
            id: "u-3",
            name: "Auditeur Sécurité ANTIC",
            email: "audit@antic.cm",
            role: "ANTIC Worker",
            department: lang === 'fr' ? "Direction Sécurité Virtuelle" : "Virtual Security Directorate",
            status: lang === 'fr' ? "Actif" : "Active"
        }
    ]);

    const toggleUserStatus = (userId) => {
        const activeLabel = lang === 'fr' ? 'Actif' : 'Active';
        const inactiveLabel = lang === 'fr' ? 'Inactif' : 'Inactive';
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: u.status === activeLabel ? inactiveLabel : activeLabel } : u));
    };

    return (
        <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                        {lang === 'fr' ? "Administration des Utilisateurs (UC-11 / UC-12)" : "User Management (UC-11 / UC-12)"}
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {lang === 'fr'
                            ? "Gestion des comptes d'accès à la plateforme web de conversion Excel → Word pour l'ANTIC."
                            : "Management of access accounts for the ANTIC Excel → Word web conversion platform."}
                    </p>
                </div>

                <button className="btn-teal">
                    <UserPlus size={16} /> {lang === 'fr' ? "Créer un Compte Utilisateur" : "Create User Account"}
                </button>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '14px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.725rem' }}>
                            <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>{lang === 'fr' ? "Utilisateur" : "User"}</th>
                            <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>{lang === 'fr' ? "Rôle" : "Role"}</th>
                            <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>{lang === 'fr' ? "Département / Division" : "Department / Division"}</th>
                            <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>{lang === 'fr' ? "Statut" : "Status"}</th>
                            <th style={{ textAlign: 'right', padding: '0.75rem 1rem' }}>{lang === 'fr' ? "Action" : "Action"}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => {
                            const isActive = u.status === 'Actif' || u.status === 'Active';
                            return (
                                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                        <div>{u.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{u.email}</div>
                                    </td>
                                    <td style={{ padding: '0.85rem 1rem' }}>
                                        <span className={`badge ${u.role === 'Administrator' ? 'badge-blue' : 'badge-emerald'}`}>
                                            <ShieldCheck size={12} /> {u.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>{u.department}</td>
                                    <td style={{ padding: '0.85rem 1rem' }}>
                                        <span className={`badge ${isActive ? 'badge-emerald' : 'badge-amber'}`}>
                                            {u.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                                        <button
                                            onClick={() => toggleUserStatus(u.id)}
                                            className="btn-secondary"
                                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                                        >
                                            {isActive ? <UserX size={14} color="#EF4444" /> : <UserCheck size={14} color="#10B981" />}
                                            {isActive ? (lang === 'fr' ? ' Désactiver' : ' Deactivate') : (lang === 'fr' ? ' Activer' : ' Activate')}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
