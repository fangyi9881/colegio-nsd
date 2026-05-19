import React, { useState, Suspense, useRef } from 'react';
import { motion } from 'motion/react';
import { Check, X, RotateCcw } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text, Environment, ContactShadows, Loader } from '@react-three/drei';
import * as THREE from 'three';

interface AvatarConfig {
  skin: string;
  hair: string;
  jersey: string;
  number: string;
}

interface BasketballAvatarBuilderProps {
  initialConfig?: AvatarConfig;
  onSave: (base64Image: string) => void;
  onCancel: () => void;
}

const SKIN_COLORS = ['#ffdbac', '#f1c27d', '#e0ac69', '#8d5524', '#c68642', '#3d2c23'];
const HAIR_COLORS = ['#090806', '#2c222b', '#71593e', '#b89778', '#d6c4c2', '#ca3435'];
const JERSEY_COLORS = ['#D4AF37', '#000000', '#FFFFFF', '#FF0000', '#0000FF', '#008000'];

function PlayerModel({ config }: { config: AvatarConfig }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={[0, -1, 0]}>
      {/* Body/Jersey */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <boxGeometry args={[0.6, 0.8, 0.3]} />
        <meshStandardMaterial color={config.jersey} />
      </mesh>

      {/* Jersey Number (Front) */}
      <Text
        position={[0, 0.8, 0.16]}
        fontSize={0.25}
        color={config.jersey === '#FFFFFF' ? '#000000' : '#FFFFFF'}
        anchorX="center"
        anchorY="middle"
      >
        {config.number || '00'}
      </Text>

      {/* Jersey Number (Back) */}
      <Text
        position={[0, 0.8, -0.16]}
        rotation={[0, Math.PI, 0]}
        fontSize={0.25}
        color={config.jersey === '#FFFFFF' ? '#000000' : '#FFFFFF'}
        anchorX="center"
        anchorY="middle"
      >
        {config.number || '00'}
      </Text>

      {/* Head */}
      <mesh position={[0, 1.45, 0]} castShadow>
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshStandardMaterial color={config.skin} />
      </mesh>

      {/* Hair (Simple cap) */}
      <mesh position={[0, 1.55, 0]} castShadow>
        <sphereGeometry args={[0.26, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={config.hair} />
      </mesh>

      {/* Arms */}
      <mesh position={[-0.4, 0.9, 0]} castShadow>
        <capsuleGeometry args={[0.08, 0.4, 4, 8]} />
        <meshStandardMaterial color={config.skin} />
      </mesh>
      <mesh position={[0.4, 0.9, 0]} castShadow>
        <capsuleGeometry args={[0.08, 0.4, 4, 8]} />
        <meshStandardMaterial color={config.skin} />
      </mesh>

      {/* Legs */}
      <mesh position={[-0.18, 0.2, 0]} castShadow>
        <capsuleGeometry args={[0.1, 0.4, 4, 8]} />
        <meshStandardMaterial color={config.jersey} />
      </mesh>
      <mesh position={[0.18, 0.2, 0]} castShadow>
        <capsuleGeometry args={[0.1, 0.4, 4, 8]} />
        <meshStandardMaterial color={config.jersey} />
      </mesh>
      
      {/* Basketball in hand */}
      <mesh position={[0.5, 0.6, 0.2]} castShadow>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial color="#FF6321" />
      </mesh>
    </group>
  );
}

export default function BasketballAvatarBuilder({ initialConfig, onSave, onCancel }: BasketballAvatarBuilderProps) {
  console.log('BasketballAvatarBuilder mounted');
  const [config, setConfig] = useState<AvatarConfig>(initialConfig || {
    skin: SKIN_COLORS[1],
    hair: HAIR_COLORS[0],
    jersey: JERSEY_COLORS[0],
    number: '23'
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleSave = () => {
    if (canvasRef.current) {
      const base64 = canvasRef.current.toDataURL('image/png');
      onSave(base64);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-surface border border-white/10 rounded-2xl p-6 max-w-4xl w-full shadow-2xl flex flex-col md:flex-row gap-8"
      >
        {/* Left: 3D Preview */}
        <div className="flex-1 min-h-[400px] bg-background rounded-xl relative overflow-hidden border border-white/5">
          <Canvas
            ref={canvasRef}
            shadows
            gl={{ preserveDrawingBuffer: true }}
            className="w-full h-full"
          >
            <PerspectiveCamera makeDefault position={[0, 0, 4]} />
            <OrbitControls 
              enablePan={false} 
              minDistance={2} 
              maxDistance={6}
              autoRotate
              autoRotateSpeed={0.5}
            />
            
            <ambientLight intensity={0.7} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
            <directionalLight position={[-5, 5, 5]} intensity={0.5} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />
            <gridHelper args={[10, 10]} position={[0, -1, 0]} />
            
            <Suspense fallback={
              <mesh>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="orange" wireframe />
              </mesh>
            }>
              <PlayerModel config={config} />
              <ContactShadows position={[0, -1, 0]} opacity={0.4} scale={10} blur={2} far={4} />
            </Suspense>
          </Canvas>
          <Loader />
          
          <div className="absolute bottom-4 left-4 text-white/30 text-xs flex items-center gap-2">
            <RotateCcw className="w-3 h-3 animate-spin-slow" />
            Arrastra para rotar • Scroll para zoom
          </div>
        </div>

        {/* Right: Controls */}
        <div className="w-full md:w-80 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">Avatar 3D Game</h3>
            <button onClick={onCancel} className="text-white/50 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6 flex-1">
            <div>
              <label className="text-sm text-white/70 block mb-3">Tono de Piel</label>
              <div className="flex flex-wrap gap-2">
                {SKIN_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setConfig({ ...config, skin: color })}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${config.skin === color ? 'border-primary scale-110 shadow-[0_0_10px_rgba(212,175,55,0.5)]' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-white/70 block mb-3">Color de Pelo</label>
              <div className="flex flex-wrap gap-2">
                {HAIR_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setConfig({ ...config, hair: color })}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${config.hair === color ? 'border-primary scale-110 shadow-[0_0_10px_rgba(212,175,55,0.5)]' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-white/70 block mb-3">Color de Equipación</label>
              <div className="flex flex-wrap gap-2">
                {JERSEY_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setConfig({ ...config, jersey: color })}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${config.jersey === color ? 'border-primary scale-110 shadow-[0_0_10px_rgba(212,175,55,0.5)]' : 'border-white/20'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-white/70 block mb-3">Dorsal</label>
              <input
                type="text"
                maxLength={2}
                value={config.number}
                onChange={(e) => setConfig({ ...config, number: e.target.value.replace(/\D/g, '') })}
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white text-xl font-bold focus:border-primary outline-none transition-colors"
                placeholder="23"
              />
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-4 bg-primary hover:bg-primary/90 text-black rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              Guardar
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
