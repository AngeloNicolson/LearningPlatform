import React, { useState, useCallback } from 'react';
import { MathRenderer } from './MathRenderer';
import './EquationEditor.css';

interface EquationEditorProps {
  value: string;
  onChange: (latex: string) => void;
  placeholder?: string;
  className?: string;
}

const commonSymbols = [
  { symbol: '\\frac{a}{b}', label: 'Fraction' },
  { symbol: 'x^{n}', label: 'Superscript' },
  { symbol: 'x_{n}', label: 'Subscript' },
  { symbol: '\\sqrt{x}', label: 'Square Root' },
  { symbol: '\\int_{a}^{b}', label: 'Integral' },
  { symbol: '\\sum_{i=1}^{n}', label: 'Summation' },
  { symbol: '\\lim_{x \\to \\infty}', label: 'Limit' },
  { symbol: '\\alpha', label: 'Alpha' },
  { symbol: '\\beta', label: 'Beta' },
  { symbol: '\\gamma', label: 'Gamma' },
  { symbol: '\\delta', label: 'Delta' },
  { symbol: '\\theta', label: 'Theta' },
  { symbol: '\\lambda', label: 'Lambda' },
  { symbol: '\\mu', label: 'Mu' },
  { symbol: '\\pi', label: 'Pi' },
  { symbol: '\\sigma', label: 'Sigma' },
  { symbol: '\\leq', label: '≤' },
  { symbol: '\\geq', label: '≥' },
  { symbol: '\\neq', label: '≠' },
  { symbol: '\\approx', label: '≈' },
  { symbol: '\\infty', label: '∞' },
  { symbol: '\\pm', label: '±' },
  { symbol: '\\times', label: '×' },
  { symbol: '\\div', label: '÷' }
];

export const EquationEditor: React.FC<EquationEditorProps> = ({
  value,
  onChange,
  placeholder = 'Enter LaTeX equation...',
  className = ''
}) => {
  const [showSymbols, setShowSymbols] = useState(false);

  const insertSymbol = useCallback((symbol: string) => {
    const textarea = document.querySelector('.equation-input') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.substring(0, start) + symbol + value.substring(end);
      onChange(newValue);
      
      // Set cursor position after inserted symbol
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + symbol.length, start + symbol.length);
      }, 0);
    }
  }, [value, onChange]);

  return (
    <div className={`equation-editor ${className}`}>
      <div className="equation-editor-header">
        <h3>Equation Editor</h3>
        <button
          type="button"
          className="symbol-toggle"
          onClick={() => setShowSymbols(!showSymbols)}
        >
          {showSymbols ? 'Hide Symbols' : 'Show Symbols'}
        </button>
      </div>

      {showSymbols && (
        <div className="symbol-palette">
          <h4>Common Symbols</h4>
          <div className="symbol-grid">
            {commonSymbols.map((item, index) => (
              <button
                key={index}
                type="button"
                className="symbol-button"
                onClick={() => insertSymbol(item.symbol)}
                title={item.label}
              >
                <MathRenderer latex={item.symbol} inline={true} />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="equation-input-section">
        <label htmlFor="latex-input">LaTeX Input:</label>
        <textarea
          id="latex-input"
          className="equation-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
        />
      </div>

      <div className="equation-preview">
        <label>Preview:</label>
        <div className="preview-container">
          {value.trim() ? (
            <MathRenderer latex={value} />
          ) : (
            <div className="preview-placeholder">
              Enter LaTeX above to see preview
            </div>
          )}
        </div>
      </div>

      <div className="equation-help">
        <details>
          <summary>LaTeX Help</summary>
          <div className="help-content">
            <h4>Basic Syntax:</h4>
            <ul>
              <li><code>\frac{'{numerator}'}{'{denominator}'}</code> - Fractions</li>
              <li><code>x^{'{power}'}</code> - Superscripts</li>
              <li><code>x_{'{subscript}'}</code> - Subscripts</li>
              <li><code>\sqrt{'{expression}'}</code> - Square roots</li>
              <li><code>\int_{'{lower}'}^{'{upper}'}</code> - Integrals</li>
              <li><code>\sum_{'{i=1}'}^{'{n}'}</code> - Summations</li>
            </ul>
          </div>
        </details>
      </div>
    </div>
  );
};

export default EquationEditor;