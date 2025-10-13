import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ClientsTable } from "@/components/clients/ClientsTable";
import { ClientSearchFilters } from "@/components/clients/ClientSearchFilters";
import { useGetAllUsersQuery } from "@/API/users.api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UserApi, UserStatus } from "@/types/users/users.types";

// 🧠 Helper: safely convert any type (Decimal, number, null) into string
const safeToString = (v: any): string => {
  if (v == null) return "0";
  if (typeof v === "object" && typeof v.toString === "function") {
    return v.toString();
  }
  if (typeof v === "number") return String(v);
  if (typeof v === "string") return v;
  try {
    return String(v);
  } catch {
    return "0";
  }
};

export default function Clients() {
  const [searchTerm, setSearchTerm] = useState("");
  const [kycFilter, setKycFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [toasts, setToasts] = useState<
    { id: string; type: "error" | "success" | "info"; message: string }[]
  >([]);

  const addToast = (
    type: "error" | "success" | "info",
    message: string,
    timeout = 4000
  ) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), timeout);
  };

  const {
    data: usersResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetAllUsersQuery(undefined, { refetchOnMountOrArgChange: false });

  // 🧭 Normalize backend response shape
  const rawApiPayload = usersResponse ?? null;
  const allApiUsers = Array.isArray(rawApiPayload)
    ? rawApiPayload
    : Array.isArray((rawApiPayload as any)?.data)
    ? (rawApiPayload as any).data
    : [];

  // 🧮 Normalize users from API into your frontend type
  const allClients: UserApi[] = useMemo(() => {
    return (allApiUsers || []).map((u: any) => {
      const client: UserApi = {
        id: typeof u.id === "number" ? u.id : Number(u.id ?? 0),
        name:
          u.name ??
          (`${(u.firstName ?? "").trim()} ${(
            u.lastName ?? ""
          ).trim()}`.trim() ||
            `User ${u.id ?? ""}`),
        email: u.email ?? "",
        phoneNumber: u.phoneNumber ?? "",
        kycStatus: u.kycStatus ?? "",
        totalDeposited: safeToString(
          u.totalDeposited ?? u.totalDeposited?.toString?.() ?? "0"
        ),
        totalInvested: safeToString(
          u.totalInvested ?? u.totalInvested?.toString?.() ?? "0"
        ),
        referralEarnings: safeToString(
          u.referralEarnings ?? u.Referral?.earningsBalance ?? "0"
        ),
        currentBalance: safeToString(
          u.currentBalance ?? u.fundsAvailable ?? "0"
        ),
        status: (u.status ?? "active") as UserStatus,
        activeInvestmentsCount:
          typeof u.activeInvestmentsCount === "number"
            ? u.activeInvestmentsCount
            : Number(u.activeInvestmentsCount ?? 0),
      };
      return client;
    });
  }, [allApiUsers]);

  // 🔍 Filtering logic (same as before)
  const clients = useMemo(() => {
    return allClients.filter((c) => {
      // STATUS filter
      if (statusFilter !== "all") {
        const status = (c.status ?? "").toString().toLowerCase();
        if (status !== statusFilter.toLowerCase()) return false;
      }

      // KYC filter
      if (kycFilter !== "all") {
        const kyc = (c.kycStatus ?? "").toString().toLowerCase().trim();
        const kycFilterNormalized = kycFilter.toLowerCase().trim();

        if (
          kycFilterNormalized === "not submitted" ||
          kycFilterNormalized === "not_submitted"
        ) {
          if (kyc && kyc !== "not submitted" && kyc !== "not_submitted") {
            return false;
          }
        } else {
          if (kyc !== kycFilterNormalized) return false;
        }
      }

      // SEARCH filter
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (
        (c.name ?? "").toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q) ||
        (String(c.id) ?? "").toLowerCase().includes(q) ||
        ((c.phoneNumber ?? "") as string).toLowerCase().includes(q)
      );
    });
  }, [allClients, searchTerm, kycFilter, statusFilter]);

  useEffect(() => {
    if (isError) {
      const msg =
        (error as any)?.data?.message ??
        (error as any)?.message ??
        "Failed to load clients";
      addToast("error", msg);
    }
  }, [isError, error]);

  const Skeleton = () => (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-12 bg-gray-200 rounded" />
      ))}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold">Clients Management</h1>
          <div className="text-sm text-muted-foreground">
            {clients.length} client{clients.length !== 1 ? "s" : ""} found
          </div>
        </div>

        <ClientSearchFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          kycFilter={kycFilter}
          setKycFilter={setKycFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        <div>
          {isLoading ? (
            <Skeleton />
          ) : isError ? (
            <Card>
              <div className="p-4">
                <div className="text-lg font-medium mb-2">
                  Failed to load clients
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  {(error as any)?.data?.message ??
                    (error as any)?.message ??
                    "An error occurred while fetching clients."}
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => refetch()}>Retry</Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSearchTerm("");
                      setKycFilter("all");
                      setStatusFilter("all");
                    }}
                  >
                    Reset filters
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <ClientsTable clients={clients} />
          )}
        </div>
      </div>

      {/* Toast notifications */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            aria-live="polite"
            className={cn(
              "px-4 py-2 rounded shadow",
              t.type === "success" && "bg-green-600 text-white",
              t.type === "error" && "bg-red-600 text-white",
              t.type === "info" && "bg-blue-600 text-white"
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
