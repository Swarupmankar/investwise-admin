import { useCallback, useMemo } from "react";
import {
  useGetAllWithdrawalsQuery,
  useUpdateWithdrawalStatusMutation,
  useUploadWithdrawProofMutation,
} from "@/API/withdrawals.api";
import { useGetAllUsersQuery } from "@/API/users.api";
import type {
  WithdrawApi,
  Withdrawal,
  WithdrawFromType,
  CanonicalWithdrawStatus,
} from "@/types/transactions/withdraw.types";

const API_BASE =
  (import.meta as any)?.env?.VITE_API_BASE_URL ||
  `${window.location.protocol}//${window.location.hostname}:3000`;

const normalizeUrl = (u?: string | null) => {
  if (!u) return null;
  if (/^https?:\/\//i.test(u)) return u;
  const path = String(u).replace(/^\/?/, "/");
  return `${API_BASE}${path}`;
};

/** safe parse to number */
const toNumber = (v?: string | number | null) => {
  if (v === undefined || v === null) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const cleaned = String(v).replace(/[^0-9.-]+/g, "");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
};

/** map withdrawFrom tokens to friendly type */
const mapWithdrawFrom = (raw: string | undefined): WithdrawFromType => {
  const s = (raw ?? "").toString().trim().toUpperCase();
  if (s === "INVESTMENT_RETURNS") return "return";
  if (s === "REFERRAL_EARNING") return "referral";
  if (s === "FUNDS_AVAILABLE") return "principal";
  return "principal";
};

/** canonicalize backend status to friendly tokens */
const canonicalStatus = (raw?: string): CanonicalWithdrawStatus => {
  const s = (raw ?? "").toString().trim().toLowerCase();
  if (!s) return "unknown";
  if (s.includes("pend")) return "pending";
  if (s.includes("review")) return "review";
  if (
    s.includes("admin_proof") ||
    s.includes("admin-proof") ||
    s.includes("adminproof")
  )
    return "admin_proof_uploaded";
  if (s.includes("reject")) return "rejected";
  if (
    s.includes("approv") ||
    s.includes("complete") ||
    s.includes("paid") ||
    s.includes("approved")
  )
    return "approved";
  return "unknown";
};

export function useWithdrawalsData() {
  const {
    data: raw = [],
    isLoading,
    isFetching,
    refetch: refetchWithdrawals,
  } = useGetAllWithdrawalsQuery();
  const { data: users = [] } = useGetAllUsersQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  const [updateWithdrawalStatusMutation, { isLoading: isUpdating }] =
    useUpdateWithdrawalStatusMutation();

  const [uploadWithdrawProofMutation, { isLoading: isUploading }] =
    useUploadWithdrawProofMutation();

  // user map
  const usersMap = useMemo(() => {
    const m = new Map<number, { name?: string; email?: string }>();
    (users || []).forEach((u: any) => {
      m.set(u.id, {
        name: u.name ?? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim(),
        email: u.email ?? "",
      });
    });
    return m;
  }, [users]);

  const withdrawals: Withdrawal[] = useMemo(() => {
    return (raw || []).map((w: WithdrawApi) => {
      const user = usersMap.get(w.userId) ?? {
        name: `User ${w.userId}`,
        email: "",
      };

      // normalize image URLs so <img src=...> can load them
      const userProof = normalizeUrl(w.userProofUrl ?? null);
      const adminProof = normalizeUrl(w.adminProofUrl ?? null);

      return {
        id: w.id,
        userId: w.userId,
        clientId: w.userId,
        clientName: user.name ?? `User ${w.userId}`,
        clientEmail: user.email ?? "",
        phoneNumber: (user as any)?.phoneNumber ?? "",
        amount: toNumber(w.amount),
        walletAddress: w.userWallet ?? "",
        txid: w.txId ?? null,

        // prefer the user's uploaded proof, then admin
        screenshot: userProof ?? adminProof ?? null,

        statusRaw: w.status,
        status: canonicalStatus(w.status),
        withdrawFromRaw: w.withdrawFrom,
        withdrawFrom: mapWithdrawFrom(w.withdrawFrom),
        createdAt: w.createdAt,
        updatedAt: w.updatedAt ?? null,

        // expose the normalized URLs too
        adminProofUrl: adminProof,
        userProofUrl: userProof,

        reviewedAt: (w as any).reviewedAt ?? null,
        reviewedBy: (w as any).reviewedBy ?? null,
        completedAt: (w as any).completedAt ?? null,
        completedBy: (w as any).completedBy ?? null,
        adminMessage: (w as any).adminMessage ?? null,
      } as Withdrawal;
    });
  }, [raw, usersMap]);

  // stats (unchanged) …
  const getStats = useCallback(
    (type?: WithdrawFromType) => {
      const list = type
        ? withdrawals.filter((x) => x.withdrawFrom === type)
        : withdrawals;

      const pendingList = list.filter((x) => x.status === "pending");
      const approvedList = list.filter((x) => x.status === "approved");
      const rejectedList = list.filter((x) => x.status === "rejected");

      return {
        total: list.length,
        pending: pendingList.length,
        approved: approvedList.length,
        rejected: rejectedList.length,
        totalAmount: list.reduce((s, i) => s + i.amount, 0),
        pendingAmount: pendingList.reduce((s, i) => s + i.amount, 0),
        approvedAmount: approvedList.reduce((s, i) => s + i.amount, 0),
        rejectedAmount: rejectedList.reduce((s, i) => s + i.amount, 0),
      };
    },
    [withdrawals]
  );

  const getFiltered = useCallback(
    (
      filters: {
        query?: string;
        status?: string;
        startDate?: string;
        endDate?: string;
      },
      type?: WithdrawFromType
    ) => {
      const q = (filters.query ?? "").toLowerCase().trim();
      return withdrawals.filter((w) => {
        if (type && w.withdrawFrom !== type) return false;
        if (
          filters.status &&
          filters.status !== "all" &&
          w.status !== filters.status
        )
          return false;
        if (q) {
          if (String(w.id).includes(q)) return true;
          if ((w.clientName ?? "").toLowerCase().includes(q)) return true;
          if ((w.clientEmail ?? "").toLowerCase().includes(q)) return true;
          if ((w.walletAddress ?? "").toLowerCase().includes(q)) return true;
          if ((w.txid ?? "").toLowerCase().includes(q)) return true;
          if (String(w.amount).includes(q)) return true;
          return false;
        }
        return true;
      });
    },
    [withdrawals]
  );

  const updateWithdrawalStatus = useCallback(
    async (
      id: number | string,
      friendlyStatus: string,
      rejectionReason?: string
    ) => {
      const numericId = typeof id === "number" ? id : Number(id);
      const s = (friendlyStatus ?? "").toString().trim().toUpperCase();

      try {
        await updateWithdrawalStatusMutation({
          transactionId: numericId,
          status: s,
          ...(s === "REJECTED" && rejectionReason?.trim()
            ? { rejectionReason: rejectionReason.trim() }
            : {}),
        }).unwrap();

        await refetchWithdrawals();
      } catch (err) {
        console.error("Failed updateWithdrawalStatus", err);
        throw err;
      }
    },
    [updateWithdrawalStatusMutation, refetchWithdrawals]
  );

  // upload proof (FormData). Returns the server response.
  const uploadWithdrawProof = useCallback(
    async (transactionId: number, file: File, txId?: string) => {
      if (!file) throw new Error("No file supplied");

      // 🔎 DEBUG before calling RTK
      // eslint-disable-next-line no-console
      console.log("[hook] uploadWithdrawProof args", {
        transactionId,
        typeofTransactionId: typeof transactionId,
        txId,
        file: file
          ? { name: file.name, size: file.size, type: file.type }
          : null,
      });

      try {
        const res = await uploadWithdrawProofMutation({
          transactionId, // ✅ strictly number
          file,
          txId,
        }).unwrap();

        await refetchWithdrawals();
        return res;
      } catch (err) {
        console.error("Failed uploadWithdrawProof", err);
        throw err;
      }
    },
    [uploadWithdrawProofMutation, refetchWithdrawals]
  );

  const getById = useCallback(
    (id: number | string) => {
      const numericId = typeof id === "number" ? id : Number(id);
      return withdrawals.find((w) => w.id === numericId) ?? null;
    },
    [withdrawals]
  );

  return {
    withdrawals,
    raw: raw ?? [],
    isLoading: isLoading || isFetching,
    isUpdating,
    isUploading,
    refetch: refetchWithdrawals,
    getStats,
    getFiltered,
    updateWithdrawalStatus,
    uploadWithdrawProof,
    getById,
  };
}
