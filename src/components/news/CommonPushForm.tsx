// src/components/news/CommonPushForm.tsx
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Bell,
  Upload,
  X,
  FileText,
  File,
  Image as ImageIcon,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateNotificationMutation } from "@/API/broadcast.api";

const NOTIFICATION_TYPES = [
  "SECURITY",
  "UPDATE",
  "PROMOTION",
  "ALERT",
  "MAINTAINANCE",
] as const;

type AttachedPreview = {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  file?: File;
};

export function CommonPushForm() {
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [userNotificationType, setUserNotificationType] = useState<
    (typeof NOTIFICATION_TYPES)[number] | ""
  >("");
  const [sending, setSending] = useState(false);

  // attachments UI (multiple previews allowed) but we will send only one file (firstSelectedFile)
  const [previews, setPreviews] = useState<AttachedPreview[]>([]);
  const [firstSelectedFile, setFirstSelectedFile] = useState<File | null>(null);

  const [createNotification] = useCreateNotificationMutation();

  const canSend =
    title.trim().length > 0 &&
    message.trim().length > 0 &&
    userNotificationType !== "";

  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const newPreviews: AttachedPreview[] = [];

    for (const f of fileList) {
      if (!allowedTypes.includes(f.type)) {
        toast({
          title: "Invalid file type",
          description: `${f.name} is not a supported file type.`,
          variant: "destructive",
        });
        continue;
      }

      if (f.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${f.name} is larger than 10MB.`,
          variant: "destructive",
        });
        continue;
      }

      const p: AttachedPreview = {
        id: Math.random().toString(36).substr(2, 9),
        name: f.name,
        url: URL.createObjectURL(f),
        type: f.type,
        size: f.size,
        file: f,
      };

      newPreviews.push(p);
    }

    if (newPreviews.length === 0) {
      e.currentTarget.value = "";
      return;
    }

    setPreviews((prev) => [...prev, ...newPreviews]);

    if (!firstSelectedFile) {
      setFirstSelectedFile(newPreviews[0].file ?? null);
    }

    e.currentTarget.value = "";
  };

  const removePreview = (id: string) => {
    setPreviews((prev) => {
      const toRemove = prev.find((p) => p.id === id);
      if (toRemove) URL.revokeObjectURL(toRemove.url);

      const newList = prev.filter((p) => p.id !== id);

      if (
        firstSelectedFile &&
        toRemove?.file &&
        firstSelectedFile.name === toRemove.file.name
      ) {
        const next = newList.find((p) => p.file);
        setFirstSelectedFile(next ? next.file! : null);
      }

      return newList;
    });
  };

  const getFileIcon = (type: string) => {
    if (!type) return <File className="h-4 w-4" />;
    if (type.startsWith("image/")) return <ImageIcon className="h-4 w-4" />;
    if (type === "application/pdf") return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleSend = async () => {
    if (!canSend) {
      toast({
        title: "Missing fields",
        description:
          "Please fill title, message and select a notification type.",
        variant: "destructive",
      });
      return;
    }

    setSending(true);

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", message.trim());
      formData.append("userNotificationType", userNotificationType);
      formData.append("targetAudience", "ALL"); // hardcoded (not shown in UI)

      if (firstSelectedFile) formData.append("file", firstSelectedFile);

      const res = await createNotification(formData as any).unwrap();

      toast({
        title: "Notification created",
        description: res?.message ?? "Notification created successfully",
      });

      previews.forEach((p) => URL.revokeObjectURL(p.url));
      setPreviews([]);
      setFirstSelectedFile(null);
      setTitle("");
      setMessage("");
      setUserNotificationType("");
    } catch (err: any) {
      console.error("Create notification failed", err);
      toast({
        title: "Failed to create notification",
        description:
          (err?.data?.message as string) ??
          (err?.message as string) ??
          "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" /> Create Common Push Notification
        </CardTitle>
        <CardDescription>
          Send a platform-wide notification to all users
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="push-title">Title *</Label>
          <Input
            id="push-title"
            placeholder="Short title for the notification"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={80}
          />
          <p className="text-xs text-muted-foreground">
            {title.length}/80 characters
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="push-message">Message *</Label>
          <Textarea
            id="push-message"
            placeholder="Write the notification message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            maxLength={200}
          />
          <p className="text-xs text-muted-foreground">
            {message.length}/200 characters
          </p>
        </div>

        <div className="w-full">
          <Label>Notification Type *</Label>
          <Select
            value={userNotificationType}
            onValueChange={(v) => setUserNotificationType(v as any)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {NOTIFICATION_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Note: targetAudience omitted from UI; still sent as ALL in formData */}

        <Button
          onClick={handleSend}
          disabled={!canSend || sending}
          className="w-full"
          size="lg"
        >
          {sending ? "Sending..." : "Send Notification"}
        </Button>
      </CardContent>
    </Card>
  );
}
