import { useState } from "react";
import { CalendarIcon, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { AdminTransactionFilters, AdminAccountingStats } from "@/types/adminTransaction";
import { formatCurrency } from "@/lib/formatters";
import { DashboardCard } from "@/components/dashboard/DashboardCard";

interface AdminAccountingFiltersProps {
  filters: AdminTransactionFilters;
  stats: AdminAccountingStats;
  onFiltersChange: (filters: Partial<AdminTransactionFilters>) => void;
  onClearFilters: () => void;
}

export const AdminAccountingFilters = ({ 
  filters, 
  stats, 
  onFiltersChange, 
  onClearFilters 
}: AdminAccountingFiltersProps) => {
  const [dateFrom, setDateFrom] = useState<Date | undefined>(filters.dateRange?.from);
  const [dateTo, setDateTo] = useState<Date | undefined>(filters.dateRange?.to);

  const handleDateRangeChange = (from?: Date, to?: Date) => {
    setDateFrom(from);
    setDateTo(to);
    onFiltersChange({
      dateRange: from || to ? { from, to } : undefined
    });
  };

  const hasActiveFilters = filters.type !== 'all' || 
                          filters.searchQuery || 
                          filters.adminName || 
                          filters.dateRange;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <DashboardCard title="Total Transactions">
          <div className="text-2xl font-bold">{stats.totalTransactions}</div>
        </DashboardCard>
        
        <DashboardCard title="Monthly Withdrawals" valueColor="warning">
          <div className="text-2xl font-bold">{formatCurrency(stats.monthlyWithdrawals)}</div>
        </DashboardCard>
        
        <DashboardCard title="Net Profit Transactions" valueColor="success">
          <div className="text-2xl font-bold">{stats.netProfitTransactions}</div>
        </DashboardCard>
        
        <DashboardCard title="Principal Transactions">
          <div className="text-2xl font-bold">{stats.principalTransactions}</div>
        </DashboardCard>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="ml-auto"
              >
                <X className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Transaction Type Filter */}
            <div>
              <Label>Transaction Type</Label>
              <Select 
                value={filters.type || 'all'} 
                onValueChange={(value) => onFiltersChange({ type: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="net_profit">Net Profit</SelectItem>
                  <SelectItem value="principal">Principal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search Query */}
            <div>
              <Label>Search</Label>
              <Input
                placeholder="Purpose, notes, admin..."
                value={filters.searchQuery || ''}
                onChange={(e) => onFiltersChange({ searchQuery: e.target.value })}
              />
            </div>

            {/* Admin Name Filter */}
            <div>
              <Label>Admin Name</Label>
              <Input
                placeholder="Filter by admin name"
                value={filters.adminName || ''}
                onChange={(e) => onFiltersChange({ adminName: e.target.value })}
              />
            </div>

            {/* Date Range */}
            <div>
              <Label>Date Range</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1 justify-start text-left font-normal",
                        !dateFrom && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, "MMM dd") : "From"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={(date) => handleDateRangeChange(date, dateTo)}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1 justify-start text-left font-normal",
                        !dateTo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, "MMM dd") : "To"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={(date) => handleDateRangeChange(dateFrom, date)}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};