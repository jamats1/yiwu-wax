---
name: nextjs-pm2-build-recovery
description: Fix Next.js app crash-looping in PM2 due to corrupted or missing .next production build directory
source: auto-skill
extracted_at: '2026-06-24T09:16:42.535Z'
---

# Next.js PM2 Build Recovery — Delete .next and Rebuild

## Problem

A Next.js app managed by PM2 crash-loops with `next start` failing because the `.next` production build directory is missing, incomplete, or corrupted. PM2 shows excessive restart count and status "waiting restart" or "stopped".

## Root Cause

The `.next` build artifacts can become stale or corrupted after:
- Interrupted builds (killed process, disk full, OOM)
- File system changes (git operations, manual deletions)
- Dependency changes that invalidate cached builds
- Deploy script (`pm2 restart`) running without a prior `next build`

`next start` requires a complete `.next` directory with `BUILD_ID`, `routes-manifest.json`, `server/`, `static/`, etc. Missing any of these causes: `Error: Could not find a production build in the '.next' directory`.

## Fix Procedure

```bash
# 1. Stop and delete the PM2 process (break crash loop)
pm2 stop <app-name>
pm2 delete <app-name>

# 2. Remove stale .next build directory
rm -rf .next

# 3. Rebuild from scratch
npx next build

# 4. Fix any build errors (ESLint, TypeScript, type errors)
#    Common issues: unused imports in new files, missing type annotations

# 5. Start fresh PM2 process from ecosystem config
pm2 start ecosystem.config.cjs --only <app-name>
pm2 save

# 6. Verify
sleep 5
pm2 logs <app-name> --lines 5 --nostream
curl -sI http://localhost:<PORT>
```

## Key Indicators

- PM2 logs show: `Error: Could not find a production build in the '.next' directory`
- `pm2 show <app>` shows high restart count (10+) and 0 memory
- `.next/` exists but is missing `static/`, `BUILD_ID`, or `build-manifest.json`
- App was working before but became unreachable after a crash or interrupted deploy

## Notes

- The deploy script `npm run deploy` runs `next build && pm2 restart` — if build fails silently or is interrupted, the restart uses the stale/corrupted build
- Never use `pm2 restart` alone for Next.js — always rebuild first if code changed
- ESLint errors in untracked/new files are a common build blocker after adding features
- The `.next/cache` directory can be safely removed along with the rest of `.next`
