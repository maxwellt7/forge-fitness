# Forge Daily PWA Findings

Expo's PWA guidance recommends adding a web manifest in `public/manifest.json` with the install name, icons, `display: "standalone"`, and theme/background colors.

Because Forge Daily uses `web.output: "static"`, the manifest should be linked through a web HTML entry file rather than a plain `public/index.html` single-page template. The Expo guide specifically shows using `src/app/+html.tsx` for static and server rendering to add the `<link rel="manifest" href="/manifest.json" />` tag to the `<head>`.

Expo also recommends using Workbox for service worker support and generating the service worker after running `npx expo export -p web`. The guide warns that service workers can cause stale-cache behavior if configured too aggressively, so a conservative offline strategy is appropriate.
