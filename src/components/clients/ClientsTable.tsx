import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClientStatusBadge } from "./ClientStatusBadge";
import { formatCurrency } from "@/lib/formatters";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UserApi } from "@/types/users/users.types";

interface ClientsTableProps {
  clients: UserApi[];
}

export const ClientsTable = ({ clients }: ClientsTableProps) => {
  const navigate = useNavigate();

  const handleViewProfile = (clientId: number) => {
    navigate(`/clients/${clientId}`);
  };

  return (
    <div className="rounded-lg border border-card-border bg-card shadow-card">
      <Table>
        <TableHeader>
          <TableRow className="border-card-border">
            <TableHead>Name</TableHead>
            <TableHead>Email / Phone</TableHead>
            <TableHead>KYC Status</TableHead>
            <TableHead className="text-right">Total Deposited</TableHead>
            <TableHead className="text-right">Total Invested</TableHead>
            <TableHead className="text-right">Referral Earnings</TableHead>
            <TableHead className="text-right">Current Balance</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id} className="border-card-border">
              <TableCell className="font-medium">{client.name}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-sm">{client.email}</span>
                  <span className="text-xs text-muted-foreground">
                    {client.phoneNumber}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <ClientStatusBadge status={client.kycStatus} />
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(Number(client.totalDeposited))}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(Number(client.totalInvested))}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(Number(client.referralEarnings))}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(Number(client.currentBalance))}
              </TableCell>
              <TableCell>
                <ClientStatusBadge status={client.status} />
              </TableCell>
              <TableCell className="text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewProfile(client.id)}
                  className="h-8 w-8 p-0"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
