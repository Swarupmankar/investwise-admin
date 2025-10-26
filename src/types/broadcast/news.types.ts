// src/types/news/news.types.ts
export interface AttachedFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface NewsPost {
  id: number;
  title: string;
  summary: string;
  fileUrl?: string;
  banner?: string;
}

export interface AttachedFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface AllNewsPost {
  id: number;
  title: string;
  summary: string;
  fileUrl?: string | null;
  attachedFiles?: AttachedFile[];
  authorName?: string;
  notificationSent?: boolean;
  emailSent?: boolean;
  createdAt: string;
  publishedAt?: string;
  banner?: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  description: string;
  fileAttachedUrl?: string | null;
  type: "PROMOTION" | "SECURITY" | "MAINTENANCE" | string;
  createdAt: string;
  updatedAt?: string;
  recipientUserIds?: number[];
}

export type CombinedPost = {
  id: string;
  source: "NEWS" | "NOTIFICATION";
  title: string;
  summary?: string;
  fileUrl?: string | null;
  raw?: NewsPost | NotificationItem;
  createdAt?: string;
  banner?: string | null;
};

export type NotificationsResponse = NotificationItem[];
