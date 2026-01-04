
import React, { useState } from 'react';
import { db } from '../db';
import { TransactionType, TransactionStatus } from '../types';
import { Wallet, QrCode, Upload, CheckCircle2, ArrowUpRight, DollarSign, Landmark, Phone } from 'lucide-react';
import { format } from 'date-fns';

interface BalanceProps {
  onNavigate: (tab: string) => void;
}

const Balance: React.FC<BalanceProps> = ({ onNavigate }) => {
  const user = db.getCurrentUser();
  const config = db.getConfig();
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [receipt, setReceipt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [activeAction, setActiveAction] = useState<'deposit' | 'withdraw'>('deposit');

  const isProfileIncomplete = !user?.whatsapp || user?.whatsapp === '(00) 00000-0000' || user?.whatsapp === '';

  const transactions = db.getTransactions()
    .filter(t => t.userId === user?.id)
    .sort((a, b) => b.timestamp - a.timestamp);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setReceipt(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProfileIncomplete) return;
    if (!user || !depositAmount || !receipt) {
      setError('Informe o valor e anexe o comprovante.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await db.deposit(user.id, parseFloat(depositAmount), receipt);
      setSuccess(true);
      setDepositAmount('');
      setReceipt(null);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProfileIncomplete) return;
    if (!user || !withdrawAmount) {
      setError('Informe o valor para o saque.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await db.withdraw(user.id, parseFloat(withdrawAmount));
      setSuccess(true);
      setWithdrawAmount('');
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyPix = () => {
    navigator.clipboard.writeText(config.pixKey);
    alert('Chave PIX copiada!');
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      
      {isProfileIncomplete && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-[2rem] p-8 text-center space-y-4">
           <Phone className="w-12 h-12 text-orange-500 mx-auto" />
           <h3 className="text-xl font-black text-white italic uppercase">PERFIL INCOMPLETO</h3>
           <p className="text-xs text-orange-500/80 font-bold max-w-sm mx-auto uppercase tracking-tight leading-relaxed">
             Para realizar depósitos ou saques, você precisa primeiro cadastrar seu WhatsApp no seu Perfil.
           </p>
           <button onClick={() => onNavigate('profile')} className="bg-orange-500 text-black font-black px-8 py-3 rounded-2xl text-[10px] uppercase italic tracking-widest">IR PARA PERFIL</button>
        </div>
      )}

      {/* Cards de Patrimônio */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${isProfileIncomplete ? 'opacity-30 pointer-events-none' : ''}`}>
        <div className="bg-[#141417] border border-[#27272A] rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex justify-between items-start">
            <div className="space-y-1">
              <h2 className="text-[10px] font-black text-[#FAFAFA]/40 uppercase tracking-[0.2em]">Saldo para Jogo</h2>
              <div className="flex items-baseline space-x-2">
                <span className="text-xl font-black text-[#10B981]">R$</span>
                <p className="text-5xl font-black tracking-tighter text-white">{user?.balance.toFixed(2)}</p>
              </div>
            </div>
            <div className="p-3 bg-[#10B981]/10 rounded-2xl"><Wallet className="w-6 h-6 text-[#10B981]" /></div>
          </div>
          <button onClick={() => setActiveAction('deposit')} className="mt-8 w-full py-4 bg-[#10B981] text-black font-black rounded-xl text-xs uppercase tracking-widest hover:bg-[#0ea372] transition-all">Adicionar Saldo</button>
        </div>

        <div className="bg-[#141417] border border-[#27272A] rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex justify-between items-start">
            <div className="space-y-1">
              <h2 className="text-[10px] font-black text-[#FAFAFA]/40 uppercase tracking-[0.2em]">Saldo para Saque</h2>
              <div className="flex items-baseline space-x-2">
                <span className="text-xl font-black text-orange-400">R$</span>
                <p className="text-5xl font-black tracking-tighter text-white">{user?.withdrawableBalance.toFixed(2)}</p>
              </div>
            </div>
            <div className="p-3 bg-orange-500/10 rounded-2xl"><Landmark className="w-6 h-6 text-orange-400" /></div>
          </div>
          <button onClick={() => setActiveAction('withdraw')} className="mt-8 w-full py-4 bg-[#27272A] text-white font-black rounded-xl text-xs uppercase tracking-widest hover:bg-[#3F3F46] border border-[#3F3F46] transition-all">Solicitar Saque</button>
        </div>
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-10 ${isProfileIncomplete ? 'opacity-30 pointer-events-none' : ''}`}>
        {/* Formulário de Ação */}
        <div className="bg-[#141417] border border-[#27272A] rounded-[2rem] p-10 shadow-2xl">
          {activeAction === 'deposit' ? (
            <div className="space-y-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-[#10B981]/10 flex items-center justify-center text-[#10B981]"><QrCode className="w-6 h-6" /></div>
                <h3 className="text-xl font-black italic tracking-tight">DEPÓSITO PIX</h3>
              </div>

              <div className="flex flex-col items-center justify-center p-8 bg-[#0A0A0B] rounded-[2rem] border border-[#27272A] border-dashed">
                {config.qrCodeUrl ? (
                  <img src={config.qrCodeUrl} alt="QR Code" className="w-48 h-48 rounded-2xl mb-6 bg-white p-3" />
                ) : (
                  <div className="w-48 h-48 bg-[#141417] rounded-2xl mb-6 flex items-center justify-center text-white/10"><QrCode className="w-20 h-20" /></div>
                )}
                <button onClick={copyPix} className="flex items-center px-5 py-2.5 bg-[#10B981]/5 border border-[#10B981]/20 rounded-xl hover:bg-[#10B981]/10 transition-all">
                  <span className="font-mono font-bold text-xs text-[#10B981] mr-3">{config.pixKey}</span>
                  <ArrowUpRight className="w-4 h-4 text-[#10B981]" />
                </button>
              </div>

              <form onSubmit={handleDeposit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#FAFAFA]/40 uppercase tracking-widest">Valor do Depósito (R$)</label>
                  <input type="number" step="0.01" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-2xl px-6 py-4 focus:border-[#10B981] outline-none font-bold" placeholder="0.00" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#FAFAFA]/40 uppercase tracking-widest">Anexar Comprovante</label>
                  <div className="relative group">
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    <div className={`w-full py-8 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${receipt ? 'border-[#10B981] bg-[#10B981]/5' : 'border-[#27272A] bg-[#0A0A0B]'}`}>
                      {receipt ? <CheckCircle2 className="w-8 h-8 text-[#10B981]" /> : <Upload className="w-8 h-8 text-[#FAFAFA]/20" />}
                      <span className="mt-2 text-[10px] font-black uppercase text-[#FAFAFA]/40">{receipt ? 'Imagem Carregada' : 'Selecionar Imagem'}</span>
                    </div>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-[#10B981] text-black font-black py-5 rounded-2xl hover:bg-[#0ea372] shadow-xl shadow-[#10B981]/10">
                  {loading ? 'ENVIANDO...' : 'CONFIRMAR DEPÓSITO'}
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500"><DollarSign className="w-6 h-6" /></div>
                <h3 className="text-xl font-black italic tracking-tight uppercase">Solicitar Saque</h3>
              </div>
              <form onSubmit={handleWithdraw} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#FAFAFA]/40 uppercase tracking-widest">Valor do Saque (R$)</label>
                  <input type="number" step="0.01" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-2xl px-6 py-4 focus:border-orange-500 outline-none font-bold" placeholder="0.00" required />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-orange-500 text-black font-black py-5 rounded-2xl hover:bg-orange-600 shadow-xl shadow-orange-500/10">
                  {loading ? 'SOLICITANDO...' : 'SOLICITAR RETIRADA'}
                </button>
              </form>
            </div>
          )}
          {error && <p className="mt-4 text-center text-red-500 text-[10px] font-black uppercase">{error}</p>}
          {success && <p className="mt-4 text-center text-[#10B981] text-[10px] font-black uppercase">Solicitação enviada!</p>}
        </div>

        {/* Histórico */}
        <div className="bg-[#141417] border border-[#27272A] rounded-[2rem] p-10 shadow-2xl h-[600px] flex flex-col">
          <h3 className="text-xl font-black italic tracking-tight uppercase mb-8">Movimentações</h3>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {transactions.map(tx => (
              <div key={tx.id} className="p-5 rounded-2xl bg-[#0A0A0B] border border-[#27272A] flex justify-between items-center">
                <div>
                  <p className="text-[9px] font-black text-[#FAFAFA]/30 uppercase">{format(tx.timestamp, "dd MMM • HH:mm")}</p>
                  <p className="font-bold text-sm uppercase mt-1">{tx.type}</p>
                </div>
                <div className="text-right">
                  <p className={`font-black text-lg ${tx.type === TransactionType.DEPOSIT || tx.type === TransactionType.PRIZE ? 'text-[#10B981]' : 'text-red-500'}`}>R$ {tx.amount.toFixed(2)}</p>
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${tx.status === TransactionStatus.APPROVED ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-white/5 text-white/20 border-white/5'}`}>{tx.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Balance;
