'use client'

import { useMemo } from 'react'
import * as THREE from 'three'

export default function GroundGrid() {
  const gridSize = 100
  const divisions = 100

  return (
    <gridHelper
      args={[gridSize, divisions, '#555555', '#333333']}
      position={[0, 0, 0]}
    />
  )
}