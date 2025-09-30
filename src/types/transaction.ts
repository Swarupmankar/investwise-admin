export interface Transaction {
  id: string;
  date: string;
  clientName: string;
  clientEmail: string;
  clientId: string;
  type: "deposit" | "withdrawal-return" | "withdrawal-referral" | "withdrawal-principal";
  amount: number;
  status: "pending" | "approved" | "rejected" | "completed";
  walletAddress?: string;
  txid?: string;
  screenshot?: string;
  adminMessage?: string;
  notes?: string;
  // Source information to identify original record
  sourceType: "deposit" | "withdrawal";
  sourceId: string;
}

export interface TransactionFilters {
  search: string;
  type: string;
  status: string;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
}

export interface TransactionSummary {
  totalDeposited: number;
  totalWithdrawn: number;
  totalReferralPayouts: number;
  totalReturns: number;
  totalPrincipal: number;
  depositCount: number;
  withdrawalCount: number;
  pendingAmount: number;
}