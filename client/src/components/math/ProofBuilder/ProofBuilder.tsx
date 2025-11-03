/**
 * @file ProofBuilder.tsx
 * @author Angelo Nicolson
 * @brief Interactive mathematical proof construction tool
 * @description Provides interface for building mathematical proofs step-by-step with validation, logical structure guidance, and support for various proof techniques.
 */

import React, { useState, useCallback } from 'react';
import { MathRenderer } from '../MathRenderer/MathRenderer';
import { EquationEditor } from '../EquationEditor/EquationEditor';
import './ProofBuilder.css';

interface ProofStep {
  id: string;
  statement: string;
  justification: string;
  equations: string[];
  stepType: 'given' | 'assumption' | 'deduction' | 'conclusion';
}

interface ProofBuilderProps {
  proof: ProofStep[];
  onChange: (proof: ProofStep[]) => void;
  theorem?: string;
  className?: string;
}

const stepTypes = [
  { value: 'given', label: 'Given', color: '#3b82f6' },
  { value: 'assumption', label: 'Assumption', color: '#8b5cf6' },
  { value: 'deduction', label: 'Deduction', color: '#059669' },
  { value: 'conclusion', label: 'Conclusion', color: '#dc2626' }
] as const;

export const ProofBuilder: React.FC<ProofBuilderProps> = ({
  proof,
  onChange,
  theorem,
  className = ''
}) => {
  const [editingStep, setEditingStep] = useState<string | null>(null);
  const [showEquationEditor, setShowEquationEditor] = useState<string | null>(null);
  const [tempEquation, setTempEquation] = useState('');

  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

  const addStep = useCallback(() => {
    const newStep: ProofStep = {
      id: generateId(),
      statement: '',
      justification: '',
      equations: [],
      stepType: 'deduction'
    };
    onChange([...proof, newStep]);
    setEditingStep(newStep.id);
  }, [proof, onChange]);

  const updateStep = useCallback((stepId: string, updates: Partial<ProofStep>) => {
    const updatedProof = proof.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    );
    onChange(updatedProof);
  }, [proof, onChange]);

  const deleteStep = useCallback((stepId: string) => {
    const updatedProof = proof.filter(step => step.id !== stepId);
    onChange(updatedProof);
    setEditingStep(null);
  }, [proof, onChange]);

  const moveStep = useCallback((stepId: string, direction: 'up' | 'down') => {
    const currentIndex = proof.findIndex(step => step.id === stepId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= proof.length) return;

    const newProof = [...proof];
    [newProof[currentIndex], newProof[newIndex]] = [newProof[newIndex], newProof[currentIndex]];
    onChange(newProof);
  }, [proof, onChange]);

  const addEquationToStep = useCallback((stepId: string) => {
    if (tempEquation.trim()) {
      const step = proof.find(s => s.id === stepId);
      if (step) {
        updateStep(stepId, {
          equations: [...step.equations, tempEquation.trim()]
        });
        setTempEquation('');
        setShowEquationEditor(null);
      }
    }
  }, [proof, tempEquation, updateStep]);

  const removeEquation = useCallback((stepId: string, equationIndex: number) => {
    const step = proof.find(s => s.id === stepId);
    if (step) {
      const newEquations = step.equations.filter((_, index) => index !== equationIndex);
      updateStep(stepId, { equations: newEquations });
    }
  }, [proof, updateStep]);

  const getStepTypeInfo = (type: ProofStep['stepType']) => {
    return stepTypes.find(st => st.value === type) || stepTypes[2];
  };

  return (
    <div className={`proof-builder ${className}`}>
      <div className="proof-header">
        <h3>Mathematical Proof Builder</h3>
        {theorem && (
          <div className="theorem-statement">
            <strong>Theorem:</strong> {theorem}
          </div>
        )}
      </div>

      <div className="proof-steps">
        {proof.length === 0 ? (
          <div className="empty-proof">
            <p>No proof steps yet. Click "Add Step" to begin your proof.</p>
          </div>
        ) : (
          proof.map((step, index) => {
            const stepTypeInfo = getStepTypeInfo(step.stepType);
            const isEditing = editingStep === step.id;

            return (
              <div key={step.id} className={`proof-step ${step.stepType}`}>
                <div className="step-header">
                  <div className="step-number">
                    <span className="step-index">{index + 1}</span>
                    <span 
                      className="step-type-badge"
                      style={{ backgroundColor: stepTypeInfo.color }}
                    >
                      {stepTypeInfo.label}
                    </span>
                  </div>
                  
                  <div className="step-controls">
                    <button
                      className="control-btn move-btn"
                      onClick={() => moveStep(step.id, 'up')}
                      disabled={index === 0}
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      className="control-btn move-btn"
                      onClick={() => moveStep(step.id, 'down')}
                      disabled={index === proof.length - 1}
                      title="Move down"
                    >
                      ↓
                    </button>
                    <button
                      className="control-btn edit-btn"
                      onClick={() => setEditingStep(isEditing ? null : step.id)}
                    >
                      {isEditing ? '✓' : '✏️'}
                    </button>
                    <button
                      className="control-btn delete-btn"
                      onClick={() => deleteStep(step.id)}
                      title="Delete step"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="step-content">
                  {isEditing ? (
                    <div className="step-editor">
                      <div className="editor-field">
                        <label>Step Type:</label>
                        <select
                          value={step.stepType}
                          onChange={(e) => updateStep(step.id, { 
                            stepType: e.target.value as ProofStep['stepType'] 
                          })}
                        >
                          {stepTypes.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="editor-field">
                        <label>Statement:</label>
                        <textarea
                          value={step.statement}
                          onChange={(e) => updateStep(step.id, { statement: e.target.value })}
                          placeholder="Enter the mathematical statement..."
                          rows={3}
                        />
                      </div>

                      <div className="editor-field">
                        <label>Justification:</label>
                        <textarea
                          value={step.justification}
                          onChange={(e) => updateStep(step.id, { justification: e.target.value })}
                          placeholder="Explain why this step follows..."
                          rows={2}
                        />
                      </div>

                      <div className="equations-section">
                        <div className="equations-header">
                          <label>Equations:</label>
                          <button
                            className="control-btn add-equation-btn"
                            onClick={() => setShowEquationEditor(
                              showEquationEditor === step.id ? null : step.id
                            )}
                          >
                            + Add Equation
                          </button>
                        </div>

                        {step.equations.map((equation, eqIndex) => (
                          <div key={eqIndex} className="equation-item">
                            <MathRenderer latex={equation} />
                            <button
                              className="control-btn delete-btn small"
                              onClick={() => removeEquation(step.id, eqIndex)}
                            >
                              ×
                            </button>
                          </div>
                        ))}

                        {showEquationEditor === step.id && (
                          <div className="equation-editor-inline">
                            <EquationEditor
                              value={tempEquation}
                              onChange={setTempEquation}
                              placeholder="Enter equation for this step..."
                            />
                            <div className="equation-controls">
                              <button
                                className="control-btn"
                                onClick={() => addEquationToStep(step.id)}
                                disabled={!tempEquation.trim()}
                              >
                                Add
                              </button>
                              <button
                                className="control-btn cancel-btn"
                                onClick={() => {
                                  setShowEquationEditor(null);
                                  setTempEquation('');
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="step-display">
                      {step.statement && (
                        <div className="statement">
                          <strong>Statement:</strong> {step.statement}
                        </div>
                      )}
                      
                      {step.equations.length > 0 && (
                        <div className="equations">
                          {step.equations.map((equation, eqIndex) => (
                            <MathRenderer key={eqIndex} latex={equation} />
                          ))}
                        </div>
                      )}
                      
                      {step.justification && (
                        <div className="justification">
                          <strong>Justification:</strong> {step.justification}
                        </div>
                      )}
                      
                      {!step.statement && !step.justification && step.equations.length === 0 && (
                        <div className="empty-step">
                          <em>Click edit to add content to this step</em>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="proof-footer">
        <button className="control-btn add-step-btn" onClick={addStep}>
          + Add Step
        </button>
      </div>

      <div className="proof-help">
        <details>
          <summary>Proof Building Help</summary>
          <div className="help-content">
            <h4>Step Types:</h4>
            <ul>
              <li><strong>Given:</strong> Facts provided in the problem</li>
              <li><strong>Assumption:</strong> Temporary assumptions (for contradiction, etc.)</li>
              <li><strong>Deduction:</strong> Logical conclusions from previous steps</li>
              <li><strong>Conclusion:</strong> The final result you're proving</li>
            </ul>
            <h4>Tips:</h4>
            <ul>
              <li>Be clear and precise in your statements</li>
              <li>Always justify each step</li>
              <li>Use equations to support your reasoning</li>
              <li>Keep steps atomic and logical</li>
            </ul>
          </div>
        </details>
      </div>
    </div>
  );
};

export default ProofBuilder;
