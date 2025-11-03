/**
 * @file CassetteButton.tsx
 * @author Angelo Nicolson
 * @brief Retro cassette tape-styled button
 * @description Themed button component with retro cassette tape aesthetics matching the overall retro terminal design of the application.
 */

import React from 'react';
import './CassetteButton.css';

interface CassetteButtonProps {
  icon: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export const CassetteButton: React.FC<CassetteButtonProps> = ({ icon, label, isActive, onClick }) => {
  return (
    <div
      className={`cassette-button ${isActive ? 'cassette-button-active' : ''}`}
      onClick={onClick}
    >
      <span className="cassette-button-icon">{icon}</span>
      <span className="cassette-button-label">{label}</span>
    </div>
  );
};
