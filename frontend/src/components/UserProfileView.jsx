import React, { useState, useRef } from 'react';
import {
    ShieldCheck,
    Lock,
    User,
    Camera,
    Save,
    RefreshCw
} from 'lucide-react';

export default function UserProfileView({ currentUser, userPhoto, setUserPhoto, onBackToDashboard, onLogout, lang = 'fr', showToast }) {
    const photoInputRef = useRef(null);

    const [profileData, setProfileData] = useState({
        name: currentUser?.name || 'PIERRE MARCELLE NANKENG',
        email: 'p.nankeng@antic.cm',
        department: 'Direction Générale / Unité Sécurité',
        matricule: 'ANT-2026-8894'
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Photo = reader.result;
                setUserPhoto(base64Photo);
                localStorage.setItem('antic_user_photo', base64Photo);
                if (showToast) {
                    showToast(lang === 'fr' ? "Photo mise à jour" : "Photo updated", "success");
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = (e) => {
        e.preventDefault();
        if (showToast) {
            showToast(lang === 'fr' ? "Informations enregistrées !" : "Information saved!", "success");
        }
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            if (showToast) {
                showToast(lang === 'fr' ? "Les mots de passe ne correspondent pas." : "Passwords do not match.", "error");
            }
            return;
        }
        if (showToast) {
            showToast(lang === 'fr' ? "Mot de passe actualisé !" : "Password updated!", "success");
        }
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    };

    return (
        <div style={{
            width: '100%',
            minHeight: 'calc(100vh - 65px)',
            background: '#FFFFFF',
            padding: '3rem 2rem',
            display: 'flex',
            justifyContent: 'center'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '900px',
                display: 'flex',
                flexDirection: 'column'
            }}>

                {/* Clean Header Area */}
                <div style={{
                    padding: '0 0 2.5rem 0',
                    borderBottom: '1px solid #F1F5F9',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2rem'
                }}>
                    {/* Minimal Avatar */}
                    <div style={{ position: 'relative' }}>
                        <div style={{
                            width: '90px',
                            height: '90px',
                            borderRadius: '50%',
                            background: '#F1F5F9',
                            border: '1px solid #E2E8F0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            color: '#0a034a',
                            fontSize: '2rem',
                            fontWeight: 700
                        }}>
                            {userPhoto ? (
                                <img src={userPhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                currentUser?.avatar || 'PN'
                            )}
                        </div>

                        <input
                            type="file"
                            ref={photoInputRef}
                            onChange={handlePhotoUpload}
                            accept="image/*"
                            style={{ display: 'none' }}
                        />

                        {/* Embedded minimal camera icon */}
                        <button
                            type="button"
                            onClick={() => photoInputRef.current?.click()}
                            style={{
                                position: 'absolute',
                                bottom: '0',
                                right: '0',
                                width: '30px',
                                height: '30px',
                                borderRadius: '50%',
                                background: '#0a034a',
                                color: '#FFFFFF',
                                border: '2px solid #FFFFFF',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                            }}
                        >
                            <Camera size={14} />
                        </button>
                    </div>

                    <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
                            {profileData.name}
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', fontSize: '0.85rem' }}>
                            <ShieldCheck size={14} /> {profileData.department}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', padding: '2.5rem 0' }}>

                    {/* Personal Info Form */}
                    <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <User size={16} color="#0a034a" /> {lang === 'fr' ? "Informations Personnelles" : "Personal Information"}
                        </h3>

                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', display: 'block', marginBottom: '6px' }}>
                                {lang === 'fr' ? "Nom Complet" : "Full Name"}
                            </label>
                            <input
                                type="text"
                                value={profileData.name}
                                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                style={{
                                    width: '100%', padding: '0.65rem 1rem', borderRadius: '10px',
                                    border: '1px solid #E2E8F0', background: '#F8FAFC', outline: 'none', fontSize: '0.85rem', color: '#0F172A'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', display: 'block', marginBottom: '6px' }}>
                                {lang === 'fr' ? "Email Professionnel" : "Work Email"}
                            </label>
                            <input
                                type="email"
                                value={profileData.email}
                                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                style={{
                                    width: '100%', padding: '0.65rem 1rem', borderRadius: '10px',
                                    border: '1px solid #E2E8F0', background: '#F8FAFC', outline: 'none', fontSize: '0.85rem', color: '#0F172A'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', display: 'block', marginBottom: '6px' }}>
                                {lang === 'fr' ? "Département" : "Department"}
                            </label>
                            <input
                                type="text"
                                value={profileData.department}
                                onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                                style={{
                                    width: '100%', padding: '0.65rem 1rem', borderRadius: '10px',
                                    border: '1px solid #E2E8F0', background: '#F8FAFC', outline: 'none', fontSize: '0.85rem', color: '#0F172A'
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            style={{
                                marginTop: '1rem', background: '#0a034a', color: '#FFFFFF', border: 'none',
                                borderRadius: '10px', padding: '0.75rem 1.5rem', fontWeight: 700, fontSize: '0.85rem',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                alignSelf: 'flex-start'
                            }}
                        >
                            <Save size={14} /> {lang === 'fr' ? "Enregistrer" : "Save Changes"}
                        </button>
                    </form>

                    {/* Security Form */}
                    <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Lock size={16} color="#0a034a" /> {lang === 'fr' ? "Sécurité" : "Security"}
                        </h3>

                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', display: 'block', marginBottom: '6px' }}>
                                {lang === 'fr' ? "Mot de Passe Actuel" : "Current Password"}
                            </label>
                            <input
                                type="password"
                                required
                                placeholder="••••••••••••"
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                style={{
                                    width: '100%', padding: '0.65rem 1rem', borderRadius: '10px',
                                    border: '1px solid #E2E8F0', background: '#FFFFFF', outline: 'none', fontSize: '0.85rem'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', display: 'block', marginBottom: '6px' }}>
                                {lang === 'fr' ? "Nouveau Mot de Passe" : "New Password"}
                            </label>
                            <input
                                type="password"
                                required
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                style={{
                                    width: '100%', padding: '0.65rem 1rem', borderRadius: '10px',
                                    border: '1px solid #E2E8F0', background: '#FFFFFF', outline: 'none', fontSize: '0.85rem'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', display: 'block', marginBottom: '6px' }}>
                                {lang === 'fr' ? "Confirmer le Nouveau Mot de Passe" : "Confirm New Password"}
                            </label>
                            <input
                                type="password"
                                required
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                style={{
                                    width: '100%', padding: '0.65rem 1rem', borderRadius: '10px',
                                    border: '1px solid #E2E8F0', background: '#FFFFFF', outline: 'none', fontSize: '0.85rem'
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            style={{
                                marginTop: '1rem', background: '#F8FAFC', color: '#0a034a', border: '1px solid #E2E8F0',
                                borderRadius: '10px', padding: '0.75rem 1.5rem', fontWeight: 700, fontSize: '0.85rem',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                alignSelf: 'flex-start',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.background = '#F1F5F9'}
                            onMouseOut={(e) => e.target.style.background = '#F8FAFC'}
                        >
                            <RefreshCw size={14} /> {lang === 'fr' ? "Mettre à jour" : "Update Password"}
                        </button>
                    </form>

                </div>
            </div>
        </div>
    );
}
