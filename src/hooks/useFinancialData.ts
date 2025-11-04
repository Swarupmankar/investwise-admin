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

  const isLoading = statsLoading || balancesLoading;
  const isFetching = statsFetching || balancesFetching;
  const error = statsError ?? balancesError ?? null;

  const createCurrentBalance = useCallback(
    async (payload: CreateCurrentBalancePayload) => {
      try {
        const res = await createMutation(payload).unwrap();
        try {
          refetchBalances();
          refetchStats();
        } catch {}
        return { success: true, data: res };
      } catch (err: any) {
        return { success: false, error: err };
      }
    },
    [createMutation, refetchBalances, refetchStats]
  );

  return {
    stats,
    balances,
    raw: { stats: statsRaw ?? null, balances: balancesRaw ?? null },
    isLoading,
    isFetching,
    creating,
    error,
    createCurrentBalance,
    refetchStats,
    refetchBalances,
  } as const;
}
