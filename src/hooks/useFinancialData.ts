// src/hooks/useFinancialData.ts
import { useCallback, useMemo } from "react";
import {
  useGetDashboardStatsQuery,
  useGetCurrentBalancesQuery,
  useCreateCurrentBalanceMutation,
} from "@/API/dashboard.api";
import {
  CreateCurrentBalancePayload,
  CurrentBalance,
  CurrentBalanceRaw,
  DashboardStatsRaw,
} from "@/types/dashboard/stats.types";

export function useFinancialData() {
  // queries
  const {
    data: statsRaw,
    error: statsError,
    isLoading: statsLoading,
    isFetching: statsFetching,
    refetch: refetchStats,
  } = useGetDashboardStatsQuery();

  const {
    data: balancesRaw,
    error: balancesError,
    isLoading: balancesLoading,
    isFetching: balancesFetching,
    refetch: refetchBalances,
  } = useGetCurrentBalancesQuery();

  // mutation for creating current balance
  const [createMutation, { isLoading: creating }] =
    useCreateCurrentBalanceMutation();

  // parse helper
  const parseNum = (v: any, fallback = 0) => {
    if (v === undefined || v === null) return fallback;
    const n = typeof v === "string" ? Number(v) : Number(v);
    return Number.isFinite(n) ? n : fallback;
  };

  // === parsed stats ===
  const stats = useMemo(() => {
    if (!statsRaw) return null;

    const parse = (s?: string) => {
      if (s === undefined || s === null) return 0;
      const n = Number(s);
      return Number.isFinite(n) ? n : 0;
    };

    const principalBalance = parse(statsRaw.principalBalance);
    const principalWithdrawn = parse(statsRaw.principalWithdrawn);
    const thisMonthRoi = parse(statsRaw.thisMonthRoi);
    const thisMonthRefEarnings = parse(statsRaw.thisMonthRefEarnings);
    const thisMonthPrincipalWithdrawn = parse(
      statsRaw.thisMonthPrincipalWithdrawn
    );
    const totalProfitWithdrawn = parse(statsRaw.totalProfitWithdrawn);
    const totalPrincipalWithdrawn = parse(statsRaw.totalPrincipalWithdrawn);

    return {
      raw: statsRaw as DashboardStatsRaw,
      principalBalance,
      principalWithdrawn,
      thisMonthRoi,
      thisMonthRefEarnings,
      thisMonthPrincipalWithdrawn,
      totalProfitWithdrawn,
      totalPrincipalWithdrawn,
      clientsCount: statsRaw.clientsCount,
      investmentsCount: statsRaw.investmentsCount,
    };
  }, [statsRaw]);

  // === parsed balances ===
  const balances = useMemo(() => {
    if (!balancesRaw || !Array.isArray(balancesRaw))
      return [] as CurrentBalance[];

    const parseEntry = (r: CurrentBalanceRaw): CurrentBalance => ({
      id: r.id,
      amount: parseNum(r.amount, 0),
      delta: parseNum(r.delta, 0),
      notes: r.notes ?? null,
      isCurrent: Boolean(r.isCurrent),
      createdAt: new Date(r.createdAt),
      updatedAt: new Date(r.updatedAt),
    });

    // sort descending by createdAt (newest first)
    const parsed = balancesRaw
      .map(parseEntry)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return parsed;
  }, [balancesRaw]);

  // Combined loading / error flags
  const isLoading = statsLoading || balancesLoading;
  const isFetching = statsFetching || balancesFetching;
  const error = statsError ?? balancesError ?? null;

  // create current balance wrapper
  const createCurrentBalance = useCallback(
    async (payload: CreateCurrentBalancePayload) => {
      try {
        const res = await createMutation(payload).unwrap();
        // refetch both queries to update UI
        try {
          refetchBalances();
          refetchStats();
        } catch {
          /* ignore refetch errors */
        }
        return { success: true, data: res };
      } catch (err: any) {
        return { success: false, error: err };
      }
    },
    [createMutation, refetchBalances, refetchStats]
  );

  // expose everything useful
  return {
    // parsed data
    stats, // null if not loaded yet
    balances, // normalized array

    // raw data if needed
    raw: {
      stats: statsRaw ?? null,
      balances: balancesRaw ?? null,
    },

    // flags
    isLoading,
    isFetching,
    creating,
    error: error,

    // actions
    createCurrentBalance,

    // refetch helpers
    refetchStats,
    refetchBalances,
  } as const;
}
