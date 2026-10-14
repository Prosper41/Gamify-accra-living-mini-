"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export type Position = { x: number; y: number; z: number };

type CityWorldProps = {
  initialPosition?: Position;
  onPositionChange?: (position: Position) => void;
  deliveryDestination?: { x: number; z: number } | null;
  onInteractionAvailable?: (action: "pickup" | "complete" | null) => void;
  onInteract?: (action: "pickup" | "complete", position: Position) => void;
};

const PICKUP = { x: 0, z: 0 };
const INTERACTION_RADIUS = 3;

const buildings = [
  { x: -16, z: -16, height: 8, color: "#d6a77a" },
  { x: -8, z: -16, height: 12, color: "#c8d7df" },
  { x: 8, z: -16, height: 10, color: "#e3c29c" },
  { x: 16, z: -16, height: 15, color: "#9eb8c5" },
  { x: -16, z: 16, height: 10, color: "#f0c58a" },
  { x: -8, z: 16, height: 7, color: "#b5d0b0" },
  { x: 8, z: 16, height: 14, color: "#d9a7a7" },
  { x: 16, z: 16, height: 9, color: "#c6b9df" },
];

function Building({
  x,
  z,
  height,
  color,
}: {
  x: number;
  z: number;
  height: number;
  color: string;
}) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[5, height, 5]} />
        <meshStandardMaterial color={color} />
      </mesh>

      <mesh position={[0, height + 0.2, 0]}>
        <boxGeometry args={[5.4, 0.4, 5.4]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
    </group>
  );
}

function DeliveryMarker({
  x,
  z,
  label,
  color,
}: {
  x: number;
  z: number;
  label: string;
  color: string;
}) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 0.2, 24]} />
        <meshStandardMaterial color={color} />
      </mesh>

      <mesh position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[1.4, 1.4, 1.4]} />
        <meshStandardMaterial color={color} />
      </mesh>

      <Text
        position={[0, 2.5, 0]}
        fontSize={0.65}
        color="#ffffff"
        anchorX="center"
        outlineWidth={0.04}
        outlineColor="#111827"
      >
        {label}
      </Text>
    </group>
  );
}

function Player({
  initialPosition,
  onPositionChange,
  deliveryDestination,
  onInteractionAvailable,
  onInteract,
}: Required<Pick<CityWorldProps, "initialPosition">> &
  Omit<CityWorldProps, "initialPosition">) {
  const playerRef = useRef<THREE.Group>(null);
  const keys = useRef<Set<string>>(new Set());
  const lastReport = useRef(0);
  const availableAction = useRef<"pickup" | "complete" | null>(null);

  const interactionRef = useRef(onInteract);
  const availableRef = useRef(onInteractionAvailable);
  const positionRef = useRef(onPositionChange);

  useEffect(() => {
    interactionRef.current = onInteract;
    availableRef.current = onInteractionAvailable;
    positionRef.current = onPositionChange;
  }, [onInteract, onInteractionAvailable, onPositionChange]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(
          event.key
        )
      ) {
        event.preventDefault();
      }

      if (event.key.toLowerCase() === "e" && !event.repeat) {
        const player = playerRef.current;
        const action = availableAction.current;

        if (player && action) {
          interactionRef.current?.(action, {
            x: player.position.x,
            y: 0,
            z: player.position.z,
          });
        }
      }

      keys.current.add(event.key.toLowerCase());
    };

    const onKeyUp = (event: KeyboardEvent) => {
      keys.current.delete(event.key.toLowerCase());
    };

    const onBlur = () => keys.current.clear();

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  useFrame((state, delta) => {
    const player = playerRef.current;
    if (!player) return;

    const speed = 7;
    const step = Math.min(delta, 0.05) * speed;

    let dx = 0;
    let dz = 0;

    if (keys.current.has("w") || keys.current.has("arrowup")) dz -= 1;
    if (keys.current.has("s") || keys.current.has("arrowdown")) dz += 1;
    if (keys.current.has("a") || keys.current.has("arrowleft")) dx -= 1;
    if (keys.current.has("d") || keys.current.has("arrowright")) dx += 1;

    const moving = dx !== 0 || dz !== 0;

    if (moving) {
      const length = Math.hypot(dx, dz);
      dx /= length;
      dz /= length;

      player.position.x = THREE.MathUtils.clamp(
        player.position.x + dx * step,
        -24,
        24
      );

      player.position.z = THREE.MathUtils.clamp(
        player.position.z + dz * step,
        -24,
        24
      );

      player.rotation.y = Math.atan2(-dx, -dz);
    }

    const cameraTarget = new THREE.Vector3(
      player.position.x,
      20,
      player.position.z + 24
    );

    state.camera.position.lerp(cameraTarget, 0.06);
    state.camera.lookAt(player.position.x, 1, player.position.z);

    if (
      moving &&
      positionRef.current &&
      state.clock.elapsedTime - lastReport.current > 0.3
    ) {
      lastReport.current = state.clock.elapsedTime;

      positionRef.current({
        x: player.position.x,
        y: 0,
        z: player.position.z,
      });
    }

    const target = deliveryDestination ?? PICKUP;

    const distance = Math.hypot(
      player.position.x - target.x,
      player.position.z - target.z
    );

    const action =
      distance <= INTERACTION_RADIUS
        ? deliveryDestination
          ? "complete"
          : "pickup"
        : null;

    if (availableAction.current !== action) {
      availableAction.current = action;
      availableRef.current?.(action);
    }
  });

  return (
    <group
      ref={playerRef}
      position={[
        initialPosition.x,
        initialPosition.y,
        initialPosition.z,
      ]}
    >
      <mesh position={[0, 1, 0]} castShadow>
        <capsuleGeometry args={[0.45, 1, 4, 8]} />
        <meshStandardMaterial color="#10b981" />
      </mesh>

      <mesh position={[0, 2.05, 0]} castShadow>
        <sphereGeometry args={[0.38, 16, 16]} />
        <meshStandardMaterial color="#8d5524" />
      </mesh>
    </group>
  );
}

