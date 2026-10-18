# KuizRoom Frontend

React/Vite client for the KuizRoom final project.

Main flows:
- Create Quiz: build quiz questions, options, correct answers, and timers.
- Create Room: choose a quiz and create a live room code.
- Join Room: players enter the room code.
- Live Quiz: the server sends questions and advances everyone using the question timer.
- Results: final leaderboard after the quiz ends.

Local setup:
```bash
npm install
npm run dev
```

Environment variables belong in `.env`, which is ignored by Git.

## Source structure

The client uses an app / feature / shared layout:

```text
src/
|-- app/          Application entry, global providers, routes, layouts, and styles
|-- assets/       Images, icons, and sounds used by the client
|-- features/     Feature-owned pages and logic (auth, rooms, quizzes, game, etc.)
|-- shared/       Reusable UI components, configuration, integrations, and utilities
|-- main.jsx      Vite entry point
```

Keep feature-specific screens and logic inside their feature folder. Put reusable
cross-feature code in `shared/`, and use `app/` to compose providers, layouts, and
routes. Global application state providers live in `app/contexts/`.
