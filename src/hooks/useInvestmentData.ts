import { useState, useMemo, useEffect } from "react";
import {
  Client,
  Investment,
  Deposit,
  Withdrawal,
  Referral,
  AdminMessage,
  AdminInvestmentWithDetails,
} from "@/types/client";
import { useGetAdminInvestmentsQuery } from "@/API/allInvestments.api";

const mockClients: Client[] = [];

const mockDeposits: Deposit[] = [];

const mockWithdrawals: Withdrawal[] = [];

const mockReferrals: Referral[] = [];

const mockMessages: AdminMessage[] = [];

export const useInvestmentData = () => {
  const [clients] = useState<Client[]>(mockClients);
  const { data: apiInvestments, isLoading: isInvestmentsLoading } =
    useGetAdminInvestmentsQuery();

  const [investments, setInvestments] = useState<AdminInvestmentWithDetails[]>(
    []
  );

  const [deposits, setDeposits] = useState<Deposit[]>(mockDeposits);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(mockWithdrawals);
  const [referrals, setReferrals] = useState<Referral[]>(mockReferrals);
  const [messages] = useState<AdminMessage[]>(mockMessages);
  const [searchTerm, setSearchTerm] = useState("");
  const [kycFilter, setKycFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  type AdminNote = import("@/types/client").AdminNote;
  const [adminNotes, setAdminNotes] = useState<AdminNote[]>(() => {
    try {
      const raw = localStorage.getItem("adminNotes");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (apiInvestments) {
      setInvestments(apiInvestments);
    }
  }, [apiInvestments]);

  const persistNotes = (next: AdminNote[]) => {
    setAdminNotes(next);
    try {
      localStorage.setItem("adminNotes", JSON.stringify(next));
    } catch {}
  };

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchesSearch =
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesKyc = kycFilter === "all" || client.kycStatus === kycFilter;
      const matchesStatus =
        statusFilter === "all" || client.status === statusFilter;

      return matchesSearch && matchesKyc && matchesStatus;
    });
  }, [clients, searchTerm, kycFilter, statusFilter]);

  const getClientById = (id: string) =>
    clients.find((client) => client.id === id);
  const getInvestmentsByClientId = (clientId: string) =>
    investments.filter((inv) => inv.clientId === clientId);
  const getDepositsByClientId = (clientId: string) =>
    deposits.filter((dep) => dep.clientId === clientId);
  const getWithdrawalsByClientId = (clientId: string) =>
    withdrawals.filter((withdrawal) => withdrawal.clientId === clientId);
  const getReferralsByClientId = (clientId: string) =>
    referrals.filter((ref) => ref.referrerId === clientId);
  const getMessagesByClientId = (clientId: string) =>
    messages.filter((msg) => msg.clientId === clientId);
  const getNotesByClientId = (clientId: string) =>
    adminNotes
      .filter((n) => n.clientId === clientId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

  const getInvestmentBreakdown = (clientId: string) => {
    const clientInvestments = investments.filter(
      (inv) => inv.clientId === clientId
    );
    const monthly = clientInvestments.filter(
      (inv) => inv.planType === "monthly"
    );
    const quarterly = clientInvestments.filter(
      (inv) => inv.planType === "quarterly"
    );

    return {
      monthly: {
        count: monthly.length,
        amount: monthly.reduce((sum, inv) => sum + inv.amount, 0),
        active: monthly.filter((inv) => inv.status === "active").length,
      },
      quarterly: {
        count: quarterly.length,
        amount: quarterly.reduce((sum, inv) => sum + inv.amount, 0),
        active: quarterly.filter((inv) => inv.status === "active").length,
      },
    };
  };

  const getReferrerForClient = (clientId: string): string | undefined => {
    const client = clients.find((c) => c.id === clientId);
    return client?.referredBy;
  };

  const getAllInvestmentsWithReferrals = () => {
    return investments;
  };

  const renameInvestment = (investmentId: string, nickname: string) => {
    setInvestments((prev) =>
      prev.map((i) => (i.id === investmentId ? { ...i, nickname } : i))
    );
  };

  const updateInvestmentStatus = (
    investmentId: string,
    status: Investment["status"]
  ) => {
    setInvestments((prev) =>
      prev.map((i) => (i.id === investmentId ? { ...i, status } : i))
    );
  };

  const logDeposit = (clientId: string, amount: number) => {
    const id = `dep${Date.now()}`;
    const date = new Date().toISOString();
    setDeposits((prev) => [
      { id, clientId, amount, status: "approved", date },
      ...prev,
    ]);
  };

  const logWithdrawal = (
    clientId: string,
    type: Withdrawal["type"],
    amount: number
  ) => {
    const id = `with${Date.now()}`;
    const date = new Date().toISOString();
    setWithdrawals((prev) => [
      { id, clientId, type, amount, status: "completed", date },
      ...prev,
    ]);
  };

  const logReferral = (
    referrerId: string,
    referredClientId: string,
    referredClientName: string,
    bonusReceived: number
  ) => {
    const id = `ref${Date.now()}`;
    const date = new Date().toISOString();
    setReferrals((prev) => [
      {
        id,
        referrerId,
        referredClientId,
        referredClientName,
        bonusReceived,
        status: "paid",
        date,
      },
      ...prev,
    ]);
  };

  const addAdminNote = (
    clientId: string,
    tag: string,
    text: string,
    createdBy = "Admin"
  ) => {
    if (!text.trim()) return;
    const note: AdminNote = {
      id: `note${Date.now()}`,
      clientId,
      tag,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      createdBy,
    };
    const next = [note, ...adminNotes];
    persistNotes(next);
  };

  const deleteAdminNote = (id: string) => {
    const next = adminNotes.filter((n) => n.id !== id);
    persistNotes(next);
  };

  return {
    clients: filteredClients,
    investments,
    isInvestmentsLoading,
    searchTerm,
    setSearchTerm,
    kycFilter,
    setKycFilter,
    statusFilter,
    setStatusFilter,
    getClientById,
    getInvestmentsByClientId,
    getDepositsByClientId,
    getWithdrawalsByClientId,
    getReferralsByClientId,
    getMessagesByClientId,
    getNotesByClientId,
    getInvestmentBreakdown,
    getReferrerForClient,
    getAllInvestmentsWithReferrals,
    renameInvestment,
    updateInvestmentStatus,
    logDeposit,
    logWithdrawal,
    logReferral,
    addAdminNote,
    deleteAdminNote,
  };
};
