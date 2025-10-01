// src/types/referral.types.ts

export type Referral = {
  id: number;
  code: string;
  balance: string;
};

export type Stats = {
  totalReferrals: number;
  bonusEarned: string;
  paidOut: string;
  pending: string;
  totalActiveInvestments: number;
};

export type ReferredInvestment = {
  investmentId: number;
  name: string;
  amount: string;
  status: string;
  activeLabel?: string;
  eligibleBonus1Pct: string;
  creditedOn?: string | null;
  referralEarningAmount?: string;
};

export type ReferralListItem = {
  referredUserId: number;
  referredUserName: string | null;
  referredUserEmail: string | null;
  accountBalance: string;
  totalInvested: string;
  referredInvestment?: ReferredInvestment | null;
};

export type UnderWhom = {
  referrer?: { id: number; name: string; email?: string } | null;
  referrerChildren: Array<{ id: number; name: string }>;
};

export type ReferralOverviewResponse = {
  referral: Referral | null;
  stats: Stats;
  referralsList: ReferralListItem[];
  underWhom: UnderWhom;
};
