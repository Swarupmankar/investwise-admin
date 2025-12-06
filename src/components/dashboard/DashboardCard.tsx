import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
  valueColor?: "default" | "success" | "destructive" | "warning";
}

export const DashboardCard = ({
  title,
  children,
  icon,
  className,
  valueColor = "default",
}: DashboardCardProps) => {
  const getValueColorClasses = () => {
    switch (valueColor) {
      case "success":
        return "text-success";
      case "destructive":
        return "text-destructive";
      case "warning":
        return "text-warning";
      default:
        return "text-foreground";
    }
  };

  return (
    <Card
      className={cn(
        "bg-gradient-card border-card-border shadow-card hover:shadow-elevated transition-all duration-300 hover:scale-105",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", getValueColorClasses())}>
          {children}
        </div>
      </CardContent>
    </Card>
  );
};
