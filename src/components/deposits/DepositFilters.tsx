// src/components/deposits/DepositFilters.tsx
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Permissive props so callers can pass either:
 * - a plain object + callback, or
 * - a React state setter returned by useState (Dispatch<SetStateAction<...>>)
 */
type FiltersMap = Record<string, any>;

type PossibleSetter =
  | ((filters: FiltersMap) => void)
  | React.Dispatch<React.SetStateAction<FiltersMap>>;

interface DepositFiltersProps {
  filters: FiltersMap;
  onFiltersChange: PossibleSetter;
  stats?: Partial<Record<string, number>> & {
    total?: number;
    pending?: number;
    approved?: number;
    rejected?: number;
  };
}

export function DepositFilters({
  filters = {},
  onFiltersChange,
  stats = {},
}: DepositFiltersProps) {
  // Defensive current snapshot so inputs never get undefined
  const currentStatus = filters?.status ?? "all";
  const currentSearch = filters?.q ?? filters?.searchQuery ?? "";
  const currentStart = filters?.startDate ?? filters?.from ?? "";
  const currentEnd = filters?.endDate ?? filters?.to ?? "";

  // helper to call either a setter or a callback
  const apply = (next: FiltersMap) => {
    if (typeof onFiltersChange === "function") {
      // If it's a React setter (has length 1 and the first param might be function),
      // calling it directly works for both setter and callback shapes.
      (onFiltersChange as any)(next);
    }
  };

  const handleStatusChange = (status: string) => {
    apply({
      ...filters,
      status: status || "all",
    });
  };

  const handleSearchChange = (searchQuery: string) => {
    apply({
      ...filters,
      q: searchQuery || undefined,
      searchQuery: searchQuery || undefined,
    });
  };

  const handleDateChange = (field: "startDate" | "endDate", value: string) => {
    apply({
      ...filters,
      [field]: value ? value : undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats?.total ?? 0}</div>
            <div className="text-sm text-muted-foreground">Total Deposits</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-400">
              {stats?.pending ?? 0}
            </div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-400">
              {stats?.approved ?? 0}
            </div>
            <div className="text-sm text-muted-foreground">Approved</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-400">
              {stats?.rejected ?? 0}
            </div>
            <div className="text-sm text-muted-foreground">Rejected</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={currentStatus}
                onValueChange={(v) => handleStatusChange(v)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Name, email, or TXID..."
                value={currentSearch ?? ""}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={currentStart ?? ""}
                onChange={(e) => handleDateChange("startDate", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={currentEnd ?? ""}
                onChange={(e) => handleDateChange("endDate", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DepositFilters;
