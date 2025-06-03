import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { EffectComposer, RenderPass, EffectPass, FXAAEffect } from 'postprocessing';
import { useControls } from 'leva';
import { BlendFunction } from 'postprocessing';
import { TrailEffect } from './trail-effect';

/**
 * Component that manages all post-processing effects
 * Configures and applies various effects to the rendered scene
 */
export const PostProcessing = () => {
  // References
  const composerRef = useRef<EffectComposer>();
  const trailEffectRef = useRef<TrailEffect | null>(null);
  const fxaaEffectRef = useRef<FXAAEffect | null>(null);

  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const [camera, setCamera] = useState<THREE.Camera | null>(null);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  const {
    trailEnabled,
    trailAmount,
    trailResolutionScale
  } = useControls('Post Processing/Persistence', {
    trailEnabled: { value: true, label: 'Enable Trail' },
    trailAmount: { value: 80, min: 1.0, max: 199.9, step: 0.01, label: 'Decay Speed' },
    trailResolutionScale: { value: 0.5, min: 0.01, max: 1.0, step: 0.01, label: 'Resolution Scale' },
  }, { collapsed: true });

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const newSize = {
        width: window.innerWidth,
        height: window.innerHeight
      };
      setWindowSize(newSize);
      
      if (composerRef.current) {
        composerRef.current.setSize(newSize.width, newSize.height);
      }
      if (trailEffectRef.current) {
        trailEffectRef.current.setSize(newSize.width, newSize.height);
        // Force recreation of render targets with new dimensions
        trailEffectRef.current.resetRenderTargets();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update trail effect options when they change
  useEffect(() => {
    if (trailEffectRef.current) {
      trailEffectRef.current.updateOptions(trailAmount, trailEnabled, trailResolutionScale);
    }
  }, [trailAmount, trailEnabled, trailResolutionScale]);


  // Configure post-processing effects
  useEffect(() => {
    if (!scene || !camera || !composerRef.current) return;

    const composer = composerRef.current;
    composer.removeAllPasses();

    // Add required passes in order
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const cloneEffect = new TrailEffect({
      trailAmount,
      trailEnabled,
      resolutionScale: trailResolutionScale,
      blendFunction: BlendFunction.NORMAL
    });
    trailEffectRef.current = cloneEffect;
    composer.addPass(new EffectPass(camera, cloneEffect));


  }, [
    composerRef.current,
    scene, camera,
    trailEnabled, trailAmount, trailResolutionScale,

  ]);

  // Handle rendering
  useFrame(({ gl, scene: currentScene, camera: currentCamera }) => {
    if (!composerRef.current) {
      composerRef.current = new EffectComposer(gl);
    }

    if (scene !== currentScene) setScene(currentScene);
    if (camera !== currentCamera) setCamera(currentCamera);

    if (composerRef.current) {
      composerRef.current.render();
    }
  }, 1);

  return null;
};