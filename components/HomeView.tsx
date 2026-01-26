
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
      {/* Top Header - Logo left, Icons right */}
      <div className="w-full max-w-5xl px-6 md:px-12">
        <header className="py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm">
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
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleBalance} 
              className="p-2.5 hover:bg-gray-50 rounded-full transition-colors active:scale-90"
            >
              <span className="material-icons-outlined text-2xl text-[#6B6B6B]">
                {isBalanceVisible ? 'visibility' : 'visibility_off'}
              </span>
            </button>
            <button 
              onClick={onLogout} 
              className="p-2.5 hover:bg-gray-50 rounded-full transition-colors active:scale-90"
            >
              <span className="material-icons-outlined text-2xl text-[#6B6B6B]">logout</span>
            </button>
          </div>
        </header>

        {/* Greeting Section */}
        <div className="py-4">
          <h2 className="text-[#1A1A1A] text-2xl font-bold">Olá, {player.nick}</h2>
          <p className="text-[#6B6B6B] text-sm font-medium mt-1 opacity-70">Sua conta está ativa e segura.</p>
        </div>

        {/* Divider */}
        <div className="w-full h-[1px] bg-[#EDEDED] my-6"></div>

        {/* Balance Area - Full Width "Até o final" */}
        <div className="w-full mb-8">
          <section 
            className="w-full p-6 md:p-8 rounded-[32px] bg-[#F5F6F7] group cursor-pointer hover:bg-[#F0F1F2] transition-all"
            onClick={() => onAction(View.EXTRATO)}
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-[#6B6B6B]">Saldo disponível</h2>
              <span className="material-icons-outlined text-gray-400 group-hover:translate-x-1 transition-transform">chevron_right</span>
            </div>
            <div className="flex flex-col">
              {isBalanceVisible ? (
                <span className="text-4xl md:text-5xl font-bold tracking-tight text-[#1A1A1A]">
                  $ {player.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              ) : (
                <div className="h-10 w-48 bg-gray-200/50 rounded-xl animate-pulse mt-2"></div>
              )}
            </div>
          </section>
        </div>

        {/* Action Area - Horizontal Scroll */}
        <section className="w-full py-4 mb-4">
          <div className="flex items-start gap-4 md:gap-8 overflow-x-auto hide-scrollbar pb-2">
            {[
              { id: View.PIX, label: 'Pix', icon: 'pix' },
              { id: View.EXTRATO, label: 'Pagar', icon: 'payments' },
              { id: View.EXTRATO, label: 'Transferir', icon: 'sync_alt' },
              { id: View.EXTRATO, label: 'Depositar', icon: 'south' },
              { id: View.EXTRATO, label: 'Extrato', icon: 'description' }
            ].map((action) => (
              <div 
                key={action.label} 
                className="flex flex-col items-center gap-2 group cursor-pointer min-w-[70px] md:min-w-[80px]"
                onClick={() => onAction(action.id)}
              >
                <div className="w-16 h-16 bg-[#F5F6F7] rounded-full flex items-center justify-center group-active:scale-95 transition-all group-hover:bg-[#EDEDED]">
                  <span className="material-icons-outlined text-2xl text-[#1A1A1A]">{action.icon}</span>
                </div>
                <span className="text-xs font-bold text-center text-[#1A1A1A]">{action.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="w-full h-[1px] bg-[#EDEDED] mb-8"></div>

        {/* Security Banner */}
        <section className="mb-8">
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-[#F5F6F7]/50 border border-[#EDEDED]">
            <span className="material-icons-outlined text-2xl mt-0.5" style={{ color: primaryColor }}>shield</span>
            <div className="flex flex-col gap-1">
              <h3 className="font-bold text-[#1A1A1A] text-sm">Segurança RedeWhite</h3>
              <p className="text-[#6B6B6B] text-xs leading-relaxed max-w-md">
                Sua conta é <strong>Verificada</strong>. Protegemos seus coins com criptografia de ponta a ponta integrada ao servidor.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomeView;
