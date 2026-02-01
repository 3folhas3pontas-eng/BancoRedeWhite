
import React, { useState, useEffect, useMemo } from 'react';
import { PlayerData } from '../types';
import { createClient } from '@supabase/supabase-js';
import { ArrowLeft, Search, History, RefreshCw, AlertCircle } from 'lucide-react';

const SUPABASE_URL = 'https://mmmazuwqcssymohcdzyj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_bf0YEm9kQ92T5U9WFbKeeg_clS4zyLc';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface Transaction {
  id: number;
  sender_name: string;
  receiver_name: string;
  amount: number;
  status: string;
  created_at: string;
}

interface StatementAreaProps {
  onBack: () => void;
  player: PlayerData;
}

type FilterType = 'Tudo' | 'Entradas' | 'Saídas';

const StatementArea: React.FC<StatementAreaProps> = ({ onBack, player }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('Tudo');

  const primaryColor = '#72E8F6';
  const greenIn = '#2ECC71';
  const redOut = '#E74C3C';

  const fetchTransactions = async () => {
    setLoading(true);
    setError(false);
    try {
      const { data, error } = await supabase
        .from('rede_white_transactions')
        .select('*')
        .or(`sender_name.ilike.${player.nick},receiver_name.ilike.${player.nick}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setTransactions(data);
    } catch (err) {
      console.error("Erro ao carregar extrato:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [player.nick]);

  const formatTransactionDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Hoje';
    if (date.toDateString() === yesterday.toDateString()) return 'Ontem';
    
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  // Lógica de filtragem e agrupamento
  const grouped = useMemo(() => {
    const filtered = transactions.filter(tx => {
      if (activeFilter === 'Tudo') return true;
      const isSent = tx.sender_name.toLowerCase() === player.nick.toLowerCase();
      if (activeFilter === 'Entradas') return !isSent;
      if (activeFilter === 'Saídas') return isSent;
      return true;
    });

    return filtered.reduce((acc, tx) => {
      const day = formatTransactionDate(tx.created_at);
      if (!acc[day]) acc[day] = [];
      acc[day].push(tx);
      return acc;
    }, {} as Record<string, Transaction[]>);
  }, [transactions, activeFilter, player.nick]);

  return (
    <div className="flex-1 flex flex-col page-enter bg-white min-h-screen">
      <header className="bg-white pt-12 pb-6 px-6 shadow-sm border-b border-[#EDEDED] z-10 sticky top-0">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={onBack} 
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors active:scale-90" 
            style={{ color: primaryColor }}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold tracking-tight text-[#1A1A1A]">Extrato</h1>
          <button className="p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors text-[#6B6B6B]">
            <Search className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-1">
            {(['Tudo', 'Entradas', 'Saídas'] as FilterType[]).map((tab) => {
              const isActive = activeFilter === tab;
              return (
                <button 
                  key={tab} 
                  onClick={() => setActiveFilter(tab)}
                  className={`px-6 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    isActive 
                      ? 'text-white border-transparent' 
                      : 'text-[#6B6B6B] border-[#EDEDED] bg-[#F5F6F7] hover:bg-gray-100'
                  }`}
                  style={isActive ? { backgroundColor: primaryColor } : {}}
                >
                  {tab}
                </button>
              );
            })}
          </div>
          <button 
            onClick={fetchTransactions}
            className={`p-2 rounded-full text-gray-300 hover:text-cyan-400 transition-colors ${loading ? 'animate-spin' : ''}`}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar p-6 pb-32">
        {loading && transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-cyan-100 border-t-cyan-400 rounded-full animate-spin"></div>
            <p className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Sincronizando extrato...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-10">
            <AlertCircle className="w-12 h-12 text-red-300 mb-4" />
            <p className="font-bold text-[#1A1A1A]">Erro ao carregar dados</p>
            <p className="text-xs text-gray-400 mt-1">Verifique sua conexão e tente novamente em instantes.</p>
            <button 
              onClick={fetchTransactions}
              className="mt-6 px-6 py-2 rounded-full bg-gray-100 text-xs font-bold text-gray-600 active:scale-95"
            >
              Tentar novamente
            </button>
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
            <History className="w-16 h-16 mb-4 text-gray-300" />
            <p className="font-bold text-[#1A1A1A]">Nenhuma movimentação</p>
            <p className="text-xs font-medium">Não encontramos transações para o filtro selecionado.</p>
          </div>
        ) : (
          (Object.entries(grouped) as [string, Transaction[]][]).map(([day, items]) => (
            <div key={day} className="mb-10">
              <h2 className="text-[11px] font-black text-gray-300 mb-6 uppercase tracking-[0.2em]">{day}</h2>
              <div className="space-y-8">
                {items.map((tx) => {
                  const isSent = tx.sender_name.toLowerCase() === player.nick.toLowerCase();
                  const txColor = isSent ? redOut : greenIn;
                  const otherParty = isSent ? tx.receiver_name : tx.sender_name;
                  const isPending = tx.status === 'PENDENTE';

                  return (
                    <div key={tx.id} className="flex items-start justify-between group active:scale-[0.98] transition-transform cursor-pointer">
                      <div className="flex space-x-4">
                        <div className="mt-1 flex items-center justify-center w-11 h-11 rounded-full bg-[#F5F6F7] text-gray-400 group-hover:bg-cyan-50 group-hover:text-cyan-400 transition-colors">
                          <span className="material-icons-outlined text-[20px]">
                            {isSent ? 'payments' : 'call_received'}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <p className="font-bold text-[15px] text-[#1A1A1A]">
                            {isSent ? 'Pix enviado' : 'Pix recebido'}
                          </p>
                          <p className="text-sm text-[#6B6B6B] font-medium leading-tight mt-0.5">
                            {isSent ? `Para ${otherParty}` : `De ${otherParty}`}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <p className="text-[10px] text-gray-400 font-bold">{formatTime(tx.created_at)}</p>
                            {isPending && (
                              <span className="px-1.5 py-0.5 rounded-sm bg-amber-50 text-amber-500 text-[8px] font-black uppercase tracking-widest">
                                Pendente
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[16px]" style={{ color: txColor }}>
                          {isSent ? '-' : '+'} $ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-[9px] text-gray-300 font-mono mt-1 uppercase">Ref: {tx.id}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
};

export default StatementArea;
