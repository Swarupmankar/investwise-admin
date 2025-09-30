export interface AttachedFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface NewsPost {
  id: string;
  title: string;
  summary: string;
  coverImageUrl?: string;
  attachedFiles: AttachedFile[];
  publishedAt: string;
  authorName: string;
  notificationSent: boolean;
  emailSent: boolean;
}

export interface NewsFilters {
  searchQuery: string;
  dateFrom?: Date;
  dateTo?: Date;
  hasFiles?: boolean;
}

export interface NewsStats {
  totalPosts: number;
  recentPosts: number;
  postsWithFiles: number;
}