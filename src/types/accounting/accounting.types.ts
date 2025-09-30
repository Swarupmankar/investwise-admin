export interface AccountBalanceOverviewResponse {
  netProfit: string;
  netProfitTotalWithdrawn: string;
  principalBalance: string;
  currentPrincipalWithdrawn: string;
  principalTotalWithdrawn: string;
  totalPlatformBalance: string;
}

export interface ReplenishPrincipalForm {
  amount: string | number;
  purpose?: string;
  notes?: string;
  txId?: string;
  file?: File | undefined | null;
}

export interface RoiDetailsResponse {
  currentRoi: string;
  usedRoi: string;
}

export interface RoiDetailsRequest {
  currentRoi: number;
  usedRoiNumber: number;
}

export interface WithdrawPrincipalResponse {
  success?: boolean;
  message?: string;
  data?: any;
}

export interface WithdrawPrincipalForm {
  withdrawFrom: "PRINCIPAL_BALANCE" | "NET_PROFIT" | string;
  amount: string | number;
  purpose?: string;
  notes?: string;
  txId?: string;
  file?: File | undefined | null;
}
