import { useState, useMemo } from "react";
import {
  Client,
  Investment,
  Deposit,
  Withdrawal,
  Referral,
  AdminMessage,
} from "@/types/client";

// Mock data
const mockClients: Client[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "+1-555-0123",
    kycStatus: "approved",
    totalDeposited: 50000,
    totalInvested: 45000,
    referralEarnings: 2500,
    currentBalance: 7500,
    status: "active",
    referredBy: "Alice Johnson",
    joinDate: "2024-01-15",
    lastActivity: "2024-01-28",
    kycDocuments: {
      selfieWithId: "/placeholder.svg",
      idProof: "/placeholder.svg",
      addressProof: "/placeholder.svg",
    },
    kycAddressText:
      "Address Line 1: 350 Fifth Avenue\nAddress Line 2: Suite 42B\nCity: New York\nState/Province: NY\nPostal Code: 10118\nCountry: United States",
    registrationAnswers: [
      {
        id: "reg01",
        question: "What is your full legal name as per official records?",
        answer: "John Albert Smith",
      },
      {
        id: "reg02",
        question:
          "What is your complete address as mentioned in your official identification document (e.g., Aadhar, Passport, Driver’s License)?",
        answer: "350 Fifth Avenue, Suite 42B, New York, NY 10118, USA",
      },
      {
        id: "reg03",
        question:
          "What is your date of birth as per your official identification documents?",
        answer: "12/04/1990",
      },
      {
        id: "reg04",
        question:
          "What is your primary email address for official communication?",
        answer: "john.smith@email.com",
      },
      {
        id: "reg05",
        question:
          "What is your active contact number for communication purposes?",
        answer: "+1-555-0123",
      },
      {
        id: "reg06",
        question: "What is your approximate annual income (in USD)?",
        answer: "C) $75,001 – $150,000",
      },
      {
        id: "reg07",
        question:
          "Have you previously invested in any financial assets or instruments?",
        answer: "A) Yes, I have regularly invested in multiple asset classes",
      },
      {
        id: "reg08",
        question: "How much experience do you have with investing?",
        answer: "D) More than 3 years",
      },
      {
        id: "reg09",
        question: "What is your current occupation?",
        answer: "A) Salaried (Private/Government Sector) — Product Manager",
      },
      {
        id: "reg10",
        question: "How much are you planning to invest with us initially?",
        answer: "D) $25,000 – $49,999",
      },
      {
        id: "reg11",
        question:
          "How soon are you willing to make your first investment with us?",
        answer: "A) Immediately",
      },
      {
        id: "reg12",
        question:
          "What is the primary goal behind your decision to invest with us?",
        answer: "A) Wealth creation over the long term",
      },
      {
        id: "reg13",
        question: "How long are you willing to invest?",
        answer: "C) 1 to 3 years",
      },
      {
        id: "reg14",
        question:
          "What would be the source of the funds you are planning to invest?",
        answer: "A) Salary / Employment Income",
      },
      {
        id: "reg15",
        question: "What is your highest level of educational qualification?",
        answer: "C) Master’s Degree",
      },
      {
        id: "reg16",
        question: "How did you hear about our investment platform?",
        answer: "B) Referral from a friend or family member",
      },
      {
        id: "reg17",
        question:
          "Would you be willing to earn additional income by referring our platform to others?",
        answer: "A) Yes, absolutely",
      },
      {
        id: "reg18",
        question:
          "Are you familiar with cryptocurrency transfers, as these may be required for depositing and withdrawing funds?",
        answer: "B) I’ve used them occasionally and can manage",
      },
      {
        id: "reg19",
        question:
          "Can you confirm that you are the sole controller of your funds and crypto wallet, and that you alone will authorize deposits, withdrawals, and use the returns for your personal benefit?",
        answer:
          "A) Yes, I confirm I am the sole controller of my funds and wallet",
      },
      {
        id: "reg20",
        question:
          "Which cryptocurrency wallet or exchange do you currently use for depositing and withdrawing funds?",
        answer: "A) Binance",
      },
    ],
  },
  {
    id: "2",
    name: "Sarah Davis",
    email: "sarah.davis@email.com",
    phone: "+1-555-0456",
    kycStatus: "pending",
    totalDeposited: 25000,
    totalInvested: 20000,
    referralEarnings: 1000,
    currentBalance: 6000,
    status: "active",
    joinDate: "2024-01-20",
    lastActivity: "2024-01-27",
    kycDocuments: {
      selfieWithId: "/placeholder.svg",
      idProof: "/placeholder.svg",
      addressProof: "/placeholder.svg",
    },
    kycAddressText:
      "Address Line 1: 221B Baker Street\nAddress Line 2: Apt 2\nCity: London\nState/Province: Greater London\nPostal Code: NW1 6XE\nCountry: United Kingdom",
    registrationAnswers: [
      { id: "reg1", question: "Full legal name", answer: "Sarah Elaine Davis" },
      {
        id: "reg2",
        question: "Address as per ID",
        answer: "221B Baker Street, Apt 2, London NW1 6XE, UK",
      },
      { id: "reg3", question: "Date of birth", answer: "1992-09-08" },
      {
        id: "reg4",
        question: "Primary email",
        answer: "sarah.davis@email.com",
      },
      { id: "reg5", question: "Approx annual income (USD)", answer: "$80,000" },
      {
        id: "reg6",
        question: "Prior investing experience",
        answer: "Limited, < 1 year",
      },
      { id: "reg7", question: "Current occupation", answer: "UX Designer" },
      { id: "reg8", question: "Initial investment amount", answer: "$20,000" },
      { id: "reg9", question: "Investment horizon", answer: "6 months" },
      {
        id: "reg10",
        question: "Source of funds",
        answer: "Savings + freelancing",
      },
    ],
  },
  {
    id: "3",
    name: "Mike Wilson",
    email: "mike.wilson@email.com",
    phone: "+1-555-0789",
    kycStatus: "rejected",
    totalDeposited: 0,
    totalInvested: 0,
    referralEarnings: 0,
    currentBalance: 0,
    status: "dormant",
    joinDate: "2024-01-10",
    lastActivity: "2024-01-15",
    registrationAnswers: [
      {
        id: "reg1",
        question: "Full legal name",
        answer: "Michael Andrew Wilson",
      },
    ],
  },
  {
    id: "4",
    name: "Emma Brown",
    email: "emma.brown@email.com",
    phone: "+1-555-0321",
    kycStatus: "approved",
    totalDeposited: 75000,
    totalInvested: 70000,
    referralEarnings: 3500,
    currentBalance: 8500,
    status: "active",
    joinDate: "2024-01-05",
    lastActivity: "2024-01-28",
    registrationAnswers: [
      {
        id: "reg1",
        question: "Full legal name",
        answer: "Emma Charlotte Brown",
      },
      { id: "reg4", question: "Primary email", answer: "emma.brown@email.com" },
    ],
  },
];

