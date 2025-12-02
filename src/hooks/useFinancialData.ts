// src/hooks/useFinancialData.ts
import { useCallback, useMemo } from "react";
import {
  useGetDashboardStatsQuery,
  useGetCurrentBalancesQuery,
  useCreateCurrentBalanceMutation,
  useGetNetProfitQuery,
} from "@/API/dashboard.api";
import {
  CreateCurrentBalancePayload,
  CurrentBalance,
  CurrentBalanceRaw,
  DashboardStatsRaw,
} from "@/types/dashboard/stats.types";

export function useFinancialData() {
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

  // NEW: net profit query
  const {
    data: netProfitRaw,
    error: netProfitError,
    isLoading: netProfitLoading,
    refetch: refetchNetProfit,
  } = useGetNetProfitQuery();

  const [createMutation, { isLoading: creating }] =
    useCreateCurrentBalanceMutation();

  const parseNum = (v: any, fallback = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };

  // === parsed stats ===
  const stats = useMemo(() => {
    if (!statsRaw) return null;

    return {
      raw: statsRaw as DashboardStatsRaw,
      principalBalance: parseNum(statsRaw.principalBalance),
      principalWithdrawn: parseNum(statsRaw.principalWithdrawn),
      thisMonthRoi: parseNum(statsRaw.thisMonthRoi),
      thisMonthRefEarnings: parseNum(statsRaw.thisMonthRefEarnings),
      thisMonthPrincipalWithdrawn: parseNum(
        statsRaw.thisMonthPrincipalWithdrawn
      ),
      totalProfitWithdrawn: parseNum(statsRaw.totalProfitWithdrawn),
      totalPrincipalWithdrawn: parseNum(statsRaw.totalPrincipalWithdrawn),
      clientsCount: statsRaw.clientsCount,
      investmentsCount: statsRaw.investmentsCount,
      carryOnOutflowReferral: parseNum(statsRaw.carryOnOutflowReferral),
      carryOnOutflowRoi: parseNum(statsRaw.carryOnOutflowRoi),
    };
  }, [statsRaw]);

  // === parsed balances ===
  const balances = useMemo(() => {
    if (!balancesRaw || !Array.isArray(balancesRaw))
      return [] as CurrentBalance[];

    return balancesRaw
      .map(
        (r: CurrentBalanceRaw): CurrentBalance => ({
          id: r.id,
          amount: parseNum(r.amount),
          delta: parseNum(r.delta),
          notes: r.notes ?? null,
          isCurrent: Boolean(r.isCurrent),
          createdAt: new Date(r.createdAt),
          updatedAt: new Date(r.updatedAt),
        })
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [balancesRaw]);

  // parsed net profit (from new endpoint)
  const netProfit = useMemo(() => parseNum(netProfitRaw, 0), [netProfitRaw]);

  const isLoading = statsLoading || balancesLoading || netProfitLoading;
  const isFetching = statsFetching || balancesFetching;
  const error = statsError ?? balancesError ?? netProfitError ?? null;

  const createCurrentBalance = useCallback(
    async (payload: CreateCurrentBalancePayload) => {
      try {
        const res = await createMutation(payload).unwrap();
        try {
          refetchBalances();
          refetchStats();
          refetchNetProfit();
        } catch {}
        return { success: true, data: res };
      } catch (err: any) {
        return { success: false, error: err };
      }
    },
    [createMutation, refetchBalances, refetchStats, refetchNetProfit]
  );

  return {
    stats,
    balances,
    netProfit,
    raw: {
      stats: statsRaw ?? null,
      balances: balancesRaw ?? null,
      netProfit: netProfitRaw ?? null,
    },
    isLoading,
    isFetching,
    creating,
    error,
    createCurrentBalance,
    refetchStats,
    refetchBalances,
    refetchNetProfit,
  } as const;
}
