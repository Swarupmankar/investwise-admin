import React from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Edit, Trash2, FileText } from "lucide-react";
import { CombinedPost } from "@/types/broadcast/news.types";

interface NewsTableProps {
  newsData: CombinedPost[];
  onView: (post: CombinedPost) => void;
  onEdit?: (post: CombinedPost) => void;
  onDelete?: (postId: number | string) => void;
}

export function NewsTable({
  newsData,
  onView,
  onEdit,
  onDelete,
}: NewsTableProps) {
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  if (!newsData || newsData.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No posts found</h3>
          <p className="text-muted-foreground text-center">
            No news posts match your current filters. Try adjusting your search
            criteria.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>📚 Post History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Files</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {newsData.map((post) => {
                const attachedCount = Array.isArray((post as any).attachedFiles)
                  ? (post as any).attachedFiles.length
                  : post.fileUrl
                  ? 1
                  : 0;

                // === derive type robustly ===
                const explicitType = (post as any).type as
                  | "NEWS"
                  | "NOTIFICATION"
                  | undefined;
                const source = post.source as string | undefined;

                const rowType =
                  explicitType ??
                  (source
                    ? source.toLowerCase() === "notification" ||
                      source.toLowerCase().includes("notif")
                      ? "NOTIFICATION"
                      : "NEWS"
                    : attachedCount > 0
                    ? "NEWS"
                    : "NEWS");

                return (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div className="flex items-start gap-3">
                        {"coverImageUrl" in (post as any) &&
                        (post as any).coverImageUrl ? (
                          <img
                            src={(post as any).coverImageUrl}
                            alt={`${post.title} cover image`}
                            className="h-10 w-10 rounded object-cover border"
                            loading="lazy"
                          />
                        ) : null}
                        <div className="space-y-1">
                          <p className="font-medium">{post.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {post.summary}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={rowType === "NEWS" ? "default" : "secondary"}
                      >
                        {rowType}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm">
                        {post.createdAt ? formatDate(post.createdAt) : "—"}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline">
                        {(post as any).authorName ?? "Admin"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      {attachedCount > 0 ? (
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1 w-fit"
                        >
                          <FileText className="h-3 w-3" />
                          {attachedCount} file{attachedCount > 1 ? "s" : ""}
                        </Badge>
                      ) : post.fileUrl ? (
                        <a
                          href={post.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm underline"
                        >
                          View file
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          None
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onView(post)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
