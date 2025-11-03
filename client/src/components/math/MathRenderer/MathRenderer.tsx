/**
 * @file MathRenderer.tsx
 * @author Angelo Nicolson
 * @brief LaTeX mathematical notation renderer
 * @description Renders mathematical expressions using MathJax with LaTeX syntax support. Provides component for displaying formatted mathematical notation throughout the application.
 */

import React, { useEffect, useRef } from 'react';
import { renderMath } from '../../../utils/mathjax';

interface MathRendererProps {
  latex: string;
  inline?: boolean;
  className?: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ 
  latex, 
  inline = false, 
  className = '' 
}) => {
  const mathRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderEquation = async () => {
      if (mathRef.current && latex.trim()) {
        if (mathRef.current) {
          renderMath(mathRef.current);
        }
      }
    };

    renderEquation();
  }, [latex]);

  const formattedLatex = inline 
    ? `\\(${latex}\\)` 
    : `\\[${latex}\\]`;

  return (
    <div 
      ref={mathRef}
      className={`math-renderer ${inline ? 'inline' : 'display'} ${className}`}
      style={{
        display: inline ? 'inline-block' : 'block',
        textAlign: inline ? 'left' : 'center',
        margin: inline ? '0' : '1em 0'
      }}
    >
      {formattedLatex}
    </div>
  );
};

export default MathRenderer;
