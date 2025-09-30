import { Deposit, Withdrawal } from "@/types/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClientStatusBadge } from "./ClientStatusBadge";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  ExternalLink, 
  FileImage, 
  Copy,
  TrendingDown,
  TrendingUp
} from "lucide-react";

interface ClientTransactionsDashboardProps {
  deposits: Deposit[];
  withdrawals: Withdrawal[];
}

export const ClientTransactionsDashboard = ({ deposits, withdrawals }: ClientTransactionsDashboardProps) => {
  const totalDeposited = deposits.filter(d => d.status === "approved").reduce((sum, d) => sum + d.amount, 0);
  const totalWithdrawn = withdrawals.filter(w => w.status === "completed").reduce((sum, w) => sum + w.amount, 0);
  const pendingDeposits = deposits.filter(d => d.status === "pending").length;
  const pendingWithdrawals = withdrawals.filter(w => w.status === "pending").length;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowDownCircle className="h-5 w-5" />
          Transaction History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="deposits">Deposits ({deposits.length})</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals ({withdrawals.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="text-center p-4 bg-card border border-border rounded-lg min-h-[100px] flex flex-col justify-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingDown className="h-4 w-4 text-success flex-shrink-0" />
                  <span className="text-sm font-medium">Deposited</span>
                </div>
                <div className="text-lg font-bold text-success">{formatCurrency(totalDeposited)}</div>
              </div>
              <div className="text-center p-4 bg-card border border-border rounded-lg min-h-[100px] flex flex-col justify-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-warning flex-shrink-0" />
                  <span className="text-sm font-medium">Withdrawn</span>
                </div>
                <div className="text-lg font-bold text-warning">{formatCurrency(totalWithdrawn)}</div>
              </div>
              <div className="text-center p-4 bg-card border border-border rounded-lg min-h-[100px] flex flex-col justify-center">
                <div className="text-sm font-medium mb-2">Pending Deposits</div>
                <div className="text-2xl font-bold text-primary">{pendingDeposits}</div>
              </div>
              <div className="text-center p-4 bg-card border border-border rounded-lg min-h-[100px] flex flex-col justify-center">
                <div className="text-sm font-medium mb-2">Pending Withdrawals</div>
                <div className="text-2xl font-bold text-primary">{pendingWithdrawals}</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="deposits" className="space-y-4">
            {deposits.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No deposits found
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {deposits.map((deposit) => (
                  <div key={deposit.id} className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ArrowDownCircle className="h-4 w-4 text-success" />
                        <span className="font-medium">{formatCurrency(deposit.amount)}</span>
                        <ClientStatusBadge status={deposit.status} />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(deposit.date)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {deposit.screenshot && (
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-muted-foreground">Screenshot Proof</div>
                          <div className="flex items-center gap-2">
                            <FileImage className="h-4 w-4 text-muted-foreground" />
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View Screenshot
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {deposit.txid && (
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-muted-foreground">Transaction ID</div>
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
                              {deposit.txid}
                            </code>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => copyToClipboard(deposit.txid!)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="withdrawals" className="space-y-4">
            {withdrawals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No withdrawals found
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {withdrawals.map((withdrawal) => (
                  <div key={withdrawal.id} className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ArrowUpCircle className="h-4 w-4 text-warning" />
                        <span className="font-medium">{formatCurrency(withdrawal.amount)}</span>
                        <Badge variant="outline" className="capitalize">
                          {withdrawal.type}
                        </Badge>
                        <ClientStatusBadge status={withdrawal.status} />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(withdrawal.date)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {withdrawal.proof && (
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-muted-foreground">Proof Document</div>
                          <div className="flex items-center gap-2">
                            <FileImage className="h-4 w-4 text-muted-foreground" />
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View Proof
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {withdrawal.txid && (
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-muted-foreground">Transaction ID</div>
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
                              {withdrawal.txid}
                            </code>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => copyToClipboard(withdrawal.txid!)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};