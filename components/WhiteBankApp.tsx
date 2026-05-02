'use client';

import { useState, useEffect, useCallback } from 'react';
import { View, PlayerData } from '@/lib/types';
import LoginView from '@/components/LoginView';
import HomeView from '@/components/HomeView';
import PixArea from '@/components/PixArea';
import StatementArea from '@/components/StatementArea';
import BottomNav from '@/components/BottomNav';
import MinerarView from '@/components/MinerarView';
import LojasAbertasView from '@/components/LojasAbertasView';

export default function WhiteBankApp() {
  const [currentView, setCurrentView] = useState<View>(View.LOGIN);
  const [user, setUser] = useState<PlayerData | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

  const refreshUserData = useCallback(async (username: string) => {
    try {
      const token = sessionToken || localStorage.getItem('whitebank_session_token');
      console.log('[v0] refreshUserData chamado, token:', token ? 'existe' : 'null');
      if (!token) return;

      const response = await fetch('/api/user/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, session_token: token })
      });

      console.log('[v0] API response status:', response.status);
      const data = await response.json();
      console.log('[v0] API response data:', data);

      if (response.ok && data.success) {
        console.log('[v0] Atualizando balance para:', data.balance);
        setUser((prev) => prev ? {
          ...prev,
          balance: data.balance
        } : prev);
      }
    } catch (e) {
      console.error('[v0] Erro ao atualizar dados:', e);
    }
  }, [sessionToken]);

  useEffect(() => {
    const savedUser = localStorage.getItem('whitebank_saved_user');
    const savedToken = localStorage.getItem('whitebank_session_token');
    if (savedUser && savedToken) {
      const parsedUser = JSON.parse(savedUser) as PlayerData;
      setUser(parsedUser);
      setSessionToken(savedToken);
      setCurrentView(View.HOME);
      refreshUserData(parsedUser.nick);
    }
  }, [refreshUserData]);

  useEffect(() => {
    if (user && currentView !== View.LOGIN) {
      // Atualiza saldo a cada 2 segundos para ser praticamente em tempo real
      const interval = setInterval(() => {
        refreshUserData(user.nick);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [user, currentView, refreshUserData]);

  const handleLoginSuccess = (playerData: PlayerData, remember: boolean, token: string) => {
    setUser(playerData);
    setSessionToken(token);
    setCurrentView(View.HOME);
    if (remember) {
      localStorage.setItem('whitebank_saved_user', JSON.stringify(playerData));
      localStorage.setItem('whitebank_session_token', token);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('whitebank_saved_user');
    localStorage.removeItem('whitebank_session_token');
    setUser(null);
    setSessionToken(null);
    setCurrentView(View.LOGIN);
  };

  const renderView = () => {
    if (!user || currentView === View.LOGIN) {
      return <LoginView onLoginSuccess={handleLoginSuccess} />;
    }

    switch (currentView) {
      case View.PIX:
        return <PixArea onBack={() => setCurrentView(View.HOME)} player={user} sessionToken={sessionToken || ''} />;
      case View.EXTRATO:
        return <StatementArea onBack={() => setCurrentView(View.HOME)} player={user} />;
      case View.LOJAS_ABERTAS:
        return <LojasAbertasView onBack={() => setCurrentView(View.HOME)} />;
      case View.MINERAR:
        return (
          <MinerarView
            onBack={() => {
              refreshUserData(user.nick);
              setCurrentView(View.HOME);
            }}
            username={user.nick}
            bankBalance={user.balance}
            onSpend={async (amount: number) => {
              // Debita e atualiza estado local imediatamente
              const newBalance = user.balance - amount;
              setUser((prev) => prev ? { ...prev, balance: newBalance } : prev);
              const token = sessionToken || localStorage.getItem('whitebank_session_token');
              await fetch('/api/user/update-balance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  username: user.nick, 
                  session_token: token, 
                  new_balance: newBalance 
                })
              });
            }}
          />
        );
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
        {user && currentView !== View.LOGIN && currentView !== View.PIX && currentView !== View.MINERAR && (
          <BottomNav currentView={currentView} onNavigate={setCurrentView} />
        )}
      </div>
    </div>
  );
}
