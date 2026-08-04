# @pipeworx/openrouteservice

[Openrouteservice (ORS)](https://openrouteservice.org) MCP — directions, matrix, isochrones, snap-to-roads, elevation, POI. Free tier 2000 req/day. Key required.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Openrouteservice data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
