# Darts (workspace)

The **Darts Training App** lives in the [`web/`](./web/) folder. See [`web/README.md`](./web/README.md) for install, environment variables, Supabase schema, and how to run the dev server.

## GitHub

Remote: [https://github.com/ffioriti85/darts](https://github.com/ffioriti85/darts) (`main`).

## Render

This repo includes [`render.yaml`](./render.yaml) (Blueprint). In the [Render Dashboard](https://dashboard.render.com/), use **Blueprints** → **New Blueprint Instance**, connect `ffioriti85/darts`, and fill in the secret environment variables when prompted (entries marked `sync: false` in the Blueprint).

**Render MCP** (Cursor): add a [Render API key](https://dashboard.render.com/u/settings#api-keys) to your MCP server config for `https://mcp.render.com/mcp` (`Authorization: Bearer <key>`). Restart Cursor, select your workspace, then you can create or manage services via MCP. If tools return `unauthorized`, the API key is missing or invalid.

**Production:** point Clerk allowed origins and redirect URLs at your `*.onrender.com` URL, and set Supabase + Clerk env vars on the Render service.
