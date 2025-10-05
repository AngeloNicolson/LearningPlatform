import React from 'react';
import { SciencePage } from '../../../pages/SciencePage/SciencePage';

interface ScienceHubProps {
  onNavigateToResources: () => void;
  onNavigateToTutors: () => void;
}

export const ScienceHub: React.FC<ScienceHubProps> = ({ onNavigateToResources, onNavigateToTutors }) => {
  return <SciencePage />;
};