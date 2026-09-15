import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import FortuneSheetEditor from './components/FortuneSheetEditor';
import WorkbookManagementView from './components/WorkbookManagementView';
import WordFilesView from './components/WordFilesView';
import NotificationsView from './components/NotificationsView';
import CollaborationView from './components/CollaborationView';
import UserManagementView from './components/UserManagementView';
import UserProfileView from './components/UserProfileView';
import SheetToWordModal from './components/SheetToWordModal';
import FileUploader from './components/FileUploader';
import LoginView from './components/LoginView';

import { CheckCircle2, AlertCircle, AlertTriangle, X } from 'lucide-react';
import { currentUser, sampleWorkbooks, conversionHistory } from './data/mockData';
import { authApi, workbooksApi } from './api_client';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(localStorage.getItem('sheetflow_token') || localStorage.getItem('antic_auth') === 'true');
  });

  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem('sheetflow_token');
      if (token) {
        try {
          await authApi.getMe();
          setIsAuthenticated(true);
        } catch (e) {
          console.warn('Session expirée ou invalide:', e);
          authApi.logout();
          setIsAuthenticated(false);
        }
      }
    }
    checkAuth();
  }, []);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [theme, setTheme] = useState('dark');
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('antic_lang') || 'fr';
  });

  const handleNavigate = (view) => {
    setActiveView(view);
    setMobileSidebarOpen(false);
  };
  const [workbooks, setWorkbooks] = useState([]); // Removed sampleWorkbooks, default to empty
  const [conversions, setConversions] = useState(conversionHistory);
  const [selectedWorkbook, setSelectedWorkbook] = useState(() => {
    try {
      const isSessionActive = sessionStorage.getItem('antic_session_active') === 'true';
      if (isSessionActive) {
        const saved = localStorage.getItem('antic_active_workbook');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && Array.isArray(parsed.sheets) && parsed.sheets.length > 0 && Array.isArray(parsed.sheets[0]?.data)) {
            return parsed;
          }
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    if (selectedWorkbook) {
      try {
        sessionStorage.setItem('antic_session_active', 'true');
        // Strip cellStyles from localStorage payload to avoid QuotaExceededError.
        // cellStyles are re-extracted from the file on upload and kept in memory.
        const lightWb = {
          ...selectedWorkbook,
          sheets: (selectedWorkbook.sheets || []).map(s => ({ ...s, cellStyles: {} }))
        };
        localStorage.setItem('antic_active_workbook', JSON.stringify(lightWb));
      } catch (err) {
        // Silently ignore quota errors
      }
    }
  }, [selectedWorkbook]);

  // Top-Level Persistent User Photo State
  const [userPhoto, setUserPhoto] = useState(() => {
    return localStorage.getItem('antic_user_photo') || null;
  });

  useEffect(() => {
    localStorage.setItem('antic_lang', lang);
  }, [lang]);

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [convertModal, setConvertModal] = useState({ isOpen: false, workbook: null, sheetName: '' });

  // Floating Toast System State
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 4000);
  };

  const getToastStyle = (type) => {
    switch (type) {
      case 'error':
        return { bg: '#DC2626', border: '#EF4444', icon: <AlertCircle size={20} color="#FFF" /> };
      case 'warning':
      case 'info':
        return { bg: '#D97706', border: '#F59E0B', icon: <AlertTriangle size={20} color="#FFF" /> };
      case 'success':
      default:
        return { bg: '#059669', border: '#10B981', icon: <CheckCircle2 size={20} color="#FFF" /> };
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleSelectWorkbook = (wb) => {
    setSelectedWorkbook(wb);
    setActiveView('editor');
  };

  const handleCreateNewWorkbook = async () => {
    try {
      let fileName = 'Nouveau_Classeur.xlsx';

      if (window.showSaveFilePicker) {
        const handle = await window.showSaveFilePicker({
          suggestedName: fileName,
          types: [{
            description: 'Fichier Excel',
            accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
          }],
        });
        fileName = handle.name;

        const XLSX = await import('xlsx');
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([[""]]);
        XLSX.utils.book_append_sheet(wb, ws, "Feuille1");

        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const writable = await handle.createWritable();
        await writable.write(excelBuffer);
        await writable.close();
      }

      const newWb = {
        id: `new_${Date.now()}`,
        name: fileName,
        sheets: [{ name: 'Feuille1', data: Array.from({ length: 100 }, () => Array(26).fill('')) }]
      };

      setWorkbooks(prev => [newWb, ...prev]);
      setSelectedWorkbook(newWb);
      setActiveView('editor');
      showToast(`Fichier ${fileName} créé de manière native avec succès !`, "success");
    } catch (err) {
      console.warn("Création de fichier annulée :", err);
    }
  };

  const handleOpenConvertModal = (wb = selectedWorkbook, sheetName = '') => {
    setConvertModal({
      isOpen: true,
      workbook: wb,
      sheetName: sheetName || (wb?.sheets[0]?.name || '')
    });
  };

  const handleConversionComplete = (newConversion) => {
    setConversions(prev => [
      {
        id: `conv-${Date.now()}`,
        ...newConversion,
        status: "Terminé"
      },
      ...prev
    ]);
    showToast("Conversion Word terminée avec succès !", "success");
  };

  const handleUploadSuccess = (newWorkbook) => {
    const wbWithMeta = {
      ...newWorkbook,
      lastUpdated: new Date().toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US', { dateStyle: 'short', timeStyle: 'short' })
    };
    setWorkbooks(prev => [wbWithMeta, ...prev]);
    setSelectedWorkbook(wbWithMeta);
    try {
      sessionStorage.setItem('antic_session_active', 'true');
      localStorage.setItem('antic_active_workbook', JSON.stringify(wbWithMeta));
    } catch (e) { }
    setActiveView('editor');
    showToast(lang === 'fr' ? `Classeur "${wbWithMeta.name}" importé avec succès !` : `Workbook "${wbWithMeta.name}" uploaded successfully!`, "success");
  };

  if (!isAuthenticated) {
    const toastConfig = getToastStyle(toast.type);
    return (
      <>
        <LoginView
          onLoginSuccess={() => {
            localStorage.setItem('antic_auth', 'true');
            setIsAuthenticated(true);
          }}
          lang={lang}
          setLang={setLang}
          showToast={showToast}
        />

        {/* Floating Toast Pop-up Positioned AT THE TOP */}
        {toast.visible && (
          <div style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 99999,
            background: toastConfig.bg,
            color: '#FFFFFF',
            padding: '0.85rem 1.4rem',
            borderRadius: '14px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.875rem',
            fontWeight: 700,
            border: `1.5px solid ${toastConfig.border}`,
            animation: 'fadeIn 0.3s ease'
          }}>
            {toastConfig.icon}
            <span>{toast.message}</span>
            <button onClick={() => setToast({ ...toast, visible: false })} style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', marginLeft: '6px' }}>
              <X size={16} />
            </button>
          </div>
        )}
      </>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex' }}>

      {/* Deep Imperial Navy Left Sidebar (#0a034a) */}
      <Sidebar
        activeView={activeView}
        setActiveView={handleNavigate}
        isMobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onOpenUploadModal={() => {
          setMobileSidebarOpen(false);
          setUploadModalOpen(true);
        }}
        currentUser={currentUser}
        userPhoto={userPhoto}
        lang={lang}
        setLang={setLang}
        onLogout={() => {
          authApi.logout();
          localStorage.setItem('antic_auth', 'false');
          localStorage.removeItem('antic_active_workbook');
          sessionStorage.removeItem('antic_session_active');
          setSelectedWorkbook(null);
          setIsAuthenticated(false);
          showToast("Déconnexion de la session agent effectuée.", "info");
        }}
      />

      {/* Main Workspace Frame */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflow: 'hidden', background: '#FFFFFF' }}>

        {/* Top Header Bar */}
        <Header
          currentUser={currentUser}
          userPhoto={userPhoto}
          theme={theme}
          toggleTheme={toggleTheme}
          activeView={activeView}
          setActiveView={handleNavigate}
          lang={lang}
          setLang={setLang}
          onOpenUserProfile={() => handleNavigate('profile')}
          onToggleMobileSidebar={() => setMobileSidebarOpen(prev => !prev)}
        />

        {/* Dynamic Workspace Container Views */}
        <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', width: '100%' }}>

          {activeView === 'dashboard' && (
            <DashboardView
              workbooks={workbooks}
              conversions={conversions}
              onSelectWorkbook={handleSelectWorkbook}
              onOpenConvertModal={handleOpenConvertModal}
              onOpenUploadModal={() => setUploadModalOpen(true)}
              onCreateNewWorkbook={handleCreateNewWorkbook}
              lang={lang}
            />
          )}

          {activeView === 'editor' && (
            <FortuneSheetEditor
              selectedWorkbook={selectedWorkbook}
              onWorkbookChange={(wb) => setSelectedWorkbook(wb)}
              onOpenConvertModal={handleOpenConvertModal}
              onBackToDashboard={() => setActiveView('dashboard')}
              onUploadSuccess={handleUploadSuccess}
              lang={lang}
            />
          )}

          {activeView === 'workbooks' && (
            <WorkbookManagementView
              workbooks={workbooks}
              onSelectWorkbook={handleSelectWorkbook}
              onOpenConvertModal={handleOpenConvertModal}
              onOpenUploadModal={() => setUploadModalOpen(true)}
              lang={lang}
            />
          )}

          {(activeView === 'conversions' || activeView === 'word_files') && (
            <WordFilesView
              conversions={conversions}
              onSelectWorkbook={handleSelectWorkbook}
              lang={lang}
            />
          )}

          {activeView === 'notifications' && (
            <NotificationsView
              onSelectWorkbook={handleSelectWorkbook}
              lang={lang}
            />
          )}

          {activeView === 'collaboration' && (
            <CollaborationView
              currentUser={currentUser}
              workbooks={workbooks}
              onSelectWorkbook={handleSelectWorkbook}
              showToast={showToast}
              lang={lang}
            />
          )}

          {/* DEDICATED FULL-PAGE USER PROFILE CONTAINER VIEW */}
          {activeView === 'profile' && (
            <UserProfileView
              currentUser={currentUser}
              userPhoto={userPhoto}
              setUserPhoto={setUserPhoto}
              onBackToDashboard={() => setActiveView('dashboard')}
              onLogout={() => setIsAuthenticated(false)}
              lang={lang}
              showToast={showToast}
            />
          )}

          {activeView === 'users' && (
            <UserManagementView lang={lang} />
          )}

        </main>
      </div>

      {/* Modals */}
      {uploadModalOpen && (
        <FileUploader
          onClose={() => setUploadModalOpen(false)}
          onUploadSuccess={handleUploadSuccess}
          lang={lang}
        />
      )}

      {convertModal.isOpen && (
        <SheetToWordModal
          workbook={convertModal.workbook}
          initialSheetName={convertModal.sheetName}
          onClose={() => setConvertModal({ isOpen: false, workbook: null, sheetName: '' })}
          onConversionComplete={handleConversionComplete}
        />
      )}

      {/* ─── GLOBAL FLOATING TOAST POP-UP SYSTEM (TOP OF SCREEN) ─── */}
      {toast.visible && (() => {
        const toastConfig = getToastStyle(toast.type);
        return (
          <div style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 99999,
            background: toastConfig.bg,
            color: '#FFFFFF',
            padding: '0.85rem 1.4rem',
            borderRadius: '14px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.875rem',
            fontWeight: 700,
            border: `1.5px solid ${toastConfig.border}`,
            animation: 'fadeIn 0.3s ease'
          }}>
            {toastConfig.icon}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast({ ...toast, visible: false })}
              style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', marginLeft: '6px' }}
            >
              <X size={16} />
            </button>
          </div>
        );
      })()}

    </div>
  );
}
