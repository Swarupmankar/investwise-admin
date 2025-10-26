// src/pages/payment-settings.tsx
import { useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { usePaymentSettings } from "@/hooks/usePaymentSettings";
import { WalletNetwork } from "@/types/payment";
import {
  Copy,
  Check,
  WalletMinimal,
  Plus,
  Save,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

/** -------- Address validators (typed to your union) -------- */
const ADDRESS_VALIDATORS: Record<WalletNetwork, (a: string) => boolean> = {
  Bitcoin: (a: string) =>
    /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/i.test(a.trim()),

  Ethereum: (a: string) => /^0x[a-fA-F0-9]{40}$/.test(a.trim()),

  /** Your union literal is "TRON (TRC20)" — use that, not "Tron" */
  "TRON (TRC20)": (a: string) => /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(a.trim()),

  /** Treat BSC like Ethereum addresses for basic UI validation */
  "BNB Smart Chain (BEP20)": (a: string) =>
    /^0x[a-fA-F0-9]{40}$/.test(a.trim()),

  /** Solana base58 (no 0/O/I/l), typical 32–44 chars */
  Solana: (a: string) => /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(a.trim()),

  /** Litecoin legacy: L/M/3 prefixes, base58 26–33 payload */
  Litecoin: (a: string) =>
    /^([LM3])[a-km-zA-HJ-NP-Z1-9]{26,33}$/.test(a.trim()),
};

/** -------- QR payload builder (use your exact literals) -------- */
function buildQrPayload(network: WalletNetwork, address: string) {
  const addr = address.trim();
  if (!addr) return "";
  switch (network) {
    case "Bitcoin":
      return `bitcoin:${addr}`; // BIP21
    case "TRON (TRC20)":
      return `tron:${addr}`; // tron:ADDR
    // For others, raw address is widely accepted by wallet scanners
    case "Ethereum":
    case "BNB Smart Chain (BEP20)":
    case "Solana":
    case "Litecoin":
    default:
      return addr;
  }
}

const SEO = {
  title: "Payment Settings – Admin Wallets",
  description:
    "Manage admin wallets with nicknames, quick switching, QR codes, and history.",
  canonical: "/payment-settings",
};

export default function PaymentSettings() {
  const {
    wallets,
    activities,
    activeWallet,
    createWallet,
    setActiveWallet,
    deleteWallet,
    qrValueFor, // kept for compatibility elsewhere
    copyAddress,
    networks,
  } = usePaymentSettings();

  // initialize selectedId from activeWallet once on mount (does not override user)
  const [selectedId, setSelectedId] = useState<number | null>(
    () => activeWallet?.id ?? null
  );

  const selected = useMemo(
    () => wallets.find((w) => w.id === selectedId) || null,
    [wallets, selectedId]
  );

  const [form, setForm] = useState<{
    nickname: string;
    network: WalletNetwork;
    address: string;
  }>({
    nickname: "",
    network: (networks?.[0] as WalletNetwork) ?? "Bitcoin",
    address: "",
  });

  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // dialog state for delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    // SEO tags
    document.title = SEO.title;
    const desc =
      document.querySelector('meta[name="description"]') ||
      document.createElement("meta");
    desc.setAttribute("name", "description");
    desc.setAttribute("content", SEO.description);
    document.head.appendChild(desc);

    const link =
      document.querySelector('link[rel="canonical"]') ||
      document.createElement("link");
    link.setAttribute("rel", "canonical");
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost";
    link.setAttribute("href", origin + SEO.canonical);
    document.head.appendChild(link);
  }, []);

  // When selection changes, sync form (edit mode)
  useEffect(() => {
    if (selected) {
      setForm({
        nickname: selected.nickname,
        network: selected.network as WalletNetwork,
        address: selected.address,
      });
    } else {
      setForm({
        nickname: "",
        network: (networks?.[0] as WalletNetwork) ?? "Bitcoin",
        address: "",
      });
    }
  }, [selected, networks]);

  /** --- Live validity + live QR for current view --- */
  const isAddressValid = useMemo(() => {
    const validator = ADDRESS_VALIDATORS[form.network];
    return validator ? validator(form.address) : !!form.address.trim();
  }, [form.network, form.address]);

  const liveQrValue = useMemo(() => {
    const network = (
      selected ? selected.network : form.network
    ) as WalletNetwork;
    const address = selected ? selected.address : form.address;
    return buildQrPayload(network, address);
  }, [selected, form.network, form.address]);

  // CREATE or REPLACE (edit) handler
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.nickname.trim() || !form.address.trim()) {
      toast.error("Nickname and address are required");
      return;
    }

    const validator = ADDRESS_VALIDATORS[form.network];
    if (validator && !validator(form.address)) {
      toast.error(
        form.network === "TRON (TRC20)"
          ? "Invalid TRON (TRC20) address. It should start with 'T' and be 34 Base58 characters."
          : `Invalid ${form.network} address.`
      );
      return;
    }

    setIsProcessing(true);
    try {
      if (selected) {
        // replace flow: create then delete old
        const created = await createWallet({
          nickname: form.nickname.trim(),
          network: form.network,
          address: form.address.trim(),
        });
        if (!created) {
          toast.error("Update failed (create step)");
          setIsProcessing(false);
          return;
        }
        const deleted = await deleteWallet(selected.id);
        if (!deleted) {
          toast.error(
            "Warning: new wallet created but failed to delete the old one"
          );
          setIsProcessing(false);
          return;
        }
        toast.success("Wallet updated (replaced)");
        // leave selection cleared (user may pick the new item manually)
        setSelectedId(null);
        setForm({
          nickname: "",
          network: (networks?.[0] as WalletNetwork) ?? "Bitcoin",
          address: "",
        });
      } else {
        // create
        const created = await createWallet({
          nickname: form.nickname.trim(),
          network: form.network,
          address: form.address.trim(),
        });
        if (created) {
          toast.success("Wallet added");
          setForm({
            nickname: "",
            network: (networks?.[0] as WalletNetwork) ?? "Bitcoin",
            address: "",
          });
          // don't auto-select; let user choose or active wallet appear
        } else {
          toast.error("Failed to add wallet");
        }
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const onActivate = async () => {
    if (!selected) return;
    setIsProcessing(true);
    try {
      const ok = await setActiveWallet(selected.id);
      if (ok) toast.success(`${selected.nickname} is now active`);
    } finally {
      setIsProcessing(false);
    }
  };

  // open the modal instead of window.confirm
  const onDeleteRequest = () => {
    if (!selected) return;
    setShowDeleteModal(true);
  };

  // actual confirmed deletion (called from modal)
  const onConfirmDelete = async () => {
    if (!selected) {
      setShowDeleteModal(false);
      return;
    }

    setIsProcessing(true);
    try {
      const ok = await deleteWallet(selected.id);
      if (ok) {
        toast.success(`${selected.nickname} deleted`);
        setSelectedId(null);
        setForm({
          nickname: "",
          network: (networks?.[0] as WalletNetwork) ?? "Bitcoin",
          address: "",
        });
      } else {
        toast.error("Could not delete wallet");
      }
    } finally {
      setIsProcessing(false);
      setShowDeleteModal(false);
    }
  };

  const onCopy = async () => {
    if (!selected?.address) return;
    await copyAddress(selected.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  // NEW WALLET button: clear selection & reset form so user is in create mode
  const onNewWalletClick = () => {
    setSelectedId(null);
    setForm({
      nickname: "",
      network: (networks?.[0] as WalletNetwork) ?? "Bitcoin",
      address: "",
    });
  };

  const isEditing = !!selected;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <header className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            Payment Settings
          </h2>
          <p className="text-muted-foreground">
            Manage admin wallets, nicknames, QR codes, and history.
          </p>
        </header>

        <main className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Wallets list */}
          <section className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <WalletMinimal className="h-5 w-5" /> Wallets
                </CardTitle>
                <CardDescription>
                  Switch between wallets or create a new one.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {wallets.length === 0 && (
                    <div className="text-sm text-muted-foreground">
                      No wallets yet. Create your first wallet.
                    </div>
                  )}
                  {wallets.map((w) => (
                    <button
                      key={w.id}
                      onClick={() => setSelectedId(w.id)}
                      className={`w-full text-left rounded-md border p-3 transition hover:bg-accent ${
                        selectedId === w.id ? "bg-accent" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-foreground">
                            {w.nickname}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {w.network}
                          </div>
                        </div>
                        {w.isActive ? (
                          <Badge variant="secondary" className="shrink-0">
                            Active
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground truncate">
                        {w.address}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-4 flex gap-2">
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={onNewWalletClick}
                  >
                    <Plus className="h-4 w-4 mr-2" /> New Wallet
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Details + form */}
          <section className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  {isEditing ? `Edit: ${selected?.nickname}` : "Create Wallet"}
                </CardTitle>
                <CardDescription>
                  {isEditing
                    ? "Update wallet details (this will create a new wallet and remove the old one)."
                    : "Add a new admin wallet."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={onSubmit}
                  className="grid grid-cols-1 gap-4 md:grid-cols-2"
                >
                  <div className="space-y-2">
                    <Label htmlFor="nickname">Nickname</Label>
                    <Input
                      id="nickname"
                      value={form.nickname}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, nickname: e.target.value }))
                      }
                      placeholder="e.g. Main BTC"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="network">Network</Label>
                    <Select
                      value={form.network}
                      onValueChange={(v) =>
                        setForm((f) => ({ ...f, network: v as WalletNetwork }))
                      }
                    >
                      <SelectTrigger id="network">
                        <SelectValue placeholder="Select network" />
                      </SelectTrigger>
                      <SelectContent>
                        {networks.map((n) => (
                          <SelectItem key={n} value={n}>
                            {n}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Address with inline validity */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <div className="flex gap-2">
                      <Input
                        id="address"
                        value={form.address}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, address: e.target.value }))
                        }
                        placeholder={
                          form.network === "TRON (TRC20)"
                            ? "Paste TRON (TRC20) address (T… 34 chars)"
                            : "Paste wallet address"
                        }
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={onCopy}
                        disabled={!selected}
                        title={
                          selected
                            ? "Copy selected address"
                            : "Select a wallet first"
                        }
                      >
                        {copied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {form.address ? (
                      <div
                        className={`text-xs mt-1 ${
                          isAddressValid
                            ? "text-emerald-600"
                            : "text-destructive"
                        }`}
                      >
                        {isAddressValid
                          ? "Looks good."
                          : `Invalid ${form.network} address.`}
                      </div>
                    ) : null}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 md:col-span-2">
                    <Button
                      type={isEditing ? "button" : "submit"}
                      className="min-w-28"
                      disabled={isProcessing || isEditing}
                      aria-disabled={isProcessing || isEditing}
                      title={
                        isEditing ? "Replace is disabled in this UI" : undefined
                      }
                    >
                      {isEditing ? (
                        <>
                          <Save className="h-4 w-4 mr-2" /> Replace
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" /> Add Wallet
                        </>
                      )}
                    </Button>
                    {isEditing && (
                      <>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={onActivate}
                          disabled={selected?.isActive || isProcessing}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" /> Set Active
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={onDeleteRequest}
                          disabled={isProcessing}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </Button>
                      </>
                    )}
                  </div>
                </form>

                {/* Preview */}
                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <div className="text-sm font-medium text-foreground mb-2">
                      Live QR
                    </div>
                    <div className="rounded-lg border bg-card p-4 flex items-center justify-center">
                      <QRCode value={liveQrValue || " "} size={164} />
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground mb-2">
                      Active Wallet
                    </div>
                    {activeWallet ? (
                      <div className="rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">
                            {activeWallet.nickname}
                          </div>
                          <Badge variant="secondary">Active</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {activeWallet.network}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground break-all">
                          {activeWallet.address}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        No active wallet yet.
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* History */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Activity History</CardTitle>
                <CardDescription>Audit log of wallet actions.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Wallet</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activities.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-muted-foreground"
                          >
                            No events yet.
                          </TableCell>
                        </TableRow>
                      )}
                      {activities.map((ev) => (
                        <TableRow key={ev.id}>
                          <TableCell className="whitespace-nowrap">
                            {new Date(ev.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell className="capitalize">
                            {ev.action.toLowerCase()}
                          </TableCell>
                          <TableCell>
                            {ev.wallet?.nickname ?? ev.walletId}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {ev.details || "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </section>
        </main>

        {/* Delete confirmation modal */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete wallet</DialogTitle>
              <DialogDescription>
                Are you sure you want to permanently delete{" "}
                <strong>{selected?.nickname ?? "this wallet"}</strong>? This
                action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={onConfirmDelete}
                disabled={isProcessing}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
