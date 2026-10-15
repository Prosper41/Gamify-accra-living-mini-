# Accra Life Mini – Shop integration patch

This package contains Claude's redesigned 3D files plus an integration patch using the previously shared game page and HUD.

## Install

1. **Back up your project or commit it first.**
2. Copy the contents of this ZIP's `frontend/` folder into your existing project's `frontend/` folder, preserving paths. Do **not** replace your whole frontend folder or delete other files.
3. Ensure Django shop routes exist: GET `/api/shops/items/`, POST `/api/shops/purchase/` with `{ "item_id": number }` and bearer authentication.
4. From frontend run `npx tsc --noEmit` then `npm run build`.
5. Run Django and Next.js. Go to Adwoa's Provision Shop in Osu (x=-11,z=-10.2), near the front entrance (x=-11,z=-6.7). Press E. Buy an item. Check balance/energy and delivery.

## Caveats

- The ZIP from Claude did not include actual Django code or live API clients. The shop API helper is based on the endpoint paths previously discussed, not verified against backend source. `getShopItems` accepts either `{items: []}` or `[]`.
- Purchase results are not trusted to be a complete player; after purchase, the panel calls existing `getPlayer()` to refresh balance and energy.
- This has not been run against your local dependencies or backend. Run the type-check and share any errors.
- Shop proximity is currently tied to Adwoa's Provision Shop; other shops are decorative.
