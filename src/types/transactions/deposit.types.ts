export interface DepositApi {
  id: number;
  userId: number;
  amount: string; // backend sends amounts as strings
  txId?: string | null;
  depositWallet: string;
  proofUrl?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface DepositRequest {
  id: number;
  userId: number;
  amount: number;
  txid?: string | null;
  depositWallet: string;
  screenshot?: string | null;
  status: string;
  submittedAt: string; // ISO
  clientName: string;
  clientEmail: string;
}

export interface DepositFilters {
  status: "all" | "pending" | "approved" | "rejected";
  searchQuery?: string;
  startDate?: string;
  endDate?: string;
}
