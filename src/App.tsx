import { useRef, useState, useEffect, FC } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import './styles.css';
import { PostProcessing } from './trail-shader/post-processing';

const DemoName: FC = () => (
  <div style={{
    position: 'fixed',
    bottom: '16px',
    left: '32px',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: '16px',
    borderRadius: '8px',
    backdropFilter: 'blur(4px)'
  }}>
    <div style={{
      fontSize: '30px',
      color: 'white',
      pointerEvents: 'none',
      fontWeight: 'bold',
      fontFamily: 'Comfortaa, cursive'
    }}>
      Trail Postprocessing
    </div>
    <div style={{
      fontSize: '16px',
      color: 'white',
      marginTop: '-5px',
      letterSpacing: '1.2px',
      fontFamily: 'Comfortaa, cursive'
    }}>
      made by <span style={{ textDecoration: 'underline' }}>
        <a href="https://niccolofanton.dev" target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'underline' }}>niccolofanton</a>
      </span>

      {" • "}
      <a href="https://github.com/niccolofanton/image-trail-shader" target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'underline' }}>GitHub</a>
    </div>
  </div>
);

/**
 * Component that handles camera updates on window resize
 */
function CameraController(): null {
  const { camera } = useThree();

  useEffect(() => {
    const handleResize = () => {
      if (camera instanceof THREE.OrthographicCamera) {
        const aspectRatio = window.innerWidth / window.innerHeight;
        const cameraHeight = 6; // Fixed height for consistent view
        const cameraWidth = cameraHeight * aspectRatio;

        camera.left = -cameraWidth / 2;
        camera.right = cameraWidth / 2;
        camera.top = cameraHeight / 2;
        camera.bottom = -cameraHeight / 2;
        camera.updateProjectionMatrix();
      }
    };

    window.addEventListener('resize', handleResize);

    // Set initial camera parameters
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [camera]);

  return null;
}

/**
 * Main application component
 */
export default function App(): JSX.Element {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Calculate camera bounds to maintain aspect ratio
  const aspectRatio = windowSize.width / windowSize.height;
  const cameraHeight = 6; // Fixed height for consistent view
  const cameraWidth = cameraHeight * aspectRatio;

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        orthographic
        camera={{
          zoom: windowSize.width > 700 ? 0.45 : 0.3,
          position: [0, 0, 5],
          left: -cameraWidth / 2,
          right: cameraWidth / 2,
          top: cameraHeight / 2,
          bottom: -cameraHeight / 2,
          near: -1000,
          far: 1000
        }}
        gl={{
          alpha: false
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color('#000000'));
        }}
      >
        <CameraController />
        {/* <ambientLight intensity={0.5} /> */}
        <pointLight position={[10, 10, 10]} />
        <MovingBall color="#FF1493" position={[1, 0, 1]} />
        <MovingBall color="#00FF00" position={[-1, 1, 0]} />
        <MovingBall color="#4169E1" position={[0, -1, -1]} />
        <MovingBall color="#FF4500" position={[2, 1, -2]} />
        <MovingBall color="#FFD700" position={[-2, -1, 2]} />
        <MovingBall color="#FF69B4" position={[1, 2, -1]} />
        <MovingBall color="#00CED1" position={[-1, -2, 1]} />
        <MovingBall color="#FF6347" position={[2, -2, 0]} />
        <MovingBall color="#32CD32" position={[-2, 2, 0]} />
        <MovingBall color="#FF1493" position={[0, 2, 2]} />
        <MovingBall color="#00FF00" position={[0, -2, -2]} />
        <MovingBall color="#4169E1" position={[2, 0, 2]} />
        <MovingBall color="#FF4500" position={[-2, 0, -2]} />
        <MovingBall color="#FFD700" position={[1, -1, 2]} />
        <MovingBall color="#FF69B4" position={[-1, 1, -2]} />
        <MovingBall color="#00CED1" position={[2, 1, 1]} />
        <MovingBall color="#FF6347" position={[-2, -1, -1]} />

        <OrbitControls />
        {/* <Perf position='bottom-right' /> */}
        <PostProcessing />
      </Canvas>
      <DemoName />
    </div>
  )
}

/**
 * Moving ball component with random motion
 */
/**
 * Moving ball component with random motion, frame-rate independent
 */
function MovingBall({ color, position }: { color: string, position: [number, number, number] }): JSX.Element {
  const meshRef = useRef<THREE.Mesh>(null);
  // Velocity in units per second
  const velocityRef = useRef<THREE.Vector3>(new THREE.Vector3(
    (Math.random() - 0.5) * 2, // random speed, tuned for visible motion
    (Math.random() - 0.5) * 2,
    0
  ));

  // Store last frame time to compute delta
  const lastTimeRef = useRef<number | null>(null);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    // delta è in secondi, quindi la velocità è in unità/secondo
    // Aggiorna la posizione in modo indipendente dal frame rate
    meshRef.current.position.addScaledVector(velocityRef.current, delta * 10);

    // Check boundaries and bounce
    const bounds = 3;
    if (Math.abs(meshRef.current.position.x) > bounds) {
      velocityRef.current.x *= -1;
      meshRef.current.position.x = Math.sign(meshRef.current.position.x) * bounds;
    }
    if (Math.abs(meshRef.current.position.y) > bounds) {
      velocityRef.current.y *= -1;
      meshRef.current.position.y = Math.sign(meshRef.current.position.y) * bounds;
    }

    // Randomly change direction occasionally, probability adjusted for delta time
    // 0.02 per frame at 60fps ≈ 1.2% per frame, so per second: 0.02 * 60 = 1.2
    // Per rendere frame-rate indipendente: 0.02 * (delta * 60)
    if (Math.random() < 0.02 * (delta * 60)) {
      velocityRef.current.set(
        (Math.random() - 0.5) * 1.2,
        (Math.random() - 0.5) * 1.2,
        0
      );
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.5, 12, 12]} />
      <meshStandardMaterial color={color} emissive={color} />
    </mesh>
  )
}