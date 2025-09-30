// src/pages/news.tsx
import React, { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { NewsForm } from "@/components/news/NewsForm";
import { NewsFilters } from "@/components/news/NewsFilters";
import { NewsTable } from "@/components/news/NewsTable";
import { NewsDetailModal } from "@/components/news/NewsDetailModal";
import { CommonPushForm } from "@/components/news/CommonPushForm";
import {
  useGetAllNewsQuery,
  useGetAllNotificationsQuery,
} from "@/API/broadcast.api";
import {
  CombinedPost,
  NewsPost,
  NotificationItem,
} from "@/types/broadcast/news.types";
import type { NewsFilters as NewsFiltersType, NewsStats } from "@/types/news";
import { useToast } from "@/hooks/use-toast";

/**
 * Default filters shape (matches NewsFiltersType from '@/types/news')
 */
const defaultFilters: NewsFiltersType = {
  searchQuery: "",
  dateFrom: undefined,
  dateTo: undefined,
  hasFiles: undefined,
};

export default function News() {
  const {
    data: newsData = [],
    isLoading: newsLoading,
    isError: newsError,
    refetch: refetchNews,
  } = useGetAllNewsQuery();

  const {
    data: notificationsData = [],
    isLoading: notifsLoading,
    isError: notifsError,
    refetch: refetchNotifs,
  } = useGetAllNotificationsQuery();

  const { toast } = useToast();

  const [filters, setFilters] = useState<NewsFiltersType>(defaultFilters);

  // helper: test whether any filter is active
  const hasActiveFilters = useMemo(() => {
    return (
      (filters.searchQuery && filters.searchQuery.trim() !== "") ||
      Boolean(filters.dateFrom) ||
      Boolean(filters.dateTo) ||
      filters.hasFiles !== undefined
    );
  }, [filters]);

  // Build merged unfiltered list first (notifications + news), normalizing date fields
  const mergedUnfiltered: CombinedPost[] = useMemo(() => {
    const mappedNotifs: CombinedPost[] = (notificationsData || []).map(
      (m: NotificationItem) => ({
        id: `notif-${m.id}`,
        source: "NOTIFICATION",
        title: m.title,
        summary: m.description,
        fileUrl: m.fileAttachedUrl ?? null,
        raw: m,
        createdAt: m.createdAt ?? undefined,
      })
    );

    const mappedNews: CombinedPost[] = (newsData || []).map((n: NewsPost) => {
      // News items sometimes use createdAt or publishedAt; prefer createdAt then publishedAt as fallback
      const created =
        ((n as any).createdAt as string | undefined) ??
        ((n as any).publishedAt as string | undefined) ??
        undefined;

      return {
        id: `news-${n.id}`,
        source: "NEWS",
        title: n.title,
        summary: (n as any).summary ?? (n as any).excerpt ?? undefined,
        fileUrl: (n as any).fileUrl ?? null,
        raw: n,
        createdAt: created,
      };
    });

    // default ordering: notifications first then news (still keep overall sort by createdAt after merge)
    const merged = [...mappedNotifs, ...mappedNews];

    // sort by createdAt descending; items without dates will be ordered after dated items
    merged.sort((a, b) => {
      if (!a.createdAt && !b.createdAt) return 0;
      if (!a.createdAt) return 1;
      if (!b.createdAt) return -1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return merged;
  }, [newsData, notificationsData]);

  // Apply filters only when user actually set filters (prevents accidental hiding)
  const combined: CombinedPost[] = useMemo(() => {
    if (!hasActiveFilters) return mergedUnfiltered;

    return mergedUnfiltered.filter((item) => {
      // SEARCH
      if (filters.searchQuery && filters.searchQuery.trim() !== "") {
        const q = filters.searchQuery.toLowerCase();
        const title = (item.title ?? "").toLowerCase();
        const summary = (item.summary ?? "").toLowerCase();
        if (!title.includes(q) && !summary.includes(q)) return false;
      }

      // DATE RANGE (only apply if date filters provided)
      if (filters.dateFrom || filters.dateTo) {
        if (!item.createdAt) return false; // items without createdAt are excluded when date filters used
        const created = new Date(item.createdAt);
        if (filters.dateFrom && created < filters.dateFrom) return false;
        if (filters.dateTo && created > filters.dateTo) return false;
      }

      // FILES filter — check common fields + notification-specific field
      if (filters.hasFiles !== undefined) {
        const hasFile =
          Boolean(item.fileUrl) ||
          Boolean((item as any).fileAttachedUrl) ||
          (Array.isArray((item as any).attachedFiles) &&
            (item as any).attachedFiles.length > 0) ||
          Boolean((item.raw as any)?.fileAttachedUrl);
        if (filters.hasFiles !== hasFile) return false;
      }

      return true;
    });
  }, [mergedUnfiltered, hasActiveFilters, filters]);

  // Stats are computed from mergedUnfiltered (overall totals)
  const stats: NewsStats = useMemo(() => {
    const totalPosts = mergedUnfiltered.length;
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentPosts = mergedUnfiltered.filter((p) => {
      if (!p.createdAt) return false;
      return new Date(p.createdAt).getTime() >= sevenDaysAgo;
    }).length;
    const postsWithFiles = mergedUnfiltered.filter((p) => {
      const hasFile =
        Boolean(p.fileUrl) ||
        Boolean((p as any).fileAttachedUrl) ||
        (Array.isArray((p as any).attachedFiles) &&
          (p as any).attachedFiles.length > 0);
      return hasFile;
    }).length;

    return { totalPosts, recentPosts, postsWithFiles };
  }, [mergedUnfiltered]);

  const isLoading = newsLoading || notifsLoading;
  const isError = newsError && notifsError;

  const [selectedPost, setSelectedPost] = useState<CombinedPost | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleView = (post: CombinedPost) => {
    setSelectedPost(post);
    setIsDetailModalOpen(true);
  };

  // filters handlers
  const onFiltersChange = (partial: Partial<NewsFiltersType>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  const onClearFilters = () => {
    setFilters(defaultFilters);
  };

  // small debug — remove after verifying
  console.log("debug: counts", {
    newsCount: (newsData || []).length,
    notifCount: (notificationsData || []).length,
    mergedUnfiltered: mergedUnfiltered.length,
    combinedFiltered: combined.length,
    hasActiveFilters,
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            News & Broadcasts
          </h1>
          <p className="text-muted-foreground">
            Create and manage platform-wide announcements for your users
          </p>
        </div>

        <NewsForm />
        <CommonPushForm />

        <NewsFilters
          filters={filters}
          stats={stats}
          onFiltersChange={onFiltersChange}
          onClearFilters={onClearFilters}
        />

        <div>
          {isLoading ? (
            <div className="p-4 text-sm text-muted-foreground">
              Loading news…
            </div>
          ) : isError ? (
            <div className="p-4 text-sm text-destructive">
              Failed to load news.{" "}
              <button
                onClick={() => {
                  refetchNews();
                  refetchNotifs();
                }}
                className="underline ml-2"
              >
                Retry
              </button>
            </div>
          ) : combined.length === 0 ? (
            <div className="p-6">
              {hasActiveFilters ? (
                <div className="text-muted-foreground">
                  No posts match your filters. Try clearing filters.
                </div>
              ) : (
                <div className="text-muted-foreground">No posts available.</div>
              )}
            </div>
          ) : (
            <NewsTable
              newsData={combined}
              onView={handleView}
              onEdit={() =>
                toast({
                  title: "Edit",
                  description: "Open a post to edit it.",
                })
              }
              onDelete={(id) =>
                toast({
                  title: "Delete",
                  description: "Open a post and use delete there.",
                })
              }
            />
          )}
        </div>

        <NewsDetailModal
          post={selectedPost}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
        />
      </div>
    </DashboardLayout>
  );
}
