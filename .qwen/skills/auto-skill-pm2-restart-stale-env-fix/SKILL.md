---
name: pm2-restart-stale-env-fix
description: Fix PM2 processes stuck with stale environment variables by deleting and recreating instead of restarting
source: auto-skill
extracted_at: '2026-06-15T03:44:32.757Z'
---

# PM2 Restart with Stale Environment Variables — Delete & Recreate Fix

## Problem

After running `pm2 restart`, a PM2 process continues using wrong/stale environment variables (e.g., wrong PORT) instead of values defined in `ecosystem.config.cjs`. This causes issues like:

- `EADDRINUSE` errors on unexpected ports
- App listening on wrong port (nginx proxy fails with 502)
- `pm2 env <id>` showing values that don't match the config file

## Root Cause

PM2 caches environment variables in its internal process metadata (saved in `~/.pm2/dump.pm2`). A `pm2 restart` — even with `--update-env` — can continue using these stale values instead of reloading from the ecosystem config file. The `...process.env` spread in the config cannot override because PM2's saved env takes precedence.

## Fix Procedure

```bash
# 1. Stop and delete the PM2 process (removes stale cached env)
pm2 stop <app-name>
pm2 delete <app-name>

# 2. Kill any stray node processes still holding the port
lsof -ti:<PORT> | xargs kill -9 2>/dev/null
# Verify port is free
ss -tlnp "sport = :<PORT>"

# 3. Re-create from ecosystem config (loads fresh env values)
pm2 start ecosystem.config.cjs --only <app-name>

# 4. Wait for startup and verify
sleep 5
pm2 logs <app-name> --lines 10 --nostream
curl -sI http://localhost:<PORT>
```

## Key Indicators

- PM2 logs show `EADDRINUSE` on unexpected port
- `pm2 env <id>` shows PORT value that doesn't match ecosystem config
- `pm2 show <app-name>` says "waiting restart" or shows excessive restart count
- App builds fine but nginx returns 502 (proxying to wrong/down port)

## Prevention

Always use `pm2 start ecosystem.config.cjs --only <app>` rather than ad-hoc `pm2 start` commands, as this ensures the config file is the source of truth. If you change env variables in the config, delete + recreate the process rather than relying on restart.
