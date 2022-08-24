import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Edges } from "@react-three/drei"
import { createContext, useContext, useEffect, useRef, useState } from "react"
import { Mesh } from "three"
import gsap from "gsap"

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
            e.camera.rotateX(target.n)
            ctx.control.current.target.lerp(e.object.position, target.n)
          },
        })
      }}
      castShadow
    >
      <meshStandardMaterial color="#28bea0"></meshStandardMaterial>
      <boxGeometry args={[1, 1, 1]}></boxGeometry>
      <Edges color="gray" scale={1.1} threshold={15} />
    </mesh>
  )
}

const Sphere = () => {
  return (
    <mesh position={[-5, 0, 0]} castShadow>
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

const App = () => {
  const controlRef = useRef<any>()
  return (
    <Canvas camera={{ position: [0, 0, 10] }} gl={{ antialias: true }} shadows>
      <context.Provider value={{ control: controlRef }}>
        <OrbitControls ref={controlRef} />
        <ambientLight />
        <directionalLight castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0001} />
        <gridHelper></gridHelper>
        <axesHelper args={[4]}></axesHelper>
        <Box />
        <Sphere />
        <Floor />
      </context.Provider>
    </Canvas>
  )
}

export default App
