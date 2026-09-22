import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import SplashScreen from './pages/SplashScreen';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Round1Quiz from './pages/Round1Quiz';
import Round2Debug from './pages/Round2Debug';
import Round3Hunt from './pages/Round3Hunt';
import AdminPortal from './pages/AdminPortal';
import CoordinatorPortal from './pages/CoordinatorPortal';

function MainContent() {
  const { currentScreen } = useApp();

  switch (currentScreen) {
    case 'splash':
      return <SplashScreen />;
    case 'landing':
      return <LandingPage />;
    case 'login':
      return <LoginPage />;
    case 'dashboard':
      return <Dashboard />;
    case 'round1':
      return <Round1Quiz />;
    case 'round2':
      return <Round2Debug />;
    case 'round3':
      return <Round3Hunt />;
    case 'admin':
      return <AdminPortal />;
    case 'coordinator':
      return <CoordinatorPortal />;
    default:
      return <Dashboard />;
  }
}

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
