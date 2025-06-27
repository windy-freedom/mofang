import { useState, useCallback } from 'react'
import { CubeState, Move, FaceColor } from '../types/cube'

// Create initial solved cube state
const createSolvedCube = (): CubeState => ({
  U: [
    ['white', 'white', 'white'],
    ['white', 'white', 'white'],
    ['white', 'white', 'white']
  ],
  D: [
    ['yellow', 'yellow', 'yellow'],
    ['yellow', 'yellow', 'yellow'],
    ['yellow', 'yellow', 'yellow']
  ],
  L: [
    ['orange', 'orange', 'orange'],
    ['orange', 'orange', 'orange'],
    ['orange', 'orange', 'orange']
  ],
  R: [
    ['red', 'red', 'red'],
    ['red', 'red', 'red'],
    ['red', 'red', 'red']
  ],
  F: [
    ['green', 'green', 'green'],
    ['green', 'green', 'green'],
    ['green', 'green', 'green']
  ],
  B: [
    ['blue', 'blue', 'blue'],
    ['blue', 'blue', 'blue'],
    ['blue', 'blue', 'blue']
  ]
})

export const useCubeState = () => {
  const [cubeState, setCubeState] = useState<CubeState>(createSolvedCube())
  const [isAnimating, setIsAnimating] = useState(false)

  // Reset cube to solved state
  const resetCube = useCallback(() => {
    setCubeState(createSolvedCube())
  }, [])

  // Scramble the cube with random moves
  const scrambleCube = useCallback(() => {
    const moves: Move[] = ['U', "U'", 'D', "D'", 'L', "L'", 'R', "R'", 'F', "F'", 'B', "B'"]
    const scrambleMoves: Move[] = []
    
    // Generate 20 random moves
    for (let i = 0; i < 20; i++) {
      const randomMove = moves[Math.floor(Math.random() * moves.length)]
      scrambleMoves.push(randomMove)
    }
    
    // Apply scramble moves
    let newState = { ...cubeState }
    scrambleMoves.forEach(move => {
      newState = applyMove(newState, move)
    })
    
    setCubeState(newState)
  }, [cubeState])

  // Apply a single move to the cube
  const makeMove = useCallback((move: Move) => {
    if (isAnimating) return
    
    setIsAnimating(true)
    const newState = applyMove(cubeState, move)
    setCubeState(newState)
    
    // Reset animation state after a short delay
    setTimeout(() => setIsAnimating(false), 300)
  }, [cubeState, isAnimating])

  return {
    cubeState,
    isAnimating,
    resetCube,
    scrambleCube,
    makeMove,
    setCubeState
  }
}

// Helper function to apply a move to the cube state
function applyMove(state: CubeState, move: Move): CubeState {
  const newState = JSON.parse(JSON.stringify(state)) as CubeState
  
  switch (move) {
    case 'U':
      return rotateU(newState, false)
    case "U'":
      return rotateU(newState, true)
    case 'D':
      return rotateD(newState, false)
    case "D'":
      return rotateD(newState, true)
    case 'L':
      return rotateL(newState, false)
    case "L'":
      return rotateL(newState, true)
    case 'R':
      return rotateR(newState, false)
    case "R'":
      return rotateR(newState, true)
    case 'F':
      return rotateF(newState, false)
    case "F'":
      return rotateF(newState, true)
    case 'B':
      return rotateB(newState, false)
    case "B'":
      return rotateB(newState, true)
    default:
      return newState
  }
}

// Rotate a 3x3 face clockwise or counterclockwise
function rotateFace(face: FaceColor[][], counterclockwise: boolean = false): FaceColor[][] {
  const newFace: FaceColor[][] = [['white', 'white', 'white'], ['white', 'white', 'white'], ['white', 'white', 'white']]
  
  if (counterclockwise) {
    // Counterclockwise rotation
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        newFace[2 - j][i] = face[i][j]
      }
    }
  } else {
    // Clockwise rotation
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        newFace[j][2 - i] = face[i][j]
      }
    }
  }
  
  return newFace
}

// Individual face rotation functions
function rotateU(state: CubeState, counterclockwise: boolean): CubeState {
  state.U = rotateFace(state.U, counterclockwise)
  
  // Rotate adjacent edges
  const temp = [...state.F[0]]
  if (counterclockwise) {
    state.F[0] = [...state.R[0]]
    state.R[0] = [...state.B[0]]
    state.B[0] = [...state.L[0]]
    state.L[0] = temp
  } else {
    state.F[0] = [...state.L[0]]
    state.L[0] = [...state.B[0]]
    state.B[0] = [...state.R[0]]
    state.R[0] = temp
  }
  
  return state
}

function rotateD(state: CubeState, counterclockwise: boolean): CubeState {
  state.D = rotateFace(state.D, counterclockwise)
  
  const temp = [...state.F[2]]
  if (counterclockwise) {
    state.F[2] = [...state.L[2]]
    state.L[2] = [...state.B[2]]
    state.B[2] = [...state.R[2]]
    state.R[2] = temp
  } else {
    state.F[2] = [...state.R[2]]
    state.R[2] = [...state.B[2]]
    state.B[2] = [...state.L[2]]
    state.L[2] = temp
  }
  
  return state
}

