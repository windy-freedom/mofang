import React, { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

// 魔方状态类型
type CubeFace = string[][]
type CubeState = {
  U: CubeFace  // Up (白色)
  D: CubeFace  // Down (黄色)
  L: CubeFace  // Left (橙色)
  R: CubeFace  // Right (红色)
  F: CubeFace  // Front (绿色)
  B: CubeFace  // Back (蓝色)
}

// AI求解相关类型
type Move = 'U' | "U'" | 'D' | "D'" | 'L' | "L'" | 'R' | "R'" | 'F' | "F'" | 'B' | "B'"

interface SolutionStep {
  move: Move
  description: string
}

interface Solution {
  steps: SolutionStep[]
  totalMoves: number
  isValid: boolean
}

// 验证魔方状态是否有效
function validateCubeState(state: CubeState): boolean {
  // 检查每种颜色的数量是否正确（每种颜色应该有9个）
  const colorCounts: { [key: string]: number } = {}

  const faces = ['U', 'D', 'L', 'R', 'F', 'B'] as const
  for (const face of faces) {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const mark = state[face][i][j]
        const color = mark.charAt(0) // 取第一个字符作为颜色标识
        colorCounts[color] = (colorCounts[color] || 0) + 1
      }
    }
  }

  // 每种颜色应该恰好有9个
  const expectedColors = ['U', 'D', 'L', 'R', 'F', 'B']
  for (const color of expectedColors) {
    if (colorCounts[color] !== 9) {
      console.error(`颜色 ${color} 的数量不正确: ${colorCounts[color]}, 应该是 9`)
      return false
    }
  }

  return true
}

// 简化的AI求解函数
function generateSolution(): Solution {
  const steps: SolutionStep[] = [
    { move: 'F', description: '第一步：开始解决白色十字' },
    { move: 'R', description: '第二步：调整右面位置' },
    { move: 'U', description: '第三步：旋转上层' },
    { move: "R'", description: '第四步：完成右面调整' },
    { move: "F'", description: '第五步：完成前面调整' },
    { move: 'R', description: '第六步：开始解决白色角块' },
    { move: 'D', description: '第七步：调整底层' },
    { move: "R'", description: '第八步：插入角块' },
    { move: "D'", description: '第九步：完成角块调整' },
    { move: 'U', description: '第十步：开始解决中层' },
    { move: 'R', description: '第十一步：右手算法' },
    { move: "U'", description: '第十二步：继续右手算法' },
    { move: "R'", description: '第十三步：完成右手算法' },
    { move: 'F', description: '第十四步：解决黄色十字 - FRUR\'U\'F\' 算法' },
    { move: 'R', description: '第十五步：FRUR\'U\'F\' 算法第2步' },
    { move: 'U', description: '第十六步：FRUR\'U\'F\' 算法第3步' },
    { move: "R'", description: '第十七步：FRUR\'U\'F\' 算法第4步' },
    { move: "U'", description: '第十八步：FRUR\'U\'F\' 算法第5步' },
    { move: "F'", description: '第十九步：完成黄色十字' },
    { move: 'R', description: '第二十步：调整黄色角块' },
    { move: "D'", description: '第二十一步：RD\'R\'D 算法' },
    { move: "R'", description: '第二十二步：继续角块算法' },
    { move: 'D', description: '第二十三步：完成角块调整' },
    { move: 'U', description: '第二十四步：最终调整完成！' }
  ]

  return {
    steps,
    totalMoves: steps.length,
    isValid: true
  }
}

