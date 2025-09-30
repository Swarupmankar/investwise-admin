// src/types/payment/wallet.types.ts

export const WALLET_NETWORKS = [
  "Bitcoin",
  "Ethereum",
  "TRON (TRC20)",
  "BNB Smart Chain (BEP20)",
  "Solana",
  "Litecoin",
] as const;

export type WalletNetwork = (typeof WALLET_NETWORKS)[number];

export interface Wallet {
  id: number;
  nickname: string;
  network: WalletNetwork | string; 
  address: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WalletActivity {
  id: number;
  action: string;
  details?: string;
  createdAt: string;
  walletId: number;
  wallet?: Wallet;
}
