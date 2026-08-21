'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface OmikujiCylinder3DProps {
  isShaking: boolean
  isRevealed: boolean
  fortuneNumber?: number
  onShakeEnd?: () => void
}

// Three.js を用いたインタラクティブな 3D 想い出みくじ筒コンポーネント
export function OmikujiCylinder3D({
  isShaking,
  isRevealed,
  fortuneNumber = 1,
  onShakeEnd,
}: OmikujiCylinder3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isShakingRef = useRef(isShaking)
  const isRevealedRef = useRef(isRevealed)

  useEffect(() => {
    isShakingRef.current = isShaking
  }, [isShaking])

  useEffect(() => {
    isRevealedRef.current = isRevealed
  }, [isRevealed])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // 1. シーン、カメラ、レンダラーの初期化
    const width = container.clientWidth || 320
    const height = container.clientHeight || 260

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    camera.position.set(0, 0.8, 6.2)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    container.appendChild(renderer.domElement)

    // 2. 照明の設定（和風の暖かみのある金光と環境光）
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 1.2)
    scene.add(ambientLight)

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.0)
    dirLight.position.set(5, 8, 5)
    scene.add(dirLight)

    const pointLight = new THREE.PointLight(0xffd700, 2.5, 10)
    pointLight.position.set(-3, 3, 2)
    scene.add(pointLight)

    const rimLight = new THREE.DirectionalLight(0xd4af37, 1.5)
    rimLight.position.set(0, -4, -4)
    scene.add(rimLight)

    // 3. おみくじ筒全体のグループ
    const mainGroup = new THREE.Group()
    scene.add(mainGroup)

    // 漆塗りの八角柱本体
    const cylinderGeo = new THREE.CylinderGeometry(0.9, 0.95, 2.8, 8)
    const lacquerMat = new THREE.MeshStandardMaterial({
      color: 0x4a2211,
      roughness: 0.25,
      metalness: 0.35,
    })
    const cylinderMesh = new THREE.Mesh(cylinderGeo, lacquerMat)
    mainGroup.add(cylinderMesh)

    // 上下の金色の飾り輪
    const ringGeo = new THREE.CylinderGeometry(0.93, 0.93, 0.14, 8)
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xe5a93c,
      roughness: 0.2,
      metalness: 0.85,
    })

    const topRing = new THREE.Mesh(ringGeo, goldMat)
    topRing.position.y = 1.35
    mainGroup.add(topRing)

    const bottomRing = new THREE.Mesh(ringGeo, goldMat)
    bottomRing.position.y = -1.35
    mainGroup.add(bottomRing)

    // 上蓋とみくじ棒が出る中央穴
    const capGeo = new THREE.CylinderGeometry(0.88, 0.88, 0.08, 8)
    const capMesh = new THREE.Mesh(capGeo, lacquerMat)
    capMesh.position.y = 1.42
    mainGroup.add(capMesh)

    const holeGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.1, 16)
    const holeMat = new THREE.MeshBasicMaterial({ color: 0x110804 })
    const holeMesh = new THREE.Mesh(holeGeo, holeMat)
    holeMesh.position.y = 1.43
    mainGroup.add(holeMesh)

    // 筒の中央の蒔絵風「想い出みくじ」看板プレート
    const signCanvas = document.createElement('canvas')
    signCanvas.width = 256
    signCanvas.height = 512
    const ctx = signCanvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#2A1208'
      ctx.fillRect(0, 0, 256, 512)
      ctx.strokeStyle = '#D4AF37'
      ctx.lineWidth = 10
      ctx.strokeRect(12, 12, 232, 488)

      ctx.fillStyle = '#FFF8E7'
      ctx.font = 'bold 56px serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('想', 128, 120)
      ctx.fillText('い', 128, 200)
      ctx.fillText('出', 128, 280)
      ctx.fillText('籤', 128, 360)
    }

    const signTexture = new THREE.CanvasTexture(signCanvas)
    const signGeo = new THREE.PlaneGeometry(0.7, 1.4)
    const signMat = new THREE.MeshStandardMaterial({
      map: signTexture,
      roughness: 0.3,
      metalness: 0.2,
    })
    const signMesh = new THREE.Mesh(signGeo, signMat)
    signMesh.position.set(0, 0, 0.92)
    mainGroup.add(signMesh)

    // 4. 竹製のおみくじ棒
    const stickGeo = new THREE.BoxGeometry(0.12, 2.4, 0.04)
    const stickMat = new THREE.MeshStandardMaterial({
      color: 0xebd2a9,
      roughness: 0.6,
      metalness: 0.1,
    })
    const stickMesh = new THREE.Mesh(stickGeo, stickMat)
    stickMesh.position.set(0, 0.2, 0)
    stickMesh.visible = false
    mainGroup.add(stickMesh)

    // みくじ棒の先端赤印
    const tipGeo = new THREE.BoxGeometry(0.122, 0.3, 0.042)
    const tipMat = new THREE.MeshBasicMaterial({ color: 0xd32f2f })
    const tipMesh = new THREE.Mesh(tipGeo, tipMat)
    tipMesh.position.y = 1.05
    stickMesh.add(tipMesh)

    // 5. 金色の粒子パーティクル
    const particleCount = 45
    const particleGeo = new THREE.BufferGeometry()
    const particlePos = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 3
      particlePos[i + 1] = Math.random() * 4 - 1
      particlePos[i + 2] = (Math.random() - 0.5) * 3
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3))

    const particleMat = new THREE.PointsMaterial({
      color: 0xffd700,
      size: 0.08,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    })
    const particles = new THREE.Points(particleGeo, particleMat)
    scene.add(particles)

    // 6. ドラッグによる 360 度回転インタラクション
    let isDragging = false
    let prevMouseX = 0
    let prevMouseY = 0
    let targetRotationY = 0.2
    let targetRotationX = 0.1

    const handlePointerDown = (e: PointerEvent) => {
      isDragging = true
      prevMouseX = e.clientX
      prevMouseY = e.clientY
    }

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return
      const deltaX = e.clientX - prevMouseX
      const deltaY = e.clientY - prevMouseY
      targetRotationY += deltaX * 0.012
      targetRotationX += deltaY * 0.008
      targetRotationX = Math.max(-0.4, Math.min(0.4, targetRotationX))
      prevMouseX = e.clientX
      prevMouseY = e.clientY
    }

    const handlePointerUp = () => {
      isDragging = false
    }

    container.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)

    // 7. アニメーションループ（THREE.Clock の非推奨警告を解消し performance.now() で高精度計算）
    let animationFrameId: number
    let lastTime = performance.now()
    const startTime = performance.now()
    let shakeTimer = 0

    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate)
      const nowTime = currentTime || performance.now()
      const delta = Math.min((nowTime - lastTime) / 1000, 0.1)
      lastTime = nowTime
      const time = (nowTime - startTime) / 1000

      // パーティクルの浮遊運動
      const positions = particleGeo.attributes.position.array as Float32Array
      for (let i = 1; i < particleCount * 3; i += 3) {
        positions[i] += delta * 0.4
        if (positions[i] > 3) positions[i] = -1.5
      }
      particleGeo.attributes.position.needsUpdate = true

      if (isShakingRef.current) {
        // シェイクアニメーション：激しい回転と揺れ
        shakeTimer += delta * 25
        mainGroup.rotation.z = Math.sin(shakeTimer) * 0.35
        mainGroup.rotation.x = Math.cos(shakeTimer * 0.8) * 0.25 + 0.1
        mainGroup.position.y = Math.sin(shakeTimer * 1.5) * 0.18
        mainGroup.rotation.y += delta * 1.5

        stickMesh.visible = true
        stickMesh.position.y = 0.3 + Math.sin(shakeTimer * 2) * 0.1
      } else if (isRevealedRef.current) {
        // 結果開示時：棒がせり出し、優美に回転
        mainGroup.position.y = THREE.MathUtils.lerp(mainGroup.position.y, 0, delta * 4)
        mainGroup.rotation.z = THREE.MathUtils.lerp(mainGroup.rotation.z, 0, delta * 4)
        mainGroup.rotation.x = THREE.MathUtils.lerp(mainGroup.rotation.x, 0.1, delta * 4)
        mainGroup.rotation.y += delta * 0.35

        stickMesh.visible = true
        stickMesh.position.y = THREE.MathUtils.lerp(stickMesh.position.y, 1.85, delta * 3.5)
      } else {
        // アイドル時：ユーザー操作による滑らかな追従回転
        mainGroup.position.y = Math.sin(time * 1.5) * 0.06
        mainGroup.rotation.y = THREE.MathUtils.lerp(mainGroup.rotation.y, targetRotationY, delta * 6)
        mainGroup.rotation.x = THREE.MathUtils.lerp(mainGroup.rotation.x, targetRotationX, delta * 6)
        mainGroup.rotation.z = THREE.MathUtils.lerp(mainGroup.rotation.z, 0, delta * 6)

        if (!isDragging) {
          targetRotationY += delta * 0.25
        }
        stickMesh.visible = false
        stickMesh.position.y = 0.2
      }

      renderer.render(scene, camera)
    }

    animate(performance.now())

    // 8. リサイズ処理
    const handleResize = () => {
      if (!container) return
      const newWidth = container.clientWidth || 320
      const newHeight = container.clientHeight || 260
      camera.aspect = newWidth / newHeight
      camera.updateProjectionMatrix()
      renderer.setSize(newWidth, newHeight)
    }
    window.addEventListener('resize', handleResize)

    // 9. メモリクリーンアップ
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      container.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }

      cylinderGeo.dispose()
      ringGeo.dispose()
      capGeo.dispose()
      holeGeo.dispose()
      signGeo.dispose()
      stickGeo.dispose()
      tipGeo.dispose()
      particleGeo.dispose()

      lacquerMat.dispose()
      goldMat.dispose()
      holeMat.dispose()
      signMat.dispose()
      stickMat.dispose()
      tipMat.dispose()
      particleMat.dispose()
      signTexture.dispose()

      renderer.dispose()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="w-full h-64 relative flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
      style={{ touchAction: 'none' }}
    />
  )
}

export default OmikujiCylinder3D
