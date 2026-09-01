import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, ContactShadows, Sparkles, Float } from "@react-three/drei";
import { Suspense, useMemo, useRef, useState, useEffect } from "react";
import * as THREE from "three";

/** Builds one cannabis-style leaf blade as an extruded shape. */
function useBladeGeometry(length: number, width: number) {
  return useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.bezierCurveTo(width * 0.5, length * 0.25, width * 0.55, length * 0.6, 0, length);
    s.bezierCurveTo(-width * 0.55, length * 0.6, -width * 0.5, length * 0.25, 0, 0);
    const g = new THREE.ExtrudeGeometry(s, {
      depth: 0.06,
      bevelEnabled: true,
      bevelSize: 0.05,
      bevelThickness: 0.05,
      bevelSegments: 3,
      curveSegments: 24,
    });
    g.center();
    return g;
  }, [length, width]);
}

function Blade({
  length,
  width,
  rotation,
  position,
  material,
}: {
  length: number;
  width: number;
  rotation: [number, number, number];
  position: [number, number, number];
  material: THREE.Material;
}) {
  const geo = useBladeGeometry(length, width);
  return (
    <mesh geometry={geo} material={material} rotation={rotation} position={position} castShadow receiveShadow />
  );
}

function Daisy({ position }: { position: [number, number, number] }) {
  const petals = useMemo(() => Array.from({ length: 10 }, (_, i) => (i / 10) * Math.PI * 2), []);
  const ref = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (ref.current) ref.current.rotation.y = s.clock.elapsedTime * 0.6;
  });
  return (
    <group ref={ref} position={position} rotation={[Math.PI / 2.6, 0, 0]}>
      {petals.map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * 0.32, Math.sin(a) * 0.32, 0]} rotation={[0, 0, a]} castShadow>
          <capsuleGeometry args={[0.09, 0.2, 4, 10]} />
          <meshStandardMaterial color="#fdfcf7" roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, 0, 0.06]} castShadow>
        <sphereGeometry args={[0.17, 24, 24]} />
        <meshStandardMaterial color="#f2c14a" roughness={0.4} />
      </mesh>
    </group>
  );
}

type FaceState = { blinkL: number; blinkR: number; look: THREE.Vector2 };

