/**
 * @file ResourceSkeletonLoader.tsx
 * @author Angelo Nicolson
 * @brief Loading skeleton for resource cards
 * @description Provides animated loading skeleton matching resource card layout. Displays during data fetching to improve perceived performance and user experience.
 */

import React from 'react';
import './ResourceSkeletonLoader.css';

interface ResourceSkeletonLoaderProps {
  count?: number;
}

export const ResourceSkeletonLoader: React.FC<ResourceSkeletonLoaderProps> = ({ count = 4 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={`skeleton-${index}`} className="resource-card skeleton">
          <div className="skeleton-type"></div>
          <div className="skeleton-title"></div>
          <div className="skeleton-description"></div>
          <div className="skeleton-grade"></div>
          <div className="skeleton-button"></div>
        </div>
      ))}
    </>
  );
};
