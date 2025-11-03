/**
 * @file ScienceHub.tsx
 * @author Angelo Nicolson
 * @brief Science learning hub with resources and tutors
 * @description Main science section providing access to science resources, interactive simulations, and science tutors. Offers navigation to different science subjects and tutor discovery.
 */

import React from 'react';
import { SciencePage } from '../../../pages/SciencePage/SciencePage';

interface ScienceHubProps {
  onNavigateToResources: () => void;
  onNavigateToTutors: () => void;
}

export const ScienceHub: React.FC<ScienceHubProps> = ({ onNavigateToResources, onNavigateToTutors }) => {
  return <SciencePage />;
};
