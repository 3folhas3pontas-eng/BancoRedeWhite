'use client';

import { useState, useEffect } from 'react';
import { PlayerData } from '@/lib/types';
import {
  ArrowLeft,
  X,
  User,
  Send,
  Copy,
  Check,
  Loader2,
  ChevronRight,
  Download,
  AlertCircle,
} from 'lucide-react';

interface PixAreaProps {
  onBack: () => void;
  player: PlayerData;
  sessionToken: string;
}

type PixStep = 'HOME' | 'INPUT_NICK' | 'INPUT_AMOUNT' | 'CONFIRM' | 'PROCESSING' | 'SUCCESS';

const primaryColor = '#72E8F6';

const cn = (...classes: (string | boolean | undefined)[]) =>
  classes.filter(Boolean).join(' ');

export default function PixArea({ onBack, player, sessionToken }: PixAreaProps) {
  const [step, setStep] = useState<PixStep>('HOME');
  const [receiverNick, setReceiverNick] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [receiverData, setReceiverData] = useState<{ nick: string; uuid: string } | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [copied, setCopied] = useState(false);

  const resetFlow = () => {
    setStep('HOME');
    setReceiverNick('');
    setAmount('');
    setErrorMessage('');
    setReceiverData(null);
    setTransactionId('');
  };

  const handleNextToAmount = async () => {
    if (!receiverNick.trim()) return;
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/user/check-player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: receiverNick.trim() })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage('Jogador não encontrado no servidor.');
      } else if (data.username.toLowerCase() === player.nick.toLowerCase()) {
        setErrorMessage('Você não pode transferir para si mesmo.');
      } else {
        setReceiverData({ nick: data.username, uuid: data.uuid });
        setStep('INPUT_AMOUNT');
      }
    } catch {
      setErrorMessage('Erro ao verificar jogador.');
    } finally {
      setIsLoading(false);
    }
  };

  const startProcessing = async () => {
    setStep('PROCESSING');
    setIsLoading(true);
    setErrorMessage('');
    const val = parseFloat(amount.replace(',', '.'));

    try {
      // Usa API segura no backend (validacao atomica de saldo)
      const response = await fetch('/api/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionToken,
          receiverUsername: receiverData?.nick,
          amount: val,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.error || 'Erro no sistema de pagamentos.');
        setStep('CONFIRM');
        return;
      }

      setTransactionId(data.transactionId);
      setStep('SUCCESS');
    } catch {
      setErrorMessage('Erro no sistema de pagamentos. Tente novamente.');
      setStep('CONFIRM');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (step === 'INPUT_AMOUNT' && amount) {
      const val = parseFloat(amount.replace(',', '.'));
      if (isNaN(val) || val <= 0) {
        setErrorMessage('Digite um valor válido maior que zero');
      } else if (val > player.balance) {
        setErrorMessage('Saldo insuficiente para esta operação');
      } else {
        setErrorMessage('');
      }
    } else if (step === 'INPUT_AMOUNT') {
      setErrorMessage('');
    }
  }, [amount, step, player.balance]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const parsedAmount = parseFloat(amount.replace(',', '.')) || 0;

  if (step === 'PROCESSING') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 h-screen">
        <div className="relative mb-8">
          <div className="h-20 w-20 rounded-full border-4 border-cyan-100" />
          <div className="absolute inset-0 h-20 w-20 animate-spin rounded-full border-4 border-transparent border-t-cyan-400" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-gray-900">Processando...</h2>
        <p className="text-center text-sm text-gray-500">
          Verificando transação no servidor RedeWhite.
        </p>
      </div>
    );
  }

  if (step === 'SUCCESS') {
    return (
      <div className="flex flex-col h-screen bg-white overflow-hidden">
        <div className="flex-1 overflow-y-auto px-6 pt-12 flex flex-col items-center pb-8">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30">
            <Check className="h-10 w-10 text-white" strokeWidth={3} />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Transferência enviada!</h1>
          <p className="mb-10 text-center text-sm text-gray-500">
            O valor já está na conta de {receiverData?.nick}
          </p>
          <div id="receipt-printable" className="w-full max-w-sm rounded-3xl bg-gray-50 p-6 border border-gray-100">
            <div className="mb-6 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-cyan-400 text-[10px] font-bold text-white">W</div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Comprovante</span>
            </div>
            <div className="mb-6 text-left">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">Valor</p>
              <p className="text-3xl font-bold text-gray-900">$ {formatCurrency(parsedAmount)}</p>
            </div>
            <div className="mb-6 h-px bg-gray-200" />
            <div className="space-y-5 text-left">
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">Para</p>
                <p className="text-lg font-bold text-gray-900">{receiverData?.nick}</p>
                <p className="text-[10px] text-gray-400">Banco RedeWhite</p>
              </div>
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">ID Transação</p>
                <p className="font-mono text-[10px] text-gray-400 uppercase">{transactionId}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-3 bg-white border-t border-gray-50">
          <button
            onClick={() => window.print()}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl font-bold text-white shadow-lg shadow-cyan-400/20"
            style={{ backgroundColor: primaryColor }}
          >
            <Download className="h-5 w-5" /> Baixar Comprovante
          </button>
          <button onClick={resetFlow} className="h-12 w-full text-sm font-semibold text-gray-500">
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  if (step === 'INPUT_NICK') {
    return (
      <div className="flex flex-col h-screen bg-white overflow-hidden">
        <header className="flex-shrink-0 px-6 pt-12 pb-4">
          <button onClick={() => setStep('HOME')} className="-ml-2 mb-6 flex h-10 w-10 items-center justify-center rounded-full text-gray-600">
            <X className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">
            Para quem você quer transferir?
          </h1>
          <p className="mt-1 text-sm text-gray-500">Nickname do jogador no servidor</p>
        </header>
        <main className="flex-1 px-6 overflow-y-auto">
          <input
            autoFocus
            type="text"
            placeholder="NICKNAME"
            className="w-full border-b-2 border-gray-200 bg-transparent py-4 text-2xl font-bold uppercase text-gray-900 placeholder:text-gray-200 focus:border-cyan-400 focus:outline-none transition-all"
            value={receiverNick}
            onChange={(e) => setReceiverNick(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleNextToAmount()}
          />
          {errorMessage && (
            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-red-50 p-4">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
              <p className="text-sm font-medium text-red-600">{errorMessage}</p>
            </div>
          )}
        </main>
        <footer className="p-6 bg-white border-t border-gray-50">
          <button
            disabled={!receiverNick.trim() || isLoading}
            onClick={handleNextToAmount}
            className={cn(
              'flex h-14 w-full items-center justify-center rounded-2xl font-bold transition-all active:scale-[0.98]',
              receiverNick.trim() && !isLoading
                ? 'text-white shadow-lg shadow-cyan-400/20'
                : 'bg-gray-100 text-gray-400'
            )}
            style={receiverNick.trim() && !isLoading ? { backgroundColor: primaryColor } : {}}
          >
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Continuar'}
          </button>
        </footer>
      </div>
    );
  }

  if (step === 'INPUT_AMOUNT') {
    const isValidAmount = parsedAmount > 0 && parsedAmount <= player.balance;
    return (
      <div className="flex flex-col h-screen bg-white overflow-hidden">
        {/* TESTE DEPLOY - BOLINHA VERMELHA */}
        <div className="fixed top-4 right-4 w-6 h-6 bg-red-500 rounded-full z-50"></div>
        <header className="flex-shrink-0 px-6 pt-12 pb-4">
          <button onClick={() => setStep('INPUT_NICK')} className="-ml-2 mb-6 flex h-10 w-10 items-center justify-center rounded-full text-gray-600">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Qual o valor?</h1>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-gray-500">Saldo:</span>
            <span className="text-sm font-bold text-emerald-600">$ {formatCurrency(player.balance)}</span>
          </div>
        </header>
        <main className="flex-1 px-6 overflow-y-auto">
          <div className="mt-6 flex items-baseline gap-2 border-b-2 border-gray-200 pb-4 focus-within:border-cyan-400">
            <span className="text-4xl font-bold text-gray-200">$</span>
            <input
              autoFocus
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              className="w-full bg-transparent text-4xl font-bold text-gray-900 focus:outline-none"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9,\.]/g, ''))}
            />
          </div>
          {errorMessage && (
            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-red-50 p-4">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
              <p className="text-sm font-medium text-red-600">{errorMessage}</p>
            </div>
          )}
          <div className="mt-8 flex items-center gap-4 rounded-2xl bg-gray-50 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100 text-cyan-600">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Para</p>
              <p className="text-base font-bold text-gray-900">{receiverData?.nick}</p>
            </div>
          </div>
          
          {/* BOTAO TRANSFERIR */}
          <div className="mt-8">
            <button
              disabled={!isValidAmount}
              onClick={() => setStep('CONFIRM')}
              className={cn(
                'flex h-14 w-full items-center justify-center gap-2 rounded-2xl font-bold transition-all active:scale-[0.98]',
                isValidAmount ? 'text-white shadow-lg shadow-cyan-400/20' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              )}
              style={isValidAmount ? { backgroundColor: primaryColor } : {}}
            >
              <Send className="h-5 w-5" /> Transferir
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (step === 'CONFIRM') {
    return (
      <div className="flex flex-col h-screen bg-white overflow-hidden">
        <header className="flex-shrink-0 px-6 pt-12 pb-4">
          <button onClick={() => setStep('INPUT_AMOUNT')} className="-ml-2 mb-6 flex h-10 w-10 items-center justify-center rounded-full text-gray-600">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Confira os dados</h1>
          <p className="mt-1 text-sm text-gray-500">Verifique os detalhes da transferência</p>
        </header>
        <main className="flex-1 px-6 overflow-y-auto space-y-8">
          <div className="mt-4 rounded-3xl p-6 text-white shadow-lg shadow-cyan-400/20" style={{ backgroundColor: primaryColor }}>
            <p className="mb-1 text-xs font-medium text-cyan-50 opacity-80 uppercase">Valor a enviar</p>
            <p className="text-4xl font-bold">$ {formatCurrency(parsedAmount)}</p>
          </div>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                <User className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase">Para</p>
                <p className="text-lg font-bold text-gray-900">{receiverData?.nick}</p>
              </div>
            </div>
            <div className="rounded-2xl bg-gray-50 p-4 border border-dashed border-gray-200">
              <p className="text-[10px] font-semibold text-gray-400 uppercase">De</p>
              <p className="font-bold text-gray-900">{player.nick}</p>
              <p className="mt-1 text-[10px] text-gray-400">
                Saldo após envio: $ {formatCurrency(player.balance - parsedAmount)}
              </p>
            </div>
          </div>
        </main>
        <footer className="p-6 bg-white border-t border-gray-50">
          <button
            onClick={startProcessing}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl font-bold text-white shadow-lg shadow-cyan-400/20"
            style={{ backgroundColor: primaryColor }}
          >
            <Send className="h-5 w-5" /> Confirmar e Enviar
          </button>
        </footer>
      </div>
    );
  }

  // HOME step
  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      <header className="flex-shrink-0 border-b border-gray-50 bg-white px-6 pb-6 pt-12">
        <div className="mb-6 flex items-center justify-between">
          <button onClick={onBack} className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-cyan-400 transition-colors hover:bg-gray-100">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div className="flex gap-4 text-gray-400">
            <span className="material-icons-outlined cursor-pointer text-xl">help_outline</span>
            <span className="material-icons-outlined cursor-pointer text-xl">settings</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Área Pix</h1>
        <p className="mt-1 text-sm text-gray-500 font-medium">Coins em tempo real</p>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-8">
        <section>
          <h2 className="mb-4 text-[10px] font-black uppercase tracking-widest text-gray-300">Enviar</h2>
          <button
            onClick={() => setStep('INPUT_NICK')}
            className="flex w-full items-center gap-4 rounded-3xl bg-gray-50 p-5 transition-all hover:bg-gray-100 active:scale-[0.98] group"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm group-hover:shadow-md transition-all">
              <Send className="h-6 w-6 text-cyan-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-gray-900">Transferir</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Envie coins via Nick</p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-200" />
          </button>
        </section>

        <section>
          <h2 className="mb-4 text-[10px] font-black uppercase tracking-widest text-gray-300">Minha chave</h2>
          <div className="flex items-center justify-between rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-50 text-cyan-400">
                <User className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-cyan-400 mb-0.5">Nickname</p>
                <p className="text-lg font-bold text-gray-900 leading-tight">{player.nick}</p>
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(player.nick)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-cyan-400 transition-colors"
            >
              {copied ? <Check className="h-5 w-5 text-emerald-500" /> : <Copy className="h-5 w-5" />}
            </button>
          </div>
        </section>

        <section>
          <div className="rounded-3xl p-6 text-white shadow-xl shadow-cyan-400/20" style={{ backgroundColor: primaryColor }}>
            <p className="mb-1 text-xs font-bold text-cyan-50 uppercase tracking-widest opacity-80">Seu saldo</p>
            <p className="text-3xl font-bold tracking-tight">$ {formatCurrency(player.balance)}</p>
          </div>
        </section>
      </main>
    </div>
  );
}
