// src/components/news/NewsEditModal.tsx
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CombinedPost } from "@/types/broadcast/news.types";
import {
  useEditNotificationMutation,
  useEditReportMutation,
} from "@/API/broadcast.api";

interface NewsEditModalProps {
  post: CombinedPost | null;
  isOpen: boolean;
  onClose: (updated?: boolean) => void;
}

export function NewsEditModal({ post, isOpen, onClose }: NewsEditModalProps) {
  const { toast } = useToast();

  const [editNotification, { isLoading: editingNotif }] =
    useEditNotificationMutation();
  const [editReport, { isLoading: editingReport }] = useEditReportMutation();

  const [title, setTitle] = useState<string>("");
  const [body, setBody] = useState<string>(""); // description OR summary depending on type
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!post) return;
    setTitle(post.title ?? "");
    const raw: any = post.raw ?? {};
    if (post.source === "NOTIFICATION") {
      setBody((raw.description as string) ?? (post.summary as string) ?? "");
    } else {
      setBody((post.summary as string) ?? (raw.summary as string) ?? "");
    }
    setFile(null);
    setIsSubmitting(false);
  }, [post]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  };

  const extractId = (p: CombinedPost) =>
    String(p.raw?.id ?? p.id)
      .replace(/^notif-/, "")
      .replace(/^news-/, "");

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!post) return;

    // prevent double submissions
    if (isSubmitting) return;

    // validation per type
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please provide a title",
        variant: "destructive",
      });
      return;
    }

    if (post.source === "NOTIFICATION") {
      if (!body.trim()) {
        toast({
          title: "Description required",
          description: "Notifications require a description",
          variant: "destructive",
        });
        return;
      }
    } else {
      if (!body.trim()) {
        toast({
          title: "Summary required",
          description: "Reports require a summary",
          variant: "destructive",
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("title", title);

      if (post.source === "NOTIFICATION") {
        fd.append("description", body);
      } else {
        fd.append("summary", body);
      }

      if (file) {
        fd.append("file", file);
      }

      const id = extractId(post);

      if (post.source === "NOTIFICATION") {
        await editNotification({ id, data: fd }).unwrap();
      } else {
        await editReport({ id, data: fd }).unwrap();
      }

      toast({ title: "Updated", description: "Post updated successfully" });
      onClose(true);
    } catch (err: any) {
      console.error("edit error", err);
      toast({
        title: "Update failed",
        description:
          err?.data?.message ?? err?.message ?? "Could not update post",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isNotification = post?.source === "NOTIFICATION";
  const bodyLabel = isNotification ? "Description" : "Summary";
  const submitLabel =
    isSubmitting || editingNotif || editingReport
      ? "Saving..."
      : "Save changes";

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose(false);
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {post
              ? `Edit ${
                  post.source === "NOTIFICATION" ? "Notification" : "Report"
                }`
              : "Edit"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 p-2">
          <div>
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <Label>{bodyLabel}</Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            {/* Important: type="button" prevents accidental form submission */}
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose(false)}
            >
              Cancel
            </Button>

            {/* Explicit type="submit" for save */}
            <Button
              type="submit"
              disabled={isSubmitting || editingNotif || editingReport}
            >
              {submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