const mockInvestments: Investment[] = [
  {
    id: "inv1",
    clientId: "1",
    amount: 25000,
    planType: "quarterly",
    startDate: "2024-01-16",
    status: "active",
    returnCredited: 1250,
    creationAnswers: [
      { id: "q1", question: "Investment amount", answer: "$25,000" },
      { id: "q2", question: "For whom", answer: "Self" },
      { id: "q3", question: "Duration", answer: "3 months" },
      { id: "q4", question: "Referral code", answer: "—" },
    ],
  },
  {
    id: "inv2",
    clientId: "1",
    amount: 20000,
    planType: "monthly",
    startDate: "2024-01-20",
    status: "active",
    returnCredited: 800,
    creationAnswers: [
      { id: "q1", question: "Investment amount", answer: "$20,000" },
      { id: "q2", question: "For whom", answer: "Family" },
      { id: "q3", question: "Duration", answer: "1 month" },
      { id: "q4", question: "Referral code", answer: "JOHN01" },
    ],
  },
  {
    id: "inv3",
    clientId: "2",
    amount: 20000,
    planType: "monthly",
    startDate: "2024-01-21",
    status: "active",
    returnCredited: 600,
    creationAnswers: [
      { id: "q1", question: "Investment amount", answer: "$20,000" },
      { id: "q2", question: "For whom", answer: "Self" },
      { id: "q3", question: "Duration", answer: "1 month" },
      { id: "q4", question: "Referral code", answer: "—" },
    ],
  },
  {
    id: "inv4",
    clientId: "4",
    amount: 50000,
    planType: "quarterly",
    startDate: "2024-01-10",
    status: "active",
    returnCredited: 2500,
    creationAnswers: [
      { id: "q1", question: "Investment amount", answer: "$50,000" },
      { id: "q2", question: "For whom", answer: "Self" },
      { id: "q3", question: "Duration", answer: "3 months" },
      { id: "q4", question: "Referral code", answer: "—" },
    ],
  },
  {
    id: "inv5",
    clientId: "4",
    amount: 20000,
    planType: "monthly",
    startDate: "2024-01-15",
    status: "completed",
    returnCredited: 200,
    creationAnswers: [
      { id: "q1", question: "Investment amount", answer: "$20,000" },
      { id: "q2", question: "For whom", answer: "Self" },
      { id: "q3", question: "Duration", answer: "1 month" },
      { id: "q4", question: "Referral code", answer: "—" },
    ],
  },
];

