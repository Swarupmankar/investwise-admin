import React, { useMemo, useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { useCreateNewsMutation } from "@/API/broadcast.api";

type LocalAttached = {
  id: string;
  file: File;
  name: string;
  url: string; // object URL for preview
  type: string;
  size: number;
};

interface NewsFormProps {
  onPublish?: (post: { title: string; summary: string }) => void;
}

const MAX_FILES = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_BANNER_SIZE = 5 * 1024 * 1024; // 5MB

export function NewsForm({ onPublish }: NewsFormProps) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");

  // Banner (single)
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState<string>("");

  // Attachments (multiple)
  const [attachedFiles, setAttachedFiles] = useState<LocalAttached[]>([]);

  const [isPublishing, setIsPublishing] = useState(false);
  const { toast } = useToast();
  const [createNews, { isLoading: isCreating }] = useCreateNewsMutation();

  const allowedAttachmentTypes = useMemo(
    () =>
      new Set([
        "application/pdf",
        "image/jpeg",
        "image/png",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ]),
    []
  );
  const allowedBannerTypes = useMemo(
    () => new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]),
    []
  );

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
    if (!allowedBannerTypes.has(f.type)) {
      toast({
        title: "Invalid banner type",
        description: "Banner must be JPG, PNG, WEBP or AVIF.",
        variant: "destructive",
      });
      e.currentTarget.value = "";
      return;
    }
    if (f.size > MAX_BANNER_SIZE) {
      toast({
        title: "Banner too large",
        description: "Banner image must be under 5MB.",
        variant: "destructive",
      });
      e.currentTarget.value = "";
      return;
    }

    if (bannerPreviewUrl) URL.revokeObjectURL(bannerPreviewUrl);
    setBannerFile(f);
    setBannerPreviewUrl(URL.createObjectURL(f));
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

    const remainingSlots = MAX_FILES - attachedFiles.length;
    if (remainingSlots <= 0) {
      toast({
        title: "Attachment limit reached",
        description: `You can attach up to ${MAX_FILES} files.`,
        variant: "destructive",
      });
      e.currentTarget.value = "";
      return;
    }

    const fileList = Array.from(files).slice(0, remainingSlots);
    const accepted: LocalAttached[] = [];

    for (const f of fileList) {
      if (!allowedAttachmentTypes.has(f.type)) {
        toast({
          title: "Invalid file type",
          description: `${f.name} is not supported.`,
          variant: "destructive",
        });
        continue;
      }
      if (f.size > MAX_FILE_SIZE) {
        toast({
          title: "File too large",
          description: `${f.name} exceeds 10MB.`,
          variant: "destructive",
        });
        continue;
      }

      // simple de-dup by name+size
      const dup = attachedFiles.some(
        (af) => af.name === f.name && af.size === f.size
      );
      if (dup) continue;

      accepted.push({
        id: Math.random().toString(36).slice(2, 10),
        file: f,
        name: f.name,
        url: URL.createObjectURL(f),
        type: f.type,
        size: f.size,
      });
    }

    if (accepted.length === 0) {
      e.currentTarget.value = "";
      return;
    }

    setAttachedFiles((prev) => [...prev, ...accepted]);
    e.currentTarget.value = "";
  };

  const removeAttachedFile = (id: string) => {
    setAttachedFiles((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((f) => f.id !== id);
    });
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
    if (attachedFiles.length === 0) {
      toast({
        title: "Files required",
        description: "Please attach at least one report file.",
        variant: "destructive",
      });
      return;
    }

    setIsPublishing(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("summary", summary.trim());

      if (bannerFile) {
        formData.append("banner", bannerFile); // server stores & returns the banner URL/name
      }

      // IMPORTANT: append each file under the SAME key: "files"
      attachedFiles.forEach(({ file }) => {
        formData.append("files", file);
      });

      await createNews(formData).unwrap();

      toast({
        title: "News Published",
        description: "The news report was successfully created.",
      });

      onPublish?.({ title: title.trim(), summary: summary.trim() });

      // Reset
      setTitle("");
      setSummary("");
      attachedFiles.forEach((f) => URL.revokeObjectURL(f.url));
      setAttachedFiles([]);
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
          Add a title, summary, a banner image, and attach up to {MAX_FILES}{" "}
          files.
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

        {/* Banner Image */}
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

        {/* Files (multiple) */}
        <div className="space-y-2">
          <Label>File Attachments</Label>
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
                  PDF, JPG, PNG, DOCX up to 10MB each • {attachedFiles.length}/
                  {MAX_FILES} attached
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
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate max-w-[280px]">
                        {file.name}
                      </p>
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
