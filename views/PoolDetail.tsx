
import React, { useState } from 'react';
import { db } from '../db';
import { Pool, PoolStatus, UserRole } from '../types';
import { ArrowLeft, Clock, Target, User as UserIcon, Trophy, CheckCircle2, Info, Phone, Calendar, Timer, AlertTriangle, X } from 'lucide-react';
import { format } from 'date-fns';

interface PoolDetailProps {
  poolId: string;
  onBack: () => void;
  onRefresh?: () => void; // Adicionado para atualizar saldo global
}

const PoolDetail: React.FC<PoolDetailProps> = ({ poolId, onBack, onRefresh }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const pool = db.getPools().find(p => p.id === poolId);
  const user = db.getCurrentUser();
  const allBets = db.getBets().filter(b => b.poolId === poolId);
  
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [winnerOption, setWinnerOption] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  if (!pool) return <div className="text-center py-20 font-black uppercase text-[#FAFAFA]/20">Evento não encontrado.</div>;

  const isAdmin = user?.role === UserRole.ADMIN;
  const isCreator = user?.id === pool.creatorId;
  const canFinalize = isAdmin || isCreator;
  
  const totalPrize = (allBets.length * pool.betAmount) * 0.90;
  const hasAlreadyBet = allBets.some(b => b.userId === user?.id);

  const handleBet = async () => {
    if (!user || !selectedOption || isProfileIncomplete) return;
    
    setLoading(true);
    setError('');
    
    try {
      await db.placeBet(user.id, pool.id, selectedOption);
      setSuccess(true);
      if (onRefresh) onRefresh(); // Atualiza saldo no App
      setRefreshKey(prev => prev + 1);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizeClick = () => {
    if (!winnerOption) return;
    setShowConfirmModal(true);
  };

  const executeFinalize = async () => {
    if (!winnerOption) return;
    
    setShowConfirmModal(false);
    setLoading(true);
    try {
      await db.finalizePool(pool.id, winnerOption);
      if (onRefresh) onRefresh(); // Atualiza saldo do admin/criador e ganhadores
      setRefreshKey(prev => prev + 1);
      window.dispatchEvent(new Event('storage'));
      // Substituímos o alert nativo por uma confirmação visual de sucesso se necessário no futuro, 
      // mas mantemos o fluxo funcional agora.
    } catch (err: any) {
      alert('Erro ao finalizar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const isProfileIncomplete = !user?.whatsapp || user?.whatsapp === '(00) 00000-0000' || user?.whatsapp === '';

  return (
    <div key={refreshKey} className="space-y-8 animate-in fade-in duration-300 pb-20">
      <button onClick={onBack} className="flex items-center text-[#FAFAFA]/50 hover:text-[#FAFAFA] transition-colors text-xs font-black uppercase tracking-widest">
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-[#141417] border border-[#27272A] rounded-[2rem] p-10 relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <span className="px-3 py-1 bg-[#10B981]/10 text-[#10B981] text-[10px] font-black uppercase rounded-lg border border-[#10B981]/20">
                    {pool.modality}
                  </span>
                  <h1 className="text-4xl font-black mt-4 italic tracking-tighter text-white uppercase">{pool.name}</h1>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-[#FAFAFA]/40 uppercase font-black tracking-widest mb-1">Custo Aposta</p>
                  <p className="text-4xl font-black text-[#10B981] tracking-tighter italic">R$ {pool.betAmount.toFixed(2)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 py-8 border-t border-[#27272A]/50">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#0A0A0B] border border-[#27272A] flex items-center justify-center text-orange-400 shadow-inner"><Timer className="w-5 h-5" /></div>
                  <div><p className="text-[9px] text-[#FAFAFA]/40 uppercase font-black">Prazo Apostas</p><p className="text-sm font-black text-white">{format(new Date(pool.dateTime), "dd/MM HH:mm")}</p></div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#0A0A0B] border border-[#27272A] flex items-center justify-center text-blue-400 shadow-inner"><Calendar className="w-5 h-5" /></div>
                  <div><p className="text-[9px] text-[#FAFAFA]/40 uppercase font-black">Data Evento</p><p className="text-sm font-black text-white">{format(new Date(pool.eventDateTime), "dd/MM HH:mm")}</p></div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#0A0A0B] border border-[#27272A] flex items-center justify-center text-[#10B981] shadow-inner"><Target className="w-5 h-5" /></div>
                  <div><p className="text-[9px] text-[#FAFAFA]/40 uppercase font-black">Prêmio Est.</p><p className="text-sm font-black text-[#10B981]">R$ {totalPrize.toFixed(2)}</p></div>
                </div>
              </div>

              {pool.status === PoolStatus.OPEN && (
                <div className="mt-8 pt-8 border-t border-[#27272A]/50 space-y-8">
                  <h3 className="text-xl font-black italic text-white uppercase tracking-tight">Faça seu Palpite</h3>
                  
                  {isProfileIncomplete ? (
                    <div className="bg-orange-500/10 border border-orange-500/30 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-pulse">
                       <div className="flex items-center space-x-4">
                          <Phone className="w-8 h-8 text-orange-500" />
                          <div>
                            <p className="text-sm font-black text-white uppercase italic">APOSTA BLOQUEADA</p>
                            <p className="text-[10px] text-orange-500/80 font-bold uppercase tracking-widest">Complete seu perfil para apostar.</p>
                          </div>
                       </div>
                    </div>
                  ) : hasAlreadyBet ? (
                    <div className="bg-[#10B981]/5 border border-[#10B981]/20 p-6 rounded-2xl flex items-center space-x-4">
                       <CheckCircle2 className="w-8 h-8 text-[#10B981]" />
                       <div>
                          <p className="text-sm font-black text-white uppercase italic">Sua aposta está confirmada!</p>
                          <p className="text-[10px] text-[#FAFAFA]/40 font-bold uppercase tracking-widest">Boa sorte.</p>
                       </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pool.options.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => setSelectedOption(opt)}
                            className={`p-6 rounded-2xl border-2 text-left transition-all ${selectedOption === opt ? 'border-[#10B981] bg-[#10B981]/5' : 'border-[#27272A] bg-[#0A0A0B] hover:border-[#10B981]/30'}`}
                          >
                            <span className="font-black italic uppercase text-sm tracking-tight">{opt}</span>
                            <div className={`w-6 h-6 rounded-full border-4 mt-4 ${selectedOption === opt ? 'border-[#10B981] bg-[#10B981]' : 'border-[#27272A]'}`} />
                          </button>
                        ))}
                      </div>

                      <div className="space-y-4">
                        {error && <p className="text-red-500 text-[10px] font-black uppercase text-center bg-red-500/10 py-2 rounded-lg">{error}</p>}
                        <button
                          disabled={!selectedOption || loading}
                          onClick={handleBet}
                          className="w-full bg-[#10B981] text-black font-black py-5 rounded-2xl disabled:opacity-30 hover:bg-[#0ea372] transition-all uppercase italic tracking-tighter shadow-xl shadow-[#10B981]/10"
                        >
                          {loading ? 'PROCESSANDO...' : `CONFIRMAR APOSTA (R$ ${pool.betAmount.toFixed(2)})`}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {canFinalize && pool.status === PoolStatus.AWAITING_RESULT && (
                <div className="mt-8 pt-8 border-t border-orange-500/20 bg-orange-500/5 p-8 rounded-3xl space-y-6">
                   <div className="flex items-center space-x-3 text-orange-400">
                      <Trophy className="w-6 h-6" />
                      <h3 className="text-xl font-black italic uppercase">Declarar Ganhador Oficial</h3>
                   </div>
                   <p className="text-[10px] text-orange-400/60 font-black uppercase tracking-widest">Selecione quem venceu para processar os pagamentos:</p>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pool.options.map(opt => (
                        <button 
                          key={opt}
                          onClick={() => setWinnerOption(opt)}
                          className={`p-5 rounded-2xl border-2 font-black italic uppercase text-sm transition-all flex items-center justify-between ${winnerOption === opt ? 'border-orange-500 bg-orange-500 text-black shadow-lg shadow-orange-500/20' : 'border-[#27272A] bg-[#0A0A0B] text-[#FAFAFA]/40'}`}
                        >
                          <span>{opt}</span>
                          {winnerOption === opt && <CheckCircle2 className="w-5 h-5" />}
                        </button>
                      ))}
                   </div>
                   <button 
                     disabled={!winnerOption || loading}
                     onClick={handleFinalizeClick}
                     className="w-full bg-orange-500 text-black font-black py-5 rounded-2xl hover:bg-orange-600 transition-all uppercase italic shadow-2xl shadow-orange-500/20 disabled:opacity-50"
                   >
                     {loading ? 'PROCESSANDO PAGAMENTOS...' : 'DECLARAR VENCEDOR E PAGAR'}
                   </button>
                </div>
              )}

              {pool.status === PoolStatus.FINISHED && (
                <div className="mt-10 p-10 bg-[#10B981]/5 border border-[#10B981]/10 rounded-[2rem] text-center space-y-6">
                   <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">EVENTO ENCERRADO</h3>
                   <div className="max-w-xs mx-auto py-6 bg-[#0A0A0B] border border-[#27272A] rounded-3xl">
                     <p className="text-[10px] text-[#FAFAFA]/40 uppercase font-black mb-2 tracking-widest">Ganhador Oficial</p>
                     <p className="text-3xl font-black text-[#10B981] italic uppercase tracking-tighter">{pool.winnerOption}</p>
                   </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#141417] border border-[#27272A] rounded-[2rem] p-10 shadow-2xl">
            <h3 className="text-xl font-black italic uppercase text-white tracking-tight mb-8">Participantes ({allBets.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allBets.map(bet => {
                const betUser = db.getUsers().find(u => u.id === bet.userId);
                const isWinner = pool.status === PoolStatus.FINISHED && bet.optionSelected === pool.winnerOption;
                return (
                  <div key={bet.id} className={`p-5 rounded-2xl border flex justify-between items-center ${isWinner ? 'bg-[#10B981]/10 border-[#10B981]/30' : 'bg-[#0A0A0B] border-[#27272A]'}`}>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-[#27272A] flex items-center justify-center text-xs font-black italic">
                        {betUser?.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-white uppercase italic">{betUser?.name}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-lg border uppercase italic ${isWinner ? 'bg-[#10B981] text-black' : 'bg-[#10B981]/5 text-[#10B981] border-[#10B981]/10'}`}>{bet.optionSelected}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-[#10B981] rounded-[2rem] p-10 text-black shadow-2xl">
            <h3 className="text-2xl font-black mb-4 uppercase italic tracking-tighter">REGRAS DE PAGAMENTO</h3>
            <p className="text-sm font-bold text-black/70 leading-relaxed italic">
              90% do valor arrecadado é pago aos ganhadores. 10% é taxa administrativa para manutenção do app.
            </p>
            <Trophy className="w-20 h-20 text-black/10 mt-6" />
          </div>
        </div>
      </div>

      {/* MODAL DE CONFIRMAÇÃO PERSONALIZADO */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#141417] border border-[#27272A] rounded-[2rem] p-8 max-w-md w-full shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-orange-500"></div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 text-orange-400">
                <AlertTriangle className="w-6 h-6" />
                <h4 className="text-xl font-black italic uppercase tracking-tighter">Confirmar Vencedor</h4>
              </div>
              <button onClick={() => setShowConfirmModal(false)} className="text-[#FAFAFA]/20 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-[#FAFAFA]/60 leading-relaxed font-bold uppercase italic tracking-tight">
                Você está declarando <span className="text-white font-black">"{winnerOption}"</span> como o vencedor oficial deste bolão.
              </p>
              
              <div className="bg-[#0A0A0B] border border-[#27272A] p-4 rounded-2xl flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-[#FAFAFA]/40">Total a distribuir:</span>
                <span className="text-lg font-black text-[#10B981] italic">R$ {totalPrize.toFixed(2)}</span>
              </div>

              <p className="text-[10px] text-red-500 font-black uppercase text-center bg-red-500/10 py-2 rounded-lg">
                Esta ação é irreversível e os pagamentos são imediatos.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="py-4 bg-[#27272A] text-white font-black rounded-xl text-xs uppercase italic hover:bg-[#3F3F46] transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={executeFinalize}
                className="py-4 bg-orange-500 text-black font-black rounded-xl text-xs uppercase italic shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all"
              >
                Sim, Declarar e Pagar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PoolDetail;