function CityScene(props: CityWorldProps & { initialPosition: Position }) {
  return (
    <>
      <color attach="background" args={["#8dc5e8"]} />
      <ambientLight intensity={1.4} />
      <directionalLight
        position={[15, 30, 10]}
        intensity={2}
        castShadow
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#57915a" />
      </mesh>

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
      >
        <planeGeometry args={[60, 10]} />
        <meshStandardMaterial color="#374151" />
      </mesh>

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.03, 0]}
      >
        <planeGeometry args={[10, 60]} />
        <meshStandardMaterial color="#374151" />
      </mesh>

      {[-24, -16, -8, 8, 16, 24].map((z) => (
        <mesh key={`horizontal-${z}`} position={[0, 0.04, z]}>
          <boxGeometry args={[1.8, 0.02, 0.18]} />
          <meshStandardMaterial color="#facc15" />
        </mesh>
      ))}

      {[-24, -16, -8, 8, 16, 24].map((x) => (
        <mesh key={`vertical-${x}`} position={[x, 0.04, 0]}>
          <boxGeometry args={[0.18, 0.02, 1.8]} />
          <meshStandardMaterial color="#facc15" />
        </mesh>
      ))}

      {buildings.map((building, index) => (
        <Building key={index} {...building} />
      ))}

      <Text
        position={[-16, 12, -16]}
        fontSize={1.5}
        color="#ffffff"
        anchorX="center"
      >
        OSU
      </Text>

      <Text
        position={[16, 18, -16]}
        fontSize={1.5}
        color="#ffffff"
        anchorX="center"
      >
        EAST LEGON
      </Text>

      <Text
        position={[-16, 13, 16]}
        fontSize={1.5}
        color="#ffffff"
        anchorX="center"
      >
        CIRCLE
      </Text>

      <DeliveryMarker
        x={PICKUP.x}
        z={PICKUP.z}
        label="DELIVERY PICKUP"
        color="#f59e0b"
      />

      {props.deliveryDestination && (
        <DeliveryMarker
          x={props.deliveryDestination.x}
          z={props.deliveryDestination.z}
          label="DELIVERY DESTINATION"
          color="#22c55e"
        />
      )}

      <Player
        initialPosition={props.initialPosition}
        onPositionChange={props.onPositionChange}
        deliveryDestination={props.deliveryDestination}
        onInteractionAvailable={props.onInteractionAvailable}
        onInteract={props.onInteract}
      />
    </>
  );
}

export default function CityWorld({
  initialPosition = { x: 0, y: 0, z: 0 },
  onPositionChange,
  deliveryDestination = null,
  onInteractionAvailable,
  onInteract,
}: CityWorldProps) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 20, 24], fov: 55 }}
      style={{ width: "100%", height: "100%" }}
    >
      <CityScene
        initialPosition={initialPosition}
        onPositionChange={onPositionChange}
        deliveryDestination={deliveryDestination}
        onInteractionAvailable={onInteractionAvailable}
        onInteract={onInteract}
      />
    </Canvas>
  );
}