
import React, { useState, useMemo } from 'react';
import { db } from '../db';
import { 
  Transaction, 
  TransactionStatus, 
  Pool, 
  User, 
  UserRole, 
  TransactionType, 
  PoolStatus,
  Bet
} from '../types';
import { 
  Shield, 
  Users, 
  Trophy, 
  Wallet, 
  ArrowDownCircle, 
  AlertTriangle,
  Check,
  X,
  Edit,
  Save,
  Search,
  QrCode,
  Key,
  Eye,
  Download,
  Trash2,
  Cpu,
  ArrowRight,
  UserCheck,
  History,
  Info,
  ExternalLink,
  Upload,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('deposits');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editBalance, setEditBalance] = useState('');
  const [editWithdrawable, setEditWithdrawable] = useState('');
  
  const [pixKey, setPixKey] = useState(db.getConfig().pixKey);
  const [qrCodeUrl, setQrCodeUrl] = useState(db.getConfig().qrCodeUrl);

  const users = db.getUsers();
  const pools = db.getPools();
  const transactions = db.getTransactions();
  const bets = db.getBets();
  const alerts = db.getAlerts();

  const metrics = useMemo(() => {
    const activePoolsCount = pools.filter(p => p.status === PoolStatus.OPEN).length;
    const totalInGame = bets.reduce((acc, b) => acc + b.amount, 0);
    const pendingWithdrawals = transactions.filter(t => t.status === TransactionStatus.PENDING && t.type === TransactionType.WITHDRAWAL).length;
    
    return [
      { label: 'Usuários', value: users.length, icon: Users, color: 'text-white' },
      { label: 'Bolões Ativos', value: activePoolsCount, icon: Trophy, color: 'text-white' },
      { label: 'Total em Jogo', value: `R$ ${totalInGame.toFixed(2)}`, icon: Wallet, color: 'text-[#10B981]' },
      { label: 'Saques Pendentes', value: pendingWithdrawals, icon: ArrowDownCircle, color: 'text-orange-400' },
      { label: 'Alertas', value: alerts.length, icon: AlertTriangle, color: alerts.some(a => a.type === 'CRITICAL') ? 'text-red-500' : 'text-[#FAFAFA]/20' },
    ];
  }, [users, pools, transactions, bets, alerts]);

  const handleAction = async (txId: string, approve: boolean) => {
    if (approve) await db.approveTransaction(txId);
    else await db.rejectTransaction(txId);
    window.dispatchEvent(new Event('storage'));
  };

  const handleSaveConfig = () => {
    db.saveConfig({ pixKey, qrCodeUrl });
    alert('Configurações salvas com sucesso!');
  };

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setQrCodeUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const startEditUser = (user: User) => {
    setEditingUser(user);
    setEditBalance(user.balance.toString());
    setEditWithdrawable(user.withdrawableBalance.toString());
  };

  const handleUpdateBalances = () => {
    if (!editingUser) return;
    db.updateUserAdmin(editingUser.id, {
      balance: parseFloat(editBalance) || 0,
      withdrawableBalance: parseFloat(editWithdrawable) || 0
    });
    setEditingUser(null);
    window.dispatchEvent(new Event('storage'));
    alert('Saldos atualizados!');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8 text-white" />
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Administração Master</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {metrics.map((m, i) => (
          <div key={i} className="bg-[#141417] border border-[#27272A] p-6 rounded-xl flex flex-col justify-between">
            <m.icon className={`w-4 h-4 ${m.color}`} />
            <p className="text-[10px] font-black text-[#FAFAFA]/40 uppercase mt-2">{m.label}</p>
            <p className={`text-xl font-black ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 bg-[#141417] p-1 border border-[#27272A] rounded-xl w-fit">
        {[
          { id: 'deposits', label: 'Depósitos' },
          { id: 'withdrawals', label: 'Saques' },
          { id: 'users', label: 'Usuários' },
          { id: 'config', label: 'Config. PIX' }
        ].map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id)} 
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-[#10B981] text-black' : 'text-[#FAFAFA]/40 hover:text-white'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-[#141417] border border-[#27272A] rounded-2xl overflow-hidden min-h-[400px]">
        {/* TAB DEPÓSITOS */}
        {activeTab === 'deposits' && (
          <div className="p-8 animate-in fade-in duration-300">
            <h3 className="text-lg font-black text-white italic uppercase mb-6">Depósitos Pendentes</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-[#FAFAFA]/20 uppercase border-b border-[#27272A]">
                    <th className="pb-4">Usuário / WhatsApp</th>
                    <th className="pb-4">Valor</th>
                    <th className="pb-4 text-center">Comprovante</th>
                    <th className="pb-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272A]/30">
                  {transactions.filter(t => t.type === TransactionType.DEPOSIT).map(tx => {
                    const txUser = users.find(u => u.id === tx.userId);
                    return (
                      <tr key={tx.id} className="hover:bg-white/5 transition-colors group">
                        <td className="py-4 font-black text-white text-xs">
                          {txUser?.name} <br/>
                          <span className="text-[10px] text-emerald-500">{txUser?.whatsapp}</span>
                        </td>
                        <td className="py-4 font-black text-[#10B981]">R$ {tx.amount.toFixed(2)}</td>
                        <td className="py-4 text-center">
                          {tx.receiptUrl && <button onClick={() => setPreviewImage(tx.receiptUrl!)} className="text-[#10B981] uppercase font-black text-[10px] flex items-center justify-center mx-auto"><Eye className="w-4 h-4 mr-1" /> Ver</button>}
                        </td>
                        <td className="py-4 text-right">
                          {tx.status === TransactionStatus.PENDING && (
                            <div className="flex justify-end space-x-2">
                              <button onClick={() => handleAction(tx.id, true)} className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-black transition-all"><Check className="w-4 h-4" /></button>
                              <button onClick={() => handleAction(tx.id, false)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"><X className="w-4 h-4" /></button>
                            </div>
                          )}
                          {tx.status !== TransactionStatus.PENDING && (
                             <span className={`text-[10px] font-black uppercase ${tx.status === TransactionStatus.APPROVED ? 'text-emerald-500' : 'text-red-500'}`}>{tx.status}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB SAQUES (Solicitação de Saque) */}
        {activeTab === 'withdrawals' && (
          <div className="p-8 animate-in fade-in duration-300">
            <h3 className="text-lg font-black text-white italic uppercase mb-6">Solicitações de Saque</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-[#FAFAFA]/20 uppercase border-b border-[#27272A]">
                    <th className="pb-4">Usuário / WhatsApp</th>
                    <th className="pb-4">Valor solicitado</th>
                    <th className="pb-4">Data</th>
                    <th className="pb-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272A]/30">
                  {transactions.filter(t => t.type === TransactionType.WITHDRAWAL).map(tx => {
                    const txUser = users.find(u => u.id === tx.userId);
                    return (
                      <tr key={tx.id} className="hover:bg-white/5 transition-colors group">
                        <td className="py-4 font-black text-white text-xs">
                          {txUser?.name} <br/>
                          <span className="text-[10px] text-orange-400">{txUser?.whatsapp}</span>
                        </td>
                        <td className="py-4 font-black text-red-500">R$ {tx.amount.toFixed(2)}</td>
                        <td className="py-4 text-xs text-[#FAFAFA]/40 font-bold">{format(tx.timestamp, "dd/MM HH:mm")}</td>
                        <td className="py-4 text-right">
                          {tx.status === TransactionStatus.PENDING && (
                            <div className="flex justify-end space-x-2">
                              <button onClick={() => handleAction(tx.id, true)} className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-black transition-all" title="Aprovar Saque"><Check className="w-4 h-4" /></button>
                              <button onClick={() => handleAction(tx.id, false)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all" title="Recusar e Devolver Saldo"><X className="w-4 h-4" /></button>
                            </div>
                          )}
                          {tx.status !== TransactionStatus.PENDING && (
                             <span className={`text-[10px] font-black uppercase ${tx.status === TransactionStatus.APPROVED ? 'text-emerald-500' : 'text-red-500'}`}>{tx.status}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB USUÁRIOS (Com edição de saldo) */}
        {activeTab === 'users' && (
          <div className="p-8 animate-in fade-in duration-300">
            <h3 className="text-lg font-black text-white italic uppercase mb-6">Gerenciar Membros</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-[#FAFAFA]/20 uppercase border-b border-[#27272A]">
                    <th className="pb-4">Nome</th>
                    <th className="pb-4">WhatsApp</th>
                    <th className="pb-4">S. Jogo</th>
                    <th className="pb-4">S. Saque</th>
                    <th className="pb-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272A]/30">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                      <td className="py-4 font-black text-white text-xs uppercase italic">{u.name}</td>
                      <td className="py-4 font-black text-emerald-500 text-[11px] italic">{u.whatsapp}</td>
                      <td className="py-4 font-black text-white text-xs">R$ {u.balance.toFixed(2)}</td>
                      <td className="py-4 font-black text-orange-400 text-xs">R$ {u.withdrawableBalance.toFixed(2)}</td>
                      <td className="py-4 text-right">
                        <button 
                          onClick={() => startEditUser(u)}
                          className="p-2 bg-white/5 text-white/40 rounded-lg hover:bg-[#10B981] hover:text-black transition-all"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB CONFIG PIX */}
        {activeTab === 'config' && (
          <div className="p-8 max-w-2xl mx-auto space-y-10 animate-in fade-in duration-300">
            <div className="text-center">
               <h3 className="text-xl font-black text-white uppercase italic">Configurações Financeiras (PIX)</h3>
               <p className="text-[10px] text-[#FAFAFA]/30 font-bold uppercase mt-1">Configure como os usuários enviam dinheiro</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
               <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#FAFAFA]/40 uppercase tracking-widest">Chave PIX (Copia e Cola)</label>
                    <input 
                      type="text" 
                      value={pixKey} 
                      onChange={(e) => setPixKey(e.target.value)} 
                      className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-xl px-4 py-3 font-bold text-[#10B981] outline-none focus:border-[#10B981]/50" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#FAFAFA]/40 uppercase tracking-widest">QR Code Atual</label>
                    <div className="relative group">
                       <input type="file" accept="image/*" onChange={handleQrUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                       <div className="w-full py-6 rounded-xl border-2 border-dashed border-[#27272A] bg-[#0A0A0B] flex flex-col items-center justify-center group-hover:border-[#10B981]/30 transition-all">
                          <Upload className="w-5 h-5 text-[#FAFAFA]/20 mb-2" />
                          <span className="text-[10px] font-black uppercase text-[#FAFAFA]/40 text-center px-4">Clique para carregar nova imagem</span>
                       </div>
                    </div>
                  </div>
               </div>

               <div className="flex flex-col items-center p-6 bg-[#0A0A0B] border border-[#27272A] rounded-[2rem]">
                  <p className="text-[9px] font-black text-[#FAFAFA]/20 uppercase mb-4 tracking-widest">Visualização do Usuário</p>
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="Preview QR" className="w-32 h-32 bg-white p-2 rounded-xl mb-4 shadow-xl" />
                  ) : (
                    <div className="w-32 h-32 bg-[#141417] rounded-xl flex items-center justify-center text-[#FAFAFA]/10 mb-4"><QrCode className="w-12 h-12" /></div>
                  )}
                  <p className="text-[10px] text-white/40 font-bold uppercase text-center max-w-[150px] truncate">{pixKey}</p>
               </div>
            </div>

            <button onClick={handleSaveConfig} className="w-full bg-[#10B981] text-black font-black py-5 rounded-2xl shadow-xl shadow-[#10B981]/10 hover:bg-[#0ea372] transition-all uppercase italic">
              SALVAR CONFIGURAÇÕES PIX
            </button>
          </div>
        )}
      </div>

      {/* MODAL EDIÇÃO DE SALDO */}
      {editingUser && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#141417] border border-[#27272A] rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl space-y-8">
            <div className="text-center">
              <h4 className="text-2xl font-black italic uppercase text-white tracking-tighter">Ajustar Saldos</h4>
              <p className="text-[10px] text-[#FAFAFA]/30 font-black uppercase mt-1">{editingUser.name}</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#10B981] uppercase tracking-widest">Saldo para Jogo (R$)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={editBalance}
                    onChange={(e) => setEditBalance(e.target.value)}
                    className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-2xl px-6 py-4 outline-none focus:border-[#10B981] font-bold text-white"
                  />
                  <Wallet className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FAFAFA]/10" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Saldo para Saque (R$)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={editWithdrawable}
                    onChange={(e) => setEditWithdrawable(e.target.value)}
                    className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-2xl px-6 py-4 outline-none focus:border-orange-500 font-bold text-white"
                  />
                  <DollarSign className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FAFAFA]/10" />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setEditingUser(null)}
                className="flex-1 py-4 bg-[#27272A] text-white font-black rounded-xl text-xs uppercase italic"
              >
                Cancelar
              </button>
              <button 
                onClick={handleUpdateBalances}
                className="flex-1 py-4 bg-[#10B981] text-black font-black rounded-xl text-xs uppercase italic shadow-lg shadow-[#10B981]/10"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VISUALIZADOR DE COMPROVANTE */}
      {previewImage && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-2xl bg-[#141417] border border-[#27272A] rounded-3xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-[#27272A] flex justify-between items-center bg-[#141417]">
              <h4 className="text-xs font-black italic uppercase text-white">Comprovante do Usuário</h4>
              <button onClick={() => setPreviewImage(null)} className="p-2 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 bg-[#0A0A0B] flex justify-center">
               <img src={previewImage} alt="Comprovante" className="max-w-full h-auto rounded-lg shadow-inner" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
