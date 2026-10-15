# Accra Life Mini: Project Handover

> **Read this first.** This file was drafted without access to the full project.
> Only `CityWorld.tsx` (the original) and the redesign files written in this
> conversation were available. Every section below is labelled **VERIFIED**
> (seen in code) or **NOT INSPECTED** (needs the real files). Nothing has been
> guessed about the Django backend, authentication, HUD, jobs or shop.
> Run `python generate_handover_inventory.py` in the project root to fill in the
> NOT INSPECTED parts from the real code (see section 8).

## 1. Project folder structure

**NOT INSPECTED.** Generate the real tree by running the script in section 8, then paste
the output here. Locations stated by the owner (not seen by me):

- `frontend/` (Next.js 16 App Router, React 19, TypeScript, Tailwind)
- `frontend/app/game/page.tsx` (game page, imports `CityWorld`)
- `GameHud.tsx` (HUD, exact path unknown)
- A Django REST Framework backend with PostgreSQL (folder name and layout unknown)

## 2. File table

### 2a. VERIFIED: 3D city (redesign written in this conversation, type-checked, not browser-tested)

| File name | Path | Purpose |
|---|---|---|
| CityWorld.tsx | frontend/components/game/CityWorld.tsx | Public entry. Canvas, scene composition, collider setup, delivery markers. Same props and default export as the original. |
| PlayerController.tsx | frontend/components/game/PlayerController.tsx | Keyboard input, smoothed movement, collision, E interaction, position reports, interaction-range detection. |
| PlayerCharacter.tsx | frontend/components/game/PlayerCharacter.tsx | Procedural humanoid with walk and idle animation. |
| FollowCamera.tsx | frontend/components/game/FollowCamera.tsx | Frame-rate-independent follow camera; feeds see-through uniforms. |
| DeliveryMarker.tsx | frontend/components/game/DeliveryMarker.tsx | Pickup and destination objective markers, beam, label, "PRESS E" prompt. |
| CityEnvironment.tsx | frontend/components/game/CityEnvironment.tsx | Memoised composition of all static scenery. |
| RoadNetwork.tsx | frontend/components/game/RoadNetwork.tsx | Ground, asphalt, sidewalks, curbs, drains, markings. |
| Building.tsx | frontend/components/game/Building.tsx | Shops, apartments, villas, tower, roof signs (exports `Buildings`). |
| Vegetation.tsx | frontend/components/game/Vegetation.tsx | Trees, palms, shrubs, flower beds, plaza paving. |
| StreetProps.tsx | frontend/components/game/StreetProps.tsx | Streetlights, traffic lights, signs, billboards, benches, bins. |
| Vehicles.tsx | frontend/components/game/Vehicles.tsx | Decorative parked cars, taxis, tro-tros (instanced). |
| Lighting.tsx | frontend/components/game/Lighting.tsx | Sun, fill light, shadows, sky dome, clouds, fog. |
| InstancedParts.tsx | frontend/components/game/InstancedParts.tsx | Generic one-draw-call instanced mesh helper. |
| Part.tsx | frontend/components/game/Part.tsx | Scaled mesh helper using shared geometry and materials. |
| city-config.ts | frontend/lib/game/city-config.ts | All layout data and gameplay constants. |
| collision.ts | frontend/lib/game/collision.ts | Colliders, circle-vs-box resolution, layout validation. |
| city-instances.ts | frontend/lib/game/city-instances.ts | Builds window, balcony, road and vehicle instance data. |
| shared-assets.ts | frontend/lib/game/shared-assets.ts | Shared geometries and cached materials. |
| occlusion.ts | frontend/lib/game/occlusion.ts | Shader patch that dithers away surfaces between camera and player. |
| types.ts | frontend/lib/game/types.ts | `Position`, `Destination`, `InteractionAction`, `PartInstance`. |

### 2b. NOT INSPECTED (owner says these exist or are implied)

| File name | Path | Purpose |
|---|---|---|
| page.tsx | frontend/app/game/page.tsx | Presumably hosts `CityWorld` and wires callbacks to the API. Unverified. |
| GameHud.tsx | unknown | HUD. Unverified. |
| Authentication, character creation, delivery jobs, rewards, MiniMart, shop items, energy | unknown | Not seen. |
| Django models, serializers, views, services, urls, settings, migrations | unknown | Not seen. |

## 3. Architecture

**VERIFIED (frontend 3D layer):** `CityWorld` is a client component that renders an R3F
`Canvas`. It does not call any API itself. It communicates only through props and callbacks:

- Props: `initialPosition`, `deliveryDestination` ({x, z} or null)
- Callbacks out: `onPositionChange(Position)` (throttled to about 0.3 s while moving, plus one report on stopping),
  `onInteractionAvailable("pickup" | "complete" | null)`, `onInteract(action, Position)`

Whatever parent component supplies these callbacks is responsible for the Django calls.
Which endpoints it calls is **NOT INSPECTED**.

**NOT INSPECTED:** everything about how the frontend talks to Django, auth flow,
serializers, and PostgreSQL persistence.

## 4. Gameplay constants (VERIFIED, in `city-config.ts`)

Pickup (0, 0). Interaction radius 3. Speed 7. Bounds plus or minus 24. Default destination (15, 15)
is the plaza centre and is kept free of scenery.

## 5. Known issues and caveats (VERIFIED, about the 3D layer only)

- The redesign has been type-checked and its layout and collision logic tested outside the browser. It has **not** been run in a browser, and no FPS figures exist.
- A destination sent by the backend inside a building footprint is reachable but drawn under the building.
- Drei `Text` loads its default font from a CDN at runtime (same as the original).
- If a parent passes a live-updating `initialPosition`, the player snaps to it (same behaviour as the original code).
- Bugs or gaps in auth, HUD, jobs, shop and the Django side: **unknown, not inspected**.

## 6. Files to share for a complete review

Share section 2a in full, plus the following once located (NOT INSPECTED):
`app/game/page.tsx`, `GameHud.tsx`, any API client or fetch helpers, auth pages and
context, character creation page, shop and MiniMart components, and from Django:
`models.py`, `serializers.py`, `views.py`, `urls.py`, services modules, `settings.py`,
migrations, and `requirements.txt`. Exclude `.env`, secrets, `node_modules`, `.next`, `venv`, `__pycache__`, `.git`.

## 7. Per-file detail for section 2b

To be completed from the real code (file name, path, purpose, key functionality,
connections, status).

## 8. How to complete this document

Run from the project root (Python 3, works on Windows):

    python generate_handover_inventory.py

It prints the folder tree and, per source file, line count, imports, `fetch`/`axios` calls,
Django classes and URL routes. It only reads files and never modifies anything.
Paste the output into sections 1 and 7, or send it to the next assistant.
