// src/components/deposits/DepositStatusBadge.tsx
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DepositStatusBadgeProps {
  status?: string | null;
  className?: string;
}

/** normalize raw status to a stable key */
const normalize = (s?: string | null) =>
  (s ?? "").toString().trim().replace(/_/g, " ").toLowerCase();

/** pretty title case for labels */
const titleCase = (s: string) =>
  s
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");

export function DepositStatusBadge({
  status,
  className,
}: DepositStatusBadgeProps) {
  const s = normalize(status);

  // canonicalize into our three buckets (plus fallback)
  const isPending =
    s.includes("pend") || s.includes("processing") || s === "awaiting";
  const isApproved =
    s.includes("approv") ||
    s.includes("paid") ||
    s.includes("complete") ||
    s === "approved";
  const isRejected = s.includes("reject") || s.includes("rejected");

  const getStatusConfig = () => {
    if (isPending) {
      return {
        variant: "secondary" as const,
        className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        text: "Pending",
      };
    }

    if (isApproved) {
      return {
        variant: "default" as const,
        className: "bg-green-500/10 text-green-400 border-green-500/20",
        text: "Approved",
      };
    }

    if (isRejected) {
      return {
        variant: "destructive" as const,
        className: "bg-red-500/10 text-red-400 border-red-500/20",
        text: "Rejected",
      };
    }

    // fallback for unknown statuses
    const label = status ? titleCase(status.replace(/_/g, " ")) : "Unknown";
    return {
      variant: "outline" as const,
      className: "text-muted-foreground",
      text: label,
    };
  };

  const cfg = getStatusConfig();

  return (
    <Badge variant={cfg.variant} className={cn(cfg.className, className)}>
      {cfg.text}
    </Badge>
  );
}

export default DepositStatusBadge;
