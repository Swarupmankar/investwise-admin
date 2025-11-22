export const ENDPOINTS = {
  USERS: {
    ALL_USERS: "/admin/clients/all",
    USER_BY_ID: (id: number) => `/admin/clients/client/${id}`,
    USERS_INVESTMENT_HISTORY: (id: number) =>
      `/admin/clients/client/returns-history/${id}`,
    REFERRAL: (id: number) => `/admin/clients/referral/${id}`,
    USER_ANSWERS: (id: number) => `/admin/clients/user-answers/${id}`,
    USER_MESSAGE: (id: number | string) => `/admin/notifications/user/${id}`,
    PAUSE: (id: string | number) => `/admin/investments/pause/${id}`,
    RESUME: (id: string | number) => `/admin/investments/resume/${id}`,
    INVESTMENT_QUESTIONS: (id: string | number) =>
      `/admin/clients/investment-answers/${id}`,
  },

  SUPPORT: {
    ALL_TICKETS: "/admin/support/all-tickets",
    TICKET_BY_ID: (id: number) => `/admin/support/all-tickets/${id}`,
    TICKET_REPLY: (id: number) => `/admin/support/ticket/${id}/reply`,
    TICKET_CLOSE: (id: number) => `/admin/support/ticket/${id}/close`,
  },

  BROADCAST: {
    CREATE_NEWS: "/admin/reports/create",
    ALL_NEWS: "/admin/reports",
    ALL_NOTIFICATIONS: "/admin/notifications/all",
    CREATE_NOTIFICATION: "/admin/notifications/create",
    EDIT_NOTIFICATION: (id: number | string) =>
      `/admin/notifications/edit/${id}`,
    DELETE_NOTIFICATION: (id: number | string) =>
      `/admin/notifications/delete/${id}`,

    EDIT_REPORT: (id: number | string) => `/admin/reports/edit/${id}`,
    DELETE_REPORT: (id: number | string) => `/admin/reports/delete/${id}`,
  },

  KYC: {
    KYC_ALL_REQUESTS: "/admin/clients/kyc/all-requests",
    KYC_REVIEW: (kycId: number | string) =>
      `/admin/clients/kyc/${kycId}/review`,
    KYC_DELETE: (kycId: number | string) =>
      `/admin/clients/kyc/${kycId}/delete`,
  },

  DEPOSITS: {
    ALL_DEPOSITS: "/admin/transactions/all-users-deposits",
    APPROVE_DEPOSITS: "/admin/transactions/update-deposit-transaction",
  },

  WITHDRAWALS: {
    ALL_WITHDRAWALS: "/admin/transactions/all-users-withdrawals",
    UPLOAD_WITHDRAWAL_PROOF: "/admin/transactions/upload-withdraw-proof",
    UPDATE_WITHDRAWAL_STATUS: "/admin/transactions/update-withdraw-transaction",
  },

  GATEWAY: {
    CREATE_WALLET: "/admin/wallet",
    ALL_WALLETS: "/admin/wallet",
    SET_ACTIVE: (id: number | string) => `/admin/wallet/set-active/${id}`,
    DELETE_WALLET: (id: number | string) => `/admin/wallet/${id}`,
    WALLET_ACTIVITIES: "/admin/wallet/activities",
  },

  DASHBOARD: {
    STATS: "/admin/dashboard/stats",
    CURRENT_BALANCES: "/admin/dashboard/current-balances",
  },

  ACCOUNTING: {
    ACCOUNT_BALANCE_OVERVIEW: "/admin/accounting/account-balance-overview",
    REPLENISH_PRINCIPAL: "/admin/accounting/replenish-principal",
    ROI_DETAILS: "/admin/accounting/roi-details",
    WITHDRAW_PRINCIPAL: "/admin/accounting/withdraw-principal",
    WITHDRAW_HISTORY: "/admin/accounting/withdraw-history",
  },

  INVESTMENTS: {
    ALL_SETTLEMENTS: "/admin/investments/get-all-settlements",
    SETTLE_INVESTMENT: "/admin/investments/settle-investment",
  },
};
