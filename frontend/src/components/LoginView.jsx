import React, { useState } from 'react';
import { ShieldCheck, Lock, User, Eye, EyeOff, CheckCircle2, ArrowRight } from 'lucide-react';

export default function LoginView({ onLoginSuccess, lang, setLang, showToast }) {
    const [isSignUp, setIsSignUp] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [credentials, setCredentials] = useState({
        username: 'p.nankeng@antic.cm',
        password: 'AnticAdmin2026!',
        fullName: 'Paul NANKENG'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isSignUp) {
            if (showToast) {
                showToast("Compte agent créé avec succès ! Vous pouvez vous connecter.", "success");
            }
            setIsSignUp(false);
        } else {
            if (showToast) {
                showToast("Connexion réussie ! Bienvenue sur le Portail ANTIC.", "success");
            }
            onLoginSuccess();
        }
    };

    return (
        <div style={{
            width: '100vw',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, rgba(2, 0, 108, 0.85) 0%, rgba(1, 0, 74, 0.9) 100%), url("/login_bg_navy.png") center/cover no-repeat',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            padding: '2rem 1rem',
            overflowY: 'auto'
        }}>

            {/* Background Decorative Rings */}
            <div style={{
                position: 'absolute',
                top: '-10%',
                left: '-10%',
                width: '500px',
                height: '500px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.03)',
                pointerEvents: 'none'
            }} />

            <div style={{
                position: 'absolute',
                bottom: '-15%',
                right: '-10%',
                width: '600px',
                height: '600px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.03)',
                pointerEvents: 'none'
            }} />

            {/* Language Toggle Selector Top Right */}
            <div style={{
                position: 'absolute',
                top: '2rem',
                right: '2rem',
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '3px',
                border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
                <button
                    onClick={() => setLang('fr')}
                    style={{
                        padding: '0.3rem 0.8rem',
                        borderRadius: '16px',
                        border: 'none',
                        background: lang === 'fr' ? '#FFFFFF' : 'transparent',
                        color: lang === 'fr' ? '#02006c' : '#FFFFFF',
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                    }}
                >
                    FR
                </button>
                <button
                    onClick={() => setLang('en')}
                    style={{
                        padding: '0.3rem 0.8rem',
                        borderRadius: '16px',
                        border: 'none',
                        background: lang === 'en' ? '#FFFFFF' : 'transparent',
                        color: lang === 'en' ? '#02006c' : '#FFFFFF',
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                    }}
                >
                    EN
                </button>
            </div>

            {/* ─── ELEGANT GLASSMORPHISM TRANSPARENT LOGIN MODAL CONTAINER ─── */}
            <div style={{
                width: '440px',
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '28px',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.35)',
                padding: '2.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                color: '#FFFFFF'
            }}>

                {/* ANTIC Logo */}
                <div style={{
                    width: '84px',
                    height: '84px',
                    borderRadius: '50%',
                    background: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.25)',
                    marginBottom: '1rem',
                    border: '3px solid rgba(255, 255, 255, 0.5)'
                }}>
                    <img src="/antic_logo.png" alt="ANTIC Logo" style={{ width: '56px', height: '56px', objectFit: 'contain' }} />
                </div>

                <h2 style={{ fontSize: '1.45rem', fontWeight: 800, textAlign: 'center', letterSpacing: '-0.01em' }}>
                    {isSignUp
                        ? (lang === 'fr' ? "Création de Compte Agent" : "Agent Account Creation")
                        : (lang === 'fr' ? "Portail Agent ANTIC" : "ANTIC Agent Portal")}
                </h2>

                <p style={{ fontSize: '0.8rem', color: '#E0E7FF', textAlign: 'center', marginTop: '4px', marginBottom: '1.5rem' }}>
                    {isSignUp
                        ? (lang === 'fr' ? "Inscrivez-vous pour accéder à la plateforme" : "Sign up to access the platform")
                        : (lang === 'fr' ? "Authentification Sécurisée Excel-to-Word Platform" : "Secure Excel-to-Word Platform Authentication")}
                </p>

                <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>

                    {/* Full Name Input for Sign Up */}
                    {isSignUp && (
                        <div>
                            <label style={{ fontSize: '0.775rem', fontWeight: 700, color: '#E0E7FF', display: 'block', marginBottom: '6px' }}>
                                {lang === 'fr' ? "Nom et Prénom de l'Agent" : "Agent Full Name"}
                            </label>
                            <div style={{ position: 'relative' }}>
                                <User size={18} color="#02006c" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type="text"
                                    required
                                    placeholder={lang === 'fr' ? "ex: Paul NANKENG" : "e.g. Paul NANKENG"}
                                    value={credentials.fullName}
                                    onChange={(e) => setCredentials({ ...credentials, fullName: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem 0.75rem 2.6rem',
                                        borderRadius: '14px',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        background: '#FFFFFF',
                                        color: '#0F172A',
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        outline: 'none'
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Identifiant Input */}
                    <div>
                        <label style={{ fontSize: '0.775rem', fontWeight: 700, color: '#E0E7FF', display: 'block', marginBottom: '6px' }}>
                            {lang === 'fr' ? "Identifiant / Email Professionnel (@antic.cm)" : "Agent ID / Professional Email (@antic.cm)"}
                        </label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} color="#02006c" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="email"
                                required
                                value={credentials.username}
                                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem 0.75rem 2.6rem',
                                    borderRadius: '14px',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    background: '#FFFFFF',
                                    color: '#0F172A',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    {/* Password Input with Eye Icon */}
                    <div>
                        <label style={{ fontSize: '0.775rem', fontWeight: 700, color: '#E0E7FF', display: 'block', marginBottom: '6px' }}>
                            {lang === 'fr' ? "Mot de Passe Agent" : "Agent Password"}
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} color="#02006c" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={credentials.password}
                                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 2.8rem 0.75rem 2.6rem',
                                    borderRadius: '14px',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    background: '#FFFFFF',
                                    color: '#0F172A',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    outline: 'none'
                                }}
                            />

                            {/* Eye Toggle Icon Button */}
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: '#02006c',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '2px'
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        style={{
                            marginTop: '0.75rem',
                            width: '100%',
                            padding: '0.85rem',
                            borderRadius: '16px',
                            border: 'none',
                            background: '#FFFFFF',
                            color: '#02006c',
                            fontWeight: 800,
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25)',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <span>
                            {isSignUp
                                ? (lang === 'fr' ? "S'inscrire" : "Sign Up")
                                : (lang === 'fr' ? "Se connecter" : "Sign In")}
                        </span>
                    </button>
                </form>

                {/* Toggle Sign In / Sign Up link */}
                <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.825rem', color: '#E0E7FF' }}>
                    {isSignUp ? (
                        <span>
                            {lang === 'fr' ? "Déjà un compte agent ?" : "Already have an agent account?"}{' '}
                            <button
                                type="button"
                                onClick={() => setIsSignUp(false)}
                                style={{ background: 'none', border: 'none', color: '#FFFFFF', fontWeight: 800, textDecoration: 'underline', cursor: 'pointer' }}
                            >
                                {lang === 'fr' ? "Se connecter" : "Sign In"}
                            </button>
                        </span>
                    ) : (
                        <span>
                            {lang === 'fr' ? "Pas encore de compte ?" : "Don't have an account yet?"}{' '}
                            <button
                                type="button"
                                onClick={() => setIsSignUp(true)}
                                style={{ background: 'none', border: 'none', color: '#FFFFFF', fontWeight: 800, textDecoration: 'underline', cursor: 'pointer' }}
                            >
                                {lang === 'fr' ? "S'inscrire / Créer un compte" : "Sign Up / Create Account"}
                            </button>
                        </span>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: '#E0E7FF', marginTop: '1.5rem' }}>
                    <ShieldCheck size={14} color="#FCD116" /> {lang === 'fr' ? "Accès réservé au personnel accrédité ANTIC (Cameroun)" : "Restricted access for accredited ANTIC personnel (Cameroon)"}
                </div>

            </div>

        </div>
    );
}
