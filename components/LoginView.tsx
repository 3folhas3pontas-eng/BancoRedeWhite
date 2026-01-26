
import React, { useState } from 'react';
import { PlayerData } from '../types';

// O Supabase foi removido temporariamente para testes de deploy estático.

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
      alert("Por favor, informe seu Nick e Senha (qualquer um serve para teste).");
      return;
    }

    setIsLoading(true);

    // Simulação de delay de rede
    setTimeout(() => {
      onLoginSuccess({
        nick: nick.trim(),
        uuid: 'DEMO-UUID-12345',
        balance: 15000.50,
        creditLimit: 5000,
        currentInvoice: 120.40
      });
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="flex-1 flex flex-col bg-white px-8 pt-20 pb-10 page-enter">
      <div className="flex flex-col items-center mb-12">
        <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg border border-gray-100 mb-6">
          <img 
            src="https://i.imgur.com/bPt3G5b.jpeg" 
            alt="RedeWhite Logo" 
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[#1A1A1A]">
          Rede<span style={{ color: primaryColor }}>White</span>
        </h1>
        <p className="text-gray-400 font-medium text-sm mt-2">Banco Digital Oficial (MODO DEMO)</p>
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Nick do Minecraft</label>
          <input 
            type="text" 
            placeholder="Qualquer nick para testar" 
            className="w-full p-4 bg-[#F5F6F7] border-none rounded-2xl text-[#1A1A1A] font-medium focus:ring-2 focus:ring-[#72E8F6] transition-all outline-none"
            value={nick} 
            onChange={(e) => setNick(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Senha (/banco)</label>
          <input 
            type="password" 
            placeholder="Qualquer senha para testar" 
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
            <>
              <span>Entrar na conta</span>
              <span className="material-icons-outlined text-sm">login</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-auto pt-10 text-center">
        <p className="text-xs text-gray-400">
          Infraestrutura em modo de teste estático.<br/>
          <span style={{ color: primaryColor }} className="font-bold cursor-pointer hover:underline">Precisa de ajuda? Contate o staff.</span>
        </p>
      </div>
    </div>
  );
};

export default LoginView;
