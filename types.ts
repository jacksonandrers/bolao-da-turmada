
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  BET = 'BET',
  PRIZE = 'PRIZE'
}

export enum PoolStatus {
  OPEN = 'OPEN',
  AWAITING_RESULT = 'AWAITING_RESULT',
  FINISHED = 'FINISHED'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  whatsapp: string; // Novo campo
  role: UserRole;
  balance: number;
  withdrawableBalance: number;
  createdAt: number;
}

export interface Pool {
  id: string;
  creatorId: string;
  name: string;
  modality: string;
  dateTime: string; // Prazo para apostar
  eventDateTime: string; // Data real do evento (novo)
  betAmount: number;
  options: string[];
  status: PoolStatus;
  winnerOption?: string;
  createdAt: number;
}

export interface Bet {
  id: string;
  poolId: string;
  userId: string;
  optionSelected: string;
  amount: number;
  timestamp: number;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  receiptUrl?: string;
  timestamp: number;
  referenceId?: string;
}

export interface AppConfig {
  pixKey: string;
  qrCodeUrl: string;
}

export interface SystemAlert {
  id: string;
  type: 'INCONSISTENCY' | 'INFO' | 'CRITICAL';
  message: string;
  timestamp: number;
  fixed?: boolean;
  referenceId?: string;
}
