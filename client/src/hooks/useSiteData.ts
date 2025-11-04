/**
 * @file useSiteData.ts
 * @author Angelo Nicolson
 * @brief Custom hook for fetching site-wide statistics
 * @description React hook that fetches and caches aggregate site statistics including resource counts,
 * tutor counts, download counts, and user counts from the backend API.
 */

import { useState, useEffect } from 'react';

interface SiteData {
  totalResources: number;
  totalTutors: number;
  totalDownloads: number;
  totalUsers: number;
}

export function useSiteData() {
  const [siteData, setSiteData] = useState<SiteData>({
    totalResources: 0,
    totalTutors: 0,
    totalDownloads: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSiteData() {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://localhost:3777/api'}/site-data`, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch site data');
        }

        const result = await response.json();
        if (result.success && result.data) {
          setSiteData(result.data);
        }
      } catch (err) {
        console.error('Error fetching site data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load statistics');
      } finally {
        setLoading(false);
      }
    }

    fetchSiteData();
  }, []);

  return { siteData, loading, error };
}
