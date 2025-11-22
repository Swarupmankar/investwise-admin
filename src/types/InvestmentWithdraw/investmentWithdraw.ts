export type SettlementStatusApi = "PENDING" | "COMPLETED" | "REJECTED";

export interface InvestmentSettlementApi {
  id: number;
  investmemtId: number;
  amount: string;
  status: SettlementStatusApi;
  createdAt: string;
  updatedAt: string;
}

export interface InvestmentSettlementUserApi {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  investmentSettlements: InvestmentSettlementApi[];
}

export type InvestmentSettlementsApi = InvestmentSettlementUserApi[];

// ---------- UI / page types ----------

export type InvestmentWithdrawFilterStatus = "all" | "pending" | "approved";

export type InvestmentWithdrawSortOrder = "newest" | "oldest";

export interface InvestmentWithdrawRequest {
  id: number;
  investmentId: number;
  amount: number;
  date: string;
  status: "pending" | "approved" | "rejected";
  clientName: string;
  clientEmail: string;
  rawStatus: SettlementStatusApi;
  approvedAt?: string;
}

export interface InvestmentWithdrawFiltersState {
  status?: InvestmentWithdrawFilterStatus;
  q?: string;
  sortOrder?: InvestmentWithdrawSortOrder;
}
