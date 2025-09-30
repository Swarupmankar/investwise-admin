import { Badge } from "@/components/ui/badge";
import { Transaction } from "@/types/transaction";

interface TransactionTypeBadgeProps {
  type: Transaction["type"];
}

export function TransactionTypeBadge({ type }: TransactionTypeBadgeProps) {
  const getTypeColor = (type: Transaction["type"]) => {
    switch (type) {
      case "deposit":
        return "bg-success/10 text-success border-success/20";
      case "withdrawal-return":
        return "bg-primary/10 text-primary border-primary/20";
      case "withdrawal-referral":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "withdrawal-principal":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted/10 text-muted-foreground border-muted/20";
    }
  };

  const getTypeText = (type: Transaction["type"]) => {
    switch (type) {
      case "deposit":
        return "Deposit";
      case "withdrawal-return":
        return "Return";
      case "withdrawal-referral":
        return "Referral";
      case "withdrawal-principal":
        return "Principal";
      default:
        return "Unknown";
    }
  };

  return (
    <Badge 
      variant="outline" 
      className={`${getTypeColor(type)} border`}
    >
      {getTypeText(type)}
    </Badge>
  );
}