import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { SceneFallback } from "./SceneFallback.jsx";
import { useMediaQuery, usePrefersReducedMotion } from "../../utils/motion.js";

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

export function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.65} />
      <pointLight color="#4a7cff" intensity={3.2} position={[0, 0.4, 2.8]} />
      <pointLight color="#667eea" intensity={1.5} position={[-2.8, 1.8, 1.8]} />
      <directionalLight color="#dbeafe" intensity={1.6} position={[3.6, 4, 4]} />
    </>
  );
}

export function SynapseCore({ reducedMotion }) {
  const groupRef = useRef(null);

  useFrame((state) => {
    if (reducedMotion || !groupRef.current) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.35;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.55) * 0.08;
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[0.48, 48, 48]} />
        <meshStandardMaterial color="#6b8cff" emissive="#4a7cff" emissiveIntensity={1.35} roughness={0.2} metalness={0.15} />
      </mesh>
      <mesh scale={1.24}>
        <sphereGeometry args={[0.48, 32, 32]} />
        <meshBasicMaterial color="#dbeaff" transparent opacity={0.12} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.72, 0.012, 12, 80]} />
        <meshBasicMaterial color="#667eea" transparent opacity={0.75} />
      </mesh>
      <mesh rotation={[0.7, 0.2, 0.85]}>
        <torusGeometry args={[0.92, 0.01, 12, 80]} />
        <meshBasicMaterial color="#764ba2" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

function FloatingGroup({ children, compact, position, reducedMotion, rotation, speed }) {
  const groupRef = useRef(null);
  const baseY = position[1];

  useFrame((state) => {
    if (reducedMotion || !groupRef.current) return;
    const elapsed = state.clock.elapsedTime * speed;
    groupRef.current.position.y = baseY + Math.sin(elapsed) * (compact ? 0.035 : 0.07);
    groupRef.current.rotation.z = rotation[2] + Math.sin(elapsed * 0.8) * 0.035;
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {children}
    </group>
  );
}

function ConnectionLine({ points, color = "#4a7cff", opacity = 0.5 }) {
  const positions = useMemo(() => new Float32Array(points.flat()), [points]);

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color={color} transparent opacity={opacity} />
    </line>
  );
}

function StudyCard({ card, compact, reducedMotion }) {
  return (
    <FloatingGroup compact={compact} position={card.position} reducedMotion={reducedMotion} rotation={card.rotation} speed={card.speed}>
      <mesh>
        <boxGeometry args={[card.width, 0.74, 0.05]} />
        <meshStandardMaterial color={card.color} roughness={0.32} metalness={0.12} transparent opacity={0.9} />
      </mesh>
      <mesh position={[-card.width / 2 + 0.15, 0.24, 0.04]}>
        <boxGeometry args={[0.2, 0.08, 0.018]} />
        <meshBasicMaterial color={card.tagColor} transparent opacity={0.92} />
      </mesh>
      <mesh position={[-0.05, 0.02, 0.045]}>
        <boxGeometry args={[card.width - 0.34, 0.055, 0.012]} />
        <meshBasicMaterial color="#dbeaff" transparent opacity={0.82} />
      </mesh>
      <mesh position={[-0.19, -0.13, 0.045]}>
        <boxGeometry args={[card.width - 0.62, 0.045, 0.012]} />
        <meshBasicMaterial color="#eef4ff" transparent opacity={0.82} />
      </mesh>
      <ConnectionLine
        points={[
          [-card.width / 2 + 0.12, -0.26, 0.06],
          [card.width / 2 - 0.14, -0.26, 0.06]
        ]}
        color={card.tagColor}
        opacity={0.65}
      />
    </FloatingGroup>
  );
}

export function FloatingStudyCards({ compact, reducedMotion }) {
  const cards = useMemo(() => [
    {
      label: "Uploaded PDF: Biology Lecture",
      shortLabel: "Uploaded PDF",
      position: [-1.9, 0.9, -0.15],
      rotation: [0.05, 0.42, -0.14],
      width: 1.38,
      color: "#eef4ff",
      tagColor: "#4a7cff",
      speed: 1.2
    },
    {
      label: "Structured notes appearing",
      shortLabel: "Notes",
      position: [1.72, 0.7, 0.08],
      rotation: [-0.04, -0.45, 0.13],
      width: 1.36,
      color: "#f6f8ff",
      tagColor: "#667eea",
      speed: 1.05
    },
    {
      label: "Practice question generated",
      shortLabel: "Question",
      position: [-1.35, -1.08, 0.18],
      rotation: [0.08, 0.22, 0.2],
      width: 1.28,
      color: "#fff8ea",
      tagColor: "#764ba2",
      speed: 1.15
    },
    {
      label: "Feedback score improving",
      shortLabel: "Feedback",
      position: [1.52, -1.0, -0.05],
      rotation: [-0.05, -0.34, -0.18],
      width: 1.26,
      color: "#fcfdff",
      tagColor: "#6b8cff",
      speed: 1.25
    }
  ], []);

  return (
    <group>
      {cards.slice(0, compact ? 3 : cards.length).map((card) => (
        <StudyCard card={card} compact={compact} key={card.label} reducedMotion={reducedMotion} />
      ))}
    </group>
  );
}

