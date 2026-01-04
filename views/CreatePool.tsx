
import React, { useState } from 'react';
import { db } from '../db';
import { Pool, PoolStatus } from '../types';
import { ArrowLeft, Trophy, AlertTriangle, ChevronDown, Calendar } from 'lucide-react';

interface CreatePoolProps {
  onCreated: () => void;
  onCancel: () => void;
}

const CreatePool: React.FC<CreatePoolProps> = ({ onCreated, onCancel }) => {
  const [name, setName] = useState('');
  const [modality, setModality] = useState('🎾 Beach Tennis');
  const [sideA, setSideA] = useState('');
  const [sideB, setSideB] = useState('');
  const [betAmount, setBetAmount] = useState('10.00');
  const [deadline, setDeadline] = useState('');
  const [eventDate, setEventDate] = useState(''); // Data real do evento
  const currentUser = db.getCurrentUser();

  const modalities = [
    '🎾 Beach Tennis',
    '⚽ Futebol',
    '🏀 Basquete',
    '🏐 Vôlei',
    '🏎️ F1 / Corrida',
    '🥊 MMA / Boxe',
    '🎮 E-Sports',
    '🎯 Outros'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const newPool: Pool = {
      id: crypto.randomUUID(),
      creatorId: currentUser.id,
      name,
      modality,
      dateTime: deadline,
      eventDateTime: eventDate,
      betAmount: parseFloat(betAmount),
      options: [sideA, sideB],
      status: PoolStatus.OPEN,
      createdAt: Date.now()
    };

    db.savePool(newPool);
    onCreated();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <button onClick={onCancel} className="flex items-center text-[#FAFAFA]/60 hover:text-[#FAFAFA] transition-colors text-sm font-medium">
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
      </button>

      <div className="bg-[#141417] border border-[#27272A] rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-[#27272A] flex items-center space-x-4">
          <div className="w-10 h-10 rounded-lg bg-[#10B981]/10 flex items-center justify-center text-[#10B981]">
            <Trophy className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold uppercase italic tracking-tighter">Criar Novo Bolão</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase text-[#FAFAFA]/40">Modalidade Esportiva *</label>
              <div className="relative">
                <select 
                  value={modality} 
                  onChange={(e) => setModality(e.target.value)} 
                  className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-xl px-4 py-3 focus:border-[#10B981] outline-none text-sm font-bold appearance-none cursor-pointer"
                  required
                >
                  {modalities.map(m => (
                    <option key={m} value={m} className="bg-[#141417]">{m}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FAFAFA]/20 pointer-events-none" />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase text-[#FAFAFA]/40">Nome do Evento *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-xl px-4 py-3 focus:border-[#10B981] outline-none text-sm font-bold" placeholder="Ex: Final do Torneio" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase text-[#FAFAFA]/40">Time/Lado A *</label>
              <input type="text" value={sideA} onChange={(e) => setSideA(e.target.value)} className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-xl px-4 py-3 text-sm font-bold" placeholder="Ex: Time Alpha" required />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase text-[#FAFAFA]/40">Time/Lado B *</label>
              <input type="text" value={sideB} onChange={(e) => setSideB(e.target.value)} className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-xl px-4 py-3 text-sm font-bold" placeholder="Ex: Time Beta" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase text-[#FAFAFA]/40">Valor Aposta (R$) *</label>
              <input type="number" step="0.01" value={betAmount} onChange={(e) => setBetAmount(e.target.value)} className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-xl px-4 py-3 text-sm font-bold text-[#10B981]" required />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase text-[#FAFAFA]/40">Fim das Apostas *</label>
              <input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-xl px-4 py-3 text-sm font-bold" required />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-black uppercase text-orange-400">Data e Hora Real do Evento *</label>
            <div className="relative">
              <input type="datetime-local" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="w-full bg-[#0A0A0B] border border-orange-500/20 rounded-xl px-4 py-3 text-sm font-bold" required />
              <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400/40 pointer-events-none" />
            </div>
          </div>

          <div className="bg-[#10B981]/5 border border-[#10B981]/20 rounded-xl p-4 flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
            <p className="text-[10px] text-[#FAFAFA]/60 font-black uppercase leading-relaxed">
              ATENÇÃO: Os dados do bolão não podem ser alterados após a criação. 10% do total será destinado à taxa administrativa.
            </p>
          </div>

          <button type="submit" className="w-full bg-[#10B981] text-black font-black py-4 rounded-xl shadow-lg hover:bg-[#0ea372] transition-all uppercase italic tracking-tighter">
            PUBLICAR BOLÃO
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePool;
