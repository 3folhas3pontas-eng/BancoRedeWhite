
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

  // Usando endpoint /head/ para visualização 3D isométrica de alta qualidade
  const skinHeadUrl = `https://mc-heads.net/head/${player.nick}/128`;

  return (
    <div className="flex-1 overflow-y-auto hide-scrollbar pb-32 bg-white flex flex-col items-center">
      <div className="w-full max-w-5xl px-6 md:px-12">
        {/* Header Superior - Logo aumentada para preencher o container conforme solicitado */}
        <header className="py-10 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-[20px] overflow-hidden border border-gray-100 flex items-center justify-center bg-[#F5F6F7] shadow-sm">
               <img 
                 src="https://i.imgur.com/bPt3G5b.jpeg" 
                 alt="Logo" 
                 className="w-full h-full object-cover" 
               />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tighter text-[#1A1A1A]">
              White<span style={{ color: primaryColor }}>Bank</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggleBalance} className="p-2 rounded-full hover:bg-gray-50 transition-colors">
              <span className="material-icons-outlined text-2xl text-[#1A1A1A]">
                {isBalanceVisible ? 'visibility' : 'visibility_off'}
              </span>
            </button>
            <button onClick={onLogout} className="p-2 rounded-full hover:bg-gray-50 transition-colors">
              <span className="material-icons-outlined text-2xl" style={{ color: logoutColor }}>logout</span>
            </button>
          </div>
        </header>

        {/* Perfil e Saudação - Skin 3D e sem fundo cinza/borda */}
        <div className="pb-12 flex items-center gap-6">
          {/* Skin Head 3D sem o box cinza */}
          <div className="flex items-center justify-center transition-all duration-300 hover:scale-110">
            <img 
              src={skinHeadUrl} 
              alt={`Skin 3D de ${player.nick}`} 
              className="w-24 h-24 object-contain drop-shadow-2xl"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://mc-heads.net/head/Steve/128";
              }}
            />
          </div>
          
          <div className="flex flex-col">
            <h2 className="text-[#1A1A1A] text-4xl font-bold tracking-tight leading-none">
              Olá, {player.nick}
            </h2>
            <p className="text-gray-400 text-[11px] font-black uppercase tracking-[0.25em] mt-3 opacity-80">
              Sua economia virtual RedeWhite
            </p>
          </div>
        </div>

        {/* Card de Saldo */}
        <div className="mb-12">
          <section 
            className="p-10 rounded-[42px] bg-white border border-[#EDEDED] shadow-sm group cursor-pointer hover:border-[#72E8F6] transition-all relative overflow-hidden"
            onClick={() => onAction(View.EXTRATO)}
          >
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h2 className="text-xs font-bold text-[#6B6B6B] uppercase tracking-widest">Saldo em coins</h2>
              <span className="material-icons-outlined text-gray-300 group-hover:translate-x-1 transition-transform group-hover:text-cyan-400">chevron_right</span>
            </div>
            <div className="flex flex-col relative z-10">
              {isBalanceVisible ? (
                <span className="text-6xl font-extrabold tracking-tighter text-[#1A1A1A]">
                  $ {player.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              ) : (
                <div className="h-16 w-64 bg-gray-50 rounded-2xl animate-pulse mt-2"></div>
              )}
            </div>
            {/* Detalhe de fundo dinâmico */}
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-cyan-50/40 rounded-full blur-3xl group-hover:bg-cyan-100/40 transition-colors"></div>
          </section>
        </div>

        {/* Área de Ações Rápidas */}
        <section className="py-4 mb-12">
          <div className="flex items-start gap-8 overflow-x-auto hide-scrollbar pb-6 -mx-2 px-2">
            {[
              { id: View.PIX, label: 'Área Pix', icon: 'pix' },
              { id: View.EXTRATO, label: 'Pagar', icon: 'payments' },
              { id: View.PIX, label: 'Transferir', icon: 'sync_alt' },
              { id: View.LOJAS_ABERTAS, label: 'Shopping', icon: 'shopping_bag' },
              { id: View.EXTRATO, label: 'Extrato', icon: 'description' }
            ].map((action, idx) => (
              <div 
                key={`${action.label}-${idx}`} 
                className="flex flex-col items-center gap-4 group cursor-pointer min-w-[80px]"
                onClick={() => onAction(action.id)}
              >
                <div className="w-20 h-20 bg-[#F5F6F7] rounded-full flex items-center justify-center group-active:scale-90 transition-all shadow-sm group-hover:bg-cyan-50">
                  <span className="material-icons-outlined text-3xl group-hover:scale-110 transition-transform" style={{ color: primaryColor }}>{action.icon}</span>
                </div>
                <span className="text-xs font-bold text-[#1A1A1A] tracking-tight">{action.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Linha Divisora Estilizada */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#F5F6F7] to-transparent mb-12"></div>
      </div>
    </div>
  );
};

export default HomeView;
