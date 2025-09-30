// src/hooks/useDepositsData.ts
import { useCallback, useMemo, useState } from "react";
import {
  useGetAllDepositsQuery,
  useUpdateDepositStatusMutation,
} from "@/API/deposits.api";
import { useGetAllUsersQuery } from "@/API/users.api";
import type { DepositApi, DepositRequest } from "@/types/transactions/deposit";

/** safe parse to number */
const toNumber = (v?: string | number | null) => {
  if (v === undefined || v === null) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const cleaned = String(v).replace(/[^0-9.-]+/g, "");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
};

/** canonicalize deposit status into "pending"|"approved"|"rejected"|other */
const canonicalStatus = (raw?: string) => {
  const s = (raw ?? "").toString().trim().toLowerCase();
  if (!s) return "unknown";
  if (s.includes("pend")) return "pending";
  if (s.includes("reject")) return "rejected";
  if (
    s.includes("approv") ||
    s.includes("paid") ||
    s.includes("complete") ||
    s.includes("success")
  )
    return "approved";
  return s;
};

export function useDepositsData() {
  const {
    data: depositsApi = [],
    isLoading,
    isFetching,
    refetch: refetchDeposits,
  } = useGetAllDepositsQuery();
  const { data: users = [] } = useGetAllUsersQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  const [filters, setFilters] = useState<{
    status?: string;
    q?: string;
    startDate?: string;
    endDate?: string;
  }>({
    status: "pending", // default: show pending
    q: undefined,
  });

  const [updateDepositStatusMutation, { isLoading: isUpdating }] =
    useUpdateDepositStatusMutation();

  // map API DepositApi -> UI DepositRequest
  const deposits: DepositRequest[] = useMemo(() => {
    const usersMap = new Map<number, { name?: string; email?: string }>();
    (users || []).forEach((u: any) => {
      usersMap.set(u.id, {
        name: u.name ?? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim(),
        email: u.email ?? "",
      });
    });

    return (depositsApi || []).map((d: DepositApi) => {
      const user = usersMap.get(d.userId) ?? {
        name: `User ${d.userId}`,
        email: "",
      };
      return {
        id: d.id,
        userId: d.userId,
        clientId: d.userId,
        clientName: user.name ?? `User ${d.userId}`,
        clientEmail: user.email ?? "",
        amount: toNumber(d.amount),
        txid: (d as any).txId ?? (d as any).txid ?? null,
        screenshot: (d as any).proofUrl ?? (d as any).screenshot ?? null,
        status: d.status ?? "",
        submittedAt: d.createdAt,
        reviewedAt: (d as any).reviewedAt ?? null,
        reviewedBy: (d as any).reviewedBy ?? null,
        adminMessage: (d as any).adminMessage ?? null,
      } as DepositRequest;
    });
  }, [depositsApi, users]);

  // stats
  const stats = useMemo(() => {
    const s = { total: 0, pending: 0, approved: 0, rejected: 0 };
    deposits.forEach((d) => {
      s.total++;
      const st = canonicalStatus(d.status);
      if (st === "pending") s.pending++;
      else if (st === "approved") s.approved++;
      else if (st === "rejected") s.rejected++;
    });
    return s;
  }, [deposits]);

  const filtered = useMemo(() => {
    const q = (filters.q ?? "").toString().toLowerCase().trim();
    return deposits.filter((d) => {
      // status filter
      if (filters.status && filters.status !== "all") {
        if (
          filters.status === "pending" &&
          canonicalStatus(d.status) !== "pending"
        )
          return false;
        if (
          filters.status === "approved" &&
          canonicalStatus(d.status) !== "approved"
        )
          return false;
        if (
          filters.status === "rejected" &&
          canonicalStatus(d.status) !== "rejected"
        )
          return false;
      }

      // simple search (id, txid, clientName, clientEmail, amount)
      if (!q) return true;
      if (String(d.id).includes(q)) return true;
      if ((d.txid ?? "").toLowerCase().includes(q)) return true;
      if ((d.clientName ?? "").toLowerCase().includes(q)) return true;
      if ((d.clientEmail ?? "").toLowerCase().includes(q)) return true;
      if (String(d.amount).toLowerCase().includes(q)) return true;
      return false;
    });
  }, [deposits, filters]);

  // wrapper to call mutation; accept id number|string and friendly status values
  const updateDepositStatus = useCallback(
    async (
      id: number | string,
      status: string,
      message?: string,
      emailSent?: boolean
    ) => {
      const numericId = typeof id === "number" ? id : Number(id);
      // map friendly status -> API expected uppercase tokens (narrowed to union)
      const s = (status ?? "").toString().trim().toLowerCase();
      let apiStatus: "APPROVED" | "REJECTED";

      if (s === "approved") apiStatus = "APPROVED";
      else if (s === "rejected") apiStatus = "REJECTED";
      else {
        // invalid status — throw so caller knows
        throw new Error(
          `Invalid status '${status}'. Expected 'approved' or 'rejected'.`
        );
      }

      try {
        // call mutation with the exact body backend expects
        console.debug("Calling updateDepositStatusMutation", {
          transactionId: numericId,
          status: apiStatus,
        });

        await updateDepositStatusMutation({
          transactionId: numericId,
          status: apiStatus,
        }).unwrap();

        // refetch deposits list after success
        await refetchDeposits();
      } catch (err: any) {
        console.error("Failed to update deposit status", err);
        // rethrow so callers (modal) can catch & show toast
        throw err;
      }
    },
    [updateDepositStatusMutation, refetchDeposits]
  );

  return {
    deposits: filtered,
    rawDeposits: deposits,
    filters,
    setFilters,
    stats,
    isLoading: isLoading || isFetching,
    isUpdating,
    updateDepositStatus,
    refetch: refetchDeposits,
  };
}
