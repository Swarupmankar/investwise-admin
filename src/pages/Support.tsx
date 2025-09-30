import { useEffect, useMemo, useRef, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  useGetTicketsQuery,
  useGetTicketByIdQuery,
  useSendReplyMutation,
  useCloseTicketMutation,
} from "@/API/support.api";

type Reply = {
  id: number | string;
  content: string;
  screenshot?: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt?: string;
};

type ToastItem = {
  id: string;
  type: "success" | "error" | "info";
  message: string;
};

export default function Support() {
  // filters
  const [statusFilter, setStatusFilter] = useState<"all" | "OPEN" | "CLOSED">(
    "all"
  );
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  // toasts
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const addToast = (
    type: ToastItem["type"],
    message: string,
    timeout = 4000
  ) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((s) => [...s, { id, type, message }]);
    setTimeout(() => setToasts((s) => s.filter((t) => t.id !== id)), timeout);
  };

  // API hooks (include refetch / error flags)
  const {
    data: ticketsData,
    isLoading: isTicketsLoading,
    isError: isTicketsError,
    error: ticketsError,
    refetch: refetchTickets,
  } = useGetTicketsQuery(
    {
      status: statusFilter === "all" ? undefined : statusFilter,
      page: 1,
    },
    { refetchOnMountOrArgChange: false } // avoid extra refetches
  );

  const [selectedId, setSelectedId] = useState<number | null>(null);

  const {
    data: selected,
    isLoading: isTicketLoading,
    isError: isTicketError,
    error: ticketError,
    refetch: refetchTicket,
  } = useGetTicketByIdQuery(selectedId!, {
    skip: !selectedId,
    refetchOnMountOrArgChange: false,
  });

  const [sendReply, { isLoading: isSending }] = useSendReplyMutation();
  const [closeTicket, { isLoading: isClosing }] = useCloseTicketMutation();

  // reply state
  const [reply, setReply] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // local optimistic replies (so UI updates immediately)
  const [localReplies, setLocalReplies] = useState<Reply[]>([]);

  // modal for images
  const [modalImage, setModalImage] = useState<string | null>(null);

  // ref for scrolling
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    document.title = "Support Tickets – Admin";
  }, []);

  // prepare ticket list
  const tickets = ticketsData?.tickets ?? [];

  // build unique client list (displayName)
  const clientsForFilter = useMemo(() => {
    const map = new Map<string, string>();
    tickets.forEach((t) => {
      const fn = t.user?.firstName ?? "";
      const ln = t.user?.lastName ?? "";
      const name = `${fn} ${ln}`.trim() || "Unknown";
      if (!map.has(name)) map.set(name, name);
    });
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      // client filter
      const fn = t.user?.firstName ?? "";
      const ln = t.user?.lastName ?? "";
      const clientName = `${fn} ${ln}`.trim() || "Unknown";
      if (clientFilter !== "all" && clientName !== clientFilter) return false;

      // search filter
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        (t.subject ?? "").toLowerCase().includes(q) ||
        (t.content ?? "").toLowerCase().includes(q)
      );
    });
  }, [tickets, search, clientFilter]);

  useEffect(() => {
    // set default selected when tickets load or filters change
    if (filteredTickets.length > 0) {
      const found = filteredTickets.some((t) => t.id === selectedId);
      if (!found) setSelectedId(filteredTickets[0].id);
    } else {
      setSelectedId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredTickets]);

  // sync server replies into localReplies whenever selected changes from server
  useEffect(() => {
    if (selected?.replies) {
      // map shape to our Reply type, support either isAdmin or isBroker from server
      const mapped = selected.replies.map((r: any) => ({
        id: r.id,
        content: r.content,
        screenshot: r.screenshot,
        isAdmin: Boolean(r.isAdmin ?? r.isBroker ?? false),
        createdAt: r.createdAt,
      })) as Reply[];

      setLocalReplies(mapped);

      // scroll to bottom after a short tick so DOM is updated
      setTimeout(() => scrollToBottom(), 50);
    } else {
      setLocalReplies([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id, selected?.replies]);

  // show errors as toasts (tickets / ticket)
  useEffect(() => {
    if (isTicketsError) {
      const msg =
        (ticketsError as any)?.data?.message ??
        (ticketsError as any)?.message ??
        "Failed to load tickets";
      addToast("error", msg);
    }
  }, [isTicketsError, ticketsError]);

  useEffect(() => {
    if (isTicketError) {
      const msg =
        (ticketError as any)?.data?.message ??
        (ticketError as any)?.message ??
        "Failed to load ticket";
      addToast("error", msg);
    }
  }, [isTicketError, ticketError]);

  const onFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = Array.from(e.target.files ?? []);
    setFiles(f);
    setPreviews(f.map((file) => URL.createObjectURL(file)));
  };

  const scrollToBottom = () => {
    // Prefer an explicit messagesEndRef if present
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
      return;
    }

    // Otherwise try to scroll the messages container directly
    const el = messagesContainerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  };

  const send = async () => {
    if (!selected || (!reply.trim() && files.length === 0)) return;

    // optimistic reply object
    const now = new Date().toISOString();
    const tempId = `temp-${Date.now()}`;
    const optimisticReply: Reply = {
      id: tempId,
      content: reply,
      screenshot: previews[0], // data URL preview if an image was added (shows instantly)
      isAdmin: true,
      createdAt: now,
    };

    // push optimistic reply into UI immediately
    setLocalReplies((prev) => [...prev, optimisticReply]);

    // preserve file to send BEFORE clearing state
    const fileToSend = files[0];

    // clear input & previews in UI
    setReply("");
    setPreviews([]);
    setFiles([]);

    // scroll to show optimistic message
    setTimeout(() => scrollToBottom(), 50);

    try {
      const res = await sendReply({
        ticketId: selected.id,
        content: optimisticReply.content,
        file: fileToSend,
      }).unwrap();

      // server reply shape: { message: string; reply: SupportReply }
      const serverReply = (res as any).reply;
      setLocalReplies((prev) =>
        prev.map((r) =>
          r.id === tempId
            ? {
                id: serverReply.id,
                content: serverReply.content,
                screenshot: serverReply.screenshot ?? undefined,
                isAdmin: Boolean(
                  serverReply.isAdmin ?? serverReply.isBroker ?? false
                ),
                createdAt: serverReply.createdAt,
              }
            : r
        )
      );

      addToast("success", (res as any).message ?? "Reply sent");
      setTimeout(() => scrollToBottom(), 50);
    } catch (err: any) {
      console.error("Failed to send reply", err);
      addToast(
        "error",
        err?.data?.message ?? err?.message ?? "Failed to send reply"
      );
      // Optionally: mark optimistic message as failed (not implemented here)
    }
  };

  const closeSelectedTicket = async () => {
    if (!selected) return;
    try {
      const res = await closeTicket({ ticketId: selected.id }).unwrap();
      addToast("success", res?.message ?? "Ticket closed");
    } catch (err: any) {
      console.error("Failed to close ticket", err);
      addToast(
        "error",
        err?.data?.message ?? err?.message ?? "Failed to close ticket"
      );
    }
  };

  // helper to open modal
  const openImageModal = (src: string) => {
    setModalImage(src);
  };
  const closeImageModal = () => setModalImage(null);

  // small skeleton components
  const TicketListSkeleton = () => (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-md border p-3">
          <div className="h-4 bg-gray-300 rounded w-3/5 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-full mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      ))}
    </div>
  );

  const MessagesSkeleton = () => (
    <div className="space-y-3 animate-pulse px-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="max-w-[80%] rounded-md px-3 py-2 text-sm bg-gray-200"
        >
          <div className="h-3 bg-gray-300 rounded w-1/3 mb-2" />
          <div className="h-3 bg-gray-300 rounded w-full" />
        </div>
      ))}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold">Support Center</h1>
          <p className="text-sm text-muted-foreground">Manage client tickets</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Ticket list */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Your Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                <Input
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search tickets"
                />

                {/* Client filter */}
                <Select
                  value={clientFilter}
                  onValueChange={(v) => setClientFilter(v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All clients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All clients</SelectItem>
                    {clientsForFilter.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={statusFilter}
                  onValueChange={(v) => setStatusFilter(v as any)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <ScrollArea className="h-[512px] pr-2">
                <div className="space-y-2">
                  {isTicketsLoading ? (
                    <TicketListSkeleton />
                  ) : isTicketsError ? (
                    <div className="p-4 rounded-md border bg-muted/50">
                      <div className="text-sm font-medium mb-2">
                        Failed to load tickets.
                      </div>
                      <div className="text-sm text-muted-foreground mb-3">
                        {(ticketsError as any)?.data?.message ??
                          (ticketsError as any)?.message ??
                          "An error occurred while fetching tickets."}
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => refetchTickets()}>Retry</Button>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setSearch("");
                            setClientFilter("all");
                            setStatusFilter("all");
                          }}
                        >
                          Reset filters
                        </Button>
                      </div>
                    </div>
                  ) : filteredTickets.length > 0 ? (
                    filteredTickets.map((t) => (
                      <button
                        key={t.id}
                        className={cn(
                          "w-full text-left rounded-md border p-3 transition-colors",
                          selectedId === t.id ? "bg-muted" : "hover:bg-muted/50"
                        )}
                        onClick={() => setSelectedId(t.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium truncate max-w-[70%]">
                            {t.subject}
                          </div>
                          <Badge
                            variant={
                              t.status === "OPEN" ? "default" : "secondary"
                            }
                          >
                            {t.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {t.content}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-1">
                          {new Date(t.createdAt).toLocaleDateString()} •{" "}
                          {t.user?.firstName} {t.user?.lastName}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No tickets found.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Ticket details */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="truncate">
                {selected
                  ? `${selected.subject} — ${selected.user?.firstName ?? ""} ${
                      selected.user?.lastName ?? ""
                    }`
                  : "Select a ticket"}
              </CardTitle>
              {selected && selected.status === "OPEN" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={closeSelectedTicket}
                  disabled={isClosing}
                >
                  {isClosing ? "Closing..." : "Close Ticket"}
                </Button>
              )}
              {selected && selected.status === "CLOSED" && (
                <Badge variant="secondary">Closed</Badge>
              )}
            </CardHeader>
            <CardContent>
              {isTicketLoading ? (
                <MessagesSkeleton />
              ) : isTicketError ? (
                <div className="p-4 rounded-md border bg-muted/50">
                  <div className="text-sm font-medium mb-2">
                    Failed to load ticket.
                  </div>
                  <div className="text-sm text-muted-foreground mb-3">
                    {(ticketError as any)?.data?.message ??
                      (ticketError as any)?.message ??
                      "An error occurred while fetching the ticket."}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => refetchTicket()}>Retry</Button>
                    <Button variant="ghost" onClick={() => setSelectedId(null)}>
                      Back to list
                    </Button>
                  </div>
                </div>
              ) : selected ? (
                <div className="space-y-4">
                  <ScrollArea className="h-[420px] pr-4">
                    {/* container for messages — we set a ref so we can scroll */}
                    <div ref={messagesContainerRef} className="space-y-3 px-1">
                      {localReplies.map((m) => {
                        const isAdmin = Boolean(m.isAdmin);
                        const authorLabel = isAdmin
                          ? "You"
                          : `${selected.user?.firstName ?? "Client"} ${
                              selected.user?.lastName ?? ""
                            }`;

                        return (
                          <div
                            key={m.id}
                            className={cn(
                              "flex",
                              isAdmin ? "justify-end" : "justify-start"
                            )}
                          >
                            <article
                              className={cn(
                                "max-w-[80%] rounded-md px-3 py-2 text-sm",
                                isAdmin ? "bg-primary/10" : "bg-muted"
                              )}
                            >
                              <header className="text-[11px] text-muted-foreground mb-1">
                                {authorLabel} •{" "}
                                {new Date(m.createdAt).toLocaleString()}
                              </header>
                              <p className="text-foreground whitespace-pre-wrap">
                                {m.content}
                              </p>

                              {m.screenshot && (
                                <div className="mt-2 grid grid-cols-1 gap-2">
                                  {/* open image in modal instead of new tab */}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openImageModal(m.screenshot!)
                                    }
                                    className="inline-block"
                                    aria-label="Open attachment"
                                  >
                                    <img
                                      src={m.screenshot}
                                      alt="attachment"
                                      className="rounded-md border border-card-border max-h-40 cursor-pointer"
                                    />
                                  </button>
                                </div>
                              )}
                            </article>
                          </div>
                        );
                      })}

                      {/* anchor to scroll into view */}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  <Separator />

                  {selected.status === "CLOSED" ? (
                    <div className="p-4 rounded-md border bg-muted/50 text-sm">
                      Ticket is closed — you cannot send replies.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Type your reply..."
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        rows={3}
                      />
                      <div className="flex flex-col gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={onFilesChange}
                          aria-label="Add image"
                        />
                        {previews.length > 0 && (
                          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                            {previews.map((src, i) => (
                              <img
                                key={i}
                                src={src}
                                alt={`Selected attachment ${i + 1}`}
                                className="h-20 w-full object-cover rounded-md border border-card-border"
                                onClick={() => openImageModal(src)}
                              />
                            ))}
                          </div>
                        )}
                        <div className="flex justify-end">
                          <Button
                            onClick={send}
                            disabled={
                              (!reply.trim() && files.length === 0) || isSending
                            }
                          >
                            {isSending ? "Sending..." : "Send Reply"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Select a ticket to view the conversation.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Image modal (simple) */}
      {modalImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={closeImageModal}
        >
          <div
            className="max-w-[90%] max-h-[90%] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="mb-2 rounded bg-white/10 px-3 py-1 text-sm"
              onClick={closeImageModal}
              aria-label="Close image"
            >
              Close
            </button>
            <div className="rounded bg-white p-2">
              <img
                src={modalImage}
                alt="Attachment"
                className="max-h-[80vh] w-auto block mx-auto"
              />
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            aria-live="polite"
            className={cn(
              "px-4 py-2 rounded shadow",
              t.type === "success" && "bg-green-600 text-white",
              t.type === "error" && "bg-red-600 text-white",
              t.type === "info" && "bg-blue-600 text-white"
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
