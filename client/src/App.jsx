import React, { useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import { useApp } from './context/useApp';
import CinematicParticleCanvas from './components/CinematicParticleCanvas';
import SplashScreen from './pages/SplashScreen';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Round1Quiz from './pages/Round1Quiz';
import Round2Debug from './pages/Round2Debug';
import Round3Hunt from './pages/Round3Hunt';
import AdminPortal from './pages/AdminPortal';
import CoordinatorPortal from './pages/CoordinatorPortal';
import CoordinatorModal from './components/CoordinatorModal';
import DisqualificationModal from './components/DisqualificationModal';

function GlobalSecurityWrapper({ children }) {
  useEffect(() => {
    // Disable right-click context menu globally
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // Disable Developer Tools & Inspect keyboard shortcuts
    const handleKeyDown = (e) => {
      // F12 key
      if (e.keyCode === 123) {
        e.preventDefault();
        return false;
      }
      // Ctrl+Shift+I (73), Ctrl+Shift+J (74), Ctrl+Shift+C (67)
      if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
        e.preventDefault();
        return false;
      }
      // Ctrl+U (85 - View Source) or Ctrl+S (83 - Save Page)
      if (e.ctrlKey && (e.keyCode === 85 || e.keyCode === 83)) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return <div>{children}</div>;
}

function MainContent() {
  const { currentScreen, currentUser } = useApp();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen />;
      case 'landing':
        return <LandingPage />;
      case 'login':
        return <LoginPage />;
      case 'dashboard':
        if (currentUser?.role === 'COORDINATOR') return <CoordinatorPortal />;
        if (currentUser?.role === 'ADMIN') return <AdminPortal />;
        return <Dashboard />;
      case 'round1':
        if (currentUser?.role === 'COORDINATOR') return <CoordinatorPortal />;
        if (currentUser?.role === 'ADMIN') return <AdminPortal />;
        return <Round1Quiz />;
      case 'round2':
        if (currentUser?.role === 'COORDINATOR') return <CoordinatorPortal />;
        if (currentUser?.role === 'ADMIN') return <AdminPortal />;
        return <Round2Debug />;
      case 'round3':
        if (currentUser?.role === 'COORDINATOR') return <CoordinatorPortal />;
        if (currentUser?.role === 'ADMIN') return <AdminPortal />;
        return <Round3Hunt />;
      case 'admin':
        if (currentUser?.role === 'COORDINATOR') return <CoordinatorPortal />;
        if (currentUser?.role === 'PARTICIPANT') return <Dashboard />;
        return <AdminPortal />;
      case 'coordinator':
        if (currentUser?.role === 'PARTICIPANT') return <Dashboard />;
        return <CoordinatorPortal />;
      case 'rules':
      case 'announcements':
      case 'profile':
      case 'support':
        return <Dashboard />;
      default:
        if (currentUser?.role === 'ADMIN') return <AdminPortal />;
        if (currentUser?.role === 'COORDINATOR') return <CoordinatorPortal />;
        if (currentUser?.role === 'PARTICIPANT') return <Dashboard />;
        return <LandingPage />;
    }
  };

  return (
    <div key={currentScreen} className="animate-hero-entrance w-full relative z-10">
      {renderScreen()}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <GlobalSecurityWrapper>
        <CinematicParticleCanvas />
        <MainContent />
        <CoordinatorModal />
        <DisqualificationModal />
      </GlobalSecurityWrapper>
    </AppProvider>
  );
}
