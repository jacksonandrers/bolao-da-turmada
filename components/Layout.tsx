
import React from 'react';
import { UserRole } from '../types';
import { db } from '../db';
import { 
  Home, 
  Trophy, 
  PlusCircle, 
  Wallet, 
  User as UserIcon, 
  Shield, 
  LogOut,
  Menu,
  MessageCircle
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const user = db.getCurrentUser();

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'my-bets', label: 'Meus Bolões', icon: Trophy },
    { id: 'create-pool', label: 'Criar Bolão', icon: PlusCircle },
    { id: 'balance', label: 'Saldo', icon: Wallet },
    { id: 'profile', label: 'Perfil', icon: UserIcon },
    { id: 'admin', label: 'Painel Admin', icon: Shield, adminOnly: true },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#0A0A0B]">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#0A0A0B] border-r border-[#27272A] transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full p-4">
          <div className="p-4 mb-8">
            <h1 className="text-[#10B981] text-2xl font-black tracking-tight">Bolão App</h1>
          </div>

          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => {
              if (item.adminOnly && user?.role !== UserRole.ADMIN) return null;
              
              const isActive = activeTab === item.id || (item.id === 'admin' && activeTab === 'admin');
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200
                    ${isActive 
                      ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/10' 
                      : 'text-[#FAFAFA]/40 hover:text-[#FAFAFA] hover:bg-[#141417]'}
                  `}
                >
                  <item.icon className={`w-5 h-5 mr-4 ${isActive ? 'text-[#10B981]' : 'text-[#FAFAFA]/40'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto space-y-2 pt-4 border-t border-[#27272A]">
            <a
              href="https://wa.me/5562986216877"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center px-4 py-3 text-sm font-bold text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/10 rounded-xl hover:bg-[#10B981]/20 transition-all"
            >
              <MessageCircle className="w-5 h-5 mr-4" />
              Suporte
            </a>
            <button
              onClick={onLogout}
              className="w-full flex items-center px-4 py-3 text-sm font-bold text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
            >
              <LogOut className="w-5 h-5 mr-4" />
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#0A0A0B]">
        {/* Mobile Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-[#0A0A0B] border-b border-[#27272A] md:hidden">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-[#FAFAFA]">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-black text-[#10B981]">Bolão App</h1>
          <div className="w-8" />
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-8 md:px-10 md:py-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
