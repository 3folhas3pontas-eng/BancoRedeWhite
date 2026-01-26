import React from 'react';
import { Transaction } from '../types';

interface StatementAreaProps {
  onBack: () => void;
}

const StatementArea: React.FC<StatementAreaProps> = ({ onBack }) => {
  const primaryColor = '#72E8F6';
  const greenIn = '#2ECC71';
  const redOut = '#E74C3C';

  const transactions: Transaction[] = [
    { id: '1', type: 'pix_enviado', title: 'Transferência enviada', description: 'Steve_Miner', amount: 1250, date: 'HOJE', time: '14:20', isNegative: true },
    { id: '2', type: 'pix_recebido', title: 'Transferência recebida', description: 'Alex_Builder', amount: 500, date: 'HOJE', time: '11:05', isNegative: false },
    { id: '3', type: 'compra', title: 'Compra no débito', description: 'Loja de Itens Raros', amount: 3420.90, date: 'ONTEM', time: '18:45', isNegative: true },
    { id: '4', type: 'pix_enviado', title: 'Transferência enviada', description: 'Creeper_Hunter99', amount: 50, date: 'ONTEM', time: '15:30', isNegative: true },
    { id: '5', type: 'recompensa', title: 'Venda de Diamantes', description: 'Leilão Global', amount: 15000, date: '12 JAN', time: '09:15', isNegative: false },
    { id: '6', type: 'estorno', title: 'Transferência cancelada', description: 'Enderman_CEO', amount: 0, date: '12 JAN', time: '08:00', isNegative: false, cancelled: true },
  ];

  const grouped = transactions.reduce((acc, tx) => {
    if (!acc[tx.date]) acc[tx.date] = [];
    acc[tx.date].push(tx);
    return acc;
  }, {} as Record<string, Transaction[]>);

  const getIcon = (type: string) => {
    switch (type) {
      case 'pix_enviado': return { icon: 'payments', color: `text-[${primaryColor}]` };
      case 'pix_recebido': return { icon: 'call_received', color: `text-[${greenIn}]` };
      case 'compra': return { icon: 'shopping_bag', color: 'text-gray-400' };
      case 'recompensa': return { icon: 'account_balance_wallet', color: `text-[${greenIn}]` };
      case 'estorno': return { icon: 'error_outline', color: 'text-gray-300' };
      default: return { icon: 'receipt', color: 'text-gray-400' };
    }
  };

  return (
    <div className="flex-1 flex flex-col page-enter bg-white">
      <header className="bg-white pt-12 pb-6 px-6 shadow-sm border-b border-[#EDEDED] z-10 sticky top-0">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors active:scale-90" style={{ color: primaryColor }}>
            <span className="material-icons-outlined">arrow_back</span>
          </button>
          <h1 className="text-lg font-bold tracking-tight text-[#1A1A1A]">Extrato</h1>
          <button className="p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors text-[#6B6B6B]">
            <span className="material-icons-outlined">search</span>
          </button>
        </div>
        <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-1">
          {['Tudo', 'Entradas', 'Saídas'].map((tab, i) => (
            <button 
              key={tab} 
              className={`px-6 py-1.5 rounded-full text-sm font-bold border transition-all ${i === 0 ? 'text-white border-transparent' : 'text-[#6B6B6B] border-[#EDEDED] bg-[#F5F6F7]'}`}
              style={i === 0 ? { backgroundColor: primaryColor } : {}}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar p-6">
        {Object.entries(grouped).map(([date, items]) => (
          <div key={date} className="mb-10">
            <h2 className="text-[11px] font-bold text-gray-400 mb-6 uppercase tracking-[0.15em]">{date}</h2>
            <div className="space-y-8">
              {items.map((tx) => {
                const { icon } = getIcon(tx.type);
                const isNegative = tx.isNegative;
                const txColor = tx.cancelled ? '#9CA3AF' : (isNegative ? redOut : greenIn);

                return (
                  <div key={tx.id} className="flex items-start justify-between group active:scale-[0.98] transition-transform cursor-pointer">
                    <div className="flex space-x-4">
                      <div className="mt-1 flex items-center justify-center w-11 h-11 rounded-full bg-[#F5F6F7] text-gray-400">
                        <span className="material-icons-outlined text-[20px]">{icon}</span>
                      </div>
                      <div className="flex flex-col">
                        <p className={`font-bold text-[15px] text-[#1A1A1A] ${tx.cancelled ? 'line-through text-gray-400' : ''}`}>
                          {tx.title}
                        </p>
                        <p className={`text-sm ${tx.cancelled ? 'text-gray-300' : 'text-[#6B6B6B]'} font-medium`}>
                          {tx.description}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-1 font-semibold">{tx.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {tx.cancelled ? (
                        <p className="font-bold text-sm text-gray-300 italic">Estornado</p>
                      ) : (
                        <p className="font-bold text-[16px]" style={{ color: txColor }}>
                          {isNegative ? '-' : '+'} $ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default StatementArea;