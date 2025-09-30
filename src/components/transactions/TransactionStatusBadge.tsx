import { Badge } from "@/components/ui/badge";
import { Transaction } from "@/types/transaction";

interface TransactionStatusBadgeProps {
  status: Transaction["status"];
}

export function TransactionStatusBadge({ status }: TransactionStatusBadgeProps) {
  const getStatusColor = (status: Transaction["status"]) => {
    switch (status) {
      case "pending":
        return "bg-warning/10 text-warning border-warning/20";
      case "approved":
        return "bg-success/10 text-success border-success/20";
      case "completed":
        return "bg-success/10 text-success border-success/20";
      case "rejected":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted/10 text-muted-foreground border-muted/20";
    }
  };

  const getStatusText = (status: Transaction["status"]) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "approved":
        return "Approved";
      case "completed":
        return "Completed";
      case "rejected":
        return "Rejected";
      default:
        return "Unknown";
    }
  };

  return (
    <Badge 
      variant="outline" 
      className={`${getStatusColor(status)} border`}
    >
      {getStatusText(status)}
    </Badge>
  );
}