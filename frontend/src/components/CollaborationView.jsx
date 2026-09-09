import React, { useState } from 'react';
import { Users, ShieldCheck, Lock, Radio, MessageSquare, Send, CheckCircle2, FileSpreadsheet, Eye, UserPlus, X, Filter, ChevronDown, Sparkles } from 'lucide-react';

export default function CollaborationView({ currentUser, workbooks = [], onSelectWorkbook, showToast, lang = 'fr' }) {
    const [selectedFileFilter, setSelectedFileFilter] = useState('ALL');
    const [inviteModalOpen, setInviteModalOpen] = useState(false);
    const [chatInput, setChatInput] = useState('');

    // Default workbooks if empty
    const availableWorkbooks = workbooks.length > 0 ? workbooks : [
        { id: 'wb-1', name: 'Budget_Previsionnel_2026.xlsx' },
        { id: 'wb-2', name: 'Suivi_Execution_Projets_SI.xlsx' },
        { id: 'wb-3', name: 'Rapport_Trimestriel_Activites_2026.xlsx' }
    ];

    // Form state for inviting an agent on a specific file
    const [inviteForm, setInviteForm] = useState({
        targetFile: availableWorkbooks[0]?.name || 'Budget_Previsionnel_2026.xlsx',
        agentName: '',
        agentEmail: '',
        accessLevel: lang === 'fr' ? 'Édition en temps réel' : 'Real-time Editing',
        directive: ''
    });

    const [activeUsers, setActiveUsers] = useState([
        {
            id: 'u-1',
            name: 'Pierre Marcelle Nankeng',
            email: 'p.nankeng@antic.cm',
            role: lang === 'fr' ? 'Administrateur' : 'Administrator',
            file: 'Budget_Previsionnel_2026.xlsx',
            sheet: lang === 'fr' ? 'Feuille1' : 'Sheet1',
            cell: 'C4',
            access: lang === 'fr' ? 'Édition en temps réel' : 'Real-time Editing',
            status: lang === 'fr' ? 'Édition en cours' : 'Editing in progress',
            color: '#1E3A8A'
        },
        {
            id: 'u-2',
            name: 'Dr. Audrey F. (Audit)',
            email: 'audrey.audit@antic.cm',
            role: lang === 'fr' ? 'Inspectrice ANTIC' : 'ANTIC Inspector',
            file: 'Budget_Previsionnel_2026.xlsx',
            sheet: lang === 'fr' ? 'Feuille1' : 'Sheet1',
            cell: 'D4',
            access: lang === 'fr' ? 'Lecture seule & Audit' : 'Read-only & Audit',
            status: lang === 'fr' ? 'Consultation' : 'Viewing',
            color: '#10B981'
        },
        {
            id: 'u-3',
            name: 'Ing. Emmanuel T.',
            email: 'e.tatou@antic.cm',
            role: lang === 'fr' ? 'Superviseur Réseau' : 'Network Supervisor',
            file: 'Suivi_Execution_Projets_SI.xlsx',
            sheet: lang === 'fr' ? 'Jalons 2026' : 'Milestones 2026',
            cell: 'B12',
            access: lang === 'fr' ? 'Édition en temps réel' : 'Real-time Editing',
            status: lang === 'fr' ? 'Édition en cours' : 'Editing in progress',
            color: '#D97706'
        }
    ]);

    const [messages, setMessages] = useState([
        {
            id: 1,
            user: 'Pierre Marcelle Nankeng',
            file: 'Budget_Previsionnel_2026.xlsx',
            text: lang === 'fr'
                ? "Bonjour l'équipe, j'ai mis à jour les prévisions budgétaires sur la ligne PKI."
                : "Hello team, I updated the budget forecast on the PKI line.",
            time: '09:12'
        },
        {
            id: 2,
            user: 'Dr. Audrey F.',
            file: 'Budget_Previsionnel_2026.xlsx',
            text: lang === 'fr'
                ? "Parfait, les verrous sur la feuille parente sont bien actifs pour éviter les conflits."
                : "Great, parent sheet cell locks are active to prevent conflicts.",
            time: '09:15'
        }
    ]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        setMessages(prev => [
            ...prev,
            {
                id: Date.now(),
                user: currentUser?.name || 'Pierre Marcelle Nankeng',
                file: selectedFileFilter === 'ALL' ? (availableWorkbooks[0]?.name || 'Général') : selectedFileFilter,
                text: chatInput,
                time: new Date().toLocaleTimeString(lang === 'fr' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' })
            }
        ]);
        setChatInput('');
    };

    const handleSendInvitation = (e) => {
        e.preventDefault();
        if (!inviteForm.agentName.trim()) return;

        const newInvitedUser = {
            id: `u-${Date.now()}`,
            name: inviteForm.agentName.trim(),
            email: inviteForm.agentEmail.trim() || `${inviteForm.agentName.toLowerCase().replace(/\s+/g, '.')}@antic.cm`,
            role: lang === 'fr' ? 'Agent Accrédité' : 'Accredited Agent',
            file: inviteForm.targetFile,
            sheet: lang === 'fr' ? 'Feuille1' : 'Sheet1',
            cell: 'A1',
            access: inviteForm.accessLevel,
            status: lang === 'fr' ? 'Invité (En attente)' : 'Invited (Pending)',
            color: '#10B981'
        };

        setActiveUsers(prev => [newInvitedUser, ...prev]);

        // Post confirmation message in chat
        setMessages(prev => [
            ...prev,
            {
                id: Date.now(),
                user: 'Système ANTIC Collaboration',
                file: inviteForm.targetFile,
                text: lang === 'fr'
                    ? `📢 L'agent ${inviteForm.agentName} a été invité(e) à collaborer sur le fichier "${inviteForm.targetFile}" (${inviteForm.accessLevel}).`
                    : `📢 Agent ${inviteForm.agentName} has been invited to collaborate on "${inviteForm.targetFile}" (${inviteForm.accessLevel}).`,
                time: new Date().toLocaleTimeString(lang === 'fr' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' })
            }
        ]);

        if (showToast) {
            showToast(
                lang === 'fr'
                    ? `Invitation envoyée avec succès à ${inviteForm.agentName} pour le fichier ${inviteForm.targetFile} !`
                    : `Invitation successfully sent to ${inviteForm.agentName} for file ${inviteForm.targetFile}!`,
                'success'
            );
        }

        setInviteModalOpen(false);
        setInviteForm({
            targetFile: availableWorkbooks[0]?.name || 'Budget_Previsionnel_2026.xlsx',
            agentName: '',
            agentEmail: '',
            accessLevel: lang === 'fr' ? 'Édition en temps réel' : 'Real-time Editing',
            directive: ''
        });
    };

    const filteredUsers = selectedFileFilter === 'ALL'
        ? activeUsers
        : activeUsers.filter(u => u.file === selectedFileFilter);

    return (
        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#F8FAFC', minHeight: 'calc(100vh - 65px)', width: '100%' }}>

            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #E2E8F0',
                paddingBottom: '1.25rem'
            }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 800, color: '#02006c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <Radio size={16} color="#02006c" /> {lang === 'fr' ? "Session Multi-Utilisateurs Temps Réel" : "Real-Time Multi-User Session"}
                    </div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                        {lang === 'fr' ? "Espace de Co-Édition & Collaboration Live" : "Live Co-Editing & Collaboration Workspace"}
                    </h1>
                    <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '2px' }}>
                        {lang === 'fr'
                            ? "Invitez des agents sur des fichiers Excel spécifiques et travaillez en simultané avec verrous cellulaires."
                            : "Invite agents to specific Excel files and collaborate in real-time with cell locking."}
                    </p>
                </div>

                {/* Primary Action Button to Open Invitation Modal */}
                <button
                    onClick={() => setInviteModalOpen(true)}
                    style={{
                        background: '#02006c',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '14px',
                        padding: '0.75rem 1.35rem',
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 15px rgba(2, 0, 108, 0.2)'
                    }}
                >
                    <UserPlus size={18} /> {lang === 'fr' ? "Inviter un Agent sur un Fichier Précis" : "Invite Agent on Specific File"}
                </button>
            </div>

            {/* File Filter Selector Bar */}
            <div style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '1rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Filter size={18} color="#02006c" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
                        {lang === 'fr' ? "Filtrer la collaboration par fichier Excel :" : "Filter collaboration by Excel file:"}
                    </span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => setSelectedFileFilter('ALL')}
                        style={{
                            background: selectedFileFilter === 'ALL' ? '#02006c' : '#F1F5F9',
                            color: selectedFileFilter === 'ALL' ? '#FFFFFF' : '#475569',
                            border: 'none',
                            borderRadius: '20px',
                            padding: '0.45rem 1rem',
                            fontSize: '0.775rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {lang === 'fr' ? "Tous les Fichiers" : "All Files"} ({activeUsers.length})
                    </button>

                    {availableWorkbooks.map((wb) => {
                        const count = activeUsers.filter(u => u.file === wb.name).length;
                        const isSelected = selectedFileFilter === wb.name;

                        return (
                            <button
                                key={wb.id || wb.name}
                                onClick={() => setSelectedFileFilter(wb.name)}
                                style={{
                                    background: isSelected ? '#02006c' : '#F1F5F9',
                                    color: isSelected ? '#FFFFFF' : '#475569',
                                    border: 'none',
                                    borderRadius: '20px',
                                    padding: '0.45rem 1rem',
                                    fontSize: '0.775rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <FileSpreadsheet size={14} />
                                <span>{wb.name}</span>
                                {count > 0 && (
                                    <span style={{
                                        background: isSelected ? '#FCD116' : '#CBD5E1',
                                        color: '#02006c',
                                        fontSize: '0.65rem',
                                        fontWeight: 900,
                                        borderRadius: '10px',
                                        padding: '1px 6px'
                                    }}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 2 Main Columns Layout */}
            <div style={{ display: 'flex', gap: '1.5rem' }}>

                {/* Left Column: Connected Agents */}
                <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#02006c' }}>
                            {lang === 'fr' ? "Agents Connectés & Collaborateurs" : "Connected Agents & Collaborators"} ({filteredUsers.length})
                        </h2>
                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                            {selectedFileFilter === 'ALL' ? (lang === 'fr' ? 'Vue Globale' : 'Global View') : `Fichier: ${selectedFileFilter}`}
                        </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        {filteredUsers.length === 0 ? (
                            <div style={{ background: '#FFFFFF', borderRadius: '18px', padding: '2rem', textAlign: 'center', border: '1px solid #E2E8F0', color: '#64748B', fontSize: '0.85rem' }}>
                                {lang === 'fr' ? "Aucun agent actuellement connecté sur ce fichier." : "No agent currently connected on this file."}
                            </div>
                        ) : (
                            filteredUsers.map((u) => (
                                <div
                                    key={u.id}
                                    style={{
                                        background: '#FFFFFF',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: '18px',
                                        padding: '1.25rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        boxShadow: '0 2px 8px rgba(2, 0, 108, 0.04)'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{
                                            width: '44px',
                                            height: '44px',
                                            borderRadius: '50%',
                                            background: '#02006c',
                                            color: '#FFFFFF',
                                            fontWeight: 800,
                                            fontSize: '0.85rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: `2px solid ${u.color}`,
                                            position: 'relative'
                                        }}>
                                            {u.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                            <span style={{ position: 'absolute', bottom: 0, right: 0, width: '10px', height: '10px', borderRadius: '50%', background: '#10B981', border: '2px solid #FFF' }} />
                                        </div>

                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>
                                                    {u.name}
                                                </h3>
                                                <span className="badge badge-navy" style={{ fontSize: '0.625rem', padding: '1px 6px' }}>
                                                    {u.access}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                                                {u.role} • {lang === 'fr' ? 'Fichier Cible :' : 'Target File:'} <strong style={{ color: '#02006c' }}>{u.file}</strong>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ fontSize: '0.725rem', fontWeight: 800, color: '#02006c', background: 'rgba(2, 0, 108, 0.08)', padding: '4px 10px', borderRadius: '12px' }}>
                                            {lang === 'fr' ? 'Cellule' : 'Cell'} {u.cell} ({u.status})
                                        </span>
                                        <div style={{ fontSize: '0.675rem', color: '#94A3B8', marginTop: '4px' }}>
                                            {lang === 'fr' ? "Verrou Actif" : "Active Lock"}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Column: Live Chat & Directives */}
                <div style={{
                    flex: 0.8,
                    background: '#FFFFFF',
                    borderRadius: '20px',
                    border: '1px solid #E2E8F0',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '540px',
                    boxShadow: '0 4px 15px rgba(2, 0, 108, 0.04)'
                }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <MessageSquare size={18} color="#02006c" />
                                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#02006c' }}>
                                    {lang === 'fr' ? "Directives & Discussion Live" : "Live Directives & Discussion"}
                                </h3>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', overflowY: 'auto', maxHeight: '400px' }}>
                            {messages.map((m) => (
                                <div key={m.id} style={{ background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem', fontWeight: 700, color: '#02006c', marginBottom: '3px' }}>
                                        <span>{m.user}</span>
                                        <span style={{ color: '#94A3B8' }}>{m.time}</span>
                                    </div>
                                    <div style={{ fontSize: '0.675rem', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>
                                        Fichier: {m.file}
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: '#334155', margin: 0, lineHeight: 1.4 }}>
                                        {m.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                        <input
                            type="text"
                            placeholder={lang === 'fr' ? "Envoyer une directive sur ce fichier..." : "Send a directive on this file..."}
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            style={{
                                flex: 1,
                                padding: '0.65rem 1rem',
                                borderRadius: '12px',
                                border: '1px solid #CBD5E1',
                                background: '#F8FAFC',
                                fontSize: '0.825rem',
                                outline: 'none'
                            }}
                        />
                        <button
                            type="submit"
                            style={{
                                background: '#02006c',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '12px',
                                padding: '0.65rem 1rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Send size={16} />
                        </button>
                    </form>
                </div>

            </div>

            {/* Modal: Inviter un Agent sur un Fichier Précis */}
            {inviteModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(15, 23, 42, 0.65)',
                    backdropFilter: 'blur(6px)',
                    zIndex: 99999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1.5rem'
                }}>
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: '24px',
                        width: '100%',
                        maxWidth: '520px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                        overflow: 'hidden',
                        animation: 'fadeIn 0.25s ease'
                    }}>

                        {/* Modal Header */}
                        <div style={{
                            background: '#02006c',
                            padding: '1.25rem 1.75rem',
                            color: '#FFFFFF',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <UserPlus size={20} color="#FCD116" />
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                                    {lang === 'fr' ? "Inviter un Agent sur un Fichier" : "Invite Agent to File"}
                                </h3>
                            </div>
                            <button
                                onClick={() => setInviteModalOpen(false)}
                                style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSendInvitation} style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                            {/* Select Target File */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                                    {lang === 'fr' ? "1. Sélectionner le Fichier Excel Cible *" : "1. Select Target Excel File *"}
                                </label>
                                <select
                                    value={inviteForm.targetFile}
                                    onChange={(e) => setInviteForm({ ...inviteForm, targetFile: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.65rem 1rem',
                                        borderRadius: '12px',
                                        border: '1px solid #CBD5E1',
                                        background: '#F8FAFC',
                                        fontSize: '0.85rem',
                                        outline: 'none',
                                        fontWeight: 700,
                                        color: '#02006c'
                                    }}
                                >
                                    {availableWorkbooks.map((wb) => (
                                        <option key={wb.id || wb.name} value={wb.name}>
                                            {wb.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Agent Name / Email */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                                    {lang === 'fr' ? "2. Nom & Prénom de l'Agent ANTIC *" : "2. ANTIC Agent Name & Surname *"}
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder={lang === 'fr' ? "Ex: Dr. Audrey F. ou audit@antic.cm" : "e.g. Dr. Audrey F. or audit@antic.cm"}
                                    value={inviteForm.agentName}
                                    onChange={(e) => setInviteForm({ ...inviteForm, agentName: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.65rem 1rem',
                                        borderRadius: '12px',
                                        border: '1px solid #CBD5E1',
                                        background: '#FFFFFF',
                                        fontSize: '0.85rem',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            {/* Access Rights */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                                    {lang === 'fr' ? "3. Niveau d'Accès & Autorisations *" : "3. Access Level & Permissions *"}
                                </label>
                                <select
                                    value={inviteForm.accessLevel}
                                    onChange={(e) => setInviteForm({ ...inviteForm, accessLevel: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.65rem 1rem',
                                        borderRadius: '12px',
                                        border: '1px solid #CBD5E1',
                                        background: '#F8FAFC',
                                        fontSize: '0.85rem',
                                        outline: 'none'
                                    }}
                                >
                                    <option value={lang === 'fr' ? 'Édition en temps réel' : 'Real-time Editing'}>
                                        {lang === 'fr' ? "Édition en temps réel (Co-auteur)" : "Real-time Editing (Co-author)"}
                                    </option>
                                    <option value={lang === 'fr' ? 'Lecture seule & Audit' : 'Read-only & Audit'}>
                                        {lang === 'fr' ? "Lecture seule & Audit (Spectateur)" : "Read-only & Audit (Viewer)"}
                                    </option>
                                    <option value={lang === 'fr' ? 'Supervision & Validation' : 'Supervision & Validation'}>
                                        {lang === 'fr' ? "Supervision & Validation (Responsable)" : "Supervision & Validation (Supervisor)"}
                                    </option>
                                </select>
                            </div>

                            {/* Custom Directive / Message */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                                    {lang === 'fr' ? "4. Directive / Message d'invitation (Optionnel)" : "4. Directive / Invitation Message (Optional)"}
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder={lang === 'fr' ? "Ex: Merci de contrôler les formules de la colonne C." : "e.g. Please check formulas in column C."}
                                    value={inviteForm.directive}
                                    onChange={(e) => setInviteForm({ ...inviteForm, directive: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.65rem 1rem',
                                        borderRadius: '12px',
                                        border: '1px solid #CBD5E1',
                                        background: '#FFFFFF',
                                        fontSize: '0.825rem',
                                        outline: 'none',
                                        resize: 'none'
                                    }}
                                />
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setInviteModalOpen(false)}
                                    className="btn-pill-light"
                                    style={{ flex: 1, padding: '0.75rem', justifyContent: 'center' }}
                                >
                                    {lang === 'fr' ? "Annuler" : "Cancel"}
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        flex: 1.5,
                                        background: '#02006c',
                                        color: '#FFFFFF',
                                        border: 'none',
                                        borderRadius: '14px',
                                        padding: '0.75rem',
                                        fontWeight: 800,
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                        boxShadow: '0 4px 15px rgba(2, 0, 108, 0.2)'
                                    }}
                                >
                                    <Send size={16} /> {lang === 'fr' ? "Envoyer l'Invitation" : "Send Invitation"}
                                </button>
                            </div>

                        </form>

                    </div>
                </div>
            )}

        </div>
    );
}

