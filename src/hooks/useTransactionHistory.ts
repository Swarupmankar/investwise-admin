// src/hooks/useTransactionHistory.ts
import { useMemo } from "react";
import { useDepositsData } from "./useDepositsData";
import { useWithdrawalsData } from "./useWithdrawalsData";
import type {
  Transaction,
  TransactionFilters,
  TransactionSummary,
} from "@/types/transaction";

/**
 * Convert many different backend status tokens into one of:
 *   - "completed" (approved/paid/completed)
 *   - "pending"   (pending / review / waiting)
 *   - "rejected"  (rejected/fail)
 */
const mapToTxnStatus = (raw?: string): "completed" | "pending" | "rejected" => {
  const s = (raw ?? "").toString().trim().toLowerCase();
  if (!s) return "pending";
  if (s.includes("reject")) return "rejected";
  if (
    s.includes("approv") ||
    s.includes("paid") ||
    s.includes("complete") ||
    s === "approved"
  )
    return "completed";
  // treat review/admin_proof/etc as pending
  return "pending";
};

/** Use many possible date fields defensively and return ISO or empty string. */
const pickDate = (obj: any) =>
  obj?.date ??
  obj?.submittedAt ??
  obj?.createdAt ??
  obj?.requestedAt ??
  obj?.requestDate ??
  "";

