export type KycStatusEnum =
  | "NOT_SUBMITTED"
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

export interface KycDocumentsApi {
  id: number;
  userId: number;
  status: KycStatusEnum;
  verified: boolean;
  rejectionReason?: string | null;
  reviewedAt?: string | null;
  passportFront?: string | null;
  passportBack?: string | null;
  selfieWithId?: string | null;
  utilityBill?: string | null;
  address?: string | null;
  passportFrontStatus?: KycStatusEnum;
  passportBackStatus?: KycStatusEnum;
  selfieWithIdStatus?: KycStatusEnum;
  utilityBillStatus?: KycStatusEnum;
  passportFrontRejectionReason?: string | null;
  passportBackRejectionReason?: string | null;
  selfieWithIdRejectionReason?: string | null;
  utilityBillRejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserInvestmentApi {
  creationAnswers: boolean;
  id: number;
  name: string;
  amount: string;
  forWhome: string;
  duration: string;
  investmentStatus: string;
  thisMonthsReturns: string;
  returnsBalance: string;
  userId: number;
  referredByUserId?: number | null;
  lastReturnsRecieved?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DepositRequestApi {
  id: number;
  userId: number;
  amount: string;
  txId: string;
  proofUrl?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface WithdrawRequestApi {
  id: number;
  userId: number;
  amount: string;
  userWallet: string;
  txId?: string | null;
  adminProofUrl?: string | null;
  userProofUrl?: string | null;
  status: string;
  withdrawFrom: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserNotificationRecipientApi {
  id: number;
  userId: number;
  notificationId: number;
  createdAt: string;
  isRead: boolean;
  readAt?: string | null;
}

export interface ReferralApi {
  earningsBalance: string;
}

export interface UserDetailApi {
  id?: number;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  fundsAvailable: string;
  email: string;
  isActive: boolean;
  kycDocuments?: KycDocumentsApi | null;
  userInvestments: UserInvestmentApi[];
  userInvestmentData?: any | null;
  depositRequests: DepositRequestApi[];
  withdrawRequests: WithdrawRequestApi[];
  Referral?: ReferralApi | null;
  onboardingAnswers: any[];
  userNotificationRecipient: UserNotificationRecipientApi[];
  totalDeposits?: string | number;
  totalWithdrawals?: string | number;
  totalInvested?: string | number;
}
