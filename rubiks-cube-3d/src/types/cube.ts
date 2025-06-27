// Rubik's Cube Types

export type FaceColor = 'white' | 'red' | 'blue' | 'orange' | 'green' | 'yellow'

export type Face = 'U' | 'D' | 'L' | 'R' | 'F' | 'B' // Up, Down, Left, Right, Front, Back

export type Move = 'U' | "U'" | 'D' | "D'" | 'L' | "L'" | 'R' | "R'" | 'F' | "F'" | 'B' | "B'"

export interface CubeState {
  // Each face is represented as a 3x3 array of colors
  U: FaceColor[][] // Up (white)
  D: FaceColor[][] // Down (yellow)
  L: FaceColor[][] // Left (orange)
  R: FaceColor[][] // Right (red)
  F: FaceColor[][] // Front (green)
  B: FaceColor[][] // Back (blue)
}

export interface CubePiece {
  position: [number, number, number]
  rotation: [number, number, number]
  colors: FaceColor[]
  type: 'corner' | 'edge' | 'center'
}

export interface SolutionStep {
  move: Move
  description: string
}

export interface Solution {
  steps: SolutionStep[]
  totalMoves: number
  isValid: boolean
}

export interface AnimationState {
  isAnimating: boolean
  currentMove: Move | null
  progress: number
}

export interface CubeSettings {
  animationSpeed: number
  showMoveNotation: boolean
  enableKeyboardControls: boolean
}
