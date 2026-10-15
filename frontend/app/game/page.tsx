"use client";

import dynamic from "next/dynamic";

import Link from "next/link";

import { useCallback, useEffect, useRef, useState } from "react";

import { getAccessToken, clearSession } from "@/lib/auth/session";

import {

  createPlayer,

  getPlayer,

  getOnlinePlayers,

  sendHeartbeat,

  updatePlayerPosition,

  PlayerApiError,

} from "@/lib/api/player";

import {

  getActiveDelivery,

  startDelivery,

  completeDelivery,

  type Delivery,

} from "@/lib/api/delivery";

import type { Player, PlayerPosition } from "@/types/player";

import GameHud from "@/components/game/GameHud";
import ShopPanel from "@/components/game/ShopPanel";

const CityWorld = dynamic(() => import("@/components/game/CityWorld"), {

  ssr: false,

});

type GameStatus =

  "loading" | "unauthenticated" | "create-character" | "ready" | "error";

type InteractionAction = "pickup" | "complete" | "shop";

export default function GamePage() {

  const [status, setStatus] = useState<GameStatus>("loading");

  const [player, setPlayer] = useState<Player | null>(null);

  const [characterName, setCharacterName] = useState("");

  const [onlinePlayers, setOnlinePlayers] = useState(0);

  const [error, setError] = useState("");

  const [creating, setCreating] = useState(false);

  // Delivery state

  const [delivery, setDelivery] = useState<Delivery | null>(null);

  const [deliveryLoaded, setDeliveryLoaded] = useState(false);

  const [availableAction, setAvailableAction] =

    useState<InteractionAction | null>(null);

  const [deliveryMessage, setDeliveryMessage] = useState("");

  const [deliveryBusy, setDeliveryBusy] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);

  // Refs

  const tokenRef = useRef<string | null>(null);

  const positionRef = useRef<PlayerPosition | null>(null);

  const lastSavedPositionRef = useRef<PlayerPosition | null>(null);

  const savingRef = useRef(false);

  const deliveryBusyRef = useRef(false);

  const deliveryRef = useRef<Delivery | null>(null);

  const deliveryLoadedRef = useRef(false);

  // Keep the current delivery available to event callbacks.

  useEffect(() => {

    deliveryRef.current = delivery;

  }, [delivery]);

  useEffect(() => {

    deliveryLoadedRef.current = deliveryLoaded;

  }, [deliveryLoaded]);

  // Load player profile

  useEffect(() => {

    let active = true;

    async function loadPlayer() {

      const token = getAccessToken();

      if (!token) {

        setStatus("unauthenticated");

        return;

      }

      tokenRef.current = token;

      try {

        const existingPlayer = await getPlayer(token);

        if (!active) return;

        setPlayer(existingPlayer);

        setStatus("ready");

      } catch (err) {

        if (!active) return;

        if (err instanceof PlayerApiError && err.status === 404) {

          setStatus("create-character");

        } else if (err instanceof PlayerApiError && err.status === 401) {

          setStatus("unauthenticated");

        } else {

          setError(

            "Unable to load your character. Check that Django is running.",

          );

          setStatus("error");

        }

      }

    }

    void loadPlayer();

    return () => {

      active = false;

    };

  }, []);

  // Create character

  async function handleCreateCharacter(

    event: React.FormEvent<HTMLFormElement>,

  ) {

    event.preventDefault();

    const token = tokenRef.current;

    const name = characterName.trim();

    if (!token || !name || creating) return;

    setCreating(true);

    setError("");

    try {

      const newPlayer = await createPlayer(token, {

        character_name: name,

      });

      setPlayer(newPlayer);

      setStatus("ready");

    } catch (err) {

      setError(

        err instanceof PlayerApiError

          ? `Unable to create character (${err.status}).`

          : "Unable to connect to Django.",

      );

    } finally {

      setCreating(false);

    }

  }

  // Receive player movement from Three.js

  const handlePositionChange = useCallback((position: PlayerPosition) => {

    positionRef.current = position;

  }, []);

  // Load any active delivery after entering the game

  useEffect(() => {

    if (status !== "ready") return;

    const token = tokenRef.current;

    if (!token) return;

    let active = true;

    async function loadDelivery() {

      try {

        const result = await getActiveDelivery(token!);

        if (active) {

          deliveryRef.current = result.delivery;

          setDelivery(result.delivery);

          deliveryLoadedRef.current = true;

          setDeliveryLoaded(true);

        }

      } catch (err) {

        console.error("Unable to load active delivery:", err);

        if (active) {

          setDeliveryMessage("Unable to load your delivery. Please refresh.");

        }

      }

    }

    void loadDelivery();

    return () => {

      active = false;

    };

  }, [status]);

  // Save movement and update player presence

  useEffect(() => {

    if (status !== "ready" || !player) return;

    const token = tokenRef.current;

    if (!token) return;

    let active = true;

    async function refreshOnlineCount() {

      try {

        const result = await getOnlinePlayers(token!);

        if (active) {

          setOnlinePlayers(result.online_players);

        }

      } catch (err) {

        console.error("Unable to load online players:", err);

      }

    }

    async function heartbeat() {

      try {

        await sendHeartbeat(token!);

        if (active) {

          await refreshOnlineCount();

        }

      } catch (err) {

        console.error("Heartbeat failed:", err);

      }

    }

    async function savePosition() {

      const position = positionRef.current;

      if (!position || savingRef.current || deliveryBusyRef.current) {

        return;

      }

      const previous = lastSavedPositionRef.current;

      if (

        previous &&

        previous.x === position.x &&

        previous.y === position.y &&

        previous.z === position.z

      ) {

        return;

      }

      savingRef.current = true;

      try {

        await updatePlayerPosition(token!, position);

        lastSavedPositionRef.current = position;

      } catch (err) {

        console.error("Unable to save player position:", err);

      } finally {

        savingRef.current = false;

      }

    }

    void heartbeat();

    const heartbeatInterval = window.setInterval(heartbeat, 25000);

    const onlineInterval = window.setInterval(refreshOnlineCount, 15000);

    const positionInterval = window.setInterval(savePosition, 1500);

    return () => {

      active = false;

      window.clearInterval(heartbeatInterval);

      window.clearInterval(onlineInterval);

      window.clearInterval(positionInterval);

    };

  }, [status, player?.id]);

  // Handle E-key delivery interaction

  const handleDeliveryInteraction = useCallback(

    async (action: InteractionAction, position: PlayerPosition) => {

      const token = tokenRef.current;

      if (action === "shop") return;
      if (!token || !deliveryLoadedRef.current || deliveryBusyRef.current) {

        return;

      }

      // Prevent stale interaction prompts from starting

      // the wrong operation.

      if (action === "pickup" && deliveryRef.current) return;

      if (action === "complete" && !deliveryRef.current) return;

      deliveryBusyRef.current = true;

      setDeliveryBusy(true);

      setDeliveryMessage("");

      try {

        // Save the precise position before Django

        // validates the player's distance.

        await updatePlayerPosition(token, position);

        positionRef.current = position;

        lastSavedPositionRef.current = position;

        if (action === "pickup") {

          const result = await startDelivery(token);

          deliveryRef.current = result.delivery;

          setDelivery(result.delivery);

          setDeliveryMessage(

            "Delivery accepted! Head to the green destination marker.",

          );

        } else {

          const result = await completeDelivery(token);

          deliveryRef.current = null;

          setDelivery(null);

          setPlayer((current) =>

            current ? { ...current, balance: result.balance } : current,

          );

          setDeliveryMessage(

            `Delivery completed! You earned GH₵${result.reward}.`,

          );

        }

        setAvailableAction(null);

      } catch (err) {

        setDeliveryMessage(

          err instanceof Error ? err.message : "Unable to process delivery.",

        );

      } finally {

        deliveryBusyRef.current = false;

        setDeliveryBusy(false);

      }

    },

    [],

  );

  const handleGameInteraction = useCallback(
    (action: InteractionAction, position: PlayerPosition) => {
      if (action === "shop") {
        setShopOpen(true);
        return;
      }
      void handleDeliveryInteraction(action, position);
    },
    [handleDeliveryInteraction],
  );

  function handleLogout() {
    clearSession();
    tokenRef.current = null;
    setShopOpen(false);
    setPlayer(null);
    setStatus("unauthenticated");
  }

  // Loading screen

  if (status === "loading") {

    return (

      <main className="flex min-h-screen items-center justify-center bg-[#08131a] text-white">

        <p className="text-slate-300">Loading your character...</p>

      </main>

    );

  }

  // Unauthenticated screen

  if (status === "unauthenticated") {

    return (

      <main className="flex min-h-screen items-center justify-center bg-[#08131a] text-white">

        <div className="text-center">

          <h1 className="text-2xl font-bold">Welcome to Accra Life</h1>

          <p className="mt-3 text-slate-400">

            Please sign in to enter the city.

          </p>

          <Link

            href="/login"

            className="mt-5 inline-block rounded-xl bg-emerald-400 px-6 py-3 font-bold text-slate-950"

          >

            Sign in

          </Link>

        </div>

      </main>

    );

  }

  // Error screen

  if (status === "error") {

    return (

      <main className="flex min-h-screen items-center justify-center bg-[#08131a] px-4 text-white">

        <div className="text-center">

          <h1 className="text-2xl font-bold">Unable to enter the city</h1>

          <p className="mt-3 text-red-300">{error}</p>

          <button

            onClick={() => window.location.reload()}

            className="mt-5 rounded-xl bg-emerald-400 px-6 py-3 font-bold text-slate-950"

          >

            Try again

          </button>

        </div>

      </main>

    );

  }

  // Character creation screen

  if (status === "create-character") {

    return (

      <main className="flex min-h-screen items-center justify-center bg-[#08131a] px-4 text-white">

        <form

          onSubmit={handleCreateCharacter}

          className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-8 shadow-2xl"

        >

          <p className="text-xs font-bold tracking-widest text-emerald-400">

            ACCRA LIFE MINI

          </p>

          <h1 className="mt-3 text-3xl font-bold">Create your character</h1>

          <p className="mt-3 text-sm text-slate-400">

            Choose a name and begin your journey in Accra. You will start with

            GH₵5,000.

          </p>

          <label

            htmlFor="characterName"

            className="mt-7 block text-sm font-medium"

          >

            Character name

          </label>

          <input

            id="characterName"

            type="text"

            value={characterName}

            onChange={(event) => setCharacterName(event.target.value)}

            placeholder="e.g. Kojo"

            minLength={2}

            maxLength={50}

            required

            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-white outline-none focus:border-emerald-400"

          />

          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

          <button

            type="submit"

            disabled={creating || !characterName.trim()}

            className="mt-6 w-full rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-emerald-300 disabled:opacity-50"

          >

            {creating ? "Creating character..." : "Enter Accra"}

          </button>

        </form>

      </main>

    );

  }

  if (!player) return null;

  // Main game

  // Main game

  return (

    <main className="relative h-screen w-screen overflow-hidden bg-[#08131a]">

      <CityWorld

        initialPosition={{

          x: player.position_x,

          y: player.position_y,

          z: player.position_z,

        }}

        onPositionChange={handlePositionChange}

        deliveryDestination={

          delivery

            ? {

                x: delivery.destination_x,

                z: delivery.destination_z,

              }

            : null

        }

        onInteractionAvailable={setAvailableAction}

        onInteract={handleGameInteraction}
        shopOpen={shopOpen}

      />

      <GameHud

        player={player}

        onlinePlayers={onlinePlayers}

        availableAction={!shopOpen && (availableAction === "shop" || deliveryLoaded) ? availableAction : null}

        deliveryBusy={deliveryBusy}

        deliveryMessage={deliveryMessage}

        activeDelivery={delivery}
        onLogout={handleLogout}

      />
      {shopOpen && tokenRef.current && (
        <ShopPanel
          token={tokenRef.current}
          balance={Number(player.balance)}
          onClose={() => setShopOpen(false)}
          onPlayerUpdated={setPlayer}
        />
      )}
    </main>
  );
}
