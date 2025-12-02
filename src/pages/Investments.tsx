import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { InvestmentSummarySection } from "@/components/investments/InvestmentSummarySection";
import { InvestmentsByPlanTable } from "@/components/investments/InvestmentsByPlanTable";
import { useInvestmentData } from "@/hooks/useInvestmentData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { CalendarIcon, X, Search } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";

const Investments = () => {
  const { investments, getAllInvestmentsWithReferrals, isInvestmentsLoading } =
    useInvestmentData();

  const [planFilter, setPlanFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [referrerFilter, setReferrerFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [sortField, setSortField] = useState<
    "amount" | "startDate" | "status" | null
  >(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // normalized data from API (already includes clientName + referredBy)
  const investmentsWithDetails = getAllInvestmentsWithReferrals() ?? [];

  // Get unique referrers for filter dropdown
  const uniqueReferrers = Array.from(
    new Set(
      investmentsWithDetails
        .map((inv) => inv.referredBy)
        .filter((v): v is string => Boolean(v))
    )
  ).sort();

  const handleSort = (field: "amount" | "startDate" | "status") => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const clearFilters = () => {
    setPlanFilter("all");
    setStatusFilter("all");
    setSearchQuery("");
    setReferrerFilter("all");
    setDateFrom(undefined);
    setDateTo(undefined);
    setSortField(null);
    setSortDirection("desc");
  };

  const hasActiveFilters =
    planFilter !== "all" ||
    statusFilter !== "all" ||
    searchQuery !== "" ||
    referrerFilter !== "all" ||
    dateFrom !== undefined ||
    dateTo !== undefined ||
    sortField !== null;

  let filteredInvestments = investmentsWithDetails.filter((inv) => {
    const matchesPlan = planFilter === "all" || inv.planType === planFilter;
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    const matchesSearch =
      searchQuery === "" ||
      inv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesReferrer =
      referrerFilter === "all" ||
      (referrerFilter === "direct" && !inv.referredBy) ||
      inv.referredBy === referrerFilter;

    const investmentDate = new Date(inv.startDate);
    const matchesDateFrom = !dateFrom || investmentDate >= dateFrom;
    const matchesDateTo = !dateTo || investmentDate <= dateTo;

    return (
      matchesPlan &&
      matchesStatus &&
      matchesSearch &&
      matchesReferrer &&
      matchesDateFrom &&
      matchesDateTo
    );
  });

  // Apply sorting
  if (sortField) {
    filteredInvestments = [...filteredInvestments].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "amount":
          comparison = a.amount - b.amount;
          break;
        case "startDate":
          comparison =
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold">Investments Overview</h1>
          <div className="text-sm text-muted-foreground">
            {isInvestmentsLoading
              ? "Loading investments..."
              : `${investments.length} total investment${
                  investments.length !== 1 ? "s" : ""
                }`}
          </div>
        </div>

        <InvestmentSummarySection investments={investments} />

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>All Investments</CardTitle>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="w-full sm:w-auto"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by client name or investment ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters Row 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Plan Type
                  </Label>
                  <Select value={planFilter} onValueChange={setPlanFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Plans</SelectItem>
                      <SelectItem value="monthly">Monthly (1%)</SelectItem>
                      <SelectItem value="quarterly">Quarterly (5%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Status
                  </Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="archived">Closed</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Referred By
                  </Label>
                  <Select
                    value={referrerFilter}
                    onValueChange={setReferrerFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by referrer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Referrers</SelectItem>
                      <SelectItem value="direct">Direct</SelectItem>
                      {uniqueReferrers.map((referrer) => (
                        <SelectItem key={referrer} value={referrer}>
                          {referrer}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Date From
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateFrom && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFrom ? format(dateFrom, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateFrom}
                        onSelect={setDateFrom}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Filters Row 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Date To
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateTo && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateTo ? format(dateTo, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateTo}
                        onSelect={setDateTo}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <InvestmentsByPlanTable
              investments={filteredInvestments}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Investments;
