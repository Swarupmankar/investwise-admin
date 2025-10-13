// src/types/users/users.types.ts
export type UserStatus = "active" | "archived" | string;

export interface UserApi {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  kycStatus: string;
  totalDeposited: string;
  totalInvested: string;
  referralEarnings: string;
  currentBalance: string;
  status: UserStatus;
  activeInvestmentsCount: number;
}

export interface UsersMeta {
  total: number;
  skip: number;
  take: number;
}

export interface AllUsersResponse {
  data: UserApi[];
  meta: UsersMeta;
}
