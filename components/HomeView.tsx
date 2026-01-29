
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
  const logoutColor = '#E74C3C';

  return (
    <div className="flex-1 overflow-y-auto hide-scrollbar pb-32 bg-white flex flex-col items-center">
      <div className="w-full max-w-5xl px-6 md:px-12">
        <header className="py-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-100">
              <img src="https://i.imgur.com/bPt3G5b.jpeg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#1A1A1A]">
              White<span style={{ color: primaryColor }}>Bank</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggleBalance} className="p-1 rounded-full hover:bg-gray-50 transition-colors">
              <span className="material-icons-outlined text-2xl text-[#1A1A1A]">
                {isBalanceVisible ? 'visibility' : 'visibility_off'}
              </span>
            </button>
            <button onClick={onLogout} className="p-1 rounded-full hover:bg-gray-50 transition-colors">
              <span className="material-icons-outlined text-2xl" style={{ color: logoutColor }}>logout</span>
            </button>
          </div>
        </header>

        <div className="pb-8">
          <h2 className="text-[#1A1A1A] text-3xl font-bold">Olá, {player.nick}</h2>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Dashboard de Economia In-Game</p>
        </div>

        {/* Balance Card */}
        <div className="mb-12">
          <section 
            className="p-8 rounded-[32px] bg-white border border-[#EDEDED] shadow-sm group cursor-pointer hover:border-[#72E8F6] transition-all"
            onClick={() => onAction(View.EXTRATO)}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[#6B6B6B]">Saldo Virtual (Coins)</h2>
              <span className="material-icons-outlined text-gray-300 group-hover:translate-x-1 transition-transform">chevron_right</span>
            </div>
            <div className="flex flex-col">
              {isBalanceVisible ? (
                <span className="text-5xl font-bold tracking-tight text-[#1A1A1A]">
                  $ {player.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              ) : (
                <div className="h-12 w-48 bg-gray-50 rounded-xl animate-pulse mt-2"></div>
              )}
            </div>
          </section>
        </div>

        {/* Action Area */}
        <section className="py-4 mb-12">
          <div className="flex items-start gap-8 overflow-x-auto hide-scrollbar pb-2">
            {[
              { id: View.PIX, label: 'Enviar Coins', icon: 'pix' },
              { id: View.EXTRATO, label: 'Registros', icon: 'payments' },
              { id: View.EXTRATO, label: 'Mover Coins', icon: 'sync_alt' },
              { id: View.LOJAS_ABERTAS, label: 'Comércio', icon: 'shopping_bag' },
              { id: View.EXTRATO, label: 'Histórico', icon: 'description' }
            ].map((action) => (
              <div 
                key={action.label} 
                className="flex flex-col items-center gap-3 group cursor-pointer min-w-[70px]"
                onClick={() => onAction(action.id)}
              >
                <div className="w-16 h-16 bg-[#F5F6F7] rounded-full flex items-center justify-center group-active:scale-95 transition-all">
                  <span className="material-icons-outlined text-2xl" style={{ color: primaryColor }}>{action.icon}</span>
                </div>
                <span className="text-[12px] font-bold text-[#1A1A1A]">{action.label}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="w-full h-[1px] bg-[#F5F6F7] mb-12"></div>

        {/* Security Info Banner */}
        <section className="mb-12">
          <div className="flex items-start gap-5 p-6 rounded-[24px] bg-[#F5F6F7]/60 border border-[#EDEDED]">
            <span className="material-icons-outlined text-2xl mt-0.5 text-[#72E8F6]">verified_user</span>
            <div className="flex flex-col gap-1">
              <h3 className="font-bold text-[#1A1A1A] text-sm">Proteção Gaming</h3>
              <p className="text-[#6B6B6B] text-[13px] leading-relaxed max-w-xl">
                Suas movimentações de coins ocorrem apenas dentro do servidor Minecraft <strong>RedeWhite</strong>. 
                Este ambiente é seguro e restrito à comunidade de jogadores, sem qualquer vínculo financeiro real.
              </p>
            </div>
          </div>
        </section>

        <footer className="mt-8 pb-12 text-center opacity-30">
          <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
            SIMULADOR DE ECONOMIA PARA JOGO (MINECRAFT) • NÃO É UM BANCO REAL<br/>
            PROJETO INDEPENDENTE PARA A COMUNIDADE REDEWHITE
          </p>
        </footer>
      </div>
    </div>
  );
};

export default HomeView;
