// src/hooks/usePaymentSettings.ts
import { useCallback, useMemo } from "react";
import {
  Wallet,
  WalletActivity,
  WALLET_NETWORKS,
  WalletNetwork,
} from "@/types/payment"; // <- ensure path points to the canonical types file
import { useToast } from "@/hooks/use-toast";
import {
  useCreateWalletMutation,
  useGetAllWalletsQuery,
  useSetActiveWalletMutation,
  useDeleteWalletMutation,
  useGetWalletActivitiesQuery,
} from "@/API/gateway.api"; // <- corrected import

export interface NewWalletInput {
  nickname: string;
  network: WalletNetwork | string;
  address: string;
}

export function usePaymentSettings() {
  const { toast } = useToast();

  // queries
  const {
    data: walletsData,
    isLoading: walletsLoading,
    isFetching: walletsFetching,
    refetch: refetchWallets,
  } = useGetAllWalletsQuery();

  const {
    data: activitiesData,
    isLoading: activitiesLoading,
    refetch: refetchActivities,
  } = useGetWalletActivitiesQuery();

  // mutations
  const [createWalletMutation, { isLoading: creating }] =
    useCreateWalletMutation();
  const [setActiveMutation, { isLoading: settingActive }] =
    useSetActiveWalletMutation();
  const [deleteWalletMutation, { isLoading: deleting }] =
    useDeleteWalletMutation();

  // derive values
  const wallets: Wallet[] = walletsData ?? [];
  const activities: WalletActivity[] = activitiesData ?? [];

  const activeWallet = useMemo(
    () => wallets.find((w) => w.isActive) ?? null,
    [wallets]
  );

  // helpers
  const qrValueFor = useCallback((wallet?: Wallet | null) => {
    if (!wallet) return "";
    return wallet.address;
  }, []);

  const copyAddress = useCallback(
    async (address?: string) => {
      if (!address) return;
      try {
        if (
          typeof navigator !== "undefined" &&
          navigator.clipboard?.writeText
        ) {
          await navigator.clipboard.writeText(address);
        } else {
          const t = document.createElement("textarea");
          t.value = address;
          t.setAttribute("readonly", "");
          t.style.position = "absolute";
          t.style.left = "-9999px";
          document.body.appendChild(t);
          t.select();
          document.execCommand("copy");
          document.body.removeChild(t);
        }
        toast({
          title: "Copied",
          description: "Wallet address copied to clipboard",
        });
      } catch {
        toast({
          title: "Copy failed",
          description: "Could not copy address",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  // API actions
  const createWallet = useCallback(
    async (input: NewWalletInput) => {
      try {
        // backend expects JSON object (per your API spec)
        const res = await createWalletMutation({
          nickname: input.nickname.trim(),
          network: input.network,
          address: input.address.trim(),
        }).unwrap();

        toast({
          title: "Wallet created",
          description: `${input.nickname} created.`,
        });
        // Optionally refetch
        // refetchWallets();
        return true;
      } catch (err: any) {
        console.error("create wallet error", err);
        toast({
          title: "Create failed",
          description:
            err?.data?.message ?? err?.message ?? "Could not create wallet",
          variant: "destructive",
        });
        return false;
      }
    },
    [createWalletMutation, toast]
  );

  const setActiveWallet = useCallback(
    async (id: number | string) => {
      try {
        await setActiveMutation({ id }).unwrap();
        toast({ title: "Activated", description: "Active wallet updated." });
        return true;
      } catch (err: any) {
        console.error("set active error", err);
        toast({
          title: "Action failed",
          description:
            err?.data?.message ?? err?.message ?? "Could not set active wallet",
          variant: "destructive",
        });
        return false;
      }
    },
    [setActiveMutation, toast]
  );

  const deleteWallet = useCallback(
    async (id: number | string) => {
      try {
        await deleteWalletMutation({ id }).unwrap();
        toast({ title: "Deleted", description: "Wallet deleted." });
        return true;
      } catch (err: any) {
        console.error("delete wallet error", err);
        toast({
          title: "Delete failed",
          description:
            err?.data?.message ?? err?.message ?? "Could not delete wallet",
          variant: "destructive",
        });
        return false;
      }
    },
    [deleteWalletMutation, toast]
  );

  return {
    // data
    wallets,
    activities,
    activeWallet,

    // loading flags
    walletsLoading,
    walletsFetching,
    activitiesLoading,
    creating,
    settingActive,
    deleting,

    // actions
    createWallet,
    setActiveWallet,
    deleteWallet,
    refetchWallets,
    refetchActivities,

    // utils
    qrValueFor,
    copyAddress,
    networks: WALLET_NETWORKS,
  } as const;
}
