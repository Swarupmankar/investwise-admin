// src/components/clients/MessageModal.tsx
import { useEffect, useState, useRef } from "react";
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
import { Send, Upload, File, X, Image, FileText, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCreateNotificationMutation } from "@/API/broadcast.api";

interface MessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientName: string;
  clientId: number | string;
  messages: any[];
  initialTitle?: string;
  initialMessage?: string;
}

interface FileWithPreview {
  file: File;
  preview?: string;
  id: string;
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
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [notificationType, setNotificationType] = useState<
    "SECURITY" | "UPDATE" | "PROMOTION" | "ALERT" | "MAINTAINANCE"
  >("UPDATE");
  const isMobile = useIsMobile();

  const [createNotification, { isLoading }] = useCreateNotificationMutation();

  useEffect(() => {
    if (open) {
      setTitle(initialTitle ?? "");
      setMessage(initialMessage ?? "");
      setFiles([]);
      setNotificationType("UPDATE");
    }
  }, [open, initialTitle, initialMessage]);

  // Cleanup preview URLs
  useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file.preview && file.preview.startsWith("blob:")) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [files]);

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <Image className="h-4 w-4" />;
    if (fileType.includes("pdf")) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: FileWithPreview[] = [];

    Array.from(selectedFiles).forEach((file) => {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 10MB limit`,
          variant: "destructive",
        });
        return;
      }

      const fileWithPreview: FileWithPreview = {
        file,
        id: Math.random().toString(36).substr(2, 9),
      };

      // Create preview for images
      if (file.type.startsWith("image/")) {
        fileWithPreview.preview = URL.createObjectURL(file);
      }

      newFiles.push(fileWithPreview);
    });

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    // Reset input to allow selecting same file again
    if (e.target) e.target.value = "";
  };

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove?.preview && fileToRemove.preview.startsWith("blob:")) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast({
        title: "Validation",
        description: "Title and message are required.",
        variant: "destructive",
      });
      return;
    }

    const raw = clientId;
    const userIdNumber = typeof raw === "number" ? raw : Number(raw);

    if (!Number.isFinite(userIdNumber) || userIdNumber <= 0) {
      toast({
        title: "Validation",
        description: "Invalid client id.",
        variant: "destructive",
      });
      return;
    }

    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("description", message);
      fd.append("userNotificationType", notificationType);
      fd.append("targetAudience", "SINGLE");
      fd.append("userId", String(userIdNumber));

      // Append all files
      files.forEach((file) => {
        fd.append("file", file.file);
      });

      await createNotification(fd).unwrap();

      toast({
        title: "Sent",
        description: `Notification sent to ${clientName}.${
          files.length > 0 ? ` ${files.length} file(s) attached.` : ""
        }`,
      });

      setTitle("");
      setMessage("");
      setFiles([]);
      onOpenChange(false);
    } catch (err: any) {
      console.error("createNotification error:", err);
      toast({
        title: "Send failed",
        description: err?.data?.message ?? "Could not send notification.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full h-[100dvh] max-w-[100vw] rounded-none overflow-y-auto overflow-x-hidden box-border p-4 sm:h-auto sm:max-w-2xl sm:max-h-[90vh] sm:rounded-lg sm:p-6">
        <DialogHeader>
          <DialogTitle className="break-words text-base sm:text-lg">
            Send Message to {clientName}
          </DialogTitle>
          <DialogDescription className="break-words text-xs sm:text-sm">
            Send a custom notification to this client. You can attach multiple
            files (max 10MB each).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Withdrawal Processed"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-9 sm:h-10 text-sm sm:text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              placeholder="Enter your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full text-sm sm:text-base resize-vertical min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
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
                className="w-full h-9 sm:h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="SECURITY">Security</option>
                <option value="UPDATE">Update</option>
                <option value="PROMOTION">Promotion</option>
                <option value="ALERT">Alert</option>
                <option value="MAINTAINANCE">Maintenance</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Attach Files</Label>
              <div
                className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                  isDragOver
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-muted-foreground/50"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium mb-1">
                  Drop files here or click to upload
                </p>
                <p className="text-xs text-muted-foreground">
                  Max 10MB per file
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-3">
              <Label>Attached Files ({files.length})</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {files.map((fileWithPreview) => (
                  <div
                    key={fileWithPreview.id}
                    className="flex items-center gap-3 p-2 border rounded-lg bg-muted/50"
                  >
                    {fileWithPreview.preview ? (
                      <img
                        src={fileWithPreview.preview}
                        alt={fileWithPreview.file.name}
                        className="h-8 w-8 object-cover rounded"
                      />
                    ) : (
                      <div className="h-8 w-8 flex items-center justify-center bg-background border rounded">
                        {getFileIcon(fileWithPreview.file.type)}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {fileWithPreview.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(fileWithPreview.file.size)}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(fileWithPreview.id);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 text-sm sm:text-base pt-4">
          <Button
            size={isMobile ? "sm" : "default"}
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            size={isMobile ? "sm" : "default"}
            onClick={handleSend}
            disabled={!title.trim() || !message.trim() || isLoading}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            {isLoading
              ? "Sending..."
              : `Send${
                  files.length > 0 ? ` with ${files.length} file(s)` : ""
                }`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
