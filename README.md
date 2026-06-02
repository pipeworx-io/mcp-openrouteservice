# mcp-openrouteservice

Openrouteservice MCP.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 673+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `directions` | Routing. |
| `matrix` | Distance/duration matrix. |
| `isochrones` | Drive/walk isochrones. |
| `snap` | Snap to nearest road. |
| `elevation_line` | Elevation along a line. |
| `elevation_point` | Elevation at a point. |
| `geocode_search` | Pelias geocoder. |

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

Or connect to the full Pipeworx gateway for access to all 673+ data sources:

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

- [All tools and guides](https://github.com/pipeworx-io/examples)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