export const useTransactionHistory = () => {
  // useDepositsData provides rawDeposits (full mapped UI deposits) and deposits (filtered).
  const { rawDeposits = [] as any[] } = useDepositsData();
  // useWithdrawalsData exposes getFiltered (hook) and raw (api raw list)
  const withdrawalsHook = useWithdrawalsData();
  const getFilteredWithdrawals =
    (withdrawalsHook as any).getFiltered ??
    (withdrawalsHook as any).getFilteredWithdrawals ??
    null;
  const rawWithdrawals =
    (withdrawalsHook as any).raw ?? (withdrawalsHook as any).withdrawals ?? [];

  const allTransactions = useMemo(() => {
    console.debug(
      "[useTransactionHistory] rawDeposits:",
      (rawDeposits ?? []).length,
      "rawWithdrawals:",
      (rawWithdrawals ?? []).length
    );

    const txs: Transaction[] = [];

    // --- Deposits (use rawDeposits so we include all statuses) ---
    (rawDeposits ?? []).forEach((d: any) => {
      const date = pickDate(d);
      const status = mapToTxnStatus(d.status ?? d.statusRaw ?? d.statusText);
      const amount = Number(d.amount ?? d.value ?? 0);
      const txid = d.txid ?? d.txId ?? d.transactionId ?? null;

      txs.push({
        id: `deposit-${d.id}`,
        date,
        clientName: d.clientName ?? d.userName ?? "",
        clientEmail: d.clientEmail ?? d.userEmail ?? "",
        clientId: d.clientId ?? d.userId ?? "",
        type: "deposit",
        amount,
        status,
        txid,
        screenshot: d.screenshot ?? d.proofUrl ?? d.adminProofUrl ?? null,
        adminMessage: d.adminMessage ?? null,
        sourceType: "deposit",
        sourceId: d.id,
      });
    });

    // --- Withdrawals ---
    // Prefer using the hook's getFiltered helper when available, otherwise use rawWithdrawals
    const withdrawalsList = getFilteredWithdrawals
      ? getFilteredWithdrawals({
          query: "",
          status: "all",
          startDate: undefined,
          endDate: undefined,
        })
      : rawWithdrawals;

    (withdrawalsList ?? []).forEach((w: any) => {
      const date = pickDate(w);
      const status = mapToTxnStatus(w.status ?? w.statusRaw ?? w.state);
      const amount = Number(w.amount ?? 0);

      // friendly withdrawal type mapping (many backends use withdrawFrom token)
      let txType: Transaction["type"] = "withdrawal-principal";
      const wf = (w.withdrawFrom ?? w.type ?? "").toString().toUpperCase();
      if (
        wf === "INVESTMENT_RETURNS" ||
        wf === "RETURN" ||
        wf === "RETURN_WITHDRAW"
      )
        txType = "withdrawal-return";
      else if (wf === "REFERRAL_EARNING" || wf === "REFERRAL")
        txType = "withdrawal-referral";
      else txType = "withdrawal-principal";

      const wallet = w.walletAddress ?? w.userWallet ?? w.wallet ?? null;
      const txid = w.tronScanLink ?? w.txid ?? w.txId ?? null;
      const screenshot =
        w.tronScanScreenshot ??
        w.userProofUrl ??
        w.userProof ??
        w.userProofUrl ??
        w.adminProofUrl ??
        null;

      txs.push({
        id: `withdrawal-${w.id}`,
        date,
        clientName: w.clientName ?? w.userName ?? "",
        clientEmail: w.clientEmail ?? w.userEmail ?? "",
        clientId: w.clientId ?? w.userId ?? "",
        type: txType,
        amount,
        status,
        walletAddress: wallet,
        txid,
        screenshot,
        adminMessage: w.adminMessage ?? null,
        notes: w.notes ?? null,
        sourceType: "withdrawal",
        sourceId: w.id,
      });
    });

    // sort newest-first (defensive if date missing)
    return txs.sort((a, b) => {
      const da = a.date ? new Date(a.date).getTime() : 0;
      const db = b.date ? new Date(b.date).getTime() : 0;
      return db - da;
    });
  }, [rawDeposits, rawWithdrawals, getFilteredWithdrawals]);

  const getFilteredTransactions = (filters: TransactionFilters) => {
    return allTransactions.filter((t) => {
      // search
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (
          !(t.clientName ?? "").toLowerCase().includes(q) &&
          !(t.clientEmail ?? "").toLowerCase().includes(q) &&
          !String(t.clientId ?? "")
            .toLowerCase()
            .includes(q) &&
          !((t.txid ?? "") as string).toLowerCase().includes(q)
        ) {
          return false;
        }
      }

      // type
      if (filters.type && filters.type !== "all") {
        if (t.type !== filters.type) return false;
      }

      // status
      if (filters.status && filters.status !== "all") {
        if (t.status !== filters.status) return false;
      }

      // date range
      if (filters.dateRange?.from || filters.dateRange?.to) {
        const td = new Date(t.date);
        if (filters.dateRange?.from && td < filters.dateRange.from)
          return false;
        if (filters.dateRange?.to && td > filters.dateRange.to) return false;
      }

      return true;
    });
  };

  const getSummary = (): TransactionSummary => {
    const completed = allTransactions.filter((t) => t.status === "completed");
    const pendingAmount = allTransactions
      .filter((t) => t.status === "pending")
      .reduce((s, t) => s + t.amount, 0);

    const totalDeposited = completed
      .filter((t) => t.type === "deposit")
      .reduce((s, t) => s + t.amount, 0);
    const totalReferralPayouts = completed
      .filter((t) => t.type === "withdrawal-referral")
      .reduce((s, t) => s + t.amount, 0);
    const totalReturns = completed
      .filter((t) => t.type === "withdrawal-return")
      .reduce((s, t) => s + t.amount, 0);
    const totalPrincipal = completed
      .filter((t) => t.type === "withdrawal-principal")
      .reduce((s, t) => s + t.amount, 0);

    return {
      totalDeposited,
      totalWithdrawn: totalReferralPayouts + totalReturns + totalPrincipal,
      totalReferralPayouts,
      totalReturns,
      totalPrincipal,
      depositCount: allTransactions.filter((t) => t.type === "deposit").length,
      withdrawalCount: allTransactions.filter((t) =>
        t.type.startsWith("withdrawal")
      ).length,
      pendingAmount,
    };
  };

  const getTransactionById = (id: string) =>
    allTransactions.find((t) => t.id === id);

  return {
    allTransactions,
    getFilteredTransactions,
    getSummary,
    getTransactionById,
  };
};
