
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
      const { data, error } = await supabase
        .from('rede_white_accounts')
        .select('*')
        .eq('username', nick.trim())
        .eq('password_hash', password)
        .single();

      if (error || !data) {
        alert("Nick ou senha incorretos.");
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
      alert("Erro ao conectar.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-white px-6 py-10 page-enter min-h-screen">
      <div className="w-full max-w-sm flex flex-col items-center">
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
        <p className="text-gray-400 font-medium text-sm mt-2 mb-10 text-center">Gestão de coins para jogadores da RedeWhite.</p>

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Nickname de Jogo</label>
            <input 
              type="text" 
              placeholder="Ex: Steve_Miner" 
              className="w-full p-4 bg-[#F5F6F7] border-none rounded-2xl text-[#1A1A1A] font-semibold focus:ring-2 focus:ring-[#72E8F6] outline-none"
              value={nick} 
              onChange={(e) => setNick(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Senha /banco</label>
            <input 
              type="password" 
              placeholder="Digite sua senha do servidor" 
              className="w-full p-4 bg-[#F5F6F7] border-none rounded-2xl text-[#1A1A1A] font-semibold focus:ring-2 focus:ring-[#72E8F6] outline-none"
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
            <label htmlFor="remember" className="text-sm font-semibold text-[#6B6B6B] cursor-pointer">Lembrar acesso</label>
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
              "Entrar no Painel"
            )}
          </button>
        </form>

        <div className="mt-16 text-center border-t border-gray-50 pt-8 w-full">
          <p className="text-[10px] text-gray-300 font-bold uppercase tracking-tighter leading-relaxed">
            ESTE SITE É UMA FERRAMENTA RECREATIVA PARA O JOGO MINECRAFT.<br/>
            NÃO SOMOS UMA INSTITUIÇÃO FINANCEIRA. AS MOEDAS NÃO TÊM VALOR REAL.<br/>
            NÃO INSIRA SENHAS DE BANCOS REAIS.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
