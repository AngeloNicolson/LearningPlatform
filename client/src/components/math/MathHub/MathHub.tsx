/**
 * @file MathHub.tsx
 * @author Angelo Nicolson
 * @brief Mathematics learning hub
 * @description Main mathematics section providing access to math resources organized by grade level and topic. Offers navigation to math lessons, practice problems, and math tutors.
 */

import React from 'react';
import { MathPage } from '../../../pages/MathPage/MathPage';

interface MathHubProps {
  onNavigateToResources: () => void;
  onNavigateToTutors: () => void;
}

export const MathHub: React.FC<MathHubProps> = ({ onNavigateToResources, onNavigateToTutors }) => {
  return <MathPage />;
};
