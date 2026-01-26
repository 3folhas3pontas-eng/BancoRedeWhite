import React, { useState } from 'react';
import { PlayerData } from '../types';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mmmazuwqcssymohcdzyj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_bf0YEm9kQ92T5U9WFbKeeg_clS4zyLc';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface LoginViewProps {
  onLoginSuccess: (player: PlayerData) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [nick, setNick] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const primaryColor = '#72E8F6';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nick || !password) {
      alert("Por favor, informe seu Nick e Senha.");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('rede_white_accounts')
        .select('*')
        .eq('username', nick.trim())
        .eq('password_hash', password)
        .single();

      if (error || !data) {
        alert("Acesso Negado: Nick ou Senha incorretos.");
      } else {
        onLoginSuccess({
          nick: data.username,
          uuid: data.uuid,
          balance: parseFloat(data.balance || '0'),
          creditLimit: 0,
          currentInvoice: 0
        });
      }
    } catch (error) {
      alert("ERRO DE CONEXÃO: Não foi possível alcançar o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-white px-6 py-10 page-enter min-h-screen">
      <div className="w-full max-w-sm flex flex-col items-center">
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden shadow-lg border border-gray-100 mb-6">
          <img 
            src="https://i.imgur.com/bPt3G5b.jpeg" 
            alt="RedeWhite Logo" 
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[#1A1A1A]">
          Rede<span style={{ color: primaryColor }}>White</span>
        </h1>
        <p className="text-gray-400 font-medium text-sm mt-2 mb-10">Banco Digital Oficial</p>

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Nick do Minecraft</label>
            <input 
              type="text" 
              placeholder="Ex: Steve_Miner" 
              className="w-full p-4 bg-[#F5F6F7] border-none rounded-2xl text-[#1A1A1A] font-medium focus:ring-2 focus:ring-[#72E8F6] transition-all outline-none"
              value={nick} 
              onChange={(e) => setNick(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Senha (/banco)</label>
            <input 
              type="password" 
              placeholder="Sua senha secreta" 
              className="w-full p-4 bg-[#F5F6F7] border-none rounded-2xl text-[#1A1A1A] font-medium focus:ring-2 focus:ring-[#72E8F6] transition-all outline-none"
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-full font-bold text-white shadow-lg shadow-[#72E8F640] transition-all active:scale-95 mt-4 flex items-center justify-center gap-2"
            style={{ backgroundColor: primaryColor }}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span>Entrar na conta</span>
            )}
          </button>
        </form>

        <div className="mt-12 text-center">
          <p className="text-xs text-gray-400">
            Infraestrutura segura RedeWhite Cloud.<br/>
            <span style={{ color: primaryColor }} className="font-bold cursor-pointer hover:underline">Problemas? Fale com o Staff.</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;