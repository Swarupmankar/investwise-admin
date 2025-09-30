import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery(),
  tagTypes: [
    "Users",
    "Support",
    "Referral",
    "Investment",
    "Notification",
    "Report",
    "Transactions",
    "Broadcast",
    "KYC",
    "Deposits",
    "Withdrawals",
    "Gateway",
    "Dashboard",
    "Accounting",
  ],

  endpoints: () => ({}),
});
