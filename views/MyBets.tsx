
import React, { useState, useMemo } from 'react';
import { db } from '../db';
import { Pool } from '../types';
import PoolCard from '../components/PoolCard';
import { Trophy, UserCircle } from 'lucide-react';

interface MyBetsProps {
  onPoolClick: (pool: Pool) => void;
}

const MyBets: React.FC<MyBetsProps> = ({ onPoolClick }) => {
  const [activeSubTab, setActiveSubTab] = useState<'bets' | 'created'>('bets');
  const user = db.getCurrentUser();
  const pools = useMemo(() => db.getPools(), []); // Atualiza status dinamicamente (aberto -> aguardando)

  const userBets = db.getBets().filter(b => b.userId === user?.id);
  const poolsUserBetInIds = Array.from(new Set(userBets.map(b => b.poolId)));
  const poolsUserBetIn = pools.filter(p => poolsUserBetInIds.includes(p.id));
  
  const myCreatedPools = pools.filter(p => p.creatorId === user?.id);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h2 className="text-4xl font-black text-white tracking-tighter">Meus Bolões</h2>

      {/* Sub Tabs */}
      <div className="flex space-x-2">
        <button 
          onClick={() => setActiveSubTab('bets')}
          className={`flex items-center px-5 py-2.5 rounded-xl text-xs font-black transition-all border ${
            activeSubTab === 'bets' 
            ? 'bg-[#10B981] text-black border-[#10B981] shadow-lg shadow-[#10B981]/20' 
            : 'bg-transparent text-[#FAFAFA]/40 border-[#27272A] hover:text-[#FAFAFA]'
          }`}
        >
          <Trophy className="w-4 h-4 mr-2" />
          Minhas Apostas ({poolsUserBetIn.length})
        </button>
        <button 
          onClick={() => setActiveSubTab('created')}
          className={`flex items-center px-5 py-2.5 rounded-xl text-xs font-black transition-all border ${
            activeSubTab === 'created' 
            ? 'bg-[#10B981] text-black border-[#10B981] shadow-lg shadow-[#10B981]/20' 
            : 'bg-transparent text-[#FAFAFA]/40 border-[#27272A] hover:text-[#FAFAFA]'
          }`}
        >
          <UserCircle className="w-4 h-4 mr-2" />
          Criados por Mim ({myCreatedPools.length})
        </button>
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(activeSubTab === 'bets' ? poolsUserBetIn : myCreatedPools).map(pool => (
          <PoolCard 
            key={pool.id} 
            pool={pool} 
            onClick={onPoolClick} 
          />
        ))}

        {(activeSubTab === 'bets' ? poolsUserBetIn : myCreatedPools).length === 0 && (
          <div className="col-span-full py-20 bg-[#141417]/50 border-2 border-dashed border-[#27272A] rounded-3xl flex flex-col items-center justify-center text-center">
            <p className="text-[#FAFAFA]/20 font-black uppercase text-sm tracking-widest italic">
              Nenhum bolão encontrado nesta categoria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBets;
