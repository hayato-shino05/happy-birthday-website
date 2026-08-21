'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

interface OmikujiCylinder3DProps {
  isShaking: boolean
  isRevealed: boolean
  fortuneNumber?: number
  onDraw?: () => void
}

// 漢数字変換ヘルパー
const KANJI_NUMBERS = [
  '第一番', '第二番', '第三番', '第四番', '第五番', '第六番',
  '第七番', '第八番', '第九番', '第十番', '第十一番', '第十二番'
]

// Three.js による最高峰の和風 3D 想い出みくじコンポーネント
export function OmikujiCylinder3D({
  isShaking,
  isRevealed,
  fortuneNumber = 1,
  onDraw,
}: OmikujiCylinder3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isShakingRef = useRef(isShaking)
  const isRevealedRef = useRef(isRevealed)
  const onDrawRef = useRef(onDraw)

  useEffect(() => {
    isShakingRef.current = isShaking
  }, [isShaking])

  useEffect(() => {
    isRevealedRef.current = isRevealed
  }, [isRevealed])

  useEffect(() => {
    onDrawRef.current = onDraw
  }, [onDraw])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // 1. シーン、カメラ、レンダラーの初期化
    const width = container.clientWidth || 360
    const height = container.clientHeight || 300

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100)
    camera.position.set(0, 1.2, 6.8)

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.35
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(renderer.domElement)

    // 2. OrbitControls の設定（スムーズなダンピングと直感的な操作）
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.enablePan = false
    controls.minDistance = 3.5
    controls.maxDistance = 9.0
    controls.minPolarAngle = Math.PI / 6
    controls.maxPolarAngle = (Math.PI * 5) / 8
    controls.target.set(0, 0.2, 0)

    // 3. 照明システム（金箔の輝きと漆の艶を引き出す多灯ライティング）
    const ambientLight = new THREE.AmbientLight(0xfff8ee, 1.4)
    scene.add(ambientLight)

    const mainSun = new THREE.DirectionalLight(0xffffff, 2.2)
    mainSun.position.set(4, 7, 5)
    mainSun.castShadow = true
    mainSun.shadow.mapSize.width = 1024
    mainSun.shadow.mapSize.height = 1024
    scene.add(mainSun)

    const warmPointLight = new THREE.PointLight(0xffb84d, 3.0, 12)
    warmPointLight.position.set(-3, 3, 2.5)
    scene.add(warmPointLight)

    const goldenRim = new THREE.DirectionalLight(0xd4af37, 2.0)
    goldenRim.position.set(0, -3, -4)
    scene.add(goldenRim)

    const topGlowLight = new THREE.PointLight(0xfff0b3, 1.5, 6)
    topGlowLight.position.set(0, 2.8, 0)
    scene.add(topGlowLight)

    // 4. メインオブジェクトグループ
    const mainRoot = new THREE.Group()
    scene.add(mainRoot)

    // 台座グループ（神社の飾り台座）
    const pedestalGroup = new THREE.Group()
    pedestalGroup.position.y = -1.75
    mainRoot.add(pedestalGroup)

    const baseGeo = new THREE.CylinderGeometry(1.6, 1.75, 0.22, 8)
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x1f0e07,
      roughness: 0.35,
      metalness: 0.2,
    })
    const baseMesh = new THREE.Mesh(baseGeo, baseMat)
    baseMesh.receiveShadow = true
    pedestalGroup.add(baseMesh)

    const baseGoldRingGeo = new THREE.CylinderGeometry(1.62, 1.62, 0.04, 8)
    const goldOrnamentMat = new THREE.MeshStandardMaterial({
      color: 0xe5a93c,
      roughness: 0.15,
      metalness: 0.9,
    })
    const baseGoldRing = new THREE.Mesh(baseGoldRingGeo, goldOrnamentMat)
    baseGoldRing.position.y = 0.12
    pedestalGroup.add(baseGoldRing)

    // おみくじ筒グループ
    const cylinderGroup = new THREE.Group()
    mainRoot.add(cylinderGroup)

    // 漆塗り（Urushi）の鏡面八角柱本体
    const cylinderGeo = new THREE.CylinderGeometry(0.95, 1.0, 2.9, 8)
    const lacquerMat = new THREE.MeshPhysicalMaterial({
      color: 0x3d170b,
      roughness: 0.18,
      metalness: 0.12,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      reflectivity: 0.8,
    })
    const cylinderMesh = new THREE.Mesh(cylinderGeo, lacquerMat)
    cylinderMesh.castShadow = true
    cylinderMesh.receiveShadow = true
    cylinderGroup.add(cylinderMesh)

    // 上下の装飾金帯（彫刻風リング）
    const ringGeo = new THREE.CylinderGeometry(0.98, 0.98, 0.16, 8)
    const topRing = new THREE.Mesh(ringGeo, goldOrnamentMat)
    topRing.position.y = 1.38
    cylinderGroup.add(topRing)

    const bottomRing = new THREE.Mesh(ringGeo, goldOrnamentMat)
    bottomRing.position.y = -1.38
    cylinderGroup.add(bottomRing)

    // 上蓋とみくじ棒出口
    const capGeo = new THREE.CylinderGeometry(0.92, 0.92, 0.09, 8)
    const capMesh = new THREE.Mesh(capGeo, lacquerMat)
    capMesh.position.y = 1.48
    cylinderGroup.add(capMesh)

    const holeRimGeo = new THREE.TorusGeometry(0.2, 0.035, 12, 24)
    const holeRim = new THREE.Mesh(holeRimGeo, goldOrnamentMat)
    holeRim.rotation.x = Math.PI / 2
    holeRim.position.y = 1.53
    cylinderGroup.add(holeRim)

    const holeInnerGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.12, 16)
    const holeInnerMat = new THREE.MeshBasicMaterial({ color: 0x050201 })
    const holeInner = new THREE.Mesh(holeInnerGeo, holeInnerMat)
    holeInner.position.y = 1.48
    cylinderGroup.add(holeInner)

    // 蒔絵風の「想い出籤」看板プレート
    const signCanvas = document.createElement('canvas')
    signCanvas.width = 512
    signCanvas.height = 1024
    const sctx = signCanvas.getContext('2d')
    if (sctx) {
      // 漆黒グラデーション背景
      const grad = sctx.createLinearGradient(0, 0, 512, 1024)
      grad.addColorStop(0, '#1E0C06')
      grad.addColorStop(0.5, '#2D1409')
      grad.addColorStop(1, '#1A0904')
      sctx.fillStyle = grad
      sctx.fillRect(0, 0, 512, 1024)

      // 二重金枠
      sctx.strokeStyle = '#E5A93C'
      sctx.lineWidth = 16
      sctx.strokeRect(24, 24, 464, 976)
      sctx.strokeStyle = '#D4AF37'
      sctx.lineWidth = 6
      sctx.strokeRect(42, 42, 428, 940)

      // 四隅の金花文様
      sctx.fillStyle = '#E5A93C'
      sctx.beginPath()
      sctx.arc(60, 60, 14, 0, Math.PI * 2)
      sctx.arc(452, 60, 14, 0, Math.PI * 2)
      sctx.arc(60, 964, 14, 0, Math.PI * 2)
      sctx.arc(452, 964, 14, 0, Math.PI * 2)
      sctx.fill()

      // 金箔の毛筆文字
      sctx.fillStyle = '#FFF5DE'
      sctx.shadowColor = '#D4AF37'
      sctx.shadowBlur = 12
      sctx.font = 'bold 110px "Yu Mincho", "Hiragino Mincho ProN", serif'
      sctx.textAlign = 'center'
      sctx.textBaseline = 'middle'
      sctx.fillText('想', 256, 230)
      sctx.fillText('い', 256, 410)
      sctx.fillText('出', 256, 590)
      sctx.fillText('籤', 256, 770)
    }

    const signTexture = new THREE.CanvasTexture(signCanvas)
    const signGeo = new THREE.PlaneGeometry(0.78, 1.56)
    const signMat = new THREE.MeshStandardMaterial({
      map: signTexture,
      roughness: 0.2,
      metalness: 0.25,
    })
    const signMesh = new THREE.Mesh(signGeo, signMat)
    signMesh.position.set(0, 0, 0.98)
    cylinderGroup.add(signMesh)

    // 5. 内部の竹製みくじ棒束
    const stickMat = new THREE.MeshStandardMaterial({
      color: 0xf1dfc3,
      roughness: 0.5,
      metalness: 0.05,
    })

    // 抽出される主役の竹製みくじ棒（漢数字銘板付き）
    const mainStickGroup = new THREE.Group()
    cylinderGroup.add(mainStickGroup)
    mainStickGroup.position.set(0, 0.2, 0)
    mainStickGroup.visible = false

    const mainStickGeo = new THREE.BoxGeometry(0.14, 2.6, 0.04)
    const mainStickMesh = new THREE.Mesh(mainStickGeo, stickMat)
    mainStickGroup.add(mainStickMesh)

    const tipGeo = new THREE.BoxGeometry(0.142, 0.35, 0.042)
    const tipMat = new THREE.MeshStandardMaterial({
      color: 0xc62828,
      roughness: 0.3,
    })
    const tipMesh = new THREE.Mesh(tipGeo, tipMat)
    tipMesh.position.y = 1.14
    mainStickGroup.add(tipMesh)

    // 棒上の番号テキスト
    const stickCanvas = document.createElement('canvas')
    stickCanvas.width = 128
    stickCanvas.height = 512
    const stickCtx = stickCanvas.getContext('2d')
    if (stickCtx) {
      stickCtx.fillStyle = '#F5E6CC'
      stickCtx.fillRect(0, 0, 128, 512)
      stickCtx.fillStyle = '#2A1208'
      stickCtx.font = 'bold 64px serif'
      stickCtx.textAlign = 'center'
      stickCtx.textBaseline = 'middle'
      const label = KANJI_NUMBERS[(fortuneNumber - 1) % KANJI_NUMBERS.length] || '第一番'
      const chars = label.split('')
      chars.forEach((c, idx) => {
        stickCtx.fillText(c, 64, 100 + idx * 80)
      })
    }
    const stickTexture = new THREE.CanvasTexture(stickCanvas)
    const stickLabelGeo = new THREE.PlaneGeometry(0.12, 0.9)
    const stickLabelMat = new THREE.MeshBasicMaterial({ map: stickTexture, transparent: true })
    const stickLabelMesh = new THREE.Mesh(stickLabelGeo, stickLabelMat)
    stickLabelMesh.position.set(0, 0.45, 0.022)
    mainStickGroup.add(stickLabelMesh)

    // 6. パーティクルシステム（金粉＆桜の花びら）
    // 金粉パーティクル
    const goldCount = 60
    const goldGeo = new THREE.BufferGeometry()
    const goldPositions = new Float32Array(goldCount * 3)
    const goldSpeeds = new Float32Array(goldCount)
    for (let i = 0; i < goldCount; i++) {
      goldPositions[i * 3] = (Math.random() - 0.5) * 4
      goldPositions[i * 3 + 1] = Math.random() * 5 - 2
      goldPositions[i * 3 + 2] = (Math.random() - 0.5) * 4
      goldSpeeds[i] = 0.3 + Math.random() * 0.5
    }
    goldGeo.setAttribute('position', new THREE.BufferAttribute(goldPositions, 3))
    const goldParticleMat = new THREE.PointsMaterial({
      color: 0xffd700,
      size: 0.09,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    })
    const goldPoints = new THREE.Points(goldGeo, goldParticleMat)
    scene.add(goldPoints)

    // 桜の花びらパーティクル
    const petalCount = 24
    const petalGroup = new THREE.Group()
    scene.add(petalGroup)
    const petalMeshes: { mesh: THREE.Mesh; rotSpeed: THREE.Vector3; fallSpeed: number }[] = []

    const petalShape = new THREE.Shape()
    petalShape.moveTo(0, 0)
    petalShape.bezierCurveTo(0.08, 0.08, 0.12, 0.22, 0, 0.3)
    petalShape.bezierCurveTo(-0.12, 0.22, -0.08, 0.08, 0, 0)
    const petalGeo = new THREE.ShapeGeometry(petalShape)
    const petalMat = new THREE.MeshStandardMaterial({
      color: 0xffb7c5,
      side: THREE.DoubleSide,
      roughness: 0.5,
      transparent: true,
      opacity: 0.85,
    })

    for (let i = 0; i < petalCount; i++) {
      const petal = new THREE.Mesh(petalGeo, petalMat)
      petal.position.set(
        (Math.random() - 0.5) * 5,
        Math.random() * 6 - 1,
        (Math.random() - 0.5) * 5
      )
      petal.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
      petalGroup.add(petal)
      petalMeshes.push({
        mesh: petal,
        rotSpeed: new THREE.Vector3(Math.random() * 0.03, Math.random() * 0.04, Math.random() * 0.02),
        fallSpeed: 0.25 + Math.random() * 0.35,
      })
    }

    // 7. Raycaster によるホバー＆クリック判定（直感操作）
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    const clickableMeshes = [cylinderMesh, signMesh, topRing, bottomRing, capMesh]
    let isHovered = false

    const handlePointerMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(clickableMeshes)

      if (intersects.length > 0) {
        if (!isHovered) {
          isHovered = true
          container.style.cursor = 'pointer'
          goldOrnamentMat.emissive.setHex(0x553d10)
        }
      } else {
        if (isHovered) {
          isHovered = false
          container.style.cursor = 'grab'
          goldOrnamentMat.emissive.setHex(0x000000)
        }
      }
    }

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(clickableMeshes)

      if (intersects.length > 0) {
        onDrawRef.current?.()
      }
    }

    renderer.domElement.addEventListener('pointermove', handlePointerMove)
    renderer.domElement.addEventListener('click', handleClick)

    // 8. アニメーションループ（performance.now による高精度タイムステップ）
    let animationFrameId: number
    let lastTime = performance.now()
    const startTime = performance.now()
    let shakePhase = 0

    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate)
      const nowTime = currentTime || performance.now()
      const delta = Math.min((nowTime - lastTime) / 1000, 0.1)
      lastTime = nowTime
      const time = (nowTime - startTime) / 1000

      controls.update()

      // 金粉パーティクルの上昇運動
      const gPos = goldGeo.attributes.position.array as Float32Array
      for (let i = 0; i < goldCount; i++) {
        gPos[i * 3 + 1] += delta * goldSpeeds[i]
        if (gPos[i * 3 + 1] > 3.2) {
          gPos[i * 3 + 1] = -1.8
          gPos[i * 3] = (Math.random() - 0.5) * 4
        }
      }
      goldGeo.attributes.position.needsUpdate = true

      // 桜の花びらの舞い落ち運動
      petalMeshes.forEach((p) => {
        p.mesh.position.y -= delta * p.fallSpeed
        p.mesh.rotation.x += p.rotSpeed.x
        p.mesh.rotation.y += p.rotSpeed.y
        p.mesh.rotation.z += p.rotSpeed.z
        if (p.mesh.position.y < -2.2) {
          p.mesh.position.y = 3.8
          p.mesh.position.x = (Math.random() - 0.5) * 5
        }
      })

      if (isShakingRef.current) {
        // 激しいリアルシェイク（傾き・回転・上下振動）
        shakePhase += delta * 32
        cylinderGroup.rotation.z = Math.sin(shakePhase) * 0.42
        cylinderGroup.rotation.x = Math.cos(shakePhase * 0.8) * 0.32 + 0.15
        cylinderGroup.position.y = Math.sin(shakePhase * 1.8) * 0.22
        cylinderGroup.rotation.y += delta * 2.8

        mainStickGroup.visible = true
        mainStickGroup.position.y = 0.4 + Math.sin(shakePhase * 2.2) * 0.15
        warmPointLight.intensity = 4.5 + Math.sin(shakePhase * 3) * 1.5
      } else if (isRevealedRef.current) {
        // 結果開示：主役のみくじ棒が黄金光と共にせり出し、静かに回転
        cylinderGroup.position.y = THREE.MathUtils.lerp(cylinderGroup.position.y, 0, delta * 4)
        cylinderGroup.rotation.z = THREE.MathUtils.lerp(cylinderGroup.rotation.z, 0, delta * 4)
        cylinderGroup.rotation.x = THREE.MathUtils.lerp(cylinderGroup.rotation.x, 0.08, delta * 4)
        cylinderGroup.rotation.y += delta * 0.4

        mainStickGroup.visible = true
        mainStickGroup.position.y = THREE.MathUtils.lerp(mainStickGroup.position.y, 1.95, delta * 3.5)
        topGlowLight.intensity = THREE.MathUtils.lerp(topGlowLight.intensity, 3.5, delta * 2)
      } else {
        // 待機時：自然な呼吸の浮遊感
        cylinderGroup.position.y = Math.sin(time * 1.8) * 0.05
        cylinderGroup.rotation.z = THREE.MathUtils.lerp(cylinderGroup.rotation.z, 0, delta * 6)
        cylinderGroup.rotation.x = THREE.MathUtils.lerp(cylinderGroup.rotation.x, 0, delta * 6)
        mainStickGroup.visible = false
        mainStickGroup.position.y = 0.2
        topGlowLight.intensity = 1.2
      }

      renderer.render(scene, camera)
    }

    animate(performance.now())

    // 9. リサイズ対応
    const handleResize = () => {
      if (!container) return
      const newWidth = container.clientWidth || 360
      const newHeight = container.clientHeight || 300
      camera.aspect = newWidth / newHeight
      camera.updateProjectionMatrix()
      renderer.setSize(newWidth, newHeight)
    }
    window.addEventListener('resize', handleResize)

    // 10. メモリの確実なクリーンアップ
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      renderer.domElement.removeEventListener('pointermove', handlePointerMove)
      renderer.domElement.removeEventListener('click', handleClick)
      controls.dispose()

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }

      cylinderGeo.dispose()
      ringGeo.dispose()
      capGeo.dispose()
      baseGeo.dispose()
      baseGoldRingGeo.dispose()
      holeRimGeo.dispose()
      holeInnerGeo.dispose()
      signGeo.dispose()
      mainStickGeo.dispose()
      tipGeo.dispose()
      stickLabelGeo.dispose()
      goldGeo.dispose()
      petalGeo.dispose()

      lacquerMat.dispose()
      goldOrnamentMat.dispose()
      baseMat.dispose()
      holeInnerMat.dispose()
      signMat.dispose()
      stickMat.dispose()
      tipMat.dispose()
      stickLabelMat.dispose()
      goldParticleMat.dispose()
      petalMat.dispose()

      signTexture.dispose()
      stickTexture.dispose()

      renderer.dispose()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="w-full h-72 relative flex items-center justify-center select-none"
      style={{ touchAction: 'none' }}
    />
  )
}

export default OmikujiCylinder3D
