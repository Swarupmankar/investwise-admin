export interface DashboardStatsRaw {
  principalBalance: string;
  principalWithdrawn: string;
  totalProfitWithdrawn: string;
  totalPrincipalWithdrawn: string;
  clientsCount: number;
  investmentsCount: number;
}

export interface OutflowStatsRaw {
  projectedThisMonthRoi: string;
  projectedThisMonthReferral: string;
  thisMonthPrincipalWithdrawn: string;
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

export interface NetProfitResponse {
  currentPnl: string;
  netProfit: string;
}
