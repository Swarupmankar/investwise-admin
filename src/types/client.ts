export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  kycStatus: "pending" | "approved" | "rejected";
  totalDeposited: number;
  totalInvested: number;
  referralEarnings: number;
  currentBalance: number;
  status: "active" | "dormant";
  referredBy?: string;
  joinDate: string;
  lastActivity: string;
  kycDocuments?: {
    selfieWithId?: string;
    idProof?: string;
    addressProof?: string;
  };
  kycAddressText?: string;
  kycReview?: {
    selfieWithId?: KycItemReview;
    idProof?: KycItemReview;
    addressProof?: KycItemReview;
    addressText?: KycItemReview;
  };
  // Registration questionnaire answers (mock data)
  registrationAnswers?: QA[];
}

export interface QA {
  id: string;
  question: string;
  answer: string;
}

export interface Investment {
  id: string;
  nickname?: string;
  clientId: string;
  amount: number;
  startDate: string;
  status: "active" | "completed" | "paused";
  returnCredited: number;
  // Investment creation questionnaire answers (mock)
  creationAnswers?: QA[];
}

export interface Deposit {
  id: string;
  clientId: string;
  amount: number;
  screenshot?: string;
  txid?: string;
  status: "pending" | "approved" | "rejected";
  date: string;
}

export interface Withdrawal {
  id: string;
  clientId: string;
  type: "return" | "referral" | "principal";
  amount: number;
  txid?: string;
  proof?: string;
  status: "pending" | "completed" | "rejected";
  date: string;
}

export interface Referral {
  id: string;
  referrerId: string;
  referredClientId: string;
  referredClientName: string;
  // Additional details about the referred user and investment
  referredClientBalance?: number;
  referredClientTotalInvested?: number;
  referredInvestmentId?: string;
  referredInvestmentAmount?: number;
  referredInvestmentStatus?: "active" | "completed" | "paused";
  bonusReceived: number;
  status: "paid" | "unpaid";
  date: string;
}

export interface AdminMessage {
  id: string;
  clientId: string;
  title: string;
  message: string;
  sentBy: string;
  sentAt: string;
  emailSent: boolean;
}

export interface KycItemReview {
  status: "pending" | "approved" | "rejected";
  notes?: string;
}

export interface AdminNote {
  id: string;
  clientId: string;
  tag: string;
  text: string;
  createdAt: string;
  createdBy: string;
}
