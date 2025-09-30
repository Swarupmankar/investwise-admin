// src/components/news/NewsForm.tsx
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Upload, X, FileText, File, Image } from "lucide-react";
import { AttachedFile, NewsPost } from "@/types/news";
import { useToast } from "@/hooks/use-toast";
import { useCreateNewsMutation } from "@/API/broadcast.api";

interface NewsFormProps {
  onPublish?: (post: Omit<NewsPost, "id" | "publishedAt">) => void;
}

export function NewsForm({ onPublish }: NewsFormProps) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [sendNotification, setSendNotification] = useState(true);
  const [sendEmail, setSendEmail] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const { toast } = useToast();
  const [createNews, { isLoading: isCreating }] = useCreateNewsMutation();

  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const newAttached: AttachedFile[] = [];

    for (const f of fileList) {
      if (!allowedTypes.includes(f.type)) {
        toast({
          title: "Invalid file type",
          description: `${f.name} is not supported.`,
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

      const attached: AttachedFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: f.name,
        url: URL.createObjectURL(f),
        type: f.type,
        size: f.size,
      };

      newAttached.push(attached);
    }

    if (newAttached.length > 0) {
      setAttachedFiles((prev) => [...prev, ...newAttached]);
      setFileToUpload(fileList[0]);
    }

    e.currentTarget.value = "";
  };

  const removeAttachedFile = (id: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const handlePublish = async () => {
    if (!title.trim() || !summary.trim()) {
      toast({
        title: "Required fields missing",
        description: "Please fill in both title and summary.",
        variant: "destructive",
      });
      return;
    }

    setIsPublishing(true);

    try {
      const localPayload: Omit<NewsPost, "id" | "publishedAt"> = {
        title: title.trim(),
        summary: summary.trim(),
        attachedFiles,
        authorName: "Admin User",
        notificationSent: sendNotification,
        emailSent: sendEmail,
      };

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("summary", summary.trim());

      if (fileToUpload) {
        formData.append("file", fileToUpload);
      } else {
        toast({
          title: "File required",
          description: "Please attach a file to publish the report.",
          variant: "destructive",
        });
        setIsPublishing(false);
        return;
      }

      const res = await createNews(formData).unwrap();

      toast({
        title: "News Published",
        description: "The news report was successfully created.",
      });

      if (onPublish) {
        try {
          onPublish(localPayload);
        } catch (err) {}
      }

      // Reset UI
      setTitle("");
      setSummary("");
      setAttachedFiles([]);
      setFileToUpload(null);
      setSendNotification(true);
      setSendEmail(false);
    } catch (err) {
      console.error("Failed to publish news:", err);
      toast({
        title: "Failed to publish post",
        description: (err as any)?.data?.message ?? "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📝 Publish Report
        </CardTitle>
        <CardDescription>Upload files, add a title and summary</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            placeholder="e.g., July Returns Distributed"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="summary">Summary *</Label>
          <Textarea
            id="summary"
            placeholder="Write your announcement content here..."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={4}
            maxLength={1000}
          />
          <p className="text-sm text-muted-foreground">
            {summary.length}/1000 characters
          </p>
        </div>

        <div className="space-y-2">
          <Label>File Attachments (Required)</Label>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <div className="mt-4">
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-sm font-medium text-primary hover:underline">
                    Upload files
                  </span>
                  <Input
                    id="file-upload"
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.docx"
                    onChange={handleFileSelection}
                    className="hidden"
                  />
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, JPG, PNG, DOCX up to 10MB each
                </p>
              </div>
            </div>
          </div>

          {attachedFiles.length > 0 && (
            <div className="space-y-2 mt-2">
              <Label>Attached Files</Label>
              {attachedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {file.type.startsWith("image/") ? (
                      <Image className="h-4 w-4" />
                    ) : file.type === "application/pdf" ? (
                      <FileText className="h-4 w-4" />
                    ) : (
                      <File className="h-4 w-4" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeAttachedFile(file.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
          <Label className="text-base font-medium">Notification Settings</Label>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="notification-toggle">
                Send notification to all users
              </Label>
              <p className="text-sm text-muted-foreground">
                Users will receive an in-app notification
              </p>
            </div>
            <Switch
              id="notification-toggle"
              checked={sendNotification}
              onCheckedChange={setSendNotification}
            />
          </div>

          {sendNotification && (
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="email-toggle">Also send via email</Label>
                <p className="text-sm text-muted-foreground">
                  Additionally send the announcement via email
                </p>
              </div>
              <Switch
                id="email-toggle"
                checked={sendEmail}
                onCheckedChange={setSendEmail}
              />
            </div>
          )}
        </div>

        <Button
          onClick={handlePublish}
          disabled={isPublishing || !title.trim() || !summary.trim()}
          className="w-full"
          size="lg"
        >
          {isPublishing ? "Publishing..." : "Publish Post"}
        </Button>
      </CardContent>
    </Card>
  );
}
