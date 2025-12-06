import { useCallback, useMemo } from "react";
import {
  useGetDashboardStatsQuery,
  useGetCurrentBalancesQuery,
  useCreateCurrentBalanceMutation,
  useGetNetProfitQuery,
  useGetOutflowStatsQuery,
} from "@/API/dashboard.api";
import {
  CreateCurrentBalancePayload,
  CurrentBalance,
  CurrentBalanceRaw,
  DashboardStatsRaw,
  NetProfitResponse,
  OutflowStatsRaw,
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
    data: outflowRaw,
    error: outflowError,
    isLoading: outflowLoading,
    isFetching: outflowFetching,
    refetch: refetchOutflow,
  } = useGetOutflowStatsQuery();

  const {
    data: balancesRaw,
    error: balancesError,
    isLoading: balancesLoading,
    isFetching: balancesFetching,
    refetch: refetchBalances,
  } = useGetCurrentBalancesQuery();

  const {
    data: currentPnlRaw = {
      currentPnl: "0",
      netProfit: "0",
    } as NetProfitResponse,
    error: currentPnlError,
    isLoading: currentPnlLoading,
    refetch: refetchCurrentPnl,
  } = useGetNetProfitQuery();

  const [createMutation, { isLoading: creating }] =
    useCreateCurrentBalanceMutation();

  const parseNum = (v: any, fallback = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };

  const stats = useMemo(() => {
    if (!statsRaw) return null;

    return {
      raw: statsRaw as DashboardStatsRaw,
      principalBalance: parseNum(statsRaw.principalBalance),
      principalWithdrawn: parseNum(statsRaw.principalWithdrawn),
      totalProfitWithdrawn: parseNum(statsRaw.totalProfitWithdrawn),
      totalPrincipalWithdrawn: parseNum(statsRaw.totalPrincipalWithdrawn),
      clientsCount: statsRaw.clientsCount,
      investmentsCount: statsRaw.investmentsCount,
    };
  }, [statsRaw]);

  const outflow = useMemo(() => {
    if (!outflowRaw) return null;

    return {
      raw: outflowRaw as OutflowStatsRaw,
      projectedThisMonthRoi: parseNum(outflowRaw.projectedThisMonthRoi),
      projectedThisMonthReferral: parseNum(
        outflowRaw.projectedThisMonthReferral
      ),
      thisMonthPrincipalWithdrawn: parseNum(
        outflowRaw.thisMonthPrincipalWithdrawn
      ),
      carryOnOutflowReferral: parseNum(outflowRaw.carryOnOutflowReferral),
      carryOnOutflowRoi: parseNum(outflowRaw.carryOnOutflowRoi),
    };
  }, [outflowRaw]);

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

  const currentPnl = useMemo(
    () => parseNum(currentPnlRaw.currentPnl),
    [currentPnlRaw]
  );

  const isLoading =
    statsLoading || balancesLoading || currentPnlLoading || outflowLoading;
  const isFetching = statsFetching || balancesFetching || outflowFetching;
  const error =
    statsError ?? balancesError ?? currentPnlError ?? outflowError ?? null;

  const createCurrentBalance = useCallback(
    async (payload: CreateCurrentBalancePayload) => {
      try {
        const res = await createMutation(payload).unwrap();
        try {
          refetchBalances();
          refetchStats();
          refetchCurrentPnl();
          refetchOutflow();
        } catch {}
        return { success: true, data: res };
      } catch (err: any) {
        return { success: false, error: err };
      }
    },
    [
      createMutation,
      refetchBalances,
      refetchStats,
      refetchCurrentPnl,
      refetchOutflow,
    ]
  );

  return {
    stats,
    outflow,
    balances,
    currentPnl,
    raw: {
      stats: statsRaw ?? null,
      outflow: outflowRaw ?? null,
      balances: balancesRaw ?? null,
      currentPnl: currentPnlRaw ?? null,
    },
    isLoading,
    isFetching,
    creating,
    error,
    createCurrentBalance,
    refetchStats,
    refetchBalances,
    refetchCurrentPnl,
    refetchOutflow,
  } as const;
}
