'use client';

import Game from '@/components/game/Game';

interface MinerarViewProps {
  onBack: () => void;
}

export default function MinerarView({ onBack }: MinerarViewProps) {
  return (
    <div className="fixed inset-0 z-50" style={{ background: '#0a0a0f' }}>
      {/* Botão voltar flutuante */}
      <button
        onClick={onBack}
        className="absolute top-4 left-4 z-[100] flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95"
        style={{
          background: 'rgba(255,255,255,0.12)',
          color: 'rgba(255,255,255,0.8)',
          border: '1px solid rgba(255,255,255,0.15)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <span className="material-icons-outlined" style={{ fontSize: 16 }}>arrow_back</span>
        Voltar
      </button>

      {/* Jogo de mineração */}
      <Game />
    </div>
  );
}
