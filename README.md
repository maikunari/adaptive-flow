# Adaptive Flow

A task management app built around a simple truth: your plan will get interrupted.

Most to-do apps treat your list like a stone tablet — once written, it's set. When something urgent drops in, it feels like a violation. You end up with an ever-growing list and the guilt that comes with it.

Adaptive Flow fixes this with a dual-pane system and a forced trade-off mechanic that keeps your day honest.

## The Concept

**Intent** — Your curated focus for the day. The non-negotiable commitments.

**Orbit** — A dedicated space for interruptions and sudden urgency. Everything incoming lands here first.

**Re-calibration** — The core mechanic. When you move a task from Orbit to Intent and it would exceed your daily capacity, the app forces a conscious trade-off: to make room, you choose which planned task gets pushed back to Orbit. No silent overloading. No guilt.

## Features

- **Capacity meter** — Set your daily capacity in minutes. The app tracks how full your day is and warns when you're over.
- **Drag and drop** — Move tasks between Intent and Orbit by dragging.
- **Sunset ritual** — At your chosen time, the app walks you through each unfinished task: keep it for tomorrow, return it to orbit, or discard it.
- **Keyboard navigation** — Arrow keys to select, Enter to complete, Cmd+K to capture a new distraction.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)

### Installation

```bash
git clone https://github.com/maikunari/adaptive-flow.git
cd adaptive-flow
npm install
```

### Development

```bash
npm run dev
```

Opens at `http://localhost:5173`.

### Production Build

```bash
npm run build
npm run preview
```

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Framer Motion
- Lucide Icons