const mockDeposits: Deposit[] = [
  {
    id: "dep1",
    clientId: "1",
    amount: 50000,
    screenshot: "/placeholder.svg",
    status: "approved",
    date: "2024-01-15",
  },
  {
    id: "dep2",
    clientId: "2",
    amount: 25000,
    txid: "0x123...abc",
    status: "approved",
    date: "2024-01-20",
  },
];

const mockWithdrawals: Withdrawal[] = [
  {
    id: "with1",
    clientId: "1",
    type: "return",
    amount: 2500,
    txid: "0x456...def",
    status: "completed",
    date: "2024-01-25",
  },
  {
    id: "with2",
    clientId: "2",
    type: "return",
    amount: 1000,
    txid: "0x789...ghi",
    status: "completed",
    date: "2024-01-26",
  },
];

const mockReferrals: Referral[] = [
  {
    id: "ref1",
    referrerId: "1",
    referredClientId: "2",
    referredClientName: "Sarah Davis",
    referredClientBalance: 6000,
    referredClientTotalInvested: 20000,
    referredInvestmentId: "inv3",
    referredInvestmentAmount: 20000,
    referredInvestmentStatus: "active",
    bonusReceived: 250,
    status: "paid",
    date: "2024-01-20",
  },
  {
    id: "ref2",
    referrerId: "2",
    referredClientId: "4",
    referredClientName: "Emma Brown",
    referredClientBalance: 8500,
    referredClientTotalInvested: 70000,
    bonusReceived: 750,
    status: "paid",
    date: "2024-01-22",
  },
];

const mockMessages: AdminMessage[] = [
  {
    id: "msg1",
    clientId: "1",
    title: "Welcome to the Platform",
    message:
      "Thank you for joining our investment platform. Your account has been approved.",
    sentBy: "Admin",
    sentAt: "2024-01-16T10:00:00Z",
    emailSent: true,
  },
];

export const useClientsData = () => {
  const [clients] = useState<Client[]>(mockClients);
  const [investments, setInvestments] = useState<Investment[]>(mockInvestments);
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

  // Investment breakdown by plan type
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

  // Get referrer for a client
  const getReferrerForClient = (clientId: string): string | undefined => {
    const client = clients.find((c) => c.id === clientId);
    return client?.referredBy;
  };

  // Get all investments with referral info
  const getAllInvestmentsWithReferrals = () => {
    return investments.map((inv) => {
      const client = clients.find((c) => c.id === inv.clientId);
      const referrer = client?.referredBy;
      return {
        ...inv,
        clientName: client?.name || "Unknown",
        referredBy: referrer,
      };
    });
  };

  // Admin actions
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
    searchTerm,
    setSearchTerm,
    kycFilter,
    setKycFilter,
    statusFilter,
    setStatusFilter,
    // getters
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
    // actions
    renameInvestment,
    updateInvestmentStatus,
    logDeposit,
    logWithdrawal,
    logReferral,
    addAdminNote,
    deleteAdminNote,
  };
};
