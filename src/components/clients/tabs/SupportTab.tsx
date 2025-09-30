import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useSupportData } from "@/hooks/useSupportData";
import type { SupportTicket } from "@/types/support";

interface SupportTabProps {
  clientId: string;
}

export function SupportTab({ clientId }: SupportTabProps) {
  const { getTicketsByClientId, replyToTicket, closeTicket, reopenTicket } = useSupportData();
  const tickets = getTicketsByClientId(clientId);
  const [selectedId, setSelectedId] = useState<string>(tickets[0]?.id);
  const selected: SupportTicket | undefined = useMemo(
    () => tickets.find((t) => t.id === selectedId) ?? tickets[0],
    [tickets, selectedId]
  );

  const [reply, setReply] = useState("");

  const handleSend = () => {
    if (selected) {
      replyToTicket(selected.id, reply, "support");
      setReply("");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[520px] pr-2">
            <div className="space-y-2">
              {tickets.map((t) => (
                <button
                  key={t.id}
                  className={cn(
                    "w-full text-left rounded-md border p-3 transition-colors",
                    selected?.id === t.id ? "bg-muted" : "hover:bg-muted/50"
                  )}
                  onClick={() => setSelectedId(t.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium truncate max-w-[70%]">{t.subject}</div>
                    <Badge variant={t.status === "open" ? "default" : "secondary"}>
                      {t.status === "open" ? "Open" : "Closed"}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-1">
                    {t.description}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </div>
                </button>
              ))}
              {tickets.length === 0 && (
                <div className="text-sm text-muted-foreground">No tickets for this client.</div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="truncate">{selected?.subject ?? "Select a ticket"}</CardTitle>
          {selected && (
            selected.status === "open" ? (
              <Button size="sm" variant="outline" onClick={() => closeTicket(selected.id)}>
                Close Ticket
              </Button>
            ) : (
              <Button size="sm" variant="secondary" onClick={() => reopenTicket(selected.id)}>
                Reopen Ticket
              </Button>
            )
          )}
        </CardHeader>
        <CardContent>
          {selected ? (
            <div className="space-y-4">
              <ScrollArea className="h-[420px] pr-4">
                <div className="space-y-3">
                  {selected.messages.map((m) => (
                    <div key={m.id} className={cn("flex", m.author === "support" ? "justify-end" : "justify-start")}> 
                      <div
                        className={cn(
                          "max-w-[80%] rounded-md px-3 py-2 text-sm",
                          m.author === "support" ? "bg-primary/10" : "bg-muted"
                        )}
                      >
                        <div className="text-[11px] text-muted-foreground mb-1">
                          {m.author === "support" ? "Support Team" : "Client"} • {new Date(m.createdAt).toLocaleString()}
                        </div>
                        <div className="text-foreground whitespace-pre-wrap">{m.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <Separator />

              <div className="space-y-2">
                <Textarea
                  placeholder="Type your reply..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button onClick={handleSend} disabled={!reply.trim()}>
                    Send Reply
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Select a ticket to view the conversation.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
