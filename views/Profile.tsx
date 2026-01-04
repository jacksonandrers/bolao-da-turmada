
import React, { useState } from 'react';
import { db } from '../db';
import { format } from 'date-fns';
import { Shield, Mail, Calendar, LogOut, Key, Save, AlertCircle, Phone } from 'lucide-react';

interface ProfileProps {
  onUpdate: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onUpdate }) => {
  const user = db.getCurrentUser();
  const [email, setEmail] = useState(user?.email || '');
  const [whatsapp, setWhatsapp] = useState(user?.whatsapp || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!user) return null;

  const isProfileIncomplete = !user.whatsapp || user.whatsapp === '(00) 00000-0000' || user.whatsapp === '';

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    if (!whatsapp || whatsapp.length < 10) {
      setMessage('Número de WhatsApp inválido. Digite DDD + Número.');
      setLoading(false);
      return;
    }
    
    try {
      db.updateUserAdmin(user.id, { 
        email, 
        whatsapp,
        password: password || user.password 
      });
      setMessage('Dados atualizados com sucesso! Funções liberadas.');
      setPassword('');
      onUpdate(); // Sincroniza o estado do App sem dar reload
    } catch (err) {
      setMessage('Erro ao atualizar dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      
      {isProfileIncomplete && (
        <div className="bg-orange-500/10 border-2 border-dashed border-orange-500/50 rounded-[3rem] p-10 text-center">
           <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-6" />
           <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">DESBLOQUEIE SUA CONTA</h2>
           <p className="text-sm text-orange-500 font-bold uppercase tracking-widest mt-2">Cadastre um número de WhatsApp real para habilitar as funções de aposta e financeiro.</p>
        </div>
      )}

      {/* Header Perfil */}
      <div className="bg-[#141417] border border-[#27272A] rounded-[3rem] p-12 text-center shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="w-28 h-28 rounded-full bg-[#10B981]/10 flex items-center justify-center text-[#10B981] text-5xl font-black mx-auto mb-8 border-4 border-[#10B981]/20 shadow-inner italic">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-4xl font-black mb-3 italic tracking-tighter text-white uppercase">{user.name}</h2>
          <div className="flex flex-col items-center justify-center space-y-2 text-[#FAFAFA]/40 mb-10 font-bold">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <span className="text-sm">{user.email}</span>
            </div>
            <div className={`flex items-center space-x-2 ${isProfileIncomplete ? 'text-orange-500' : 'text-[#10B981]'}`}>
              <Phone className="w-4 h-4" />
              <span className="text-sm">{isProfileIncomplete ? 'Aguardando WhatsApp' : user.whatsapp}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6 max-w-sm mx-auto">
            <div className="p-6 bg-[#0A0A0B] rounded-3xl border border-[#27272A]">
              <p className="text-[10px] text-[#FAFAFA]/40 uppercase font-black tracking-widest mb-1">Status</p>
              <div className="flex items-center justify-center text-[#10B981] font-black italic">
                <Shield className="w-4 h-4 mr-2" />
                {user.role}
              </div>
            </div>
            <div className="p-6 bg-[#0A0A0B] rounded-3xl border border-[#27272A]">
              <p className="text-[10px] text-[#FAFAFA]/40 uppercase font-black tracking-widest mb-1">Membro</p>
              <div className="flex items-center justify-center text-[#FAFAFA] font-black italic">
                <Calendar className="w-4 h-4 mr-2" />
                {format(user.createdAt, "MM/yyyy")}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-[#141417] border border-[#27272A] rounded-[3rem] p-10 shadow-2xl">
           <div className="flex items-center space-x-4 mb-8">
              <div className="w-12 h-12 bg-[#10B981]/10 rounded-2xl flex items-center justify-center text-[#10B981]"><Key className="w-6 h-6" /></div>
              <h3 className="text-xl font-black italic uppercase text-white tracking-tight">Editar Perfil</h3>
           </div>
           
           <form onSubmit={handleUpdate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#FAFAFA]/40 uppercase tracking-widest">E-mail de Login</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-2xl px-6 py-4 focus:border-[#10B981] outline-none font-bold italic text-white" />
              </div>
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest ${isProfileIncomplete ? 'text-orange-500 animate-pulse' : 'text-[#10B981]'}`}>WhatsApp (Desbloqueia Apostas)</label>
                <input type="text" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className={`w-full bg-[#0A0A0B] border rounded-2xl px-6 py-4 outline-none font-bold italic text-white ${isProfileIncomplete ? 'border-orange-500/50 focus:border-orange-500' : 'border-[#27272A] focus:border-[#10B981]'}`} placeholder="(00) 00000-0000" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#FAFAFA]/40 uppercase tracking-widest">Nova Senha (Opcional)</label>
                <input type="password" value={password} placeholder="Mudar senha" onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-2xl px-6 py-4 focus:border-[#10B981] outline-none font-bold italic text-white" />
              </div>
              
              {message && (
                <div className={`p-4 rounded-xl flex items-center space-x-3 text-xs font-black uppercase ${message.includes('sucesso') ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-red-500/10 text-red-500'}`}>
                  <AlertCircle className="w-4 h-4" />
                  <span>{message}</span>
                </div>
              )}

              <button type="submit" disabled={loading} className="w-full bg-[#10B981] text-black font-black py-5 rounded-2xl hover:bg-[#0ea372] transition-all flex items-center justify-center space-x-2 shadow-xl shadow-[#10B981]/10 uppercase italic">
                <Save className="w-5 h-5" />
                <span>{loading ? 'SALVANDO...' : 'SALVAR E DESBLOQUEAR'}</span>
              </button>
           </form>
        </div>

        <div className="bg-[#141417] border border-[#27272A] rounded-[3rem] p-10 flex flex-col justify-center">
           <div className="p-8 bg-[#0A0A0B] border border-[#27272A] rounded-3xl">
              <h4 className="text-xs font-black uppercase text-[#10B981] mb-4">Suporte e Segurança</h4>
              <p className="text-xs font-bold text-[#FAFAFA]/30 leading-relaxed uppercase italic">Suas funções financeiras estão bloqueadas por segurança. Ao salvar um número de WhatsApp válido, o sistema libera automaticamente os depósitos, saques e apostas.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
