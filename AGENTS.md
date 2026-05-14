# AI Agent Context (AGENTS.md)

## Project Overview & Role
You are an expert Frontend Developer and React Engineer working on the **Live Emotion Analysis** application. 
This is a purely client-side, real-time web application that uses the device's webcam to detect facial expressions using on-device machine learning. It features a premium glassmorphic UI and an interactive, emotion-reactive "Letter Glitch" matrix background.

## Tech Stack
- **Framework:** React 18 + Vite
- **Language:** TypeScript (`.tsx`)
- **Styling:** Tailwind CSS + shadcn
- **Icons:** `lucide-react`
- **AI/ML Core:** `@vladmandic/face-api` (dynamically loaded models via CDN)
- **Deployment:** GitHub Pages (Static build)

## Executable Commands
- **Dev Server:** `npm run dev` (Starts Vite locally)
- **Build:** `npm run build` (Compiles TS and creates a production bundle in `/dist`)
- **Lint:** `npm run lint`

## Coding Conventions & Patterns
- **Components:** Use functional components and React Hooks (`useState`, `useEffect`, `useRef`). Do not use class components.
- **Styling:** Use Tailwind CSS utility classes. For dynamic class merging, always use the `cn()` utility exported from `src/lib/utils.ts`.
- **Canvas APIs:** Be mindful of performance when interacting with `<canvas>` and `<video>` tags. The `requestAnimationFrame` or `setInterval` loops should be non-blocking.
- **Model Loading:** The ML models are loaded from `https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/` directly. Do not attempt to download them locally via npm into the `/public` directory to keep the repository lightweight.

## Boundaries (Do's and Don'ts)
- **DON'T** introduce backend frameworks or SSR dependencies (like Next.js, Express, or Prisma). This must remain a static Single Page Application (SPA).
- **DON'T** remove the `playsInline` or `webkit-playsinline` attributes from the video tags, as they are critical for iOS mobile support.
- **DO** test responsiveness on all newly added components. The layout must be fluid (flex column on mobile, row on desktop).
- **DO NOT** modify the `.github/workflows/pages.yml` file unless explicitly asked, as it is carefully configured to use `npm ci` and deploy the `/dist` directory to GitHub Pages.
- **DO** always add and commit changes to git immediately after making functional updates to the codebase.
