import React from 'react';
import { ScienceResources } from '../ScienceResources/ScienceResources';

interface ScienceHubProps {
  onNavigateToResources: () => void;
  onNavigateToTutors: () => void;
}

export const ScienceHub: React.FC<ScienceHubProps> = ({ onNavigateToResources, onNavigateToTutors }) => {
  return <ScienceResources />;
};