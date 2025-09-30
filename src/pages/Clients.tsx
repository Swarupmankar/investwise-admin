// src/pages/Clients.tsx
import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ClientsTable } from "@/components/clients/ClientsTable";
import { ClientSearchFilters } from "@/components/clients/ClientSearchFilters";
import { useGetAllUsersQuery } from "@/API/users.api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UserApi } from "@/types/users/users.types";

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

  const allApiUsers = usersResponse ?? [];

  const allClients: UserApi[] = useMemo(() => {
    return (allApiUsers || []).map((u: any) => {
      const createdAt = u.createdAt ?? new Date().toISOString();
      const updatedAt = u.updatedAt ?? createdAt;

      const client: Partial<UserApi> = {
        id: typeof u.id === "number" ? u.id : Number(u.id),
        name: u.name ?? `User ${u.id}`,
        email: u.email,
        phoneNumber: u.phoneNumber ?? null,
        kycStatus: u.kycStatus ?? null,
        totalDeposited: u.totalDeposited ?? "0",
        totalInvested: u.totalInvested ?? "0",
        referralEarnings: u.referralEarnings ?? "0",
        currentBalance: u.currentBalance ?? "0",
        status: u.status ?? "active",
      };

      return client as UserApi;
    });
  }, [allApiUsers]);

  const clients = useMemo(() => {
    return allClients.filter((c) => {
      // STATUS filter: allow 'all' or match backend status (active | archived | dormant)
      if (statusFilter !== "all") {
        const status = (c.status ?? "").toString().toLowerCase();
        if (status !== statusFilter.toLowerCase()) return false;
      }

      if (kycFilter !== "all") {
        const kyc = (c.kycStatus ?? "").toString().toLowerCase().trim();
        const kycFilterNormalized = kycFilter.toLowerCase().trim();

        if (
          kycFilterNormalized === "not submitted" ||
          kycFilterNormalized === "not_submitted"
        ) {
          // treat null / empty / not_submitted / not submitted as Not submitted
          if (kyc && kyc !== "not submitted" && kyc !== "not_submitted") {
            return false;
          }
        } else {
          // pending / approved / rejected — strict match
          if (kyc !== kycFilterNormalized) return false;
        }
      }

      // SEARCH filter (name, email, phone, id)
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

      {/* toasts */}
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
