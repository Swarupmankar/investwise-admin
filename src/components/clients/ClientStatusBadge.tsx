// ClientStatusBadge.tsx
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ClientStatusBadgeProps {
  status: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
}

const normalize = (s?: string) =>
  (s || "").toString().trim().replace(/_/g, " ").toLowerCase();

const toTitleCase = (s: string) =>
  s
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

export const ClientStatusBadge = ({
  status,
  variant,
}: ClientStatusBadgeProps) => {
  const norm = normalize(status);

  const getStatusConfig = () => {
    switch (norm) {
      case "approved":
      case "active":
        return {
          variant: "default" as const,
          className: "bg-success text-success-foreground",
        };
      case "pending":
        return {
          variant: "secondary" as const,
          className: "bg-warning text-warning-foreground",
        };
      case "rejected":
      case "archived":
        return {
          variant: "destructive" as const,
          className: "bg-destructive text-destructive-foreground",
        };
      case "not submitted":
        return {
          variant: "outline" as const,
          className: "text-muted-foreground",
        };
      default:
        return {
          variant: "outline" as const,
          className: "text-muted-foreground",
        };
    }
  };

  const config = getStatusConfig();
  const displayLabel = toTitleCase(status.replace(/_/g, " ").trim());

  return (
    <Badge variant={variant || config.variant} className={cn(config.className)}>
      {displayLabel}
    </Badge>
  );
};
