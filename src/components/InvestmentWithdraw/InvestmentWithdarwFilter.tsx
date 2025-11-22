import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  InvestmentWithdrawFiltersState,
  InvestmentWithdrawFilterStatus,
  InvestmentWithdrawSortOrder,
} from "@/types/InvestmentWithdraw/investmentWithdraw";

interface InvestmentWithdrawFiltersProps {
  filters: InvestmentWithdrawFiltersState;
  onFiltersChange: (next: InvestmentWithdrawFiltersState) => void;
  stats: {
    total?: number;
    pending?: number;
    approved?: number;
  };
}

export function InvestmentWithdrawFilters({
  filters,
  onFiltersChange,
  stats,
}: InvestmentWithdrawFiltersProps) {
  const apply = (next: InvestmentWithdrawFiltersState) => {
    if (typeof onFiltersChange === "function") onFiltersChange(next);
  };

  const currentStatus: InvestmentWithdrawFilterStatus = filters.status ?? "all";
  const currentSearch = filters.q ?? "";
  const currentSortOrder: InvestmentWithdrawSortOrder =
    filters.sortOrder ?? "newest";

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total ?? 0}</div>
            <div className="text-sm text-muted-foreground">Total Requests</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-400">
              {stats.pending ?? 0}
            </div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-400">
              {stats.approved ?? 0}
            </div>
            <div className="text-sm text-muted-foreground">Approved</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={currentStatus}
              onValueChange={(v) =>
                apply({
                  ...filters,
                  status: v as InvestmentWithdrawFilterStatus,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search */}
          <div className="space-y-2">
            <Label>Search</Label>
            <Input
              value={currentSearch}
              placeholder="Client name or email..."
              onChange={(e) =>
                apply({
                  ...filters,
                  q: e.target.value,
                })
              }
            />
          </div>

          {/* Sort by date/time */}
          <div className="space-y-2">
            <Label>Sort by</Label>
            <Select
              value={currentSortOrder}
              onValueChange={(v) =>
                apply({
                  ...filters,
                  sortOrder: v as InvestmentWithdrawSortOrder,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
