
import React, { useState, useEffect } from 'react';
import { PlayerData } from '../types';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mmmazuwqcssymohcdzyj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_bf0YEm9kQ92T5U9WFbKeeg_clS4zyLc';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface LoginViewProps {
  onLoginSuccess: (player: PlayerData, remember: boolean) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [nick, setNick] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const primaryColor = '#72E8F6';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nick || !password) {
      alert("Por favor, informe seu Nick e Código de Acesso.");
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
        alert("Acesso Negado: Nick ou Código incorretos.");
      } else {
        onLoginSuccess({
          nick: data.username,
          uuid: data.uuid,
          balance: parseFloat(data.balance || '0'),
          creditLimit: 0,
          currentInvoice: 0
        }, rememberMe);
      }
    } catch (error) {
      alert("ERRO DE CONEXÃO: Não foi possível alcançar o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-white px-6 py-10 page-enter min-h-screen">
      {/* Aviso anti-phishing no topo para bots de segurança */}
      <div className="mb-6 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-center max-w-sm">
        <p className="text-[10px] text-yellow-800 font-bold uppercase tracking-tight">
          Aviso: Interface de Jogo Minecraft (RedeWhite). Não somos um banco real.
        </p>
      </div>

      <div className="w-full max-w-sm flex flex-col items-center">
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden mb-6">
          <img 
            src="https://i.imgur.com/bPt3G5b.jpeg" 
            alt="RedeWhite Logo" 
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[#1A1A1A]">
          Rede<span style={{ color: primaryColor }}>White</span>
        </h1>
        <p className="text-gray-400 font-medium text-sm mt-2 mb-10">Dashboard de Jogador (Minecraft)</p>

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Seu Nick no Jogo</label>
            <input 
              type="text" 
              placeholder="Ex: Steve_Miner" 
              className="w-full p-4 bg-[#F5F6F7] border-none rounded-2xl text-[#1A1A1A] font-medium focus:ring-2 focus:ring-[#72E8F6] transition-all outline-none"
              value={nick} 
              onChange={(e) => setNick(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Código de Acesso (/banco)</label>
            <input 
              type="password" 
              placeholder="Sua senha do servidor" 
              className="w-full p-4 bg-[#F5F6F7] border-none rounded-2xl text-[#1A1A1A] font-medium focus:ring-2 focus:ring-[#72E8F6] transition-all outline-none"
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 ml-1 mt-1">
            <input 
              type="checkbox" 
              id="remember" 
              className="w-5 h-5 rounded border-gray-300 text-[#72E8F6] focus:ring-[#72E8F6]"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="remember" className="text-sm font-semibold text-[#6B6B6B] cursor-pointer">Manter conectado</label>
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
              <span>Entrar no Dashboard</span>
            )}
          </button>
        </form>

        <div className="mt-12 text-center border-t border-gray-100 pt-6 w-full">
          <p className="text-[10px] text-gray-400 leading-tight">
            ESTE SITE É UMA SIMULAÇÃO PARA FINS DE JOGO (MINECRAFT).<br/>
            NÃO SOMOS UMA INSTITUIÇÃO FINANCEIRA REAL.<br/>
            NÃO INSIRA SENHAS DE BANCOS REAIS AQUI.
          </p>
          <p className="text-xs mt-4">
            <span style={{ color: primaryColor }} className="font-bold cursor-pointer hover:underline">Precisa de ajuda? Staff RedeWhite.</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
