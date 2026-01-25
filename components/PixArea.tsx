
import React from 'react';
import { PlayerData } from '../types';

interface PixAreaProps {
  onBack: () => void;
  player: PlayerData;
}

const PixArea: React.FC<PixAreaProps> = ({ onBack, player }) => {
  const primaryColor = '#72E8F6';

  return (
    <div className="flex-1 flex flex-col page-enter bg-white">
      <header className="bg-white pt-12 pb-8 px-6 border-b border-[#EDEDED]">
        <div className="flex justify-between items-start mb-6">
          <button 
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors active:scale-90"
            style={{ color: primaryColor }}
          >
            <span className="material-icons-outlined">chevron_left</span>
          </button>
          <div className="flex gap-4 text-[#6B6B6B]">
            <span className="material-icons-outlined cursor-pointer hover:opacity-60">help_outline</span>
            <span className="material-icons-outlined cursor-pointer hover:opacity-60">mail_outline</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">Área Pix</h1>
        <p className="text-sm text-[#6B6B6B] mt-1">Envie e receba pagamentos a qualquer hora no servidor.</p>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        <div className="p-6">
          <h2 className="text-lg font-bold mb-5 text-[#1A1A1A]">Enviar e receber</h2>
          <div className="space-y-4">
            {[
              { icon: 'payments', title: 'Transferir', sub: 'Envie coins para outros jogadores' },
              { icon: 'qr_code_2', title: 'Cobrar', sub: 'Receba coins via QR Code ou link' },
              { icon: 'content_copy', title: 'Pix Copia e Cola', sub: 'Cole um código para pagar' }
            ].map((item, idx) => (
              <button 
                key={idx}
                className="w-full flex items-center p-4 bg-[#F5F6F7] rounded-2xl hover:bg-[#EDEDED] transition-colors active:scale-[0.98]"
              >
                <div className="bg-white p-3 rounded-full mr-4 shadow-sm">
                  <span className="material-icons-outlined" style={{ color: primaryColor }}>{item.icon}</span>
                </div>
                <div className="text-left flex-1">
                  <span className="block font-bold text-[#1A1A1A] text-[15px]">{item.title}</span>
                  <span className="text-xs text-[#6B6B6B] font-medium">{item.sub}</span>
                </div>
                <span className="material-icons-outlined text-gray-300">chevron_right</span>
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 py-6 border-t border-[#EDEDED]">
          <h2 className="text-lg font-bold mb-4 text-[#1A1A1A]">Minha chave</h2>
          <div className="bg-white border border-[#EDEDED] rounded-2xl p-5 space-y-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center bg-[#F5F6F7] rounded-full flex-shrink-0">
                  <span className="material-icons-outlined text-lg" style={{ color: primaryColor }}>person</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: primaryColor }}>NICKNAME DO JOGADOR</p>
                  <p className="font-bold text-[#1A1A1A] mt-1 text-base">{player.nick}</p>
                </div>
              </div>
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors" style={{ color: primaryColor }}>
                <span className="material-icons-outlined text-xl">content_copy</span>
              </button>
            </div>
          </div>
          <button 
            className="mt-6 w-full py-4 font-bold text-center border-2 rounded-full transition-all active:scale-95 text-sm"
            style={{ color: primaryColor, borderColor: primaryColor }}
          >
            Gerenciar minhas chaves
          </button>
        </div>
      </div>
    </div>
  );
};

export default PixArea;
