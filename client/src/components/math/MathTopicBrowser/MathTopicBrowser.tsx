/**
 * @file MathTopicBrowser.tsx
 * @author Angelo Nicolson
 * @brief Mathematics topic exploration interface
 * @description Allows browsing of mathematical topics organized by grade level and subject area. Provides topic cards with icons, descriptions, and resource counts.
 */

import React, { useState } from 'react';
import { MathRenderer } from '../MathRenderer/MathRenderer';
import { mathTemplates, MathTemplate, getAllMathCategories } from '../../../utils/mathTemplates';
import './MathTopicBrowser.css';

interface MathTopicBrowserProps {
  onTopicSelect: (template: MathTemplate) => void;
  className?: string;
}

export const MathTopicBrowser: React.FC<MathTopicBrowserProps> = ({ 
  onTopicSelect, 
  className = '' 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedComplexity, setSelectedComplexity] = useState<number>(0);
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);

  const categories = getAllMathCategories();
  const complexityLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const filteredTemplates = mathTemplates.filter(template => {
    const categoryMatch = selectedCategory === 'all' || template.category === selectedCategory;
    const complexityMatch = selectedComplexity === 0 || template.complexity_level === selectedComplexity;
    return categoryMatch && complexityMatch;
  });

  const getComplexityColor = (level: number): string => {
    if (level <= 3) return '#059669';
    if (level <= 6) return '#d97706';
    if (level <= 8) return '#dc2626';
    return '#7c2d12';
  };

  const getComplexityLabel = (level: number): string => {
    if (level <= 3) return 'Beginner';
    if (level <= 6) return 'Intermediate';
    if (level <= 8) return 'Advanced';
    return 'Expert';
  };

  return (
    <div className={`math-topic-browser ${className}`}>
      <div className="browser-header">
        <h2>Mathematical Debate Topics</h2>
        <p>Explore mathematical concepts through structured debate</p>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label htmlFor="category-filter">Category:</label>
          <select 
            id="category-filter"
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="complexity-filter">Complexity:</label>
          <select 
            id="complexity-filter"
            value={selectedComplexity} 
            onChange={(e) => setSelectedComplexity(Number(e.target.value))}
          >
            <option value={0}>All Levels</option>
            {complexityLevels.map(level => (
              <option key={level} value={level}>
                Level {level} - {getComplexityLabel(level)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="templates-grid">
        {filteredTemplates.length === 0 ? (
          <div className="no-templates">
            <p>No templates match your current filters.</p>
            <button 
              className="reset-filters-btn"
              onClick={() => {
                setSelectedCategory('all');
                setSelectedComplexity(0);
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredTemplates.map(template => (
            <div key={template.id} className="template-card">
              <div className="card-header">
                <h3 className="template-title">{template.title}</h3>
                <div className="template-badges">
                  <span className="category-badge">{template.category}</span>
                  <span 
                    className="complexity-badge"
                    style={{ backgroundColor: getComplexityColor(template.complexity_level) }}
                  >
                    Level {template.complexity_level}
                  </span>
                </div>
              </div>

              <p className="template-description">{template.description}</p>

              {template.template_content.key_equations && (
                <div className="key-equations">
                  <h4>Key Equations:</h4>
                  <div className="equations-preview">
                    {template.template_content.key_equations.slice(0, 2).map((equation, index) => (
                      <MathRenderer key={index} latex={equation} />
                    ))}
                    {template.template_content.key_equations.length > 2 && (
                      <span className="more-equations">
                        +{template.template_content.key_equations.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="card-actions">
                <button
                  className="expand-btn"
                  onClick={() => setExpandedTemplate(
                    expandedTemplate === template.id ? null : template.id
                  )}
                >
                  {expandedTemplate === template.id ? 'Show Less' : 'Preview'}
                </button>
                <button
                  className="select-btn"
                  onClick={() => onTopicSelect(template)}
                >
                  Start Debate
                </button>
              </div>

              {expandedTemplate === template.id && (
                <div className="expanded-content">
                  <div className="preview-section">
                    <h4>Overview Preview:</h4>
                    <div className="preview-text">
                      {template.template_content.overview.split('\n').slice(0, 6).join('\n')}
                      {template.template_content.overview.split('\n').length > 6 && '...'}
                    </div>
                  </div>

                  {template.template_content.key_equations && (
                    <div className="all-equations">
                      <h4>All Key Equations:</h4>
                      {template.template_content.key_equations.map((equation, index) => (
                        <MathRenderer key={index} latex={equation} />
                      ))}
                    </div>
                  )}

                  {template.template_content.references && (
                    <div className="references">
                      <h4>References:</h4>
                      <ul>
                        {template.template_content.references.map((ref, index) => (
                          <li key={index}>{ref}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="browser-footer">
        <div className="complexity-legend">
          <h4>Complexity Levels:</h4>
          <div className="legend-items">
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#059669' }}></span>
              <span>1-3: Beginner (Undergraduate)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#d97706' }}></span>
              <span>4-6: Intermediate (Advanced Undergraduate)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#dc2626' }}></span>
              <span>7-8: Advanced (Graduate)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#7c2d12' }}></span>
              <span>9-10: Expert (Research Level)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MathTopicBrowser;
