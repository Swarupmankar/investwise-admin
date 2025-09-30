export interface Withdrawal {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientId: string;
  type: "return" | "referral" | "principal";
  amount: number;
  walletAddress: string;
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  status: "pending" | "approved" | "rejected" | "proof_submitted" | "reviewed";
  adminMessage?: string;
  emailSent?: boolean;
  tronScanLink?: string;
  tronScanScreenshot?: string;
  clientProofScreenshot?: string;
  clientProofSubmittedAt?: string;
  completedAt?: string;
  completedBy?: string;
  currentBalance: number;
  notes?: string;
}

export interface WithdrawalFilters {
  search: string;
  status: string;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  type?: "return" | "referral" | "principal";
}