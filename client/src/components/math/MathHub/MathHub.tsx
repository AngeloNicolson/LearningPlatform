import React from 'react';
import { MathPage } from '../../../pages/MathPage/MathPage';

interface MathHubProps {
  onNavigateToResources: () => void;
  onNavigateToTutors: () => void;
}

export const MathHub: React.FC<MathHubProps> = ({ onNavigateToResources, onNavigateToTutors }) => {
  return <MathPage />;
};