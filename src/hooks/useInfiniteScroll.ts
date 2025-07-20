import { useEffect, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  threshold?: number; // Distance from bottom in pixels
}

export const useInfiniteScroll = ({
  hasMore,
  loading,
  onLoadMore,
  threshold = 300
}: UseInfiniteScrollOptions) => {
  const handleScroll = useCallback(() => {
    if (loading || !hasMore) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;

    // Check if user has scrolled near the bottom
    if (scrollTop + clientHeight >= scrollHeight - threshold) {
      onLoadMore();
    }
  }, [loading, hasMore, onLoadMore, threshold]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);
};