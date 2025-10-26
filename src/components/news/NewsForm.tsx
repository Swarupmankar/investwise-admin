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
import { Upload, X, FileText, File, Image as ImageIcon } from "lucide-react";
import { AttachedFile, NewsPost } from "@/types/broadcast/news.types";
import { useToast } from "@/hooks/use-toast";
import { useCreateNewsMutation } from "@/API/broadcast.api";

interface NewsFormProps {
  onPublish?: (post: Omit<NewsPost, "id" | "publishedAt">) => void;
}

export function NewsForm({ onPublish }: NewsFormProps) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");

  // Banner image (single)
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState<string>("");

  // Attachment (the actual report/file)
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  const [isPublishing, setIsPublishing] = useState(false);
  const { toast } = useToast();
  const [createNews, { isLoading: isCreating }] = useCreateNewsMutation();

  const allowedAttachmentTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const allowedBannerTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
  ];

  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleBannerSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const f = files[0];
    if (!allowedBannerTypes.includes(f.type)) {
      toast({
        title: "Invalid banner type",
        description: "Banner must be a JPG, PNG, WEBP or AVIF image.",
        variant: "destructive",
      });
      e.currentTarget.value = "";
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast({
        title: "Banner too large",
        description: "Banner image must be under 5MB.",
        variant: "destructive",
      });
      e.currentTarget.value = "";
      return;
    }

    setBannerFile(f);
    const url = URL.createObjectURL(f);
    setBannerPreviewUrl(url);
    e.currentTarget.value = "";
  };

  const clearBanner = () => {
    if (bannerPreviewUrl) URL.revokeObjectURL(bannerPreviewUrl);
    setBannerFile(null);
    setBannerPreviewUrl("");
  };

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const newAttached: AttachedFile[] = [];

    for (const f of fileList) {
      if (!allowedAttachmentTypes.includes(f.type)) {
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
      // For backend (single file field expected), keep first file
      setFileToUpload(fileList[0]);
    }

    e.currentTarget.value = "";
  };

  const removeAttachedFile = (id: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
    // If we removed the only file that was also the one to upload, clear it
    if (attachedFiles.length === 1) {
      setFileToUpload(null);
    }
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
    if (!fileToUpload) {
      toast({
        title: "File required",
        description: "Please attach a report file (PDF/IMG/DOCX).",
        variant: "destructive",
      });
      return;
    }

    setIsPublishing(true);

    try {
      // Build payload for API
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("summary", summary.trim());
      formData.append("file", fileToUpload); // report file

      // NEW: banner (backend expects field name "banner" – will store & later return the *name*)
      if (bannerFile) {
        formData.append("banner", bannerFile);
      }

      const res = await createNews(formData).unwrap();

      toast({
        title: "News Published",
        description: "The news report was successfully created.",
      });

      // Optional local callback
      if (onPublish) {
        try {
          onPublish({
            title: title.trim(),
            summary: summary.trim(),
            fileUrl: undefined,
            banner: undefined, // backend will produce a name later
          } as any);
        } catch {}
      }

      // Reset UI
      setTitle("");
      setSummary("");
      attachedFiles.forEach((f) => URL.revokeObjectURL(f.url));
      setAttachedFiles([]);
      setFileToUpload(null);
      clearBanner();
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
        <CardDescription>
          Add a title, summary, banner image, and upload the report file.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Title */}
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

        {/* Summary */}
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

        {/* Banner Image (NEW) */}
        <div className="space-y-2">
          <Label>Banner Image</Label>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
            <div className="text-center">
              <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <div className="mt-4">
                <Label htmlFor="banner-upload" className="cursor-pointer">
                  <span className="text-sm font-medium text-primary hover:underline">
                    Upload banner image
                  </span>
                  <Input
                    id="banner-upload"
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.avif"
                    onChange={handleBannerSelection}
                    className="hidden"
                  />
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG, WEBP, AVIF up to 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Banner preview */}
          {bannerFile && (
            <div className="mt-3 flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <ImageIcon className="h-4 w-4" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate max-w-[260px]">
                    {bannerFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(bannerFile.size)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {bannerPreviewUrl && (
                  <img
                    src={bannerPreviewUrl}
                    alt="Banner preview"
                    className="h-12 w-20 object-cover rounded border"
                  />
                )}
                <Button size="sm" variant="ghost" onClick={clearBanner}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Report File (Required) */}
        <div className="space-y-2">
          <Label>File Attachments </Label>
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
                      <ImageIcon className="h-4 w-4" />
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
