import React, { useState, useRef } from 'react';
import {
    ShieldCheck,
    Mail,
    Building,
    Camera,
    Save,
    Lock,
    User,
    RefreshCw,
    Upload
} from 'lucide-react';

export default function UserProfileView({ currentUser, userPhoto, setUserPhoto, onBackToDashboard, onLogout, lang = 'fr', showToast }) {
    const photoInputRef = useRef(null);

    // Editable Profile Information State (Role Removed as requested)
    const [profileData, setProfileData] = useState({
        name: currentUser?.name || 'PIERRE MARCELLE NANKENG',
        email: 'p.nankeng@antic.cm',
        department: 'Direction Générale / Unité Sécurité',
        matricule: 'ANT-2026-8894'
    });

    // Password Change State
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Handle Photo Upload & Save to LocalStorage for Top-Level Persistence
    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Photo = reader.result;
                setUserPhoto(base64Photo);
                localStorage.setItem('antic_user_photo', base64Photo);
                if (showToast) {
                    showToast(lang === 'fr' ? "Photo de profil mise à jour et enregistrée avec succès !" : "Profile picture updated and saved successfully!", "success");
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // Save Profile Details
    const handleSaveProfile = (e) => {
        e.preventDefault();
        if (showToast) {
            showToast(lang === 'fr' ? "Informations personnelles enregistrées avec succès !" : "Personal information saved successfully!", "success");
        }
    };

    // Update Password
    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            if (showToast) {
                showToast(lang === 'fr' ? "Le nouveau mot de passe et la confirmation ne correspondent pas." : "New password and confirmation do not match.", "error");
            }
            return;
        }
        if (showToast) {
            showToast(lang === 'fr' ? "Mot de passe mis à jour avec succès !" : "Password updated successfully!", "success");
        }
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    };

    return (
        <div style={{
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            background: '#F8FAFC',
            minHeight: 'calc(100vh - 65px)',
            width: '100%'
        }}>

            {/* Page Header */}
            <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 800, color: '#02006c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <ShieldCheck size={16} color="#02006c" /> {lang === 'fr' ? "Profil de l'Agent Institutionnel ANTIC" : "ANTIC Institutional Agent Profile"}
                </div>
                <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                    {lang === 'fr' ? "Gestion du Profil & Mot de Passe" : "Profile & Password Management"}
                </h1>
                <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '2px' }}>
                    {lang === 'fr'
                        ? "Modifiez vos informations personnelles, téléchargez votre photo de profil persistante et mettez à jour votre mot de passe."
                        : "Edit your personal information, upload your persistent profile picture, and update your password."}
                </p>
            </div>

            {/* ─── FULL-WIDTH PAGE CONTAINER (100% WIDTH) ─── */}
            <div style={{
                width: '100%',
                background: '#FFFFFF',
                borderRadius: '24px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 10px 30px rgba(2, 0, 108, 0.05)',
                overflow: 'hidden'
            }}>

                {/* Banner with Strict #02006c */}
                <div style={{
                    background: '#02006c',
                    padding: '2.5rem 2.5rem 4rem 2.5rem',
                    color: '#FFFFFF',
                    position: 'relative'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 800, color: '#FFFFFF', opacity: 0.9 }}>
                        <ShieldCheck size={16} color="#FCD116" /> REPUBLIQUE DU CAMEROUN • ANTIC
                    </div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '6px' }}>
                        {lang === 'fr' ? "Espace Agent Accrédité" : "Accredited Agent Space"}
                    </h2>
                </div>

                {/* ─── AVATAR & PROMINENT USER NAME ─── */}
                <div style={{
                    padding: '0 2.5rem',
                    marginTop: '-2.8rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'relative',
                    zIndex: 2,
                    paddingBottom: '1.5rem',
                    borderBottom: '1px solid #E2E8F0'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>

                        {/* Interactive Avatar Photo Container */}
                        <div style={{ position: 'relative' }}>
                            <div style={{
                                width: '110px',
                                height: '110px',
                                borderRadius: '50%',
                                background: '#02006c',
                                border: '4px solid #FFFFFF',
                                color: '#FFFFFF',
                                fontWeight: 800,
                                fontSize: '2.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 8px 25px rgba(2, 0, 108, 0.25)',
                                overflow: 'hidden'
                            }}>
                                {userPhoto ? (
                                    <img src={userPhoto} alt="Photo Profil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    currentUser?.avatar || 'PN'
                                )}
                            </div>

                            {/* Upload Photo Button Badge */}
                            <input
                                type="file"
                                ref={photoInputRef}
                                onChange={handlePhotoUpload}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />

                            <button
                                type="button"
                                onClick={() => photoInputRef.current?.click()}
                                title={lang === 'fr' ? "Changer la photo de profil" : "Change profile picture"}
                                style={{
                                    position: 'absolute',
                                    bottom: '4px',
                                    right: '4px',
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    background: '#02006c',
                                    color: '#FFFFFF',
                                    border: '2px solid #FFFFFF',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                                }}
                            >
                                <Camera size={17} />
                            </button>
                        </div>

                        {/* HIGHLY VISIBLE USER NAME */}
                        <div style={{ marginTop: '1.5rem' }}>
                            <h3 style={{
                                fontSize: '1.8rem',
                                fontWeight: 800,
                                color: '#02006c',
                                letterSpacing: '-0.01em',
                                lineHeight: 1.2
                            }}>
                                {profileData.name}
                            </h3>
                        </div>
                    </div>

                    <button
                        onClick={() => photoInputRef.current?.click()}
                        className="btn-pill-light"
                        style={{ fontSize: '0.825rem', marginTop: '1.5rem' }}
                    >
                        <Upload size={16} /> {lang === 'fr' ? "Ajouter une Photo de Profil" : "Add Profile Picture"}
                    </button>
                </div>

                {/* ─── 2 COLUMNS EDITABLE FORMS ─── */}
                <div style={{ padding: '2.5rem', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2.5rem' }}>

                    {/* LEFT COLUMN: EDIT PERSONAL INFORMATIONS */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#02006c', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <User size={18} color="#02006c" /> {lang === 'fr' ? "Modifier mes Informations Personnelles" : "Edit Personal Information"}
                            </h3>
                            <p style={{ fontSize: '0.775rem', color: '#64748B', marginTop: '2px' }}>
                                {lang === 'fr'
                                    ? "Mettez à jour votre nom, adresse email professionnelle et département."
                                    : "Update your name, professional email address, and department."}
                            </p>
                        </div>

                        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '6px' }}>
                                    {lang === 'fr' ? "Nom Complet & Prénom" : "Full Name"}
                                </label>
                                <input
                                    type="text"
                                    value={profileData.name}
                                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '12px',
                                        border: '1px solid #CBD5E1',
                                        background: '#F8FAFC',
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        outline: 'none',
                                        color: '#0F172A'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '6px' }}>
                                    {lang === 'fr' ? "Adresse Email Professionnelle (@antic.cm)" : "Work Email Address (@antic.cm)"}
                                </label>
                                <input
                                    type="email"
                                    value={profileData.email}
                                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '12px',
                                        border: '1px solid #CBD5E1',
                                        background: '#F8FAFC',
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        outline: 'none',
                                        color: '#0F172A'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '6px' }}>
                                    {lang === 'fr' ? "Direction / Département" : "Directorate / Department"}
                                </label>
                                <input
                                    type="text"
                                    value={profileData.department}
                                    onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '12px',
                                        border: '1px solid #CBD5E1',
                                        background: '#F8FAFC',
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        outline: 'none',
                                        color: '#0F172A'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '6px' }}>
                                    {lang === 'fr' ? "Matricule Agent (Non-Modifiable)" : "Agent ID (Read-only)"}
                                </label>
                                <input
                                    type="text"
                                    readOnly
                                    value={profileData.matricule}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '12px',
                                        border: '1px solid #CBD5E1',
                                        background: '#E2E8F0',
                                        color: '#64748B',
                                        fontSize: '0.85rem',
                                        fontWeight: 700,
                                        fontFamily: 'var(--font-mono)'
                                    }}
                                />
                            </div>

                            <button
                                type="submit"
                                style={{
                                    marginTop: '0.5rem',
                                    background: '#02006c',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    borderRadius: '14px',
                                    padding: '0.75rem 1.5rem',
                                    fontWeight: 800,
                                    fontSize: '0.875rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    boxShadow: '0 4px 15px rgba(2, 0, 108, 0.25)'
                                }}
                            >
                                <Save size={16} /> {lang === 'fr' ? "Enregistrer les Modifications du Profil" : "Save Profile Changes"}
                            </button>
                        </form>
                    </div>

                    {/* RIGHT COLUMN: CHANGE PASSWORD FORM */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#F8FAFC', padding: '1.75rem', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                        <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#02006c', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Lock size={18} color="#02006c" /> {lang === 'fr' ? "Modifier mon Mot de Passe" : "Change Password"}
                            </h3>
                            <p style={{ fontSize: '0.775rem', color: '#64748B', marginTop: '2px' }}>
                                {lang === 'fr'
                                    ? "Sécurisez votre compte agent avec un mot de passe fort."
                                    : "Secure your agent account with a strong password."}
                            </p>
                        </div>

                        <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '6px' }}>
                                    {lang === 'fr' ? "Mot de Passe Actuel" : "Current Password"}
                                </label>
                                <input
                                    type="password"
                                    placeholder="••••••••••••"
                                    required
                                    value={passwordForm.currentPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '12px',
                                        border: '1px solid #CBD5E1',
                                        background: '#FFFFFF',
                                        fontSize: '0.85rem',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '6px' }}>
                                    {lang === 'fr' ? "Nouveau Mot de Passe" : "New Password"}
                                </label>
                                <input
                                    type="password"
                                    placeholder={lang === 'fr' ? "Minimum 8 caractères" : "Minimum 8 characters"}
                                    required
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '12px',
                                        border: '1px solid #CBD5E1',
                                        background: '#FFFFFF',
                                        fontSize: '0.85rem',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '6px' }}>
                                    {lang === 'fr' ? "Confirmer le Nouveau Mot de Passe" : "Confirm New Password"}
                                </label>
                                <input
                                    type="password"
                                    placeholder={lang === 'fr' ? "Répéter le mot de passe" : "Repeat password"}
                                    required
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '12px',
                                        border: '1px solid #CBD5E1',
                                        background: '#FFFFFF',
                                        fontSize: '0.85rem',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            <button
                                type="submit"
                                style={{
                                    marginTop: '0.5rem',
                                    background: '#02006c',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    borderRadius: '14px',
                                    padding: '0.75rem 1.5rem',
                                    fontWeight: 800,
                                    fontSize: '0.875rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                <RefreshCw size={16} /> {lang === 'fr' ? "Mettre à Jour le Mot de Passe" : "Update Password"}
                            </button>
                        </form>
                    </div>

                </div>

            </div>

        </div>
    );
}
