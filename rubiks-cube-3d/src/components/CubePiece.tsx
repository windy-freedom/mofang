import React, { useRef } from 'react'
import { Mesh } from 'three'
import { FaceColor } from '../types/cube'

interface CubePieceProps {
  position: [number, number, number]
  colors: FaceColor[]
  type: 'corner' | 'edge' | 'center'
}

// Color mapping for cube faces
const colorMap: Record<FaceColor, string> = {
  white: '#ffffff',
  red: '#ff0000',
  blue: '#0000ff',
  orange: '#ff8c00',
  green: '#00ff00',
  yellow: '#ffff00'
}

const CubePiece: React.FC<CubePieceProps> = ({ position, colors, type }) => {
  const meshRef = useRef<Mesh>(null)

  // Simplified approach - use the first color or a default
  const primaryColor = colors.length > 0 ? colorMap[colors[0]] : '#333333'

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[0.98, 0.98, 0.98]} />
      <meshLambertMaterial color={primaryColor} />
    </mesh>
  )
}



export default CubePiece
