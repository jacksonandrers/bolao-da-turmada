
import React, { useState, useMemo } from 'react';
import { db } from '../db';
import { Pool, PoolStatus } from '../types';
import PoolCard from '../components/PoolCard';
import { PlusCircle, TrendingUp, Trophy, ArrowUpRight, Wallet, Landmark, AlertCircle, Phone } from 'lucide-react';

interface HomeViewProps {
  onPoolClick: (pool: Pool) => void;
  onNavigate: (tab: string) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onPoolClick, onNavigate }) => {
  const [activeFilter, setActiveFilter] = useState<PoolStatus>(PoolStatus.OPEN);
  const user = db.getCurrentUser();
  
  const isProfileIncomplete = !user?.whatsapp || user?.whatsapp === '(00) 00000-0000';

  const pools = useMemo(() => db.getPools(), [activeFilter]);
  
  const openPools = pools.filter(p => p.status === PoolStatus.OPEN);
  const awaitingPools = pools.filter(p => p.status === PoolStatus.AWAITING_RESULT);
  
  const filteredPools = activeFilter === PoolStatus.OPEN ? openPools : awaitingPools;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Banner Trava de Perfil */}
      {isProfileIncomplete && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 animate-pulse">
           <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center text-orange-500">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase italic">FUNÇÕES BLOQUEADAS</h3>
                <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest">Complete seu perfil com WhatsApp para começar a apostar.</p>
              </div>
           </div>
           <button 
             onClick={() => onNavigate('profile')}
             className="bg-orange-500 text-black font-black px-6 py-2.5 rounded-xl text-[10px] uppercase italic tracking-widest hover:bg-orange-600 transition-all"
           >
             COMPLETAR AGORA
           </button>
        </div>
      )}

      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#10B981]/10 via-[#141417] to-[#0A0A0B] border border-[#27272A] rounded-[2rem] p-8 md:p-12">
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter leading-tight">
            Seja bem vindo à <br/> <span className="text-[#10B981]">Turmada</span>
          </h1>
          <p className="text-[#FAFAFA]/40 text-sm font-medium mb-8 max-w-sm">
            Aqui sua diversão é levada a sério. Aposte e acompanhe seus resultados em tempo real.
          </p>
          <div className="flex gap-4">
            <button 
              onClick={() => !isProfileIncomplete && onNavigate('create-pool')}
              className={`font-black px-6 py-3 rounded-xl text-sm transition-all ${isProfileIncomplete ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5' : 'bg-[#10B981] hover:bg-[#0ea372] text-black'}`}
              disabled={isProfileIncomplete}
            >
              Criar Bolão
            </button>
            <button 
              onClick={() => onNavigate('balance')}
              className="bg-[#27272A] hover:bg-[#3F3F46] text-white font-black px-6 py-3 rounded-xl text-sm transition-all border border-[#3F3F46]"
            >
              Gerenciar Saldo
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#10B981]/5 blur-[80px] -mr-32 -mt-32 rounded-full"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#141417] border border-[#27272A] p-6 rounded-2xl group hover:border-[#10B981]/30 transition-all">
          <div className="flex items-center space-x-2 mb-2">
            <Wallet className="w-4 h-4 text-[#10B981]" />
            <p className="text-[9px] font-black text-[#FAFAFA]/30 uppercase tracking-[0.2em]">Saldo para Jogo</p>
          </div>
          <p className="text-2xl font-black text-white tracking-tighter">R$ {user?.balance.toFixed(2)}</p>
        </div>

        <div className="bg-[#141417] border border-[#27272A] p-6 rounded-2xl group hover:border-orange-500/30 transition-all">
          <div className="flex items-center space-x-2 mb-2">
            <Landmark className="w-4 h-4 text-orange-400" />
            <p className="text-[9px] font-black text-[#FAFAFA]/30 uppercase tracking-[0.2em]">Saldo para Saque</p>
          </div>
          <p className="text-2xl font-black text-white tracking-tighter">R$ {user?.withdrawableBalance.toFixed(2)}</p>
        </div>

        <div className="bg-[#141417] border border-[#27272A] p-6 rounded-2xl flex flex-col justify-center">
          <p className="text-[9px] font-black text-[#FAFAFA]/30 uppercase tracking-[0.2em] mb-1">Bolões Abertos</p>
          <p className="text-xl font-black text-[#10B981] tracking-tighter">{openPools.length}</p>
        </div>

        <div className="bg-[#141417] border border-[#27272A] p-6 rounded-2xl flex flex-col justify-center">
          <p className="text-[9px] font-black text-[#FAFAFA]/30 uppercase tracking-[0.2em] mb-1">Aguardando Resultado</p>
          <p className="text-xl font-black text-orange-400 tracking-tighter">{awaitingPools.length}</p>
        </div>
      </div>

      {/* Content Header */}
      <div className="flex items-center justify-between pt-4 border-t border-[#27272A]">
        <h2 className="text-xl font-black italic tracking-tighter text-white uppercase">Lista de Eventos</h2>
        <div className="flex gap-1 p-1 bg-[#141417] border border-[#27272A] rounded-xl">
          <button onClick={() => setActiveFilter(PoolStatus.OPEN)} className={`px-4 py-1.5 text-[10px] font-black rounded-lg transition-all ${activeFilter === PoolStatus.OPEN ? 'bg-[#10B981] text-black' : 'text-[#FAFAFA]/40'}`}>ABERTOS</button>
          <button onClick={() => setActiveFilter(PoolStatus.AWAITING_RESULT)} className={`px-4 py-1.5 text-[10px] font-black rounded-lg transition-all ${activeFilter === PoolStatus.AWAITING_RESULT ? 'bg-[#10B981] text-black' : 'text-[#FAFAFA]/40'}`}>AGUARDANDO</button>
        </div>
      </div>

      {filteredPools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPools.map(pool => (
            <PoolCard key={pool.id} pool={pool} onClick={onPoolClick} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-[#141417]/30 border-2 border-dashed border-[#27272A] rounded-3xl">
          <p className="text-[#FAFAFA]/10 font-black italic uppercase tracking-widest">Nenhum evento ativo no momento</p>
        </div>
      )}
    </div>
  );
};

export default HomeView;
