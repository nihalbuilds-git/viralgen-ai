# E2E Tests

Playwright suite covering the full ViralGen user journey:
sign up → brand profile → generate → persistence → favorite → public share.

## Run

```bash
# 1. Start the dev server
bun run dev

# 2. In another terminal — install browsers once, then run
bunx playwright install chromium
bun run e2e
```

Override the target with `E2E_BASE_URL=https://your-preview.lovable.app bun run e2e`.

## Notes

- Tests create a fresh user per run (`e2e+<random>@viralgen-test.dev`) and
  rely on Supabase email auto-confirm being enabled (Lovable Cloud dev default).
- The spec runs **serially** — each step depends on state from the previous
  one. Splitting would require DB seeding.
- Failures capture screenshots, video, and a trace under `test-results/`.

## What's covered

| Step | File |
|------|------|
| Sign up + session bootstrap | `helpers.ts` → `signUpNewUser` |
| Brand profile create | `full-flow.spec.ts` |
| Caption generation via AI Gateway | `full-flow.spec.ts` |
| Persistence in `/dashboard/history` | `full-flow.spec.ts` |
| Favorite → visible in `/dashboard/favorites` | `full-flow.spec.ts` |
| Toggle public share + anonymous `/s/:id` view | `full-flow.spec.ts` |
