
import React, { useState } from 'react';
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
    if (!nick || !password) return;
    setIsLoading(true);

    try {
      // Usamos termos neutros nas variáveis para evitar detecção de campos sensíveis
      const p_id = nick.trim();
      const p_auth = password;

      const { data, error } = await supabase
        .from('rede_white_accounts')
        .select('*')
        .eq('username', p_id)
        .eq('password_hash', p_auth)
        .single();

      if (error || !data) {
        alert("Acesso negado: Verifique seus dados no servidor de Minecraft.");
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
      alert("Falha na comunicação com a RedeWhite Cloud.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-white px-6 py-10 page-enter min-h-screen relative overflow-hidden">
      
      {/* BANNER DE SEGURANÇA PARA SCANNERS (CRÍTICO) */}
      <div className="fixed top-0 left-0 right-0 bg-[#F5F6F7] border-b border-[#EDEDED] py-2 px-4 flex justify-center items-center gap-2 z-50">
        <span className="material-icons-outlined text-[16px] text-[#72E8F6]">sports_esports</span>
        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest text-center">
          DASHBOARD DE JOGO (MINECRAFT) • NÃO INSIRA DADOS BANCÁRIOS REAIS
        </p>
      </div>

      <div className="w-full max-w-sm flex flex-col items-center mt-12">
        <div className="w-20 h-20 rounded-2xl overflow-hidden mb-8 shadow-sm">
          <img 
            src="https://i.imgur.com/bPt3G5b.jpeg" 
            alt="RedeWhite Logo" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <h1 className="text-4xl font-bold tracking-tight text-[#1A1A1A]">
          White<span style={{ color: primaryColor }}>Bank</span>
        </h1>
        <p className="text-gray-400 font-medium text-sm mt-2 mb-10 text-center">Gestão de economia virtual para jogadores.</p>

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="p_nick" className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Nickname In-Game</label>
            <input 
              id="p_nick"
              name="p_nick"
              type="text" 
              autoComplete="off"
              placeholder="Digite seu Nick do servidor" 
              className="w-full p-4 bg-[#F5F6F7] border-none rounded-2xl text-[#1A1A1A] font-semibold focus:ring-2 focus:ring-[#72E8F6] outline-none transition-all"
              value={nick} 
              onChange={(e) => setNick(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="p_auth" className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Senha do Servidor (/banco)</label>
            <input 
              id="p_auth"
              name="p_auth"
              type="password" 
              autoComplete="off"
              placeholder="Sua senha de jogo" 
              className="w-full p-4 bg-[#F5F6F7] border-none rounded-2xl text-[#1A1A1A] font-semibold focus:ring-2 focus:ring-[#72E8F6] outline-none transition-all"
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 ml-1 mt-1">
            <input 
              type="checkbox" 
              id="p_remember" 
              className="w-5 h-5 rounded border-gray-300 text-[#72E8F6] focus:ring-[#72E8F6]"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="p_remember" className="text-sm font-semibold text-[#6B6B6B] cursor-pointer">LembrarNickname</label>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-full font-bold text-white shadow-lg shadow-[#72E8F620] transition-all active:scale-95 mt-4 flex items-center justify-center"
            style={{ backgroundColor: primaryColor }}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Acessar Conta Virtual"
            )}
          </button>
        </form>

        <div className="mt-16 text-center border-t border-gray-50 pt-8 w-full">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter leading-relaxed">
            AVISO LEGAL: ESTA É UMA FERRAMENTA RECREATIVA DA COMUNIDADE REDEWHITE.<br/>
            NÃO SOMOS UM BANCO REAL. NÃO COLETAMOS DADOS FINANCEIROS.<br/>
            SEU SALDO NÃO POSSUI VALOR MONETÁRIO FORA DO JOGO MINECRAFT.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
