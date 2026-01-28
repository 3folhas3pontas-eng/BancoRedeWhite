
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mmmazuwqcssymohcdzyj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_bf0YEm9kQ92T5U9WFbKeeg_clS4zyLc';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface Shop {
  id: string;
  shop_name: string;
  owner_name: string;
  status: 'ABERTO' | 'FECHADO';
}

interface LojasAbertasViewProps {
  onBack: () => void;
}

const LojasAbertasView: React.FC<LojasAbertasViewProps> = ({ onBack }) => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const primaryColor = '#72E8F6';
  const openColor = '#2ECC71';
  const closedColor = '#E74C3C';

  const fetchShops = async () => {
    try {
      const { data, error } = await supabase
        .from('rede_white_shops')
        .select('id, shop_name, owner_name, status')
        .order('status', { ascending: true });

      if (error) throw error;
      if (data) setShops(data);
    } catch (err) {
      console.error("Erro ao carregar lojas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
    const interval = setInterval(fetchShops, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 flex flex-col page-enter bg-white min-h-screen">
      {/* Header - White Theme */}
      <header className="px-6 pt-12 pb-6 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-4 mb-4">
          <button 
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <span className="material-icons-outlined text-[#1A1A1A]">arrow_back</span>
          </button>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Lojas Abertas agora</h1>
        </div>
        <div className="w-full h-[1px] bg-[#EDEDED]"></div>
      </header>

      <main className="flex-1 px-6 py-4 overflow-y-auto hide-scrollbar pb-32">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#72E8F6] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400 font-medium">Sincronizando com o servidor...</p>
          </div>
        ) : shops.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-icons-outlined text-6xl text-gray-200 mb-4">storefront</span>
            <p className="text-gray-400 font-medium">Nenhuma loja cadastrada no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shops.map((shop) => {
              const isOpen = shop.status === 'ABERTO';
              return (
                <div 
                  key={shop.id}
                  className={`relative p-5 rounded-[24px] border-2 transition-all duration-500 bg-white flex flex-col gap-3 shadow-sm ${
                    isOpen 
                      ? 'border-[#2ECC71] shadow-[#2ECC7115]' 
                      : 'border-[#EDEDED] opacity-60'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <h3 className="text-xl font-bold text-[#1A1A1A] tracking-tight">{shop.shop_name}</h3>
                      <p className="text-gray-500 text-xs font-medium uppercase tracking-widest mt-1">Dono: {shop.owner_name}</p>
                    </div>
                    
                    {/* Status Badge */}
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black tracking-tighter ${
                      isOpen ? 'bg-[#2ECC7120] text-[#2ECC71]' : 'bg-[#E74C3C20] text-[#E74C3C]'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-[#2ECC71] animate-pulse' : 'bg-[#E74C3C]'}`}></span>
                      <span className={isOpen ? 'animate-pulse' : ''}>{shop.status}</span>
                    </div>
                  </div>

                  <div className="w-full h-[1px] bg-[#F5F6F7] mt-2"></div>

                  <div className="flex items-center justify-between text-[11px] text-gray-400 font-bold mt-1">
                    <div className="flex items-center gap-1">
                      <span className="material-icons-outlined text-sm">location_on</span>
                      <span>Mundo Principal</span>
                    </div>
                    {isOpen && (
                      <span className="text-[#72E8F6]">Vá até a loja agora!</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Footer Info */}
        <div className="mt-12 p-6 rounded-2xl bg-[#F5F6F7] border border-[#EDEDED] text-center">
          <p className="text-gray-500 text-xs font-medium leading-relaxed">
            As informações acima são atualizadas automaticamente via <span className="text-[#72E8F6]">RedeWhite Cloud</span>. <br/>
            O status reflete a disponibilidade real dos jogadores no servidor Minecraft.
          </p>
        </div>
      </main>
    </div>
  );
};

export default LojasAbertasView;
