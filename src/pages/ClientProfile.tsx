import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ClientDashboardHeader } from "@/components/clients/ClientDashboardHeader";
import { ClientOverviewGrid } from "@/components/clients/ClientOverviewGrid";
import { MessageModal } from "@/components/clients/MessageModal";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { KYCTab } from "@/components/clients/tabs/KYCTab";
import { InvestmentsTab } from "@/components/clients/tabs/InvestmentsTab";
import { DepositsTab } from "@/components/clients/tabs/DepositsTab";
import { WithdrawalsTab } from "@/components/clients/tabs/WithdrawalsTab";
import { ReferralsTab } from "@/components/clients/tabs/ReferralsTab";
import { QuestionnairesTab } from "@/components/clients/tabs/QuestionnairesTab";
import { MessagesTab } from "@/components/clients/tabs/MessagesTab";
import { useGetUserByIdQuery } from "@/API/users.api";
import type {
  UserDetailApi,
  UserInvestmentApi,
} from "@/types/users/userDetail.types";
import { UserApi } from "@/types/users/users.types";

const ClientProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const numericId = useMemo(() => {
    if (!id) return NaN;
    const parsed = Number(id);
    return Number.isFinite(parsed) ? parsed : NaN;
  }, [id]);

  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("investments");

  const {
    data: client,
    isLoading,
    isError,
    error,
    isFetching,
  } = useGetUserByIdQuery(numericId ?? 0, {
    skip: Number.isNaN(numericId),
  });

  if (isLoading || isFetching) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-lg font-medium">Loading client details…</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!id || Number.isNaN(numericId)) {
    console.warn(
      "[ClientProfile] Invalid client id:",
      id,
      "numeric:",
      numericId
    );
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold">Client not found</h1>
          <p className="text-sm text-muted-foreground mt-2">
            {isError
              ? "There was an error fetching this client."
              : "No client found with this id."}
          </p>
          <Button onClick={() => navigate("/clients")} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Clients
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const investments = client.userInvestments ?? [];
  const deposits = client.depositRequests ?? [];
  const withdrawals = client.withdrawRequests ?? [];
  const referrals = client.Referral ? [client.Referral] : [];
  const messages = client.userNotificationRecipient ?? [];
  const updateInvestmentStatus = async (
    _investmentId: number | string,
    _status: string
  ) => {
    return;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Enhanced Client Header */}
        <ClientDashboardHeader
          client={client as UserDetailApi}
          onBack={() => navigate("/clients")}
          onSendMessage={() => setMessageModalOpen(true)}
        />

        {/* Overview Metrics Grid */}
        <ClientOverviewGrid
          client={client as UserDetailApi}
          investments={investments}
          deposits={deposits}
          withdrawals={withdrawals}
          referrals={referrals}
        />

        {/* Sticky Actions + Tabs */}
        <div className="sticky top-0 z-40">
          <div className="bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="container mx-auto">
                <TabsList className="w-full overflow-x-auto justify-center gap-2 sm:gap-3 p-1.5 flex-wrap mx-auto">
                  <TabsTrigger value="kyc">KYC</TabsTrigger>
                  <TabsTrigger value="investments">Investments</TabsTrigger>
                  <TabsTrigger value="deposits">Deposits</TabsTrigger>
                  <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
                  <TabsTrigger value="referrals">Referrals</TabsTrigger>
                  <TabsTrigger value="questionnaires">
                    Questionnaires
                  </TabsTrigger>
                  <TabsTrigger value="messages">Messages</TabsTrigger>
                </TabsList>
              </div>

              <div className="py-6">
                <div className="container mx-auto space-y-6">
                  <TabsContent value="kyc">
                    <KYCTab client={client as unknown as UserApi} />
                  </TabsContent>

                  <TabsContent value="investments">
                    <InvestmentsTab
                      investments={investments}
                      onChangeStatus={(iid, s) =>
                        updateInvestmentStatus(iid, s)
                      }
                    />
                  </TabsContent>

                  <TabsContent value="deposits">
                    <DepositsTab deposits={deposits} />
                  </TabsContent>

                  <TabsContent value="withdrawals">
                    <WithdrawalsTab withdrawals={withdrawals} />
                  </TabsContent>

                  <TabsContent value="referrals">
                    <ReferralsTab
                      userId={numericId}
                      clientName={`${client.firstName} ${client.lastName}`}
                    />
                  </TabsContent>

                  <TabsContent value="questionnaires">
                    <QuestionnairesTab
                      userId={numericId}
                      investments={
                        investments as unknown as UserInvestmentApi[]
                      }
                    />
                  </TabsContent>

                  <TabsContent value="messages">
                    <MessagesTab
                      userId={numericId}
                      onCompose={() => setMessageModalOpen(true)}
                    />
                  </TabsContent>
                </div>
              </div>
            </Tabs>
          </div>
        </div>

        {/* Message Modal */}
        <MessageModal
          open={messageModalOpen}
          onOpenChange={setMessageModalOpen}
          clientName={`${client.firstName} ${client.lastName}`}
          clientId={numericId}
          messages={messages}
        />
      </div>
    </DashboardLayout>
  );
};

export default ClientProfile;
