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
  CameraHelper,
  DirectionalLight,
  DirectionalLightHelper,
  MathUtils,
  Mesh,
  PerspectiveCamera as PerspectiveCameraImpl,
} from "three"
import gsap from "gsap"
import useShadowHelper from "./hooks/useShadowHelper"

const context = createContext<{ control: any }>({
  control: null,
})

const Box = () => {
  const [clicked, setClicked] = useState(false)
  const ctx = useContext(context)
  const el = useRef<Mesh>(null)
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

  useLayoutEffect(() => {
    const target = { n: 0 }
    gsap.to(target, {
      n: 1,
      duration: 2,
      repeat: -1,
      ease: "none",
      onUpdate() {
        el.current!.rotation.y = MathUtils.lerp(0, Math.PI * 2, target.n)
      },
    })
  }, [])

  return (
    <mesh
      ref={el}
      position={[5, 0, 0]}
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
      }}
      castShadow
    >
      <meshStandardMaterial color="#28bea0"></meshStandardMaterial>
      <boxGeometry args={[1, 1, 1]}></boxGeometry>
      <Edges color="gray" scale={1.1} threshold={15} />
      <Cone position={[-4, 0, 0]} />
    </mesh>
  )
}

const Sphere = () => {
  return (
    <mesh position={[-2, 0, 0]} castShadow>
      <meshNormalMaterial wireframe></meshNormalMaterial>
      <sphereGeometry args={[3, 100, 100]}></sphereGeometry>
      <Edges color="gray" scale={1.1} threshold={15} />
    </mesh>
  )
}

const Floor = () => {
  return (
    <mesh position={[0, -4, 0]} rotation={[-1.55, 0, 0]} receiveShadow>
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
      {props.children}
    </Canvas>
  )
}

const App = () => (
  <Wrapper>
    <Root />
  </Wrapper>
)

export default App
