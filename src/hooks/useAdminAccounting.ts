// src/hooks/useAdminAccounting.ts
import { useState, useMemo, useCallback, useEffect } from "react";
import type {
  AdminAccount,
  AdminTransaction,
  ManualInput,
  AdminTransactionFilters,
  AdminAccountingStats,
} from "@/types/adminTransaction";
import {
  useGetAccountBalanceOverviewQuery,
  useGetRoiDetailsQuery,
  useReplenishPrincipalMutation,
  useWithdrawPrincipalMutation,
  useGetWithdrawHistoryQuery,
} from "@/API/accounting.api";

export const useAdminAccounting = () => {
  const [filters, setFilters] = useState<AdminTransactionFilters>({
    type: "all",
  });

  // Manual inputs state
  const [manualInputs, setManualInputs] = useState<ManualInput>({
    roiMadeThisMonth: 0,
    roiUsedForPayouts: 0,
    lastRecalculated: new Date().toISOString(),
  });

  // Account overview
  const {
    data: accountOverviewData,
    isLoading: isAccountLoading,
    isFetching: isAccountFetching,
    refetch: refetchAccountOverview,
  } = useGetAccountBalanceOverviewQuery(undefined, {});

  // ROI details
  const {
    data: roiDetailsData,
    isLoading: isRoiLoading,
    refetch: refetchRoi,
  } = useGetRoiDetailsQuery(undefined);

  // Withdraw history (server source of truth for transactions)
  const {
    data: withdrawHistoryData,
    isLoading: isWithdrawHistoryLoading,
    refetch: refetchWithdrawHistory,
  } = useGetWithdrawHistoryQuery(undefined);

  // mutations
  const [replenishPrincipalApi, { isLoading: isReplenishLoading }] =
    useReplenishPrincipalMutation();
  const [withdrawPrincipalApi, { isLoading: isWithdrawPrincipalLoading }] =
    useWithdrawPrincipalMutation();

  // Map API response to AdminAccount
  const account: AdminAccount = useMemo(() => {
    if (!accountOverviewData) {
      return {
        netProfitAvailable: 0,
        principalBalance: 0,
        currentPrincipalWithdrawn: 0,
        totalWithdrawnNetProfit: 0,
        totalWithdrawnPrincipal: 0,
        lastUpdated: new Date().toISOString(),
      };
    }

    const netProfit = Number(accountOverviewData.netProfit || 0);
    const principal = Number(accountOverviewData.principalBalance || 0);
    const currentPrincipalWithdrawn = Number(
      accountOverviewData.currentPrincipalWithdrawn ?? 0
    );
    const totalWithdrawnPrincipal = Number(
      accountOverviewData.principalTotalWithdrawn ??
        accountOverviewData.principalTotalWithdrawn ??
        0
    );
    const totalWithdrawnNetProfit = Number(
      accountOverviewData.netProfitTotalWithdrawn || 0
    );

    return {
      netProfitAvailable: netProfit,
      principalBalance: principal,
      currentPrincipalWithdrawn,
      totalWithdrawnNetProfit,
      totalWithdrawnPrincipal,
      lastUpdated: new Date().toISOString(),
    };
  }, [accountOverviewData]);

  // Seed manual inputs from ROI details
  useEffect(() => {
    if (!roiDetailsData) return;
    setManualInputs({
      roiMadeThisMonth: Number(roiDetailsData.currentRoi || 0),
      roiUsedForPayouts: Number(roiDetailsData.usedRoi || 0),
      lastRecalculated: new Date().toISOString(),
    });
  }, [roiDetailsData]);

  // Map withdraw-history -> AdminTransaction (server transactions only)
  const serverTransactions: AdminTransaction[] = useMemo(() => {
    if (!withdrawHistoryData || !Array.isArray(withdrawHistoryData)) return [];

    const mapped = (withdrawHistoryData as any[]).map((item) => {
      const isPrincipal = item.withdrawFrom === "PRINCIPAL_BALANCE";
      const isReplenish = String(item.type).toUpperCase() === "REPLENISH";

      // For display: REPLENISH reduces deficit => show negative amount (consistent with UI convention)
      const rawAmount = Number(item.amount || 0);
      const amount = isReplenish ? -Math.abs(rawAmount) : rawAmount;

      const createdAt = item.createdAt ?? new Date().toISOString();

      const txn: AdminTransaction = {
        id: String(item.id),
        type: isPrincipal ? "principal" : "net_profit",
        amount,
        date: createdAt.split("T")[0],
        purpose: item.purpose ?? "",
        notes: item.notes ?? undefined,
        proofScreenshot: item.screenshot ?? undefined,
        tronScanLink: item.txId ?? undefined,
        adminName: item.adminName ?? "Admin",
        createdAt,
      };

      return txn;
    });

    // sort by createdAt desc
    mapped.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return mapped;
  }, [withdrawHistoryData]);

  // Combined transactions shown to UI = serverTransactions ONLY (no local optimistic entries)
  const combinedTransactions = serverTransactions;

  // Stats derived from server transactions
  const stats = useMemo((): AdminAccountingStats => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyTransactions = combinedTransactions.filter((t) => {
      const td = new Date(t.date);
      return td.getMonth() === currentMonth && td.getFullYear() === currentYear;
    });

    return {
      totalTransactions: combinedTransactions.length,
      monthlyWithdrawals: monthlyTransactions.reduce((s, t) => s + t.amount, 0),
      netProfitTransactions: combinedTransactions.filter(
        (t) => t.type === "net_profit"
      ).length,
      principalTransactions: combinedTransactions.filter(
        (t) => t.type === "principal"
      ).length,
    };
  }, [combinedTransactions]);

  // FILTERS
  const filteredTransactions = useMemo(() => {
    return combinedTransactions.filter((transaction) => {
      if (
        filters.type &&
        filters.type !== "all" &&
        transaction.type !== filters.type
      )
        return false;

      if (filters.dateRange?.from || filters.dateRange?.to) {
        const transactionDate = new Date(transaction.date);
        if (filters.dateRange.from && transactionDate < filters.dateRange.from)
          return false;
        if (filters.dateRange.to && transactionDate > filters.dateRange.to)
          return false;
      }

      if (
        filters.adminName &&
        !transaction.adminName
          .toLowerCase()
          .includes(filters.adminName.toLowerCase())
      )
        return false;

      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        return (
          transaction.purpose.toLowerCase().includes(q) ||
          transaction.notes?.toLowerCase().includes(q) ||
          transaction.adminName.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [combinedTransactions, filters]);

  /**
   * addWithdrawal
   * - principal: call withdrawPrincipal API and then refetch server history and balances (no optimistic local insert)
   * - net_profit: local-only (no server endpoint) — but will NOT be included in the transactions list shown to UI because UI uses server history only
   */
  const addWithdrawal = useCallback(
    async (
      type: "net_profit" | "principal",
      amount: number,
      purpose: string,
      notes?: string,
      proofScreenshot?: File | string | null,
      tronScanLink?: string
    ): Promise<string> => {
      // Create an id for the caller if they need it, but we won't persist locally for UI listing
      const tempId = Date.now().toString();

      if (type === "principal") {
        const payload = {
          withdrawFrom: "PRINCIPAL_BALANCE" as const,
          amount,
          purpose,
          notes,
          txId: tronScanLink,
          file:
            proofScreenshot && typeof proofScreenshot !== "string"
              ? proofScreenshot
              : undefined,
        };

        try {
          await withdrawPrincipalApi(payload as any).unwrap?.();
          // refresh authoritative data
          refetchWithdrawHistory();
          refetchAccountOverview();
          return tempId;
        } catch (err) {
          throw err;
        }
      }

      // NET_PROFIT: no server endpoint; do not add to displayed transactions (since we show serverHistory only)
      return tempId;
    },
    [withdrawPrincipalApi, refetchWithdrawHistory, refetchAccountOverview]
  );

  // REPLENISH PRINCIPAL
  const replenishPrincipal = useCallback(
    async (
      amount: number,
      purpose: string,
      notes?: string,
      proofScreenshotFile?: File | null,
      tronScanLink?: string
    ) => {
      if (amount <= 0) throw new Error("Amount must be greater than 0");

      const payload = {
        amount,
        purpose,
        notes,
        txId: tronScanLink,
        file: proofScreenshotFile ?? undefined,
      };

      try {
        await replenishPrincipalApi(payload as any).unwrap?.();
        // refresh authoritative data
        refetchWithdrawHistory();
        refetchAccountOverview();
        return { success: true };
      } catch (err) {
        throw err;
      }
    },
    [replenishPrincipalApi, refetchWithdrawHistory, refetchAccountOverview]
  );

  // Manual inputs update
  const updateManualInputs = useCallback((inputs: Partial<ManualInput>) => {
    setManualInputs((prev) => ({
      ...prev,
      ...inputs,
      lastRecalculated: new Date().toISOString(),
    }));
  }, []);

  const recalculateNetProfit = useCallback(() => {
    refetchAccountOverview();
  }, [refetchAccountOverview]);

  const updateFilters = useCallback(
    (newFilters: Partial<AdminTransactionFilters>) => {
      setFilters((prev) => ({ ...prev, ...newFilters }));
    },
    []
  );

  const clearFilters = useCallback(() => setFilters({ type: "all" }), []);

  return {
    account,
    transactions: filteredTransactions,
    manualInputs,
    filters,
    stats,
    addWithdrawal,
    replenishPrincipal,
    updateManualInputs,
    recalculateNetProfit,
    updateFilters,
    clearFilters,
    isAccountLoading: isAccountLoading || isAccountFetching,
    isRoiLoading,
    isReplenishLoading,
    isWithdrawPrincipalLoading,
    isWithdrawHistoryLoading,
    refetchAccountOverview,
    refetchRoi,
    refetchWithdrawHistory,
  };
};
