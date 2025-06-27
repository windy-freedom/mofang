import React from 'react'
import { Move } from '../types/cube'
import './Controls.css'

interface ControlsProps {
  onSolve?: () => void
  onScramble?: () => void
  onReset?: () => void
  onMove?: (move: Move) => void
  isLoading?: boolean
}

const Controls: React.FC<ControlsProps> = ({
  onSolve,
  onScramble,
  onReset,
  onMove,
  isLoading = false
}) => {

  const handleMoveClick = (move: Move) => {
    if (onMove && !isLoading) {
      onMove(move)
    }
  }
  return (
    <div className="controls">
      <h3>Controls</h3>
      
      <div className="control-section">
        <h4>Cube Actions</h4>
        <div className="button-group">
          <button 
            className="control-button solve-button"
            onClick={onSolve}
            disabled={isLoading}
          >
            {isLoading ? 'Solving...' : 'Solve Cube'}
          </button>
          
          <button 
            className="control-button scramble-button"
            onClick={onScramble}
            disabled={isLoading}
          >
            Scramble
          </button>
          
          <button 
            className="control-button reset-button"
            onClick={onReset}
            disabled={isLoading}
          >
            Reset
          </button>
        </div>
      </div>
      
      <div className="control-section">
        <h4>Manual Moves</h4>
        <div className="move-grid">
          <button className="move-button" onClick={() => handleMoveClick('U')} disabled={isLoading}>U</button>
          <button className="move-button" onClick={() => handleMoveClick("U'")} disabled={isLoading}>U'</button>
          <button className="move-button" onClick={() => handleMoveClick('D')} disabled={isLoading}>D</button>
          <button className="move-button" onClick={() => handleMoveClick("D'")} disabled={isLoading}>D'</button>
          <button className="move-button" onClick={() => handleMoveClick('L')} disabled={isLoading}>L</button>
          <button className="move-button" onClick={() => handleMoveClick("L'")} disabled={isLoading}>L'</button>
          <button className="move-button" onClick={() => handleMoveClick('R')} disabled={isLoading}>R</button>
          <button className="move-button" onClick={() => handleMoveClick("R'")} disabled={isLoading}>R'</button>
          <button className="move-button" onClick={() => handleMoveClick('F')} disabled={isLoading}>F</button>
          <button className="move-button" onClick={() => handleMoveClick("F'")} disabled={isLoading}>F'</button>
          <button className="move-button" onClick={() => handleMoveClick('B')} disabled={isLoading}>B</button>
          <button className="move-button" onClick={() => handleMoveClick("B'")} disabled={isLoading}>B'</button>
        </div>
      </div>
      
      <div className="control-section">
        <h4>Keyboard Controls</h4>
        <div className="keyboard-help">
          <p><strong>U/u</strong> - Up face clockwise/counter-clockwise</p>
          <p><strong>D/d</strong> - Down face clockwise/counter-clockwise</p>
          <p><strong>L/l</strong> - Left face clockwise/counter-clockwise</p>
          <p><strong>R/r</strong> - Right face clockwise/counter-clockwise</p>
          <p><strong>F/f</strong> - Front face clockwise/counter-clockwise</p>
          <p><strong>B/b</strong> - Back face clockwise/counter-clockwise</p>
        </div>
      </div>
    </div>
  )
}

export default Controls
