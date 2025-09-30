import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { type WithdrawalFilters } from "@/types/withdrawal";

interface WithdrawalFiltersProps {
  filters: WithdrawalFilters;
  onFiltersChange: (filters: WithdrawalFilters) => void;
}

export function WithdrawalFilters({ filters, onFiltersChange }: WithdrawalFiltersProps) {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({ ...filters, status: value });
  };

  const handleDateFromChange = (date: Date | undefined) => {
    onFiltersChange({ 
      ...filters, 
      dateRange: { ...filters.dateRange, from: date } 
    });
  };

  const handleDateToChange = (date: Date | undefined) => {
    onFiltersChange({ 
      ...filters, 
      dateRange: { ...filters.dateRange, to: date } 
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      status: "all",
      dateRange: { from: undefined, to: undefined }
    });
  };

  const hasActiveFilters = filters.search || filters.status !== "all" || filters.dateRange.from || filters.dateRange.to;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by name, email, or user ID..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        <Select value={filters.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="proof_submitted">Proof Submitted</SelectItem>
            <SelectItem value="reviewed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[200px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange.from ? (
                  format(filters.dateRange.from, "PPP")
                ) : (
                  <span>From date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={filters.dateRange.from}
                onSelect={handleDateFromChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[200px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange.to ? (
                  format(filters.dateRange.to, "PPP")
                ) : (
                  <span>To date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={filters.dateRange.to}
                onSelect={handleDateToChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {hasActiveFilters && (
          <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2">
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}