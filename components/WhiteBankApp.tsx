'use client';

import { useState, useEffect, useCallback } from 'react';
import { View, PlayerData } from '@/lib/types';
import { supabase } from '@/lib/supabase';
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
          currentInvoice: 0,
        });
      }
    } catch (e) {
      console.error('Erro ao atualizar dados:', e);
    }
  }, []);

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
              // Debita no Supabase e atualiza estado local imediatamente
              const newBalance = user.balance - amount;
              setUser((prev) => prev ? { ...prev, balance: newBalance } : prev);
              await supabase
                .from('rede_white_accounts')
                .update({ balance: newBalance })
                .eq('username', user.nick);
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
