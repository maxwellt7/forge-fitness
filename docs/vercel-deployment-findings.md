# Vercel Deployment Findings

## Evidence gathered on 2026-04-20

### Expo web publishing guidance
- Expo's web publishing guide states that the production web build is created with `expo export -p web` and the output is written to the `dist` directory.
- The same guide provides a Vercel configuration example using a root-level `vercel.json` with:
  - `buildCommand: "expo export -p web"`
  - `outputDirectory: "dist"`
  - `devCommand: "expo"`
  - `cleanUrls: true`
  - `framework: null`
  - an SPA-style rewrite from `/:path*` to `/`
- The guide also notes that if the app uses static rendering, additional dynamic route configuration may be needed instead of relying only on the generic SPA rewrite example.

### Expo static rendering guidance
- Expo Router `web.output: "static"` generates HTML files for each route in `dist`.
- Dynamic routes do not work automatically in static mode unless known paths are generated ahead of time with `generateStaticParams`.
- Truly runtime-dynamic routes are not supported in static mode without additional server-side handling.

### Current project-specific findings
- Forge Daily currently uses `web.output: "static"`.
- A local production export succeeds with `npx expo export --platform web` and writes a complete `dist` directory including `index.html`, route HTML files, `manifest.json`, and `sw.js`.
- The repository currently has no `vercel.json`, which means the documented Vercel-specific build/output settings are missing from the codebase.
