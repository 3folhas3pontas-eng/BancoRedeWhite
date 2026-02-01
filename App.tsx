
import React, { useState, useEffect, useCallback } from 'react';
import { View, PlayerData } from './types';
import LoginView from './components/LoginView';
import HomeView from './components/HomeView';
import PixArea from './components/PixArea';
import StatementArea from './components/StatementArea';
import BottomNav from './components/BottomNav';
import LojasAbertasView from './components/LojasAbertasView';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mmmazuwqcssymohcdzyj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_bf0YEm9kQ92T5U9WFbKeeg_clS4zyLc';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.LOGIN);
  const [user, setUser] = useState<PlayerData | null>(null);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

  const refreshUserData = useCallback(async (username: string) => {
    try {
      const { data, error } = await supabase
        .from('rede_white_accounts')
        .select('*')
        .eq('username', username)
        .single();

      if (data && !error) {
        setUser({
          nick: data.username,
          uuid: data.uuid,
          balance: parseFloat(data.balance || '0'),
          creditLimit: 0,
          currentInvoice: 0
        });
      }
    } catch (e) {
      console.error("Erro ao atualizar dados:", e);
    }
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('whitebank_saved_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser) as PlayerData;
      setUser(parsedUser);
      setCurrentView(View.HOME);
      refreshUserData(parsedUser.nick);
    }
  }, [refreshUserData]);

  useEffect(() => {
    if (user && currentView !== View.LOGIN) {
      const interval = setInterval(() => {
        refreshUserData(user.nick);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [user, currentView, refreshUserData]);

  const handleLoginSuccess = (playerData: PlayerData, remember: boolean) => {
    setUser(playerData);
    setCurrentView(View.HOME);
    if (remember) {
      localStorage.setItem('whitebank_saved_user', JSON.stringify(playerData));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('whitebank_saved_user');
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
        return <StatementArea onBack={() => setCurrentView(View.HOME)} player={user} />;
      case View.LOJAS_ABERTAS:
        return <LojasAbertasView onBack={() => setCurrentView(View.HOME)} />;
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
    <div className="min-h-screen bg-white flex flex-col items-center">
      <div className="w-full max-w-[1200px] min-h-screen relative flex flex-col bg-white">
        {renderView()}
        {user && currentView !== View.LOGIN && currentView !== View.PIX && (
          <BottomNav currentView={currentView} onNavigate={setCurrentView} />
        )}
      </div>
    </div>
  );
};

export default App;
