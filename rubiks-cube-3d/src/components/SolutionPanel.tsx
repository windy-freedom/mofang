import React from 'react'
import { Solution, SolutionStep } from '../types/cube'
import './SolutionPanel.css'

interface SolutionPanelProps {
  solution?: Solution | null
  currentStep?: number
  isPlaying?: boolean
  onPlay?: () => void
  onPause?: () => void
  onNext?: () => void
  onPrevious?: () => void
  onReset?: () => void
  animationSpeed?: number
  onSpeedChange?: (speed: number) => void
}

const SolutionPanel: React.FC<SolutionPanelProps> = ({
  solution,
  currentStep = -1,
  isPlaying = false,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  onReset,
  animationSpeed = 1,
  onSpeedChange
}) => {
  if (!solution) {
    return (
      <div className="solution-panel">
        <h3>Solution</h3>
        <div className="no-solution">
          <p>Click "Solve Cube" to generate a solution</p>
        </div>
      </div>
    )
  }

  return (
    <div className="solution-panel">
      <h3>Solution ({solution.totalMoves} moves)</h3>
      
      <div className="solution-controls">
        <div className="playback-controls">
          <button 
            className="control-btn"
            onClick={onPrevious}
            disabled={currentStep <= 0}
          >
            ⏮
          </button>
          
          <button 
            className="control-btn play-pause"
            onClick={isPlaying ? onPause : onPlay}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          
          <button 
            className="control-btn"
            onClick={onNext}
            disabled={currentStep >= solution.steps.length - 1}
          >
            ⏭
          </button>
          
          <button 
            className="control-btn reset-btn"
            onClick={onReset}
          >
            ⏹
          </button>
        </div>
        
        <div className="speed-control">
          <label>Speed: {animationSpeed}x</label>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.5"
            value={animationSpeed}
            onChange={(e) => onSpeedChange?.(parseFloat(e.target.value))}
            className="speed-slider"
          />
        </div>
      </div>
      
      <div className="solution-steps">
        <div className="steps-header">
          <span>Step {currentStep + 1} of {solution.steps.length}</span>
        </div>
        
        <div className="steps-list">
          {solution.steps.map((step, index) => (
            <div 
              key={index}
              className={`solution-step ${index === currentStep ? 'current' : ''} ${index < currentStep ? 'completed' : ''}`}
            >
              <div className="step-number">{index + 1}</div>
              <div className="step-move">{step.move}</div>
              <div className="step-description">{step.description}</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="solution-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${((currentStep + 1) / solution.steps.length) * 100}%` }}
          />
        </div>
        <div className="progress-text">
          Progress: {Math.round(((currentStep + 1) / solution.steps.length) * 100)}%
        </div>
      </div>
    </div>
  )
}

export default SolutionPanel
