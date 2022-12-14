import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Edges, PerspectiveCamera, useHelper, Cone } from "@react-three/drei"
import {
  createContext,
  MutableRefObject,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"
import {
  BufferAttribute,
  BufferGeometry,
  CameraHelper,
  DirectionalLight,
  DirectionalLightHelper,
  Float32BufferAttribute,
  Line,
  LineBasicMaterial,
  MathUtils,
  Mesh,
  PerspectiveCamera as PerspectiveCameraImpl,
  TextureLoader,
} from "three"
import gsap from "gsap"
import { EffectComposer, DepthOfField, Noise } from "@react-three/postprocessing"
import useShadowHelper from "./hooks/useShadowHelper"
import { Physics, useBox, usePlane } from "@react-three/cannon"

const loader = new TextureLoader()

const context = createContext<{ control: any }>({
  control: null,
})

const SomeEffect = () => {
  return (
    <EffectComposer>
      {/* <DepthOfField focusDistance={0} focalLength={0.02} bokehScale={2} height={480} /> */}
      {/* <Noise/> */}
    </EffectComposer>
  )
}

const Box = () => {
  const [clicked, setClicked] = useState(false)
  const ctx = useContext(context)
  // const el = useRef<Mesh>(null)
  useFrame((state) => {
    // state.camera.lookAt(10, 10, 10)
    // console.log("???")
    // if (clicked) {
    //   state.camera.lookAt(el.current!.position)
    //   // state.camera.position.lerp
    // }
    // state.camera.lookAt(el.current.position)
  })
  const state = useThree()

  const [el, api] = useBox(() => ({
    mass: 1,
    position: [4, 0, 0],
  }))

  useLayoutEffect(() => {
    const target = { n: 0 }
    gsap.to(target, {
      n: 1,
      duration: 2,
      repeat: -1,
      ease: "none",
      onUpdate() {
        api.rotation.set(0, MathUtils.lerp(0, Math.PI * 2, target.n), 0)
      },
    })
  }, [])

  return (
    <mesh
      ref={el}
      onClick={(e) => {
        setClicked(true)
        const target = { n: 0 }
        gsap.to(target, {
          n: 1,
          duration: 1,
          onUpdate() {
            // e.camera.rotateX(target.n)
            ctx.control.current.target.lerp(e.object.position, target.n)
          },
        })
        api.velocity.set(0, 20, 0)
      }}
      castShadow
    >
      <meshStandardMaterial map={loader.load("/tater.jpeg")}></meshStandardMaterial>
      <boxGeometry args={[1, 1, 1]}></boxGeometry>
      <Edges color="gray" scale={1.1} threshold={15} />
      <Cone position={[-4, 0, 0]} />
    </mesh>
  )
}

const Sphere = () => {
  return (
    <mesh position={[-6, 0, 0]} castShadow>
      <meshNormalMaterial wireframe></meshNormalMaterial>
      <sphereGeometry args={[3, 100, 100]}></sphereGeometry>
      <Edges color="gray" scale={1.1} threshold={15} />
    </mesh>
  )
}

const Floor = () => {
  const [el] = usePlane(() => ({
    position: [0, -4, 0],
    rotation: [-Math.PI / 2, 0, 0],
  }))
  return (
    <mesh ref={el} receiveShadow>
      <meshPhongMaterial></meshPhongMaterial>
      <planeGeometry args={[20, 20]}></planeGeometry>
    </mesh>
  )
}

const useCameraControl = (controlRef: MutableRefObject<any>) => {
  useEffect(() => {
    window.addEventListener("keydown", (e) => {
      console.log(e.code)
      switch (e.code) {
        case "KeyW": {
          gsap.to(controlRef.current.object.position, {
            z: controlRef.current.object.position.z - 0.5,
            duration: 0.6,
            overwrite: true,
          })
          break
        }
        case "KeyS": {
          gsap.to(controlRef.current.object.position, {
            z: controlRef.current.object.position.z + 0.5,
            duration: 0.6,
            overwrite: true,
          })
          break
        }
        case "KeyA": {
          gsap.to(controlRef.current.object.position, {
            x: controlRef.current.object.position.x - 0.5,
            duration: 0.6,
            overwrite: true,
          })
          break
        }
        case "KeyD": {
          gsap.to(controlRef.current.object.position, {
            x: controlRef.current.object.position.x + 0.5,
            duration: 0.6,
            overwrite: true,
          })
          break
        }
        case "KeyQ": {
          gsap.to(controlRef.current.object.position, {
            y: controlRef.current.object.position.y + 0.5,
            duration: 0.6,
            overwrite: true,
          })
          break
        }
        case "KeyE": {
          gsap.to(controlRef.current.object.position, {
            y: controlRef.current.object.position.y - 0.5,
            duration: 0.6,
            overwrite: true,
          })
          break
        }
      }
    })
  }, [])
}

const Linee = () => {
  const state = useThree()
  useEffect(() => {
    const geometry = new BufferGeometry()
    const material = new LineBasicMaterial({ vertexColors: true })
    const positions = [-2, 1, 0, 2, 2, 0, 2, 6, 1]
    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3))
    geometry.setAttribute(
      "color",
      new BufferAttribute(new Float32Array([0.1, 0.2, 0.9, 1, 0.1, 0.1, 0, 1, 0.5, 0.2, 0.1, 1]), 4)
    )
    // const morphTarget = new Float32BufferAttribute([-2, 1, 0, 2, 2, 0, 2, 6, 1], 3)
    // morphTarget.name = "target1"

    // geometry.morphAttributes.position = [morphTarget]
    // geometry.computeBoundingSphere()

    const line = new Line(geometry, material)
    state.scene.add(line)
  })
  return <></>
}

const Root = () => {
  const scene = useThree((state) => state.scene)
  const controlRef = useRef<any>()
  const cameraRef = useRef<PerspectiveCameraImpl>()
  const lightRef = useRef<DirectionalLight>(null)
  // useHelper(cameraRef, CameraHelper)
  useShadowHelper(lightRef)
  useEffect(() => {
    console.log(lightRef)
    lightRef.current!.shadow.camera.left = -10
  }, [])
  useCameraControl(controlRef)

  return (
    <context.Provider value={{ control: controlRef }}>
      <SomeEffect />
      <PerspectiveCamera ref={cameraRef} position={[100, 5, 5]}></PerspectiveCamera>
      <OrbitControls ref={controlRef} camera={cameraRef.current} />
      <ambientLight />
      <directionalLight
        ref={lightRef}
        castShadow
        color="red"
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0001}
      />
      <gridHelper></gridHelper>
      <axesHelper args={[4]}></axesHelper>
      <Box />
      <Sphere />
      <Linee />
      <Floor />
    </context.Provider>
  )
}

type WrapperProps = {
  children?: React.ReactNode
}

const Wrapper = (props: WrapperProps) => {
  return (
    <Canvas camera={{ position: [0, 0, 10] }} gl={{ antialias: true }} shadows>
      {/* <fog attach="fog" color="hotpink" near={1} far={50} /> */}
      <Physics>{props.children}</Physics>
    </Canvas>
  )
}

const App = () => (
  <Wrapper>
    <Root />
  </Wrapper>
)

export default App
