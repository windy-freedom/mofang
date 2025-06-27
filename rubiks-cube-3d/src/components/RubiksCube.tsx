import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, Mesh } from 'three'
import CubePiece from './CubePiece'
import { CubeState, FaceColor } from '../types/cube'

// Initial solved cube state
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

interface RubiksCubeProps {
  cubeState?: CubeState
  isAnimating?: boolean
}

const RubiksCube: React.FC<RubiksCubeProps> = ({ 
  cubeState = createSolvedCube(), 
  isAnimating = false 
}) => {
  const groupRef = useRef<Group>(null)

  // Generate all 27 cube pieces (including the invisible center piece)
  const cubePieces = useMemo(() => {
    const pieces = []
    
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          // Skip the center piece (invisible)
          if (x === 0 && y === 0 && z === 0) continue
          
          const position: [number, number, number] = [x * 1.1, y * 1.1, z * 1.1]
          const colors = getPieceColors(x, y, z, cubeState)
          const type = getPieceType(x, y, z)
          
          pieces.push({
            key: `${x}-${y}-${z}`,
            position,
            colors,
            type
          })
        }
      }
    }
    
    return pieces
  }, [cubeState])

  // Optional rotation animation when not manually controlled
  useFrame((state) => {
    if (groupRef.current && !isAnimating) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1
    }
  })

  return (
    <group ref={groupRef}>
      {cubePieces.map((piece) => (
        <CubePiece
          key={piece.key}
          position={piece.position}
          colors={piece.colors}
          type={piece.type}
        />
      ))}
    </group>
  )
}

// Helper function to determine piece colors based on position and cube state
function getPieceColors(x: number, y: number, z: number, cubeState: CubeState): FaceColor[] {
  const colors: FaceColor[] = []
  
  // Map 3D position to 2D face coordinates
  const mapToFaceCoord = (coord: number): number => coord + 1 // Convert -1,0,1 to 0,1,2
  
  // Top face (y = 1)
  if (y === 1) {
    colors.push(cubeState.U[mapToFaceCoord(-z)][mapToFaceCoord(x)])
  }
  
  // Bottom face (y = -1)
  if (y === -1) {
    colors.push(cubeState.D[mapToFaceCoord(z)][mapToFaceCoord(x)])
  }
  
  // Left face (x = -1)
  if (x === -1) {
    colors.push(cubeState.L[mapToFaceCoord(-z)][mapToFaceCoord(-y)])
  }
  
  // Right face (x = 1)
  if (x === 1) {
    colors.push(cubeState.R[mapToFaceCoord(-z)][mapToFaceCoord(y)])
  }
  
  // Front face (z = 1)
  if (z === 1) {
    colors.push(cubeState.F[mapToFaceCoord(-y)][mapToFaceCoord(x)])
  }
  
  // Back face (z = -1)
  if (z === -1) {
    colors.push(cubeState.B[mapToFaceCoord(-y)][mapToFaceCoord(-x)])
  }
  
  return colors
}

// Helper function to determine piece type
function getPieceType(x: number, y: number, z: number): 'corner' | 'edge' | 'center' {
  const nonZeroCount = [x, y, z].filter(coord => coord !== 0).length
  
  if (nonZeroCount === 3) return 'corner'
  if (nonZeroCount === 2) return 'edge'
  return 'center'
}

export default RubiksCube
