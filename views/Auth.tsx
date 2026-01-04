import React, { useState } from 'react';
import { db } from '../db';
import { User, UserRole } from '../types';
import { Phone, ShieldCheck, Mail, Lock } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegistering && (!whatsapp || whatsapp.length < 8)) {
      setError('Insira um número de WhatsApp válido.');
      return;
    }

    const users = db.getUsers();

    if (isRegistering) {
      if (users.some(u => u.email === email)) {
        setError('E-mail já cadastrado.');
        return;
      }

      const newUser: User = {
        id: crypto.randomUUID(),
        name,
        email,
        whatsapp,
        password,
        role: email.toLowerCase() === 'upmarketingassessoria@gmail.com' || email.toLowerCase().includes('admin') ? UserRole.ADMIN : UserRole.USER,
        balance: 0,
        withdrawableBalance: 0,
        createdAt: Date.now()
      };
      
      db.saveUser(newUser);
      db.setCurrentUser(newUser);
      onLogin(newUser);
    } else {
      // Login Admin Master Hardcoded (Qualquer senha permitida para o e-mail específico)
      if (email.toLowerCase() === 'upmarketingassessoria@gmail.com') {
        let admin = users.find(u => u.email.toLowerCase() === 'upmarketingassessoria@gmail.com');
        if (!admin) {
          admin = {
            id: 'admin-master',
            name: 'Administrador Master',
            email: 'upmarketingassessoria@gmail.com',
            whatsapp: '(00) 00000-0000',
            password: password, // Define a senha informada no primeiro acesso
            role: UserRole.ADMIN,
            balance: 0,
            withdrawableBalance: 0,
            createdAt: Date.now()
          };
          db.saveUser(admin);
        }
        db.setCurrentUser(admin);
        onLogin(admin);
        return;
      }

      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        db.setCurrentUser(user);
        onLogin(user);
      } else {
        setError('E-mail ou senha incorretos.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0B] relative overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#10B981]/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#10B981]/5 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md px-6 relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/20 mb-6">
            <ShieldCheck className="w-8 h-8 text-[#10B981]" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase mb-1">
            BOLÃO <span className="text-[#10B981]">APP</span>
          </h1>
          <p className="text-[#FAFAFA]/30 font-black uppercase tracking-[0.3em] text-[10px]">Elite Experience</p>
        </div>

        <div className="bg-[#141417]/80 backdrop-blur-xl border border-[#27272A] rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">
              {isRegistering ? 'Criar Conta' : 'Acessar Área VIP'}
            </h2>
            <p className="text-[10px] text-[#FAFAFA]/40 font-bold uppercase mt-1">
              {isRegistering ? 'Cadastre-se para começar a lucrar' : 'Entre para gerenciar seus bolões'}
            </p>
          </div>
          
          <form onSubmit={handleAuth} className="space-y-5">
            {isRegistering && (
              <>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase text-[#FAFAFA]/40 ml-1">Nome Completo</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-2xl px-5 py-4 font-bold text-white outline-none focus:border-[#10B981] transition-all" 
                    placeholder="Seu nome"
                    required 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase text-[#10B981] ml-1">WhatsApp de Contato</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="(00) 00000-0000" 
                      value={whatsapp} 
                      onChange={(e) => setWhatsapp(e.target.value)} 
                      className="w-full bg-[#0A0A0B] border border-[#10B981]/30 rounded-2xl pl-12 pr-5 py-4 font-bold text-white outline-none focus:border-[#10B981] transition-all" 
                      required 
                    />
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#10B981]/50" />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase text-[#FAFAFA]/40 ml-1">E-mail</label>
              <div className="relative">
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-2xl pl-12 pr-5 py-4 font-bold text-white outline-none focus:border-[#10B981] transition-all" 
                  placeholder="seu@email.com"
                  required 
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FAFAFA]/10" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase text-[#FAFAFA]/40 ml-1">Senha</label>
              <div className="relative">
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-2xl pl-12 pr-5 py-4 font-bold text-white outline-none focus:border-[#10B981] transition-all" 
                  placeholder="••••••••"
                  required 
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FAFAFA]/10" />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl">
                <p className="text-red-400 text-[10px] font-black uppercase text-center tracking-tight">
                  {error}
                </p>
              </div>
            )}

            <button 
              type="submit" 
              className="w-full bg-[#10B981] text-black font-black py-5 rounded-2xl hover:bg-[#0ea372] transition-all shadow-xl shadow-[#10B981]/10 mt-4 uppercase italic tracking-tighter active:scale-95"
            >
              {isRegistering ? 'FINALIZAR CADASTRO' : 'ENTRAR NO SISTEMA'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#27272A] text-center">
            <button 
              onClick={() => {
                setError('');
                setIsRegistering(!isRegistering);
              }} 
              className="text-[10px] font-black text-[#FAFAFA]/30 uppercase hover:text-[#10B981] transition-colors tracking-widest"
            >
              {isRegistering ? 'Já tem conta? Faça Login' : 'Ainda não é membro? Cadastre-se'}
            </button>
          </div>
        </div>
        
        <p className="text-center mt-8 text-[9px] font-black text-[#FAFAFA]/10 uppercase tracking-[0.4em]">
          Secure & Encrypted Platform
        </p>
      </div>
    </div>
  );
};

export default Auth;