// src/types/dashboard/stats.types.ts
export interface DashboardStatsRaw {
  principalBalance: string;
  principalWithdrawn: string;
  thisMonthRoi: string;
  thisMonthRefEarnings: string;
  thisMonthPrincipalWithdrawn: string;
  totalProfitWithdrawn: string;
  totalPrincipalWithdrawn: string;
  clientsCount: number;
  investmentsCount: number;
  carryOnOutflowReferral: string;
  carryOnOutflowRoi: string;
}

export interface CurrentBalanceRaw {
  id: number;
  amount: string;
  delta: string;
  notes?: string | null;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CurrentBalance {
  id: number;
  amount: number;
  delta: number;
  notes?: string | null;
  isCurrent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCurrentBalancePayload {
  amount: number;
  notes?: string;
}
