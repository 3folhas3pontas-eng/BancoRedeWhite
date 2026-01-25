
import React from 'react';
import { View, PlayerData } from '../types';

interface HomeViewProps {
  player: PlayerData;
  isBalanceVisible: boolean;
  toggleBalance: () => void;
  onAction: (view: View) => void;
  onLogout: () => void;
}

const HomeView: React.FC<HomeViewProps> = ({ player, isBalanceVisible, toggleBalance, onAction, onLogout }) => {
  const primaryColor = '#72E8F6';

  return (
    <div className="flex-1 overflow-y-auto hide-scrollbar pb-32 bg-white">
      {/* Header - White & Clean */}
      <header className="px-6 pt-12 pb-6 flex flex-col gap-6 bg-white border-b border-[#EDEDED]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#EDEDED]">
              <img 
                src="https://i.imgur.com/bPt3G5b.jpeg" 
                alt="RedeWhite Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#1A1A1A]">
              Rede<span style={{ color: primaryColor }}>White</span>
            </h1>
          </div>
          <div className="flex items-center gap-4 text-[#6B6B6B]">
            <button onClick={toggleBalance} className="hover:opacity-60 transition-opacity">
              <span className="material-icons-outlined text-2xl">
                {isBalanceVisible ? 'visibility' : 'visibility_off'}
              </span>
            </button>
            <button onClick={onLogout} className="hover:opacity-60 transition-opacity">
              <span className="material-icons-outlined text-2xl">logout</span>
            </button>
          </div>
        </div>
        <div className="flex flex-col">
          <h2 className="text-[#1A1A1A] text-lg font-bold">Olá, {player.nick}</h2>
          <p className="text-[#6B6B6B] text-[11px] font-medium mt-0.5">Bem-vindo ao banco da RedeWhite</p>
        </div>
      </header>

      {/* Main Content Area */}
      <main>
        {/* Balance Section */}
        <section 
          className="px-6 py-8 group cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => onAction(View.EXTRATO)}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#1A1A1A]">Saldo disponível</h2>
            <span className="material-icons-outlined text-gray-300 group-hover:translate-x-1 transition-transform">chevron_right</span>
          </div>
          <div className="flex flex-col">
            {isBalanceVisible ? (
              <span className="text-3xl font-bold tracking-tight text-[#1A1A1A]">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(player.balance).replace('R$', 'W$')}
              </span>
            ) : (
              <div className="h-10 w-48 bg-gray-100 rounded-lg animate-pulse"></div>
            )}
          </div>
        </section>

        {/* Action Horizontal Scroll */}
        <section className="py-2 overflow-x-auto hide-scrollbar flex gap-4 px-6 mb-4">
          {[
            { id: View.PIX, label: 'Pix', icon: 'pix' },
            { id: View.EXTRATO, label: 'Pagar', icon: 'payments' },
            { id: View.EXTRATO, label: 'Transferir', icon: 'sync_alt' },
            { id: View.EXTRATO, label: 'Depositar', icon: 'south' },
            { id: View.EXTRATO, label: 'Extrato', icon: 'description' }
          ].map((action) => (
            <div 
              key={action.label} 
              className="flex flex-col items-center gap-3 group cursor-pointer min-w-[72px]"
              onClick={() => onAction(action.id)}
            >
              <div 
                className="w-16 h-16 bg-[#F5F6F7] rounded-full flex items-center justify-center group-active:scale-90 transition-transform"
                style={{ color: primaryColor }}
              >
                <span className="material-icons-outlined text-2xl">{action.icon}</span>
              </div>
              <span className="text-xs font-bold text-center text-[#1A1A1A]">{action.label}</span>
            </div>
          ))}
        </section>

        {/* My Cards Card */}
        <section className="px-6 py-4">
          <div className="bg-[#F5F6F7] rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-[#EDEDED] transition-colors">
            <span className="material-icons-outlined" style={{ color: primaryColor }}>credit_card</span>
            <span className="text-sm font-bold text-[#1A1A1A]">Meus cartões</span>
          </div>
        </section>

        {/* Account Info Section */}
        <section className="px-6 py-8 border-t border-[#EDEDED] mt-6">
          <div className="flex items-center justify-between mb-4 group cursor-pointer">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="material-icons-outlined text-xl" style={{ color: primaryColor }}>account_balance</span>
                <h2 className="text-lg font-bold text-[#1A1A1A]">Serviços RedeWhite</h2>
              </div>
            </div>
            <span className="material-icons-outlined text-gray-300 group-hover:translate-x-1 transition-transform">chevron_right</span>
          </div>
          <p className="text-[#6B6B6B] text-sm font-medium">Sua conta é {player.uuid !== 'N/A' ? 'Verificada' : 'Pendente'}. Gerencie seus coins do servidor com segurança.</p>
        </section>
      </main>
    </div>
  );
};

export default HomeView;
