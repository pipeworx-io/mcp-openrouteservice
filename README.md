# @pipeworx/openrouteservice

[Openrouteservice (ORS)](https://openrouteservice.org) MCP — directions, matrix, isochrones, snap-to-roads, elevation, POI. Free tier 2000 req/day. Key required.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1476+ live data sources.

## Auth

- Platform: `PLATFORM_ORS_KEY`. BYO: `?_apiKey=…`.

## Tools

- `directions(coordinates, profile?, format?, instructions?)` — routing
- `matrix(locations, profile?, sources?, destinations?, metrics?)` — distance/duration matrix
- `isochrones(locations, profile?, range, range_type?)` — drive/walk isochrones
- `snap(locations, profile?, radius?)` — snap to nearest road
- `elevation_line(format_in, geometry)` — elevation along a line
- `elevation_point(format_in, geometry)` — elevation at a point
- `geocode_search(text, sources?, layers?, size?, focus_lat?, focus_lon?)` — Pelias geocoder

`profile`: `driving-car` (default) | `driving-hgv` | `cycling-regular` | `cycling-road` | `cycling-mountain` | `foot-walking` | `foot-hiking` | `wheelchair`.

## Data source

`https://api.openrouteservice.org/v2/`

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "openrouteservice": {
      "url": "https://gateway.pipeworx.io/openrouteservice/mcp"
    }
  }
}
```

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/openrouteservice/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1476+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Openrouteservice data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT

## No MCP client? Call it over HTTP

```bash
curl -X POST https://gateway.pipeworx.io/v1/tools/openrouteservice_directions \
  -H 'Content-Type: application/json' \
  -d '{"coordinates":[[8.681495,49.41461],[8.687872,49.420318]],"profile":"driving-car","instructions":true}'
```

No account needed for the first calls. Inspect any tool: `GET https://gateway.pipeworx.io/v1/tools/openrouteservice_directions`. Find one: `POST https://gateway.pipeworx.io/v1/tools/search_packs` with `{"query":"..."}`.
