
import React, { useState } from 'react';
import { View, PlayerData } from './types';
import LoginView from './components/LoginView';
import HomeView from './components/HomeView';
import PixArea from './components/PixArea';
import StatementArea from './components/StatementArea';
import BottomNav from './components/BottomNav';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.LOGIN);
  const [user, setUser] = useState<PlayerData | null>(null);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

  const handleLoginSuccess = (playerData: PlayerData) => {
    setUser(playerData);
    setCurrentView(View.HOME);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView(View.LOGIN);
  };

  const renderView = () => {
    if (!user || currentView === View.LOGIN) {
      return <LoginView onLoginSuccess={handleLoginSuccess} />;
    }

    switch (currentView) {
      case View.PIX:
        return <PixArea onBack={() => setCurrentView(View.HOME)} player={user} />;
      case View.EXTRATO:
        return <StatementArea onBack={() => setCurrentView(View.HOME)} />;
      case View.HOME:
      default:
        return (
          <HomeView 
            player={user} 
            isBalanceVisible={isBalanceVisible} 
            toggleBalance={() => setIsBalanceVisible(!isBalanceVisible)}
            onAction={(view) => setCurrentView(view)}
            onLogout={handleLogout}
          />
        );
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-[430px] bg-white min-h-screen relative flex flex-col shadow-2xl overflow-hidden">
        {renderView()}
        {user && currentView !== View.LOGIN && (
          <BottomNav currentView={currentView} onNavigate={setCurrentView} />
        )}
      </div>
    </div>
  );
};

export default App;
