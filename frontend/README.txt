ACCRA LIFE MINI - JWT AUTH FIX

Contains ONLY authentication, API, game-page and HUD changes. No 3D world, ShopPanel, or backend changes.

1. Back up your existing frontend folder.
2. Copy the included frontend folder CONTENTS into C:\Users\FJ\lagos-life-mini\frontend, merging and replacing the matching files.
3. Confirm frontend/app/login/page.tsx saves BOTH tokens: saveAccessToken(tokens.access); saveRefreshToken(tokens.refresh);
4. cd C:\Users\FJ\lagos-life-mini\frontend
5. npx tsc --noEmit
6. Sign out then sign in again to get a refresh token.
7. Test delivery, shop, logout, and re-login.

Note: if an access token expires, requests retry once after refresh. If refresh token expires, sign in again. If network fails, session is not erased.