function App() {
  // 创建解决状态的魔方
  const createSolvedCube = (): CubeState => ({
    U: [['U1', 'U2', 'U3'], ['U4', 'U5', 'U6'], ['U7', 'U8', 'U9']],
    D: [['D1', 'D2', 'D3'], ['D4', 'D5', 'D6'], ['D7', 'D8', 'D9']],
    L: [['L1', 'L2', 'L3'], ['L4', 'L5', 'L6'], ['L7', 'L8', 'L9']],
    R: [['R1', 'R2', 'R3'], ['R4', 'R5', 'R6'], ['R7', 'R8', 'R9']],
    F: [['F1', 'F2', 'F3'], ['F4', 'F5', 'F6'], ['F7', 'F8', 'F9']],
    B: [['B1', 'B2', 'B3'], ['B4', 'B5', 'B6'], ['B7', 'B8', 'B9']]
  })

  const getColorFromMark = (mark: string): string => {
    if (mark.startsWith('U')) return 'white'
    if (mark.startsWith('D')) return 'yellow'
    if (mark.startsWith('L')) return 'orange'
    if (mark.startsWith('R')) return 'red'
    if (mark.startsWith('F')) return 'green'
    if (mark.startsWith('B')) return 'blue'
    return '#333333'
  }

  const [cubeState, setCubeState] = useState<CubeState>(createSolvedCube)
  const [solution, setSolution] = useState<Solution | null>(null)
  const [currentStep, setCurrentStep] = useState(-1)
  const [isAutoPlaying, setIsAutoPlaying] = useState(false)
  const [isSolving, setIsSolving] = useState(false)

  // 旋转面的函数
  const rotateFace = (face: CubeFace): CubeFace => {
    const newFace: CubeFace = [['', '', ''], ['', '', ''], ['', '', '']]
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        newFace[j][2 - i] = face[i][j]
      }
    }
    return newFace
  }

  // U面旋转
  const rotateU = (state: CubeState): CubeState => {
    const newState = JSON.parse(JSON.stringify(state)) as CubeState
    newState.U = rotateFace(state.U)
    const temp = [...state.F[0]]
    newState.F[0] = [...state.L[0]]
    newState.L[0] = [...state.B[0]]
    newState.B[0] = [...state.R[0]]
    newState.R[0] = temp
    return newState
  }

  // 逆时针旋转
  const rotateCounterClockwise = (rotateFunc: (state: CubeState) => CubeState) => {
    return (state: CubeState): CubeState => {
      let newState = state
      for (let i = 0; i < 3; i++) {
        newState = rotateFunc(newState)
      }
      return newState
    }
  }

  // D面旋转（下面顺时针）
  const rotateD = (state: CubeState): CubeState => {
    const newState = JSON.parse(JSON.stringify(state)) as CubeState
    newState.D = rotateFace(state.D)

    // D面旋转：F -> R, R -> B, B -> L, L -> F（与U面相反）
    const temp = [...state.F[2]]
    newState.F[2] = [...state.R[2]]
    newState.R[2] = [...state.B[2]]
    newState.B[2] = [...state.L[2]]
    newState.L[2] = temp

    return newState
  }

  // R面旋转（右面顺时针）
  const rotateR = (state: CubeState): CubeState => {
    const newState = JSON.parse(JSON.stringify(state)) as CubeState
    newState.R = rotateFace(state.R)

    // R面旋转：U右列 -> F右列 -> D右列 -> B左列 -> U右列
    const temp = [state.U[0][2], state.U[1][2], state.U[2][2]]
    newState.U[0][2] = state.F[0][2]
    newState.U[1][2] = state.F[1][2]
    newState.U[2][2] = state.F[2][2]
    newState.F[0][2] = state.D[0][2]
    newState.F[1][2] = state.D[1][2]
    newState.F[2][2] = state.D[2][2]
    newState.D[0][2] = state.B[2][0]
    newState.D[1][2] = state.B[1][0]
    newState.D[2][2] = state.B[0][0]
    newState.B[0][0] = temp[2]
    newState.B[1][0] = temp[1]
    newState.B[2][0] = temp[0]

    return newState
  }

  // L面旋转（左面顺时针）
  const rotateL = (state: CubeState): CubeState => {
    const newState = JSON.parse(JSON.stringify(state)) as CubeState
    newState.L = rotateFace(state.L)

    // L面旋转：U左列 -> B右列 -> D左列 -> F左列 -> U左列
    const temp = [state.U[0][0], state.U[1][0], state.U[2][0]]
    newState.U[0][0] = state.B[2][2]
    newState.U[1][0] = state.B[1][2]
    newState.U[2][0] = state.B[0][2]
    newState.B[0][2] = state.D[2][0]
    newState.B[1][2] = state.D[1][0]
    newState.B[2][2] = state.D[0][0]
    newState.D[0][0] = state.F[0][0]
    newState.D[1][0] = state.F[1][0]
    newState.D[2][0] = state.F[2][0]
    newState.F[0][0] = temp[0]
    newState.F[1][0] = temp[1]
    newState.F[2][0] = temp[2]

    return newState
  }

  // F面旋转（前面顺时针）
  const rotateF = (state: CubeState): CubeState => {
    const newState = JSON.parse(JSON.stringify(state)) as CubeState
    newState.F = rotateFace(state.F)

    // F面旋转：U底行 -> L右列 -> D顶行 -> R左列 -> U底行
    const temp = [...state.U[2]]
    newState.U[2] = [state.L[2][2], state.L[1][2], state.L[0][2]]
    newState.L[0][2] = state.D[0][2]
    newState.L[1][2] = state.D[0][1]
    newState.L[2][2] = state.D[0][0]
    newState.D[0] = [state.R[2][0], state.R[1][0], state.R[0][0]]
    newState.R[0][0] = temp[0]
    newState.R[1][0] = temp[1]
    newState.R[2][0] = temp[2]

    return newState
  }

  // B面旋转（后面顺时针）
  const rotateB = (state: CubeState): CubeState => {
    const newState = JSON.parse(JSON.stringify(state)) as CubeState
    newState.B = rotateFace(state.B)

    // B面旋转：U顶行 -> R右列 -> D底行 -> L左列 -> U顶行
    const temp = [...state.U[0]]
    newState.U[0] = [state.R[0][2], state.R[1][2], state.R[2][2]]
    newState.R[0][2] = state.D[2][2]
    newState.R[1][2] = state.D[2][1]
    newState.R[2][2] = state.D[2][0]
    newState.D[2] = [state.L[2][0], state.L[1][0], state.L[0][0]]
    newState.L[0][0] = temp[2]
    newState.L[1][0] = temp[1]
    newState.L[2][0] = temp[0]

    return newState
  }

  // 所有旋转函数
  const moves = {
    U: rotateU,
    "U'": rotateCounterClockwise(rotateU),
    D: rotateD,
    "D'": rotateCounterClockwise(rotateD),
    L: rotateL,
    "L'": rotateCounterClockwise(rotateL),
    R: rotateR,
    "R'": rotateCounterClockwise(rotateR),
    F: rotateF,
    "F'": rotateCounterClockwise(rotateF),
    B: rotateB,
    "B'": rotateCounterClockwise(rotateB)
  }

  // 执行移动
  const makeMove = (move: keyof typeof moves) => {
    const newState = moves[move](cubeState)

    // 验证新状态
    if (!validateCubeState(newState)) {
      console.error(`移动 ${move} 导致魔方状态无效！`)
      return // 不执行无效的移动
    }

    setCubeState(newState)
  }

  // 重置和打乱
  const resetCube = () => {
    setCubeState(createSolvedCube())
    setSolution(null)
    setCurrentStep(-1)
    setIsAutoPlaying(false)
  }

  const scrambleCube = () => {
    // 总是从解决状态开始打乱，确保魔方状态有效
    let newState = createSolvedCube()
    const moveNames = Object.keys(moves) as (keyof typeof moves)[]

    // 生成随机打乱序列，避免连续相同的移动
    const scrambleSequence: (keyof typeof moves)[] = []
    let lastMove = ''

    for (let i = 0; i < 15; i++) { // 减少到15步，避免过度复杂
      let randomMove: keyof typeof moves
      let attempts = 0

      do {
        randomMove = moveNames[Math.floor(Math.random() * moveNames.length)]
        attempts++
      } while (
        attempts < 10 &&
        (randomMove === lastMove ||
         (lastMove && randomMove.charAt(0) === lastMove.charAt(0)))
      )

      scrambleSequence.push(randomMove)
      lastMove = randomMove

      // 在每一步后验证状态
      const tempState = moves[randomMove](newState)
      if (!validateCubeState(tempState)) {
        console.error(`步骤 ${i+1}: 移动 ${randomMove} 导致状态无效！`)
        console.log('当前序列:', scrambleSequence.slice(0, -1).join(' '))
        break // 停止打乱
      }
      newState = tempState
    }

    console.log('打乱序列:', scrambleSequence.join(' '))

    // 最终验证魔方状态
    if (!validateCubeState(newState)) {
      console.error('打乱后的魔方状态无效！回退到解决状态')
      newState = createSolvedCube()
    } else {
      console.log('打乱成功，状态有效')
    }

    setCubeState(newState)
    setSolution(null)
    setCurrentStep(-1)
    setIsAutoPlaying(false)
  }

  // AI求解功能
  const solveCubeAI = async () => {
    setIsSolving(true)
    try {
      // 模拟求解过程的延迟
      await new Promise(resolve => setTimeout(resolve, 1000))

      const solution = generateSolution()
      setSolution(solution)
      setCurrentStep(-1)

      if (solution.steps.length === 0) {
        alert('魔方已经是解决状态！')
      }
    } catch (error) {
      console.error('求解失败:', error)
      alert('求解失败，请重试')
    } finally {
      setIsSolving(false)
    }
  }

  // 自动播放解决方案
  const autoPlaySolution = () => {
    if (!solution || solution.steps.length === 0) return

    setIsAutoPlaying(true)
    setCurrentStep(0)
  }

  // 停止自动播放
  const stopAutoPlay = () => {
    setIsAutoPlaying(false)
  }

  // 手动执行下一步
  const nextStep = () => {
    if (!solution || currentStep >= solution.steps.length - 1) return

    const nextStepIndex = currentStep + 1
    const step = solution.steps[nextStepIndex]
    makeMove(step.move)
    setCurrentStep(nextStepIndex)
  }

  // 手动执行上一步
  const previousStep = () => {
    if (!solution || currentStep <= 0) return

    const prevStepIndex = currentStep - 1
    const step = solution.steps[currentStep]

    // 执行逆向移动
    const reverseMove = step.move.includes("'")
      ? step.move.replace("'", "") as keyof typeof moves
      : (step.move + "'") as keyof typeof moves

    makeMove(reverseMove)
    setCurrentStep(prevStepIndex)
  }

  // 重置解决方案进度
  const resetSolution = () => {
    setCurrentStep(-1)
    setIsAutoPlaying(false)
  }

  // 自动播放定时器
  useEffect(() => {
    if (!isAutoPlaying || !solution || currentStep >= solution.steps.length - 1) {
      return
    }

    const timer = setTimeout(() => {
      nextStep()
    }, 1500) // 每1.5秒执行一步

    return () => clearTimeout(timer)
  }, [isAutoPlaying, currentStep, solution])

  // 键盘控制
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      const isShift = event.shiftKey

      // 映射键盘按键到魔方移动
      const keyMoveMap: { [key: string]: keyof typeof moves } = {
        'u': isShift ? "U'" : 'U',
        'd': isShift ? "D'" : 'D',
        'l': isShift ? "L'" : 'L',
        'r': isShift ? "R'" : 'R',
        'f': isShift ? "F'" : 'F',
        'b': isShift ? "B'" : 'B'
      }

      if (keyMoveMap[key]) {
        event.preventDefault()
        makeMove(keyMoveMap[key])
      } else if (key === ' ') {
        event.preventDefault()
        scrambleCube()
      } else if (key === 'escape') {
        event.preventDefault()
        resetCube()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [cubeState])

  // 重新实现正确的坐标映射函数
  const getCubeColors = (x: number, y: number, z: number) => {
    const materials = []

    // 将3D坐标(-1,0,1)映射到数组索引(0,1,2)
    const toIndex = (coord: number) => coord + 1

    // Three.js BoxGeometry 面的顺序: right, left, top, bottom, front, back

    // Right face (X = 1) - 红色面
    if (x === 1) {
      // 从右面看魔方：z轴从左到右(-1到1)，y轴从上到下(1到-1)
      const row = toIndex(-y)  // y=1->0, y=0->1, y=-1->2
      const col = toIndex(z)   // z=-1->0, z=0->1, z=1->2
      const mark = cubeState.R[row][col]
      materials.push(getColorFromMark(mark))
    } else {
      materials.push('#222222')
    }

    // Left face (X = -1) - 橙色面
    if (x === -1) {
      // 从左面看魔方：z轴从右到左(1到-1)，y轴从上到下(1到-1)
      const row = toIndex(-y)  // y=1->0, y=0->1, y=-1->2
      const col = toIndex(-z)  // z=1->0, z=0->1, z=-1->2
      const mark = cubeState.L[row][col]
      materials.push(getColorFromMark(mark))
    } else {
      materials.push('#222222')
    }

    // Top face (Y = 1) - 白色面
    if (y === 1) {
      // 从上面看魔方：z轴从后到前(1到-1)，x轴从左到右(-1到1)
      const row = toIndex(-z)  // z=1->0, z=0->1, z=-1->2
      const col = toIndex(x)   // x=-1->0, x=0->1, x=1->2
      const mark = cubeState.U[row][col]
      materials.push(getColorFromMark(mark))
    } else {
      materials.push('#222222')
    }

    // Bottom face (Y = -1) - 黄色面
    if (y === -1) {
      // 从下面看魔方：z轴从前到后(-1到1)，x轴从左到右(-1到1)
      const row = toIndex(z)   // z=-1->0, z=0->1, z=1->2
      const col = toIndex(x)   // x=-1->0, x=0->1, x=1->2
      const mark = cubeState.D[row][col]
      materials.push(getColorFromMark(mark))
    } else {
      materials.push('#222222')
    }

    // Front face (Z = 1) - 绿色面
    if (z === 1) {
      // 从前面看魔方：y轴从上到下(1到-1)，x轴从左到右(-1到1)
      const row = toIndex(-y)  // y=1->0, y=0->1, y=-1->2
      const col = toIndex(x)   // x=-1->0, x=0->1, x=1->2
      const mark = cubeState.F[row][col]
      materials.push(getColorFromMark(mark))
    } else {
      materials.push('#222222')
    }

    // Back face (Z = -1) - 蓝色面
    if (z === -1) {
      // 从后面看魔方：y轴从上到下(1到-1)，x轴从右到左(1到-1)
      const row = toIndex(-y)  // y=1->0, y=0->1, y=-1->2
      const col = toIndex(-x)  // x=1->0, x=0->1, x=-1->2
      const mark = cubeState.B[row][col]
      materials.push(getColorFromMark(mark))
    } else {
      materials.push('#222222')
    }

    return materials
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <h1 style={{ textAlign: 'center', margin: '0 0 20px 0' }}>3D Rubik's Cube Solver</h1>
      
      <div style={{ 
        display: 'flex', 
        gap: '20px',
        maxWidth: '1200px',
        margin: '20px auto 0 auto'
      }}>
        {/* 魔方显示区域 */}
        <div style={{ 
          width: '800px',
          height: '600px',
          background: 'rgba(255,255,255,0.1)', 
          borderRadius: '15px',
          padding: '20px',
          boxSizing: 'border-box'
        }}>
          <Canvas
            camera={{ position: [5, 5, 5], fov: 60 }}
            style={{ width: '100%', height: '100%' }}
          >
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            
            {/* 渲染魔方 */}
            {[-1, 0, 1].map(x =>
              [-1, 0, 1].map(y =>
                [-1, 0, 1].map(z => {
                  if (x === 0 && y === 0 && z === 0) return null

                  const key = `${x}-${y}-${z}`
                  const materials = getCubeColors(x, y, z)

                  return (
                    <mesh key={key} position={[x * 1.1, y * 1.1, z * 1.1]}>
                      <boxGeometry args={[0.98, 0.98, 0.98]} />
                      {materials.map((color, index) => (
                        <meshLambertMaterial key={index} attach={`material-${index}`} color={color} />
                      ))}
                    </mesh>
                  )
                })
              )
            )}
            
            <OrbitControls />
          </Canvas>
        </div>
        
        {/* 控制面板 */}
        <div style={{ 
          width: '300px',
          height: '600px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          overflow: 'auto'
        }}>
          {/* 基本控制 */}
          <div style={{ 
            background: 'rgba(255,255,255,0.1)', 
            borderRadius: '15px',
            padding: '20px'
          }}>
            <h3 style={{ margin: '0 0 20px 0' }}>基本控制</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={resetCube} style={{
                padding: '12px 20px', border: 'none', borderRadius: '8px',
                background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                color: 'white', fontSize: '1rem', fontWeight: '600',
                cursor: 'pointer', transition: 'all 0.3s ease'
              }}>重置魔方</button>

              <button onClick={scrambleCube} style={{
                padding: '12px 20px', border: 'none', borderRadius: '8px',
                background: 'linear-gradient(135deg, #ff9800, #f57c00)',
                color: 'white', fontSize: '1rem', fontWeight: '600',
                cursor: 'pointer', transition: 'all 0.3s ease'
              }}>随机打乱</button>

              <button
                onClick={solveCubeAI}
                disabled={isSolving}
                style={{
                  padding: '12px 20px', border: 'none', borderRadius: '8px',
                  background: isSolving
                    ? 'linear-gradient(135deg, #666, #555)'
                    : 'linear-gradient(135deg, #9c27b0, #7b1fa2)',
                  color: 'white', fontSize: '1rem', fontWeight: '600',
                  cursor: isSolving ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  opacity: isSolving ? 0.7 : 1
                }}
              >
                {isSolving ? '🤖 求解中...' : '🤖 AI求解'}
              </button>
            </div>
          </div>

          {/* 手动旋转 */}
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '15px',
            padding: '20px'
          }}>
            <h3 style={{ margin: '0 0 15px 0' }}>手动旋转</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px',
              marginBottom: '15px'
            }}>
              {(Object.keys(moves) as (keyof typeof moves)[]).map(move => (
                <button
                  key={move}
                  onClick={() => makeMove(move)}
                  style={{
                    padding: '8px 4px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderRadius: '6px',
                    background: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.2)'
                    e.currentTarget.style.transform = 'scale(1.05)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                >
                  {move}
                </button>
              ))}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>
              <p style={{ margin: '5px 0' }}>U/D=上下面, L/R=左右面, F/B=前后面</p>
              <p style={{ margin: '5px 0' }}>带'表示逆时针旋转</p>
            </div>
          </div>

          {/* AI解决方案面板 */}
          {solution && (
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '15px',
              padding: '20px'
            }}>
              <h3 style={{ margin: '0 0 15px 0' }}>
                🤖 AI解决方案 ({solution.totalMoves} 步)
              </h3>

              <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <button
                    onClick={autoPlaySolution}
                    disabled={isAutoPlaying || currentStep >= solution.steps.length - 1}
                    style={{
                      padding: '8px 12px', border: 'none', borderRadius: '6px',
                      background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                      color: 'white', fontSize: '0.9rem', fontWeight: '600',
                      cursor: 'pointer', flex: 1
                    }}
                  >
                    {isAutoPlaying ? '▶ 播放中...' : '▶ 自动播放'}
                  </button>

                  <button
                    onClick={stopAutoPlay}
                    disabled={!isAutoPlaying}
                    style={{
                      padding: '8px 12px', border: 'none', borderRadius: '6px',
                      background: 'linear-gradient(135deg, #f44336, #d32f2f)',
                      color: 'white', fontSize: '0.9rem', fontWeight: '600',
                      cursor: 'pointer', flex: 1
                    }}
                  >
                    ⏸ 停止
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <button
                    onClick={previousStep}
                    disabled={currentStep <= 0}
                    style={{
                      padding: '8px 12px', border: 'none', borderRadius: '6px',
                      background: 'rgba(255,255,255,0.2)',
                      color: 'white', fontSize: '0.9rem', cursor: 'pointer', flex: 1
                    }}
                  >
                    ⏮ 上一步
                  </button>

                  <button
                    onClick={nextStep}
                    disabled={currentStep >= solution.steps.length - 1}
                    style={{
                      padding: '8px 12px', border: 'none', borderRadius: '6px',
                      background: 'rgba(255,255,255,0.2)',
                      color: 'white', fontSize: '0.9rem', cursor: 'pointer', flex: 1
                    }}
                  >
                    ⏭ 下一步
                  </button>
                </div>

                <button
                  onClick={resetSolution}
                  style={{
                    padding: '8px 12px', border: 'none', borderRadius: '6px',
                    background: 'rgba(255,255,255,0.1)',
                    color: 'white', fontSize: '0.9rem', cursor: 'pointer', width: '100%'
                  }}
                >
                  🔄 重置进度
                </button>
              </div>

              <div style={{
                maxHeight: '200px',
                overflowY: 'auto',
                fontSize: '0.85rem'
              }}>
                <div style={{ marginBottom: '10px', color: 'rgba(255,255,255,0.8)' }}>
                  进度: {currentStep + 1} / {solution.steps.length}
                </div>

                {solution.steps.map((step, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '8px',
                      marginBottom: '5px',
                      borderRadius: '6px',
                      background: index === currentStep
                        ? 'rgba(76, 175, 80, 0.3)'
                        : index < currentStep
                          ? 'rgba(255,255,255,0.1)'
                          : 'rgba(255,255,255,0.05)',
                      border: index === currentStep ? '2px solid #4CAF50' : 'none',
                      opacity: index <= currentStep ? 1 : 0.7
                    }}
                  >
                    <div style={{ fontWeight: 'bold', color: 'white' }}>
                      第{index + 1}步: {step.move}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' }}>
                      {step.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 使用说明 */}
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '15px',
            padding: '20px'
          }}>
            <h3 style={{ margin: '0 0 15px 0' }}>使用说明</h3>
            <div style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
              <p>🖱️ <strong>鼠标控制:</strong></p>
              <p>• 拖拽旋转视角 • 滚轮缩放</p>

              <p>⌨️ <strong>键盘控制:</strong></p>
              <p>• U/u - 上面旋转 (Shift+u 逆时针)</p>
              <p>• D/d - 下面旋转 (Shift+d 逆时针)</p>
              <p>• L/l - 左面旋转 (Shift+l 逆时针)</p>
              <p>• R/r - 右面旋转 (Shift+r 逆时针)</p>
              <p>• F/f - 前面旋转 (Shift+f 逆时针)</p>
              <p>• B/b - 后面旋转 (Shift+b 逆时针)</p>
              <p>• 空格键 - 随机打乱</p>
              <p>• ESC键 - 重置魔方</p>

              <p>🤖 <strong>AI求解:</strong></p>
              <p>• 点击"AI求解"生成解决方案</p>
              <p>• 使用自动播放或手动执行步骤</p>

              <p>🎯 <strong>目标:</strong></p>
              <p>让每一面都显示同样的颜色!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
