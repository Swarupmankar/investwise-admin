import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MailPlus } from "lucide-react";
import { useGetNotificationsByUserIdQuery } from "@/API/broadcast.api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface NotificationItem {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  fileAttachedUrl?: string | null;
  recipientUserIds?: number[];
  raw?: any;
}

interface MessagesTabProps {
  userId?: number | null;
  onCompose: () => void;
}

function formatDateTimeIso(d?: string | null) {
  if (!d) return { date: "—", time: "" };
  const t = Date.parse(d);
  if (!Number.isFinite(t)) return { date: String(d), time: "" };
  const dt = new Date(t);
  const date = dt.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const time = dt.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return { date, time };
}

export function MessagesTab({ userId, onCompose }: MessagesTabProps) {
  const isValidId =
    typeof userId === "number" && Number.isFinite(userId) && userId > 0;
  const {
    data: messages = [],
    isLoading,
    isError,
  } = useGetNotificationsByUserIdQuery(
    (isValidId ? (userId as number) : 0) as any,
    { skip: !isValidId }
  );

  useEffect(() => {
    console.log("[MessagesTab] hook messages:", messages);
  }, [messages]);

  const [imageOpen, setImageOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const openImage = (src: string) => {
    setImageSrc(src);
    setImageOpen(true);
  };
  const closeImage = () => {
    setImageOpen(false);
    setImageSrc(null);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button size="sm" onClick={onCompose}>
            <MailPlus className="mr-2 h-4 w-4" />
            Compose
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Message History</CardTitle>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="text-sm text-muted-foreground">
                Loading messages…
              </div>
            ) : isError ? (
              <div className="text-sm text-red-500">
                Failed to load messages.
              </div>
            ) : messages.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No messages yet.
              </div>
            ) : (
              <ul className="space-y-4">
                {messages.map((m: NotificationItem) => {
                  const dt = formatDateTimeIso(m.createdAt);
                  return (
                    <li
                      key={m.id}
                      className="border rounded-md p-4 flex gap-4 items-start"
                    >
                      <div className="w-20 h-20 flex-shrink-0">
                        {m.fileAttachedUrl ? (
                          <button
                            onClick={() => openImage(m.fileAttachedUrl!)}
                            className="w-20 h-20 rounded-md overflow-hidden border p-0 hover:opacity-90"
                            aria-label="Open attachment"
                          >
                            <img
                              src={m.fileAttachedUrl}
                              alt={m.title}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ) : (
                          <div className="w-20 h-20 rounded-md bg-muted-foreground/10 flex items-center justify-center text-xs text-muted-foreground">
                            No Image
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="text-base font-semibold text-foreground">
                          {m.title}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {m.description ?? "—"}
                        </div>
                        <div className="mt-3 text-xs text-muted-foreground">
                          Channel: In-app
                        </div>
                      </div>

                      <div className="text-right text-xs text-muted-foreground whitespace-nowrap">
                        <div>{dt.date}</div>
                        <div className="text-[11px] text-muted-foreground/90 mt-1">
                          {dt.time}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={imageOpen} onOpenChange={setImageOpen}>
        <DialogContent className="max-w-3xl w-full">
          <DialogHeader>
            <DialogTitle>Attachment</DialogTitle>
          </DialogHeader>
          <div className="p-2">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt="attachment preview"
                className="w-full h-auto rounded-md object-contain"
              />
            ) : (
              <div className="text-sm text-muted-foreground">No image</div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={closeImage}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default MessagesTab;
