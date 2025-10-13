export interface WithdrawApi {
  id: number;
  userId: number;
  amount: string;
  userWallet: string;
  txId?: string | null;
  adminProofUrl?: string | null;
  userProofUrl?: string | null;
  status: string;
  withdrawFrom:
    | "FUNDS_AVAILABLE"
    | "INVESTMENT_RETURNS"
    | "REFERRAL_EARNING"
    | string;
  createdAt: string;
  updatedAt: string;
}

// Friendly (UI) withdraw types
export type WithdrawFromType = "principal" | "return" | "referral";

// canonical status for UI
export type CanonicalWithdrawStatus =
  | "pending"
  | "review"
  | "approved"
  | "rejected"
  | "admin_proof_uploaded"
  | "unknown";

// UI-facing shape
export interface Withdrawal {
  id: number;
  userId: number;
  clientId: number;
  clientName: string;
  clientEmail: string;
  phoneNumber: string;
  amount: number;
  walletAddress?: string | null;
  txid?: string | null;
  screenshot?: string | null;
  statusRaw: string;
  status: CanonicalWithdrawStatus;
  withdrawFromRaw: string;
  withdrawFrom: WithdrawFromType;
  createdAt: string;
  updatedAt?: string | null;
  adminProofUrl?: string | null;
  userProofUrl?: string | null;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  completedAt?: string | null;
  completedBy?: string | null;
  adminMessage?: string | null;
}