export function MindMapCluster({ compact }) {
  const nodes = compact
    ? [[0.1, 1.18, -0.15], [0.78, 1.34, -0.12], [-0.6, 1.33, -0.08]]
    : [[0.1, 1.22, -0.18], [0.85, 1.38, -0.12], [-0.72, 1.38, -0.08], [0.48, 1.76, -0.2], [-0.28, 1.72, -0.16]];

  return (
    <group>
      {nodes.slice(1).map((node, index) => (
        <ConnectionLine points={[nodes[0], node]} color="#667eea" opacity={0.68} key={`map-line-${index}`} />
      ))}
      {nodes.map((node, index) => (
        <mesh key={`map-node-${index}`} position={node}>
          <sphereGeometry args={[index === 0 ? 0.11 : 0.075, 20, 20]} />
          <meshStandardMaterial color={index === 0 ? "#4a7cff" : "#667eea"} emissive={index === 0 ? "#4a7cff" : "#764ba2"} emissiveIntensity={0.45} />
        </mesh>
      ))}
    </group>
  );
}

export function ConnectionLines({ compact }) {
  const targets = compact
    ? [[-1.35, 0.7, -0.15], [1.28, 0.55, 0.08], [0.1, 1.08, -0.15]]
    : [[-1.45, 0.75, -0.15], [1.35, 0.56, 0.08], [-1.02, -0.82, 0.18], [1.15, -0.76, -0.05], [0.1, 1.08, -0.15]];

  return (
    <group>
      {targets.map((target, index) => (
        <ConnectionLine points={[[0, 0, 0], target]} color={index % 2 ? "#667eea" : "#4a7cff"} opacity={0.44} key={`core-line-${index}`} />
      ))}
    </group>
  );
}

export function ParticleField({ compact, reducedMotion }) {
  const pointsRef = useRef(null);
  const count = compact ? 34 : 72;
  const positions = useMemo(() => {
    const values = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      values[index * 3] = (Math.random() - 0.5) * (compact ? 4.1 : 5.2);
      values[index * 3 + 1] = (Math.random() - 0.5) * (compact ? 2.7 : 3.4);
      values[index * 3 + 2] = (Math.random() - 0.5) * (compact ? 1.7 : 2.2);
    }
    return values;
  }, [compact, count]);

  useFrame((state) => {
    if (reducedMotion || !pointsRef.current) return;
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.06;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#667eea" size={compact ? 0.018 : 0.024} transparent opacity={0.48} sizeAttenuation />
    </points>
  );
}

function SceneContent({ compact, reducedMotion }) {
  const groupRef = useRef(null);

  useFrame((state) => {
    if (reducedMotion || !groupRef.current) return;
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.18) * 0.16;
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.45) * 0.045;
  });

  return (
    <group ref={groupRef} position={[0, compact ? -0.03 : -0.1, 0]}>
      <ConnectionLines compact={compact} />
      <FloatingStudyCards compact={compact} reducedMotion={reducedMotion} />
      <MindMapCluster compact={compact} />
      <SynapseCore reducedMotion={reducedMotion} />
      <ParticleField compact={compact} reducedMotion={reducedMotion} />
    </group>
  );
}

export default function Hero3DScene() {
  const reducedMotion = usePrefersReducedMotion();
  const compact = useMediaQuery("(max-width: 768px)");
  const [webglReady, setWebglReady] = useState(true);

  useEffect(() => {
    setWebglReady(supportsWebGL());
  }, []);

  if (!webglReady) {
    return <SceneFallback />;
  }

  return (
    <div className="three-scene-shell">
      <Canvas
        camera={{ position: [0, 0.1, compact ? 5.2 : 4.3], fov: compact ? 42 : 48 }}
        dpr={compact ? [1, 1.25] : [1, 1.8]}
        frameloop={reducedMotion ? "demand" : "always"}
        gl={{ alpha: true, antialias: true, powerPreference: compact ? "low-power" : "high-performance" }}
      >
        <SceneLighting />
        <SceneContent compact={compact} reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}
