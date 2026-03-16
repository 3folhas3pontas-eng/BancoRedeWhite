'use client';

import { View, PlayerData } from '@/lib/types';

interface HomeViewProps {
  player: PlayerData;
  isBalanceVisible: boolean;
  toggleBalance: () => void;
  onAction: (view: View) => void;
  onLogout: () => void;
}

const primaryColor = '#72E8F6';
const logoutColor = '#E74C3C';

export default function HomeView({
  player,
  isBalanceVisible,
  toggleBalance,
  onAction,
  onLogout,
}: HomeViewProps) {
  const skinHeadUrl = `https://mc-heads.net/head/${player.nick}/128`;

  return (
    <div className="flex-1 overflow-y-auto hide-scrollbar pb-32 bg-white flex flex-col items-center">
      <div className="w-full max-w-5xl px-6 md:px-12">
        {/* Header */}
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
              <span className="material-icons-outlined text-2xl" style={{ color: logoutColor }}>
                logout
              </span>
            </button>
          </div>
        </header>

        {/* Perfil */}
        <div className="pb-12 flex items-center gap-6">
          <div className="flex items-center justify-center transition-all duration-300 hover:scale-110">
            <img
              src={skinHeadUrl}
              alt={`Skin de ${player.nick}`}
              className="w-24 h-24 object-contain drop-shadow-2xl"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://mc-heads.net/head/Steve/128';
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
              <h2 className="text-xs font-bold text-[#6B6B6B] uppercase tracking-widest">
                Saldo em coins
              </h2>
              <span className="material-icons-outlined text-gray-300 group-hover:translate-x-1 transition-transform group-hover:text-cyan-400">
                chevron_right
              </span>
            </div>
            <div className="flex flex-col relative z-10">
              {isBalanceVisible ? (
                <span className="text-6xl font-extrabold tracking-tighter text-[#1A1A1A]">
                  $ {player.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              ) : (
                <div className="h-16 w-64 bg-gray-50 rounded-2xl animate-pulse mt-2" />
              )}
            </div>
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-cyan-50/40 rounded-full blur-3xl group-hover:bg-cyan-100/40 transition-colors" />
          </section>
        </div>

        {/* Ações Rápidas */}
        <section className="py-4 mb-12">
          <div className="flex items-start gap-8 overflow-x-auto hide-scrollbar pb-6 -mx-2 px-2">
            {[
              { id: View.PIX, label: 'Área Pix', icon: 'pix' },
              { id: View.EXTRATO, label: 'Pagar', icon: 'payments' },
              { id: View.PIX, label: 'Transferir', icon: 'sync_alt' },
              { id: View.LOJAS_ABERTAS, label: 'Shopping', icon: 'shopping_bag' },
              { id: View.EXTRATO, label: 'Extrato', icon: 'description' },
            ].map((action, idx) => (
              <div
                key={`${action.label}-${idx}`}
                className="flex flex-col items-center gap-4 group cursor-pointer min-w-[80px]"
                onClick={() => onAction(action.id)}
              >
                <div className="w-20 h-20 bg-[#F5F6F7] rounded-full flex items-center justify-center group-active:scale-90 transition-all shadow-sm group-hover:bg-cyan-50">
                  <span
                    className="material-icons-outlined text-3xl group-hover:scale-110 transition-transform"
                    style={{ color: primaryColor }}
                  >
                    {action.icon}
                  </span>
                </div>
                <span className="text-xs font-bold text-[#1A1A1A] tracking-tight">{action.label}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#F5F6F7] to-transparent mb-12" />

        {/* Botao Minerar */}
        <section className="w-full mb-16 flex justify-center">
          <button
            onClick={() => onAction(View.MINERAR)}
            className="relative flex items-center justify-center gap-3 w-full max-w-sm px-8 py-5 rounded-[28px] font-extrabold text-[#1A1A1A] text-lg tracking-tight overflow-hidden group transition-all active:scale-95 shadow-[0_8px_40px_0_rgba(114,232,246,0.35)] hover:shadow-[0_12px_50px_0_rgba(114,232,246,0.55)]"
            style={{ background: 'linear-gradient(135deg, #72E8F6 0%, #3dd6e8 60%, #00c2d4 100%)' }}
          >
            {/* brilho interno */}
            <span className="absolute inset-0 rounded-[28px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 60%)' }} />
            <span className="material-icons-outlined text-2xl relative z-10">diamond</span>
            <span className="relative z-10 uppercase tracking-widest text-sm font-black">Minerar</span>
          </button>
        </section>
      </div>
    </div>
  );
}
