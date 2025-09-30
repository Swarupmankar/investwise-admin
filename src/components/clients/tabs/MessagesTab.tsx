import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminMessage } from "@/types/client";
import { formatDate } from "@/lib/formatters";
import { MailPlus } from "lucide-react";

interface MessagesTabProps {
  messages: AdminMessage[];
  onCompose: () => void;
}

export function MessagesTab({ messages, onCompose }: MessagesTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button size="sm" onClick={onCompose}><MailPlus className="mr-2 h-4 w-4" />Compose</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Message History</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {messages.map((m) => (
              <li key={m.id} className="border rounded-md p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{m.title}</div>
                  <div className="text-xs text-muted-foreground">{formatDate(m.sentAt)}</div>
                </div>
                <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{m.message}</div>
                <div className="mt-2 text-xs text-muted-foreground">Channel: {m.emailSent ? "Email + In‑app" : "In‑app"}</div>
              </li>
            ))}
            {messages.length === 0 && (
              <div className="text-sm text-muted-foreground">No messages yet.</div>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
