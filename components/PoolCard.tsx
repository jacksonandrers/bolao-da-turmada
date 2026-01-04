
import React from 'react';
import { Pool, PoolStatus } from '../types';
import { format } from 'date-fns';
import { ChevronRight, DollarSign, Trophy, Clock, Calendar, Timer } from 'lucide-react';

interface PoolCardProps {
  pool: Pool;
  onClick: (pool: Pool) => void;
}

const PoolCard: React.FC<PoolCardProps> = ({ pool, onClick }) => {
  const getStatusDisplay = (status: PoolStatus) => {
    switch (status) {
      case PoolStatus.OPEN:
        return { label: 'Aberto', class: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' };
      case PoolStatus.AWAITING_RESULT:
        return { label: 'Aguardando Resultado', class: 'bg-orange-500/10 text-orange-500 border-orange-500/20' };
      case PoolStatus.FINISHED:
        return { label: 'Finalizado', class: 'bg-gray-500/10 text-gray-500 border-gray-500/20' };
    }
  };

  const statusDisplay = getStatusDisplay(pool.status);
  const prizeValue = pool.betAmount * 0.9; 

  return (
    <div className="bg-[#141417] border border-[#27272A] rounded-2xl overflow-hidden flex flex-col group transition-all hover:border-[#10B981]/30 shadow-xl">
      <div className="p-5 flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-[#10B981]/10 flex items-center justify-center text-xl italic font-black">
             {pool.modality.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-white text-sm uppercase leading-tight italic">{pool.name}</h3>
            <p className="text-[10px] text-[#FAFAFA]/40 font-black uppercase mt-0.5">{pool.modality}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${statusDisplay.class}`}>
          {statusDisplay.label}
        </span>
      </div>

      <div className="px-5 py-2 flex flex-col space-y-2 border-y border-[#27272A]/30 bg-[#0A0A0B]/30">
          <div className="flex items-center space-x-2 text-[10px] font-black uppercase text-orange-400">
            <Timer className="w-3.5 h-3.5" />
            <span>Prazo Aposta: {format(new Date(pool.dateTime), "dd/MM - HH:mm")}</span>
          </div>
          <div className="flex items-center space-x-2 text-[10px] font-black uppercase text-blue-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>Início Evento: {format(new Date(pool.eventDateTime), "dd/MM - HH:mm")}</span>
          </div>
      </div>

      <div className="px-5 py-4 space-y-2">
          <div className="flex items-center justify-between bg-[#0A0A0B] p-3 rounded-xl border border-[#27272A]">
              <span className="text-xs font-black text-[#FAFAFA]/80 uppercase">{pool.options[0]}</span>
              <span className="text-[10px] font-black text-[#FAFAFA]/10 italic">VS</span>
              <span className="text-xs font-black text-[#FAFAFA]/80 uppercase text-right">{pool.options[1]}</span>
          </div>
      </div>

      <div className="px-5 grid grid-cols-2 gap-2">
        <div className="bg-[#0A0A0B] p-2 rounded-xl border border-[#27272A] flex flex-col items-center">
          <DollarSign className="w-3 h-3 text-[#10B981] mb-1" />
          <p className="text-[10px] font-black text-white uppercase">Custo: R$ {pool.betAmount.toFixed(2)}</p>
        </div>
        <div className="bg-[#0A0A0B] p-2 rounded-xl border border-[#27272A] flex flex-col items-center">
          <Trophy className="w-3 h-3 text-[#10B981] mb-1" />
          <p className="text-[10px] font-black text-[#10B981] uppercase">Prêmio: R$ {prizeValue.toFixed(2)}</p>
        </div>
      </div>

      <div className="p-5">
        <button onClick={() => onClick(pool)} className="w-full flex items-center justify-center space-x-2 bg-[#27272A] hover:bg-[#10B981] text-[#FAFAFA] hover:text-black py-3 rounded-xl text-xs font-black transition-all uppercase">
          <span>Ver Detalhes e Apostar</span> <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default PoolCard;
