'use client';

import { useState, useEffect } from 'react';
import Game from '@/components/game/Game';
import { loadMiningSave, MiningSave } from '@/lib/game/save';
import { loadInventory, MiningInventory, DEFAULT_INVENTORY } from '@/lib/game/inventory';

interface MinerarViewProps {
  onBack: () => void;
  username: string;
  bankBalance: number;
  onSpend: (amount: number) => Promise<void>;
}

export default function MinerarView({ onBack, username, bankBalance, onSpend }: MinerarViewProps) {
  const [save, setSave] = useState<MiningSave | null | undefined>(undefined);
  const [inventory, setInventory] = useState<MiningInventory | undefined>(undefined);

  useEffect(() => {
    Promise.all([
      loadMiningSave(username),
      loadInventory(username),
    ]).then(([saveData, invData]) => {
      setSave(saveData ?? null);
      setInventory(invData ?? DEFAULT_INVENTORY);
    });
  }, [username]);

  if (save === undefined || inventory === undefined) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: '#0a0a0f' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#72E8F6] border-t-transparent rounded-full animate-spin" />
          <span className="text-white/60 text-sm font-medium">Carregando progresso...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50" style={{ background: '#0a0a0f' }}>
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

      <Game
        username={username}
        initialSave={save}
        initialInventory={inventory}
        bankBalance={bankBalance}
        onSpend={onSpend}
      />
    </div>
  );
}

