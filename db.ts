
import { User, Pool, Bet, Transaction, AppConfig, SystemAlert, UserRole, TransactionStatus, TransactionType, PoolStatus } from './types';

const DB_KEYS = {
  USERS: 'bt_users',
  POOLS: 'bt_pools',
  BETS: 'bt_bets',
  TRANSACTIONS: 'bt_transactions',
  CONFIG: 'bt_config',
  ALERTS: 'bt_alerts',
  SESSION: 'bt_session'
};

class DatabaseService {
  private get<T>(key: string, defaultValue: T): T {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  }

  private set<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  getCurrentUser(): User | null {
    return this.get<User | null>(DB_KEYS.SESSION, null);
  }

  setCurrentUser(user: User | null): void {
    this.set(DB_KEYS.SESSION, user);
  }

  getUsers(): User[] {
    return this.get<User[]>(DB_KEYS.USERS, []);
  }

  saveUser(user: User): void {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index > -1) users[index] = user;
    else users.push(user);
    this.set(DB_KEYS.USERS, users);
    
    // Sincroniza sessão se o usuário salvo for o logado
    const sessionUser = this.getCurrentUser();
    if (sessionUser && sessionUser.id === user.id) {
      this.setCurrentUser(user);
    }
  }

  updateUserAdmin(userId: string, data: Partial<User>): void {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error('Usuário não encontrado');
    this.saveUser({ ...user, ...data });
  }

  getPools(): Pool[] {
    const pools = this.get<Pool[]>(DB_KEYS.POOLS, []);
    const now = Date.now();
    return pools.map(pool => {
      const deadline = new Date(pool.dateTime).getTime();
      const eventTime = new Date(pool.eventDateTime).getTime();
      
      let updatedStatus = pool.status;

      if (pool.status === PoolStatus.OPEN && now >= deadline) {
        updatedStatus = PoolStatus.AWAITING_RESULT;
      }

      if (updatedStatus === PoolStatus.AWAITING_RESULT && now >= (eventTime + 3600000)) {
        this.addAlertOnce(`ANALISAR BOLÃO: "${pool.name}" não foi encerrado.`, 'CRITICAL', pool.id);
      }

      return { ...pool, status: updatedStatus };
    });
  }

  private addAlertOnce(message: string, type: any, refId: string) {
    const alerts = this.getAlerts();
    if (!alerts.some(a => a.referenceId === refId)) {
      this.addAlert({ type, message, referenceId: refId });
    }
  }

  savePool(pool: Pool): void {
    const pools = this.get<Pool[]>(DB_KEYS.POOLS, []);
    const index = pools.findIndex(p => p.id === pool.id);
    
    if (index > -1) {
      const existing = pools[index];
      const updated = {
        ...existing,
        status: pool.status,
        winnerOption: pool.winnerOption
      };
      pools[index] = updated;
    } else {
      pools.push(pool);
    }
    
    this.set(DB_KEYS.POOLS, pools);
  }

  async finalizePool(poolId: string, winnerOption: string): Promise<void> {
    const pools = this.getPools();
    const pool = pools.find(p => p.id === poolId);
    if (!pool) throw new Error('Bolão não encontrado');
    
    if (pool.status === PoolStatus.FINISHED) return;

    const allBets = this.getBets().filter(b => b.poolId === poolId);
    const winners = allBets.filter(b => b.optionSelected === winnerOption);
    
    const totalCollected = allBets.reduce((acc, b) => acc + b.amount, 0);
    const prizePool = totalCollected * 0.90; // Taxa 10%

    if (winners.length > 0) {
      const individualPrize = prizePool / winners.length;
      const users = this.getUsers();
      
      winners.forEach(bet => {
        const user = users.find(u => u.id === bet.userId);
        if (user) {
          user.withdrawableBalance += individualPrize;
          // Registra transação de prêmio
          const txs = this.getTransactions();
          txs.push({
            id: crypto.randomUUID(),
            userId: user.id,
            type: TransactionType.PRIZE,
            amount: individualPrize,
            status: TransactionStatus.APPROVED,
            timestamp: Date.now(),
            referenceId: poolId
          });
          this.set(DB_KEYS.TRANSACTIONS, txs);
          
          // Salva usuário e atualiza sessão se necessário
          this.saveUser(user);
        }
      });
    }

    pool.status = PoolStatus.FINISHED;
    pool.winnerOption = winnerOption;
    this.savePool(pool);
    
    const alerts = this.getAlerts().filter(a => a.referenceId !== poolId);
    this.set(DB_KEYS.ALERTS, alerts);
  }

  getBets(): Bet[] {
    return this.get<Bet[]>(DB_KEYS.BETS, []);
  }

  async placeBet(userId: string, poolId: string, option: string): Promise<void> {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    const pool = this.getPools().find(p => p.id === poolId);
    
    if (!user || !pool) throw new Error('Dados inválidos');
    if (pool.status !== PoolStatus.OPEN) throw new Error('Apostas encerradas.');
    
    const hasBet = this.getBets().some(b => b.poolId === poolId && b.userId === userId);
    if (hasBet) throw new Error('Limite de 1 aposta por pessoa.');

    if (user.balance < pool.betAmount) throw new Error('Saldo insuficiente.');

    user.balance -= pool.betAmount;
    this.saveUser(user);

    const bets = this.getBets();
    bets.push({
      id: crypto.randomUUID(),
      poolId,
      userId,
      optionSelected: option,
      amount: pool.betAmount,
      timestamp: Date.now()
    });
    this.set(DB_KEYS.BETS, bets);
    
    // Registra transação de aposta
    const txs = this.getTransactions();
    txs.push({
      id: crypto.randomUUID(),
      userId,
      type: TransactionType.BET,
      amount: pool.betAmount,
      status: TransactionStatus.APPROVED,
      timestamp: Date.now(),
      referenceId: poolId
    });
    this.set(DB_KEYS.TRANSACTIONS, txs);
  }

  getTransactions(): Transaction[] {
    return this.get<Transaction[]>(DB_KEYS.TRANSACTIONS, []);
  }

  async deposit(userId: string, amount: number, receiptUrl: string): Promise<void> {
    const txs = this.getTransactions();
    txs.push({
      id: crypto.randomUUID(),
      userId,
      type: TransactionType.DEPOSIT,
      amount,
      status: TransactionStatus.PENDING,
      receiptUrl,
      timestamp: Date.now()
    });
    this.set(DB_KEYS.TRANSACTIONS, txs);
  }

  async withdraw(userId: string, amount: number): Promise<void> {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error('Usuário não encontrado');
    if (user.withdrawableBalance < amount) throw new Error('Saldo insuficiente');

    user.withdrawableBalance -= amount;
    this.saveUser(user);

    const txs = this.getTransactions();
    txs.push({
      id: crypto.randomUUID(),
      userId,
      type: TransactionType.WITHDRAWAL,
      amount,
      status: TransactionStatus.PENDING,
      timestamp: Date.now()
    });
    this.set(DB_KEYS.TRANSACTIONS, txs);
  }

  async approveTransaction(txId: string): Promise<void> {
    const txs = this.getTransactions();
    const tx = txs.find(t => t.id === txId);
    if (!tx || tx.status !== TransactionStatus.PENDING) return;
    const user = this.getUsers().find(u => u.id === tx.userId);
    if (user) {
      if (tx.type === TransactionType.DEPOSIT) user.balance += tx.amount;
      tx.status = TransactionStatus.APPROVED;
      this.saveUser(user);
      this.set(DB_KEYS.TRANSACTIONS, txs);
    }
  }

  async rejectTransaction(txId: string): Promise<void> {
    const txs = this.getTransactions();
    const tx = txs.find(t => t.id === txId);
    if (!tx || tx.status !== TransactionStatus.PENDING) return;
    if (tx.type === TransactionType.WITHDRAWAL) {
      const user = this.getUsers().find(u => u.id === tx.userId);
      if (user) { user.withdrawableBalance += tx.amount; this.saveUser(user); }
    }
    tx.status = TransactionStatus.REJECTED;
    this.set(DB_KEYS.TRANSACTIONS, txs);
  }

  getAlerts(): SystemAlert[] {
    return this.get<SystemAlert[]>(DB_KEYS.ALERTS, []);
  }

  deleteAlert(alertId: string): void {
    const alerts = this.getAlerts().filter(a => a.id !== alertId);
    this.set(DB_KEYS.ALERTS, alerts);
  }

  addAlert(alert: Omit<SystemAlert, 'id' | 'timestamp'>): void {
    const alerts = this.getAlerts();
    alerts.unshift({ ...alert, id: crypto.randomUUID(), timestamp: Date.now() });
    this.set(DB_KEYS.ALERTS, alerts);
  }

  getConfig(): AppConfig {
    return this.get<AppConfig>(DB_KEYS.CONFIG, { pixKey: '010.235.721-84', qrCodeUrl: '' });
  }

  saveConfig(config: AppConfig): void {
    this.set(DB_KEYS.CONFIG, config);
  }

  runSystemScan(): string[] {
    this.getPools(); 
    return [];
  }
}

export const db = new DatabaseService();
