# CLAUDE.md

The full guidance for this repository lives in [AGENTS.md](./AGENTS.md). Read it before working.

@AGENTS.md

Key reminders: this is a **published Qwik library** on **Qwik v2 beta** (`@qwik.dev/core` /
`@qwik.dev/router`). Never reintroduce `@builder.io/*` imports. After changing `src/`, verify with
`pnpm build.types` + `pnpm build.lib` (root) and `pnpm build.types` in `website/` and `test/`.