function rotateL(state: CubeState, counterclockwise: boolean): CubeState {
  state.L = rotateFace(state.L, counterclockwise)
  
  const temp = [state.U[0][0], state.U[1][0], state.U[2][0]]
  if (counterclockwise) {
    state.U[0][0] = state.B[2][2]
    state.U[1][0] = state.B[1][2]
    state.U[2][0] = state.B[0][2]
    state.B[0][2] = state.D[2][0]
    state.B[1][2] = state.D[1][0]
    state.B[2][2] = state.D[0][0]
    state.D[0][0] = state.F[0][0]
    state.D[1][0] = state.F[1][0]
    state.D[2][0] = state.F[2][0]
    state.F[0][0] = temp[0]
    state.F[1][0] = temp[1]
    state.F[2][0] = temp[2]
  } else {
    state.U[0][0] = state.F[0][0]
    state.U[1][0] = state.F[1][0]
    state.U[2][0] = state.F[2][0]
    state.F[0][0] = state.D[0][0]
    state.F[1][0] = state.D[1][0]
    state.F[2][0] = state.D[2][0]
    state.D[0][0] = state.B[2][2]
    state.D[1][0] = state.B[1][2]
    state.D[2][0] = state.B[0][2]
    state.B[0][2] = temp[2]
    state.B[1][2] = temp[1]
    state.B[2][2] = temp[0]
  }
  
  return state
}

function rotateR(state: CubeState, counterclockwise: boolean): CubeState {
  state.R = rotateFace(state.R, counterclockwise)
  
  const temp = [state.U[0][2], state.U[1][2], state.U[2][2]]
  if (counterclockwise) {
    state.U[0][2] = state.F[0][2]
    state.U[1][2] = state.F[1][2]
    state.U[2][2] = state.F[2][2]
    state.F[0][2] = state.D[0][2]
    state.F[1][2] = state.D[1][2]
    state.F[2][2] = state.D[2][2]
    state.D[0][2] = state.B[2][0]
    state.D[1][2] = state.B[1][0]
    state.D[2][2] = state.B[0][0]
    state.B[0][0] = temp[2]
    state.B[1][0] = temp[1]
    state.B[2][0] = temp[0]
  } else {
    state.U[0][2] = state.B[2][0]
    state.U[1][2] = state.B[1][0]
    state.U[2][2] = state.B[0][0]
    state.B[0][0] = state.D[2][2]
    state.B[1][0] = state.D[1][2]
    state.B[2][0] = state.D[0][2]
    state.D[0][2] = state.F[0][2]
    state.D[1][2] = state.F[1][2]
    state.D[2][2] = state.F[2][2]
    state.F[0][2] = temp[0]
    state.F[1][2] = temp[1]
    state.F[2][2] = temp[2]
  }
  
  return state
}

function rotateF(state: CubeState, counterclockwise: boolean): CubeState {
  state.F = rotateFace(state.F, counterclockwise)
  
  const temp = [...state.U[2]]
  if (counterclockwise) {
    state.U[2] = [state.R[2][0], state.R[1][0], state.R[0][0]]
    state.R[0][0] = state.D[0][2]
    state.R[1][0] = state.D[0][1]
    state.R[2][0] = state.D[0][0]
    state.D[0] = [state.L[2][2], state.L[1][2], state.L[0][2]]
    state.L[0][2] = temp[0]
    state.L[1][2] = temp[1]
    state.L[2][2] = temp[2]
  } else {
    state.U[2] = [state.L[2][2], state.L[1][2], state.L[0][2]]
    state.L[0][2] = state.D[0][0]
    state.L[1][2] = state.D[0][1]
    state.L[2][2] = state.D[0][2]
    state.D[0] = [state.R[2][0], state.R[1][0], state.R[0][0]]
    state.R[0][0] = temp[2]
    state.R[1][0] = temp[1]
    state.R[2][0] = temp[0]
  }
  
  return state
}

function rotateB(state: CubeState, counterclockwise: boolean): CubeState {
  state.B = rotateFace(state.B, counterclockwise)
  
  const temp = [...state.U[0]]
  if (counterclockwise) {
    state.U[0] = [state.L[0][0], state.L[1][0], state.L[2][0]]
    state.L[0][0] = state.D[2][0]
    state.L[1][0] = state.D[2][1]
    state.L[2][0] = state.D[2][2]
    state.D[2] = [state.R[2][2], state.R[1][2], state.R[0][2]]
    state.R[0][2] = temp[2]
    state.R[1][2] = temp[1]
    state.R[2][2] = temp[0]
  } else {
    state.U[0] = [state.R[2][2], state.R[1][2], state.R[0][2]]
    state.R[0][2] = state.D[2][2]
    state.R[1][2] = state.D[2][1]
    state.R[2][2] = state.D[2][0]
    state.D[2] = [state.L[0][0], state.L[1][0], state.L[2][0]]
    state.L[0][0] = temp[0]
    state.L[1][0] = temp[1]
    state.L[2][0] = temp[2]
  }
  
  return state
}
