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
    <div className="flex-1 overflow-y-auto hide-scrollbar pb-32 bg-white flex flex-col items-center">
      <div className="w-full max-w-4xl px-4 md:px-8">
        {/* Header */}
        <header className="py-8 md:py-12 flex flex-col gap-6 bg-white border-b border-[#EDEDED]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden border border-[#EDEDED]">
                <img 
                  src="https://i.imgur.com/bPt3G5b.jpeg" 
                  alt="RedeWhite Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#1A1A1A]">
                Rede<span style={{ color: primaryColor }}>White</span>
              </h1>
            </div>
            <div className="flex items-center gap-4 text-[#6B6B6B]">
              <button onClick={toggleBalance} className="hover:opacity-60 transition-opacity p-2 bg-[#F5F6F7] rounded-full">
                <span className="material-icons-outlined text-2xl">
                  {isBalanceVisible ? 'visibility' : 'visibility_off'}
                </span>
              </button>
              <button onClick={onLogout} className="hover:opacity-60 transition-opacity p-2 bg-[#F5F6F7] rounded-full">
                <span className="material-icons-outlined text-2xl text-red-400">logout</span>
              </button>
            </div>
          </div>
          <div className="flex flex-col">
            <h2 className="text-[#1A1A1A] text-xl font-bold">Olá, {player.nick}</h2>
            <p className="text-[#6B6B6B] text-xs font-medium mt-0.5">Sua conta está ativa e segura.</p>
          </div>
        </header>

        {/* Main Grid for PC */}
        <main className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Balance Card */}
          <section 
            className="p-6 md:p-8 rounded-3xl bg-white border border-[#EDEDED] shadow-sm group cursor-pointer hover:border-primary transition-all"
            onClick={() => onAction(View.EXTRATO)}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-[#6B6B6B]">Saldo disponível</h2>
              <span className="material-icons-outlined text-gray-300 group-hover:translate-x-1 transition-transform">chevron_right</span>
            </div>
            <div className="flex flex-col">
              {isBalanceVisible ? (
                <span className="text-3xl md:text-4xl font-bold tracking-tight text-[#1A1A1A]">
                  $ {player.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              ) : (
                <div className="h-10 w-48 bg-gray-100 rounded-lg animate-pulse"></div>
              )}
            </div>
          </section>

          {/* My Cards Card */}
          <section className="p-6 md:p-8 rounded-3xl bg-[#F5F6F7] flex flex-col justify-center gap-4 cursor-pointer hover:bg-[#EDEDED] transition-all">
            <div className="flex items-center gap-4">
              <span className="material-icons-outlined text-3xl" style={{ color: primaryColor }}>credit_card</span>
              <span className="text-lg font-bold text-[#1A1A1A]">Meus cartões</span>
            </div>
            <p className="text-xs text-[#6B6B6B] font-medium">Gerencie seus limites e cartões virtuais aqui.</p>
          </section>

          {/* Action Area - Row/Grid */}
          <section className="md:col-span-2 py-4">
            <div className="flex overflow-x-auto md:grid md:grid-cols-5 gap-4 hide-scrollbar">
              {[
                { id: View.PIX, label: 'Pix', icon: 'pix' },
                { id: View.EXTRATO, label: 'Pagar', icon: 'payments' },
                { id: View.EXTRATO, label: 'Transferir', icon: 'sync_alt' },
                { id: View.EXTRATO, label: 'Depositar', icon: 'south' },
                { id: View.EXTRATO, label: 'Extrato', icon: 'description' }
              ].map((action) => (
                <div 
                  key={action.label} 
                  className="flex flex-col items-center gap-3 group cursor-pointer min-w-[80px]"
                  onClick={() => onAction(action.id)}
                >
                  <div 
                    className="w-16 h-16 md:w-20 md:h-20 bg-[#F5F6F7] rounded-full flex items-center justify-center group-active:scale-90 md:hover:bg-[#E8FBFE] transition-all"
                    style={{ color: primaryColor }}
                  >
                    <span className="material-icons-outlined text-2xl md:text-3xl">{action.icon}</span>
                  </div>
                  <span className="text-xs font-bold text-center text-[#1A1A1A]">{action.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Info Banner */}
          <section className="md:col-span-2 p-6 border-t border-[#EDEDED] flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="material-icons-outlined text-xl" style={{ color: primaryColor }}>shield</span>
              <h3 className="font-bold text-[#1A1A1A]">Segurança RedeWhite</h3>
            </div>
            <p className="text-[#6B6B6B] text-sm leading-relaxed">
              Sua conta é <strong>Verificada</strong>. Protegemos seus coins com criptografia de ponta a ponta integrada ao servidor.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
};

export default HomeView;