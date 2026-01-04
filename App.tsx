
import React, { useState, useEffect, useCallback } from 'react';
import { db } from './db';
import { User, UserRole } from './types';
import Layout from './components/Layout';
import Auth from './views/Auth';
import HomeView from './views/HomeView';
import CreatePool from './views/CreatePool';
import MyBets from './views/MyBets';
import PoolDetail from './views/PoolDetail';
import Balance from './views/Balance';
import Profile from './views/Profile';
import AdminDashboard from './views/AdminDashboard';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(db.getCurrentUser());
  const [activeTab, setActiveTab] = useState('home');
  const [selectedPoolId, setSelectedPoolId] = useState<string | null>(null);

  // Função para sincronizar o estado do usuário sem recarregar a página
  const refreshUser = useCallback(() => {
    const updated = db.getCurrentUser();
    setCurrentUser(updated);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      db.runSystemScan();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!currentUser) {
    return <Auth onLogin={(user) => setCurrentUser(user)} />;
  }

  const handleLogout = () => {
    db.setCurrentUser(null);
    setCurrentUser(null);
  };

  const navigateToPool = (id: string) => {
    setSelectedPoolId(id);
    setActiveTab('pool-detail');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeView 
            onPoolClick={(pool) => navigateToPool(pool.id)} 
            onNavigate={(tab) => setActiveTab(tab)} 
          />
        );
      case 'my-bets':
        return (
          <MyBets 
            onPoolClick={(pool) => navigateToPool(pool.id)} 
          />
        );
      case 'create-pool':
        return (
          <CreatePool 
            onCreated={() => setActiveTab('my-bets')} 
            onCancel={() => setActiveTab('home')} 
          />
        );
      case 'pool-detail':
        return <PoolDetail poolId={selectedPoolId!} onBack={() => setActiveTab('home')} onRefresh={refreshUser} />;
      case 'balance':
        return <Balance onNavigate={(tab) => setActiveTab(tab)} />;
      case 'profile':
        return <Profile onUpdate={refreshUser} />;
      case 'admin':
        return currentUser.role === UserRole.ADMIN ? <AdminDashboard /> : <HomeView onPoolClick={(pool) => navigateToPool(pool.id)} onNavigate={(tab) => setActiveTab(tab)} />;
      default:
        return <HomeView onPoolClick={(pool) => navigateToPool(pool.id)} onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout}>
      {renderContent()}
    </Layout>
  );
};

export default App;
