import { useState, useCallback, useMemo } from 'react';
import { NewsPost, NewsFilters, NewsStats, AttachedFile } from '@/types/news';

// Mock news data
const mockNewsData: NewsPost[] = [
  {
    id: '1',
    title: 'July Returns Distributed',
    summary: "This month's returns have been distributed to all eligible investors. Please check your wallet balance and contact support if you have any questions.",
    coverImageUrl: 'https://images.unsplash.com/photo-1554224154-22dec7ec8818?w=1200&auto=format&fit=crop&q=60',
    attachedFiles: [
      {
        id: 'f1',
        name: 'July_Returns_Report.pdf',
        url: '/files/july-returns.pdf',
        type: 'application/pdf',
        size: 1024000
      }
    ],
    publishedAt: '2024-01-15T10:30:00Z',
    authorName: 'Sarah Johnson',
    notificationSent: true,
    emailSent: true
  },
  {
    id: '2',
    title: 'New KYC Guidelines',
    summary: 'We have updated our KYC (Know Your Customer) guidelines to comply with the latest regulatory requirements. All users must complete the updated verification process.',
    coverImageUrl: 'https://images.unsplash.com/photo-1495578942200-c5f5d2137a9b?w=1200&auto=format&fit=crop&q=60',
    attachedFiles: [
      {
        id: 'f2',
        name: 'KYC_Guidelines_2024.pdf',
        url: '/files/kyc-guidelines.pdf',
        type: 'application/pdf',
        size: 512000
      },
      {
        id: 'f3',
        name: 'Verification_Checklist.docx',
        url: '/files/verification-checklist.docx',
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: 256000
      }
    ],
    publishedAt: '2024-01-10T14:15:00Z',
    authorName: 'Michael Chen',
    notificationSent: true,
    emailSent: false
  },
  {
    id: '3',
    title: 'Platform Maintenance Schedule',
    summary: 'We will be performing scheduled maintenance on our platform this weekend. Expected downtime is 2-4 hours on Sunday between 2:00 AM - 6:00 AM UTC.',
    coverImageUrl: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=1200&auto=format&fit=crop&q=60',
    attachedFiles: [],
    publishedAt: '2024-01-08T09:00:00Z',
    authorName: 'Technical Team',
    notificationSent: true,
    emailSent: true
  }
];

export const useNewsData = () => {
  const [newsData, setNewsData] = useState<NewsPost[]>(mockNewsData);
  const [filters, setFilters] = useState<NewsFilters>({
    searchQuery: '',
    dateFrom: undefined,
    dateTo: undefined,
    hasFiles: undefined
  });

  const filteredNews = useMemo(() => {
    return newsData.filter(post => {
      // Search query filter
      if (filters.searchQuery && !post.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) && 
          !post.summary.toLowerCase().includes(filters.searchQuery.toLowerCase())) {
        return false;
      }

      // Date range filter
      if (filters.dateFrom && new Date(post.publishedAt) < filters.dateFrom) {
        return false;
      }
      if (filters.dateTo && new Date(post.publishedAt) > filters.dateTo) {
        return false;
      }

      // Files filter
      if (filters.hasFiles !== undefined) {
        const hasFiles = post.attachedFiles.length > 0;
        if (filters.hasFiles && !hasFiles) return false;
        if (!filters.hasFiles && hasFiles) return false;
      }

      return true;
    });
  }, [newsData, filters]);

  const stats: NewsStats = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return {
      totalPosts: newsData.length,
      recentPosts: newsData.filter(post => new Date(post.publishedAt) >= sevenDaysAgo).length,
      postsWithFiles: newsData.filter(post => post.attachedFiles.length > 0).length
    };
  }, [newsData]);

  const publishPost = useCallback((newPost: Omit<NewsPost, 'id' | 'publishedAt'>) => {
    const post: NewsPost = {
      ...newPost,
      id: Math.random().toString(36).substr(2, 9),
      publishedAt: new Date().toISOString()
    };
    
    setNewsData(prev => [post, ...prev]);
    return post;
  }, []);

  const editPost = useCallback((id: string, updates: Partial<NewsPost>) => {
    setNewsData(prev => 
      prev.map(post => 
        post.id === id ? { ...post, ...updates } : post
      )
    );
  }, []);

  const deletePost = useCallback((id: string) => {
    setNewsData(prev => prev.filter(post => post.id !== id));
  }, []);

  const updateFilters = useCallback((newFilters: Partial<NewsFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      searchQuery: '',
      dateFrom: undefined,
      dateTo: undefined,
      hasFiles: undefined
    });
  }, []);

  return {
    newsData: filteredNews,
    allNewsData: newsData,
    filters,
    stats,
    publishPost,
    editPost,
    deletePost,
    updateFilters,
    clearFilters
  };
};