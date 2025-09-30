// src/components/clients/MessageModal.tsx
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCreateNotificationMutation } from "@/API/broadcast.api";

interface MessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientName: string;
  clientId: number | string; // NEW: pass user id to send single-target notification
  messages: any[]; // preserve your existing shape
  initialTitle?: string;
  initialMessage?: string;
}

export const MessageModal = ({
  open,
  onOpenChange,
  clientName,
  clientId,
  messages,
  initialTitle,
  initialMessage,
}: MessageModalProps) => {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sendEmail, setSendEmail] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [notificationType, setNotificationType] = useState<
    "SECURITY" | "UPDATE" | "PROMOTION" | "ALERT" | "MAINTAINANCE"
  >("UPDATE");
  const isMobile = useIsMobile();

  const [createNotification, { isLoading }] = useCreateNotificationMutation();

  useEffect(() => {
    if (open) {
      setTitle(initialTitle ?? "");
      setMessage(initialMessage ?? "");
      setFile(null);
      setSendEmail(false);
      setNotificationType("UPDATE");
    }
  }, [open, initialTitle, initialMessage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  };

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast({
        title: "Validation",
        description: "Title and message are required.",
      });
      return;
    }

    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("description", message);
      fd.append("userNotificationType", notificationType);
      fd.append("targetAudience", "SINGLE");
      fd.append("userId", String(clientId));
      // optionally attach a file
      if (file) fd.append("file", file);

      await createNotification(fd).unwrap();

      toast({ title: "Sent", description: "Notification sent to user." });
      // reset local state and close modal
      setTitle("");
      setMessage("");
      setFile(null);
      setSendEmail(false);
      onOpenChange(false);
    } catch (err: any) {
      console.error("createNotification error:", err);
      toast({
        title: "Send failed",
        description: err?.data?.message ?? "Could not send notification.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full h-[100dvh] max-w-[100vw] rounded-none overflow-y-auto overflow-x-hidden box-border p-4 sm:h-auto sm:max-w-2xl sm:max-h-[80vh] sm:rounded-lg sm:p-6">
        <DialogHeader>
          <DialogTitle className="break-words text-base sm:text-lg">
            Send Message to {clientName}
          </DialogTitle>
          <DialogDescription className="break-words text-xs sm:text-sm">
            Send a custom notification to this client. You can also choose to
            send an email.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g., Withdrawal Processed"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-9 sm:h-10 text-sm sm:text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Enter your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full text-sm sm:text-base"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <Label htmlFor="type">Notification Type</Label>
              <select
                id="type"
                value={notificationType}
                onChange={(e) =>
                  setNotificationType(
                    e.target.value as
                      | "SECURITY"
                      | "UPDATE"
                      | "PROMOTION"
                      | "ALERT"
                      | "MAINTAINANCE"
                  )
                }
                className="w-full h-9 sm:h-10 rounded-md border px-2 text-sm"
              >
                <option value="SECURITY">SECURITY</option>
                <option value="UPDATE">UPDATE</option>
                <option value="PROMOTION">PROMOTION</option>
                <option value="ALERT">ALERT</option>
                <option value="MAINTAINANCE">MAINTAINANCE</option>
              </select>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 text-sm sm:text-base">
          <Button
            size={isMobile ? "sm" : "default"}
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            size={isMobile ? "sm" : "default"}
            onClick={handleSend}
            disabled={!title || !message || isLoading}
          >
            <Send className="h-4 w-4 mr-2" />
            {isLoading ? "Sending..." : "Send Message"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