function Eye({ x, side, face }: { x: number; side: "L" | "R"; face: React.MutableRefObject<FaceState> }) {
  const pupil = useRef<THREE.Group>(null);
  const lid = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const f = face.current;
    if (pupil.current) {
      pupil.current.position.x = f.look.x * 0.09;
      pupil.current.position.y = f.look.y * 0.07;
    }
    if (lid.current) {
      const b = side === "L" ? f.blinkL : f.blinkR;
      lid.current.position.y = 0.28 - b * 0.28;
      lid.current.scale.y = Math.max(b, 0.001);
    }
  });

  return (
    <group position={[x, 0.55, 0.62]}>
      <mesh>
        <sphereGeometry args={[0.28, 32, 32]} />
        <meshStandardMaterial color="#ffffff" roughness={0.25} />
      </mesh>
      <group ref={pupil} position={[0, 0, 0.19]}>
        <mesh>
          <sphereGeometry args={[0.14, 24, 24]} />
          <meshStandardMaterial color="#3b2416" roughness={0.2} />
        </mesh>
        <mesh position={[0.05, 0.05, 0.1]}>
          <sphereGeometry args={[0.045, 16, 16]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.4} />
        </mesh>
      </group>
      {/* eyelid for blinking */}
      <mesh ref={lid} position={[0, 0.28, 0.06]} scale={[1, 0.001, 1]}>
        <sphereGeometry args={[0.295, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#5aa845" roughness={0.6} />
      </mesh>
    </group>
  );
}


type Expression = "happy" | "wink" | "surprised" | "chill";

function Character({ pointer }: { pointer: React.MutableRefObject<THREE.Vector2> }) {
  const root = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const leftArm = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);
  const mouth = useRef<THREE.Mesh>(null);
  const browL = useRef<THREE.Mesh>(null);
  const browR = useRef<THREE.Mesh>(null);
  const exprRef = useRef<Expression>("happy");
  // smoothed drivers so expression changes ease in instead of popping
  const drive = useRef({ surprise: 0, chill: 0, wink: 0 });
  const face = useRef<FaceState>({ blinkL: 0, blinkR: 0, look: new THREE.Vector2() });

  useEffect(() => {
    const order: Expression[] = ["happy", "wink", "chill", "surprised"];
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % order.length;
      exprRef.current = order[i];
    }, 4200);
    return () => clearInterval(id);
  }, []);

  const body = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#65b34a",
        roughness: 0.35,
        metalness: 0.05,
        clearcoat: 0.6,
        clearcoatRoughness: 0.5,
        sheen: 0.4,
        sheenColor: new THREE.Color("#c8f0a0"),
      }),
    []
  );

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.05);
    const ease = (current: number, target: number, speed: number) =>
      current + (target - current) * (1 - Math.exp(-speed * dt));

    const expr = exprRef.current;
    const d = drive.current;
    d.surprise = ease(d.surprise, expr === "surprised" ? 1 : 0, 5);
    d.chill = ease(d.chill, expr === "chill" ? 1 : 0, 5);
    d.wink = ease(d.wink, expr === "wink" ? 1 : 0, 9);

    // smooth look target from pointer
    face.current.look.lerp(pointer.current, 1 - Math.exp(-6 * dt));
    const look = face.current.look;

    if (root.current) {
      // idle bob + gentle bend/sway of the whole plant
      root.current.position.y = Math.sin(t * 1.4) * 0.12 - 0.1;
      root.current.rotation.z = Math.sin(t * 0.8) * 0.05;
      root.current.rotation.y = look.x * 0.45 + Math.sin(t * 0.5) * 0.08;
      root.current.rotation.x = -look.y * 0.18;
    }
    if (head.current) {
      // counter-bend so the top leans like a stem in a breeze
      head.current.rotation.z = -Math.sin(t * 0.8 + 0.6) * 0.09;
      head.current.rotation.x = Math.sin(t * 1.1) * 0.04;
    }
    if (rightArm.current) {
      const wave = 1 + d.surprise * 0.5;
      rightArm.current.rotation.z = -0.9 - Math.sin(t * 4) * 0.55 * wave;
    }
    if (leftArm.current) {
      leftArm.current.rotation.z = 0.7 + Math.sin(t * 1.6) * 0.16;
    }
    if (mouth.current) {
      const open = 1 + d.surprise * 0.5 - d.chill * 0.5;
      const s = open * (1 + Math.sin(t * 3) * 0.08);
      mouth.current.scale.set(1, s, 1);
    }
    if (browL.current) browL.current.rotation.z = 0.12 + d.surprise * 0.13;
    if (browR.current) browR.current.rotation.z = -0.12 - d.surprise * 0.13;

    // blinking — smooth triangular envelope instead of a hard on/off flip
    const cycle = 4.5;
    const phase = t % cycle;
    const blinkDur = 0.18;
    const raw = phase > cycle - blinkDur ? 1 - Math.abs(((phase - (cycle - blinkDur)) / blinkDur) * 2 - 1) : 0;
    const soft = raw * raw * (3 - 2 * raw);
    face.current.blinkL = Math.max(soft, d.chill * 0.75);
    face.current.blinkR = Math.max(soft, d.chill * 0.75, d.wink);
  });


  return (
    <group ref={root} scale={1.18} position={[0, 0.1, 0]}>
      <group ref={head}>
        {/* central blade / face */}
        <Blade length={3.2} width={1.9} rotation={[0, 0, 0]} position={[0, 0.35, 0]} material={body} />
        {/* leaf vein highlight on central blade */}
        <mesh position={[0, 0.35, 0.12]}>
          <capsuleGeometry args={[0.03, 2.4, 4, 8]} />
          <meshStandardMaterial color="#8fd06a" roughness={0.4} emissive="#4c8f36" emissiveIntensity={0.35} />
        </mesh>
        {/* side blades */}
        <Blade length={2.5} width={1.5} rotation={[0, 0, 0.72]} position={[-1.15, -0.15, -0.08]} material={body} />
        <Blade length={2.5} width={1.5} rotation={[0, 0, -0.72]} position={[1.15, -0.15, -0.08]} material={body} />
        <Blade length={1.9} width={1.2} rotation={[0, 0, 1.32]} position={[-1.85, -1.0, -0.16]} material={body} />
        <Blade length={1.9} width={1.2} rotation={[0, 0, -1.32]} position={[1.85, -1.0, -0.16]} material={body} />

        <Daisy position={[0, 1.95, 0.15]} />

        {/* face */}
        <Eye x={-0.42} side="L" face={face} />
        <Eye x={0.42} side="R" face={face} />

        {/* brows */}
        <mesh ref={browL} position={[-0.44, 0.95, 0.62]} rotation={[0, 0, 0.12]}>
          <boxGeometry args={[0.34, 0.07, 0.07]} />
          <meshStandardMaterial color="#3a3a34" roughness={0.6} />
        </mesh>
        <mesh ref={browR} position={[0.44, 0.95, 0.62]} rotation={[0, 0, -0.12]}>
          <boxGeometry args={[0.34, 0.07, 0.07]} />
          <meshStandardMaterial color="#3a3a34" roughness={0.6} />
        </mesh>


        {/* mouth */}
        <mesh ref={mouth} position={[0, 0.02, 0.6]} scale={[1, 1, 1]}>
          <sphereGeometry args={[0.3, 28, 20, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
          <meshStandardMaterial color="#5a2230" roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.16, 0.66]} scale={[0.7, 0.4, 0.5]}>
          <sphereGeometry args={[0.2, 20, 16]} />
          <meshStandardMaterial color="#e2757f" roughness={0.5} />
        </mesh>

        {/* cheeks */}
        <mesh position={[-0.95, 0.3, 0.52]} scale={[1, 0.65, 0.3]}>
          <sphereGeometry args={[0.22, 20, 20]} />
          <meshStandardMaterial color="#f0a07a" transparent opacity={0.55} roughness={0.8} />
        </mesh>
        <mesh position={[0.95, 0.3, 0.52]} scale={[1, 0.65, 0.3]}>
          <sphereGeometry args={[0.22, 20, 20]} />
          <meshStandardMaterial color="#f0a07a" transparent opacity={0.55} roughness={0.8} />
        </mesh>
      </group>

      {/* arms */}
      <group ref={leftArm} position={[-1.55, -0.55, 0.25]}>
        <mesh position={[-0.35, 0.1, 0]} rotation={[0, 0, Math.PI / 2.2]} castShadow>
          <capsuleGeometry args={[0.13, 0.55, 6, 14]} />
          <meshStandardMaterial color="#6fbc52" roughness={0.45} />
        </mesh>
        <mesh position={[-0.72, 0.34, 0]} castShadow>
          <sphereGeometry args={[0.22, 20, 20]} />
          <meshStandardMaterial color="#6fbc52" roughness={0.45} />
        </mesh>
      </group>
      <group ref={rightArm} position={[1.55, -0.55, 0.25]}>
        <mesh position={[0.35, 0.1, 0]} rotation={[0, 0, -Math.PI / 2.2]} castShadow>
          <capsuleGeometry args={[0.13, 0.55, 6, 14]} />
          <meshStandardMaterial color="#6fbc52" roughness={0.45} />
        </mesh>
        <mesh position={[0.72, 0.34, 0]} castShadow>
          <sphereGeometry args={[0.22, 20, 20]} />
          <meshStandardMaterial color="#6fbc52" roughness={0.45} />
        </mesh>
      </group>

      {/* legs */}
      {[-0.45, 0.45].map((x) => (
        <group key={x}>
          <mesh position={[x, -1.85, 0]} castShadow>
            <capsuleGeometry args={[0.14, 0.5, 6, 14]} />
            <meshStandardMaterial color="#6fbc52" roughness={0.45} />
          </mesh>
          <mesh position={[x, -2.25, 0.14]} scale={[1, 0.7, 1.35]} castShadow>
            <sphereGeometry args={[0.24, 20, 20]} />
            <meshStandardMaterial color="#4e9b3b" roughness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function PointerTracker({ pointer }: { pointer: React.MutableRefObject<THREE.Vector2> }) {
  const { viewport } = useThree();
  useFrame((state) => {
    pointer.current.set(state.pointer.x, state.pointer.y);
    void viewport;
  });
  return null;
}

const Cuddles3D = () => {
  const pointer = useRef(new THREE.Vector2());
  const [reduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  return (
    <div className="relative h-[460px] w-full sm:h-[540px] lg:h-[640px]" aria-hidden="true">
      <div className="pointer-events-none absolute inset-6 -z-10 rounded-[3rem] bg-gradient-to-tr from-hippie-coral/20 via-transparent to-hippie-sage/20 blur-3xl" />
      <Canvas
        shadows
        dpr={[1, 1.8]}
        frameloop={reduced ? "demand" : "always"}
        camera={{ position: [0, 0.1, 11.5], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight
          position={[4, 6, 5]}
          intensity={2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-5, 2, -3]} intensity={0.7} color="#ffb98a" />
        {/* warm rim light from behind for silhouette pop */}
        <spotLight position={[0, 4, -6]} intensity={1.4} color="#ffb27a" angle={0.7} penumbra={1} />
        <Suspense fallback={null}>
          <Environment resolution={128}>
            <Lightformer intensity={2} position={[0, 5, 2]} scale={[10, 10, 1]} />
            <Lightformer intensity={1.2} color="#ff9a76" position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[16, 2, 1]} />
            <Lightformer intensity={1} color="#8fd3a5" position={[5, 1, -1]} rotation-y={-Math.PI / 2} scale={[16, 2, 1]} />
          </Environment>
          <PointerTracker pointer={pointer} />
          <Float speed={1.2} rotationIntensity={0.08} floatIntensity={0.15}>
            <Character pointer={pointer} />
          </Float>
          {/* glowing halo ring behind the character */}
          <mesh position={[0, 0.1, -1.6]}>
            <torusGeometry args={[3.1, 0.05, 16, 100]} />
            <meshStandardMaterial color="#ffb98a" emissive="#ff8f5e" emissiveIntensity={2.2} toneMapped={false} />
          </mesh>
          <Sparkles count={45} scale={[8, 7, 4]} position={[0, 0.5, 0]} size={3.2} speed={0.35} color="#ffd9a8" opacity={0.6} />
          <ContactShadows position={[0, -2.75, 0]} opacity={0.5} scale={13} blur={2.8} far={5.5} color="#1a0f1f" />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Cuddles3D;
