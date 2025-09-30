// src/components/withdrawals/WithdrawalStatusBadge.tsx
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Accept any string here because backend sometimes sends many different tokens
 * (REVIEW, PENDING, ADMIN_PROOF_UPLOADED, APPROVED, etc). We normalise below.
 */
interface WithdrawalStatusBadgeProps {
  status?: string; // accept raw string tokens from API or canonical tokens
  className?: string;
}

/** normalize string safely */
const norm = (v?: string) => (v ? v.toString().trim().toLowerCase() : "");

export function WithdrawalStatusBadge({
  status,
  className,
}: WithdrawalStatusBadgeProps) {
  const s = norm(status);

  const getStatusColor = () => {
    switch (s) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "review":
      case "reviewing":
      case "review_request":
      case "reviewrequested":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "approved":
      case "paid":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "rejected":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "proof_submitted":
      case "proof-submitted":
      case "admin_proof_uploaded":
      case "admin-proof-uploaded":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "reviewed":
      case "completed":
        return "bg-emerald-600/10 text-emerald-600 border-emerald-600/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getStatusText = () => {
    switch (s) {
      case "pending":
        return "Pending";
      case "review":
      case "reviewing":
      case "review_request":
      case "reviewrequested":
        return "In Review";
      case "approved":
      case "paid":
        return "Approved";
      case "rejected":
        return "Rejected";
      case "proof_submitted":
      case "proof-submitted":
      case "admin_proof_uploaded":
      case "admin-proof-uploaded":
        return "Proof Submitted";
      case "reviewed":
      case "completed":
        return "Completed";
      default:
        // Fallback: prettify unknown token (snake/upper/kyc-like)
        return String(status ?? "Unknown")
          .toLowerCase()
          .split(/[_\-\s]+/)
          .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : ""))
          .join(" ");
    }
  };

  return (
    <Badge
      variant="outline"
      className={cn(getStatusColor(), "border", className)}
    >
      {getStatusText()}
    </Badge>
  );
}

export default WithdrawalStatusBadge;
