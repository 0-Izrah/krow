# ⚡ KROW

> A personal workout tracker built for athletes who couldn't find an app that had everything they needed — so they built one.

![Project Grind](https://img.shields.io/badge/status-active-c8ff00?style=flat-square&labelColor=141414)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&labelColor=141414)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&labelColor=141414)
![Netlify](https://img.shields.io/badge/Deployed_on-Netlify-00C7B7?style=flat-square&logo=netlify&labelColor=141414)
![PWA](https://img.shields.io/badge/PWA-installable-c8ff00?style=flat-square&labelColor=141414)

---

## What It Is

Krow is a fully installable Progressive Web App (PWA) built for calisthenics and home-based training. It solves a specific problem: most workout apps either lack the exercises you actually do, hide features behind paywalls, or don't let you build routines the way you think about training.

This one does none of that. It's yours

---

## Features

- **Custom Exercise Library** — Add any movement with name, muscle group, coaching notes, and a YouTube URL for visual reference. No exercise database limitations.
- **Routine Builder** — Create named routines, assign them to days of the week, and configure sets, reps, and rest time per exercise.
- **Live Session Logging** — Active workout screen with set checkboxes, editable rep counts, and a progress bar. One tap to mark a set done.
- **Streak Tracking** — Consecutive training day streak calculated automatically from your session history.
- **Stats Dashboard** — Weekly session count, all-time totals, and a training frequency chart by day of week.
- **YouTube Visualization** — Paste any YouTube link when adding an exercise and it renders as an embedded player on the exercise card. Covers niche movements no app library would have.
- **62 Built-in Exercises** — Pre-loaded library covering Shoulders, Back, Chest, Arms, Core, Legs, and Full Body — curated for calisthenics and home training.
- **Installable PWA** — Works offline after first load. Install it to your phone home screen — looks and feels like a native app.
- **Zero subscription, zero ads** — Self-hosted on Netlify's free tier. Your data stays on your device.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | React 18 (Vite) |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| Data | localStorage (custom hooks) |
| PWA | vite-plugin-pwa / Workbox |
| Hosting | Netlify |

---

## Project Structure

```
src/
├── components/
│   ├── ui/
│   │   ├── Card.jsx
│   │   ├── Button.jsx
│   │   ├── Badge.jsx
│   │   └── Modal.jsx
│   └── BottomNav.jsx
├── pages/
│   ├── Dashboard.jsx
│   ├── Routines.jsx
│   ├── ExerciseLibrary.jsx
│   ├── LogWorkout.jsx
│   └── Stats.jsx
├── hooks/
│   ├── useLocalStorage.js
│   ├── useRoutines.js
│   ├── useExercises.js
│   └── useWorkoutLogs.js
├── utils/
│   ├── streak.js
│   └── youtube.js
├── data/
│   └── builtInExercises.js
├── App.jsx
└── main.jsx
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- npm v9+
- Git

### Local Development

```bash
# Clone the repo
git clone https://github.com/your-username/project-grind.git
cd project-grind

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

### Build for Production

```bash
npm run build
npm run preview   # Preview the production build locally
```

---

## Deployment

This project is configured for one-click deployment on Netlify.

### Via Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

### Via GitHub Integration

1. Push your repo to GitHub
2. Go to [netlify.com](https://netlify.com) → New site → Import from GitHub
3. Select your repo — build settings are auto-detected from `netlify.toml`
4. Click **Deploy**

Every push to `main` triggers an automatic redeploy.

---

## Installing as a PWA

Once deployed, open your Netlify URL on your phone:

- **Android (Chrome):** Tap the three-dot menu → *Add to Home Screen*
- **iOS (Safari):** Tap the Share icon → *Add to Home Screen*

The app installs with a custom icon and runs in standalone mode — no browser UI, no address bar.

---

## Data & Privacy

All data is stored locally in your browser's `localStorage`. Nothing is sent to a server. No accounts, no tracking, no analytics.

If you want to sync data across devices, a [Supabase](https://supabase.com) free tier integration can be added — the hook architecture is designed to make this a simple swap.

---

## Roadmap

- [ ] Rest timer — auto-countdown after each completed set
- [ ] Progressive overload display — show previous session's numbers during logging
- [ ] Exercise reordering within routines (drag-and-drop)
- [ ] Supabase cloud sync for cross-device access
- [ ] Dark/light theme toggle
- [ ] Export workout history as CSV

---

## Local Data Reset

If you want to clear all data and start fresh:

```js
// Run this in your browser console
localStorage.clear();
location.reload();
```

---

## License

MIT — use it, fork it, make it yours.

---

<p align="center">Built for the grind. Not for the app store.</p>
