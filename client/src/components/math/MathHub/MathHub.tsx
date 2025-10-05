import React from 'react';
import { MathResources } from '../MathResources/MathResources';

interface MathHubProps {
  onNavigateToResources: () => void;
  onNavigateToTutors: () => void;
}

export const MathHub: React.FC<MathHubProps> = ({ onNavigateToResources, onNavigateToTutors }) => {
  return <MathResources onNavigateToTutors={onNavigateToTutors} />;
};