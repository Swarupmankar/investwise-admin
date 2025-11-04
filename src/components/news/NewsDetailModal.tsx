// src/components/news/NewsDetailModal.tsx
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Image,
  Download,
  Edit,
  Trash2,
  Calendar,
  User,
} from "lucide-react";
import { format } from "date-fns";
import { CombinedPost } from "@/types/broadcast/news.types";
import { useToast } from "@/hooks/use-toast";
import {
  useDeleteNotificationMutation,
  useDeleteReportMutation,
} from "@/API/broadcast.api";
import { NewsEditModal } from "./NewsEditModal";

interface NewsDetailModalProps {
  post: CombinedPost | null;
  isOpen: boolean;
  onClose: () => void;
  // removed onEdit/onDelete (we handle inside)
}

export function NewsDetailModal({
  post,
  isOpen,
  onClose,
}: NewsDetailModalProps) {
  const { toast } = useToast();
  const [deleteNotification] = useDeleteNotificationMutation();
  const [deleteReport] = useDeleteReportMutation();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!post) return null;

  // reuse your attachedFiles + primary logic (omitted for brevity) — same as before
  const getPrimaryAttachmentUrl = (): string | null => {
    if (post.fileUrl) return post.fileUrl;
    const raw: any = post.raw ?? {};
    if (raw.fileAttachedUrl) return raw.fileAttachedUrl;
    if (raw.fileUrl) return raw.fileUrl;
    if (Array.isArray(raw.attachedFiles) && raw.attachedFiles.length > 0) {
      const f = raw.attachedFiles[0];
      return f?.url ?? f?.fileUrl ?? null;
    }
    return null;
  };

  const primaryAttachmentUrl = getPrimaryAttachmentUrl();

  const buildAttachedFiles = (): Array<any> => {
    const raw: any = post.raw ?? {};
    const filesMap = new Map<string, any>();
    const pushIfUnique = (file: any) => {
      if (!file?.url) return;
      const key = String(file.url);
      if (!filesMap.has(key)) filesMap.set(key, file);
    };

    if (Array.isArray(raw.attachedFiles)) {
      for (const f of raw.attachedFiles) {
        pushIfUnique({
          id: f.id ?? f.name ?? `${post.id}-file`,
          name: f.name ?? f.filename ?? f.originalName ?? "file",
          url: f.url ?? f.fileUrl ?? null,
          type: f.type ?? f.mimeType ?? "",
          size: f.size ?? undefined,
        });
      }
    }

    if (raw.fileAttachedUrl) {
      pushIfUnique({
        id: `fileAttachedUrl-${post.id}`,
        name: post.title ? `${post.title} attachment` : "attachment",
        url: raw.fileAttachedUrl,
        type: "",
      });
    }

    if (post.fileUrl) {
      pushIfUnique({
        id: `fileUrl-${post.id}`,
        name: post.title ? `${post.title} file` : "file",
        url: post.fileUrl,
        type: "",
      });
    }

    return Array.from(filesMap.values());
  };

  const attachedFiles = buildAttachedFiles();

  // date
  const raw: any = post.raw ?? {};
  const candidate =
    post.createdAt ?? raw.createdAt ?? raw.publishedAt ?? undefined;
  const safeDate = candidate ? new Date(candidate) : null;
  const formattedFullDate = safeDate ? format(safeDate, "PPP") : "—";
  const formattedTime = safeDate ? format(safeDate, "p") : "—";

  // determine type
  const explicitType = (post as any).type as
    | "NEWS"
    | "NOTIFICATION"
    | undefined;
  const source = (post as any).source as string | undefined;
  const rowType =
    explicitType ??
    (source
      ? source.toLowerCase().includes("notif")
        ? "NOTIFICATION"
        : "NEWS"
      : attachedFiles.length > 0
      ? "NEWS"
      : "NEWS");

  const isNotification =
    post.source === "NOTIFICATION" ||
    (raw && raw.type && typeof raw.type === "string" && raw.type !== "NEWS");

  // delete handler
  const handleDelete = async () => {
    if (!post) return;
    const id = String(post.raw?.id ?? post.id)
      .toString()
      .replace(/^notif-/, "")
      .replace(/^news-/, "");
    if (!confirm("Are you sure you want to delete this item?")) return;
    setIsDeleting(true);
    try {
      if (post.source === "NOTIFICATION" || isNotification) {
        await deleteNotification({ id }).unwrap();
        toast({ title: "Deleted", description: "Notification deleted" });
      } else {
        await deleteReport({ id }).unwrap();
        toast({ title: "Deleted", description: "News deleted" });
      }
      onClose();
    } catch (err: any) {
      console.error("delete error", err);
      toast({
        title: "Delete failed",
        description: err?.data?.message ?? err?.message ?? "Could not delete",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl truncate">
              {post.title ?? "Untitled"}
            </DialogTitle>
            <DialogDescription>
              Published {formattedFullDate}{" "}
              {formattedTime !== "—" && `at ${formattedTime}`}
            </DialogDescription>
          </DialogHeader>

          <div className="my-2">
            <Badge variant={rowType === "NEWS" ? "default" : "secondary"}>
              {rowType === "NOTIFICATION" ? "NOTIFICATION" : "NEWS"}
            </Badge>
          </div>

          {primaryAttachmentUrl &&
            primaryAttachmentUrl.match(/\.(jpg|jpeg|png|webp|gif)$/i) && (
              <div className="my-4">
                <img
                  src={primaryAttachmentUrl}
                  alt={`${post.title} attachment`}
                  className="w-full h-48 object-cover rounded-md border"
                  loading="lazy"
                />
              </div>
            )}

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Content</h3>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {post.summary ?? raw.description ?? "—"}
              </p>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Author:</span>
                <Badge variant="outline">{raw.authorName ?? "Admin"}</Badge>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Published:
                </span>
                <span className="text-sm">{formattedFullDate}</span>
              </div>
            </div>

            {attachedFiles.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="font-semibold">
                    Attached Files ({attachedFiles.length})
                  </h3>
                  <div className="space-y-2">
                    {attachedFiles.map((file) => (
                      <div
                        key={file.id ?? file.url}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4" />
                          <div>
                            <p className="text-sm font-medium">
                              {file.name ?? "file"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {file.size
                                ? `${Math.round(file.size / 1024)} KB`
                                : ""}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {file.url ? (
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm underline"
                            >
                              Open
                            </a>
                          ) : null}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              try {
                                const link = document.createElement("a");
                                link.href = file.url;
                                link.download = file.name ?? "file";
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              } catch {
                                window.open(file.url, "_blank");
                              }
                            }}
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {isNotification && (
              <>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Notification Type
                    </p>
                    <p>{raw.type ?? "UNKNOWN"}</p>
                  </div>
                </div>
              </>
            )}

            <Separator />

            <div className="flex justify-between">
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditOpen(true)}>
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="h-4 w-4 mr-2" />{" "}
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
              <Button variant="secondary" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit modal */}
      <NewsEditModal
        post={post}
        isOpen={isEditOpen}
        onClose={(updated) => {
          setIsEditOpen(false);
          if (updated) onClose();
        }}
      />
    </>
  );
}
