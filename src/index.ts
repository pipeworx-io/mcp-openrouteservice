interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Openrouteservice MCP.
 */


const BASE = 'https://api.openrouteservice.org';
const UA = 'pipeworx-mcp-openrouteservice/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'directions',
    description: 'Routing.',
    inputSchema: {
      type: 'object',
      properties: {
        coordinates: { type: 'array', items: { type: 'array', items: { type: 'number' } }, description: '[[lon, lat], …]' },
        profile: { type: 'string' },
        format: { type: 'string', description: 'json (default) | geojson | gpx' },
        instructions: { type: 'boolean' },
      },
      required: ['coordinates'],
    },
  },
  {
    name: 'matrix',
    description: 'Distance/duration matrix.',
    inputSchema: {
      type: 'object',
      properties: {
        locations: { type: 'array', items: { type: 'array', items: { type: 'number' } } },
        profile: { type: 'string' },
        sources: { type: 'array', items: { type: 'number' } },
        destinations: { type: 'array', items: { type: 'number' } },
        metrics: { type: 'array', items: { type: 'string' }, description: '["duration","distance"]' },
      },
      required: ['locations'],
    },
  },
  {
    name: 'isochrones',
    description: 'Drive/walk isochrones.',
    inputSchema: {
      type: 'object',
      properties: {
        locations: { type: 'array', items: { type: 'array', items: { type: 'number' } } },
        profile: { type: 'string' },
        range: { type: 'array', items: { type: 'number' }, description: 'Seconds or meters.' },
        range_type: { type: 'string', description: 'time (default) | distance' },
      },
      required: ['locations', 'range'],
    },
  },
  {
    name: 'snap',
    description: 'Snap to nearest road.',
    inputSchema: {
      type: 'object',
      properties: {
        locations: { type: 'array', items: { type: 'array', items: { type: 'number' } } },
        profile: { type: 'string' },
        radius: { type: 'number' },
      },
      required: ['locations'],
    },
  },
  {
    name: 'elevation_line',
    description: 'Elevation along a line.',
    inputSchema: {
      type: 'object',
      properties: {
        format_in: { type: 'string', description: 'geojson | polyline | encodedpolyline5 | encodedpolyline6' },
        geometry: { description: 'Per format_in' },
      },
      required: ['format_in', 'geometry'],
    },
  },
  {
    name: 'elevation_point',
    description: 'Elevation at a point.',
    inputSchema: {
      type: 'object',
      properties: {
        format_in: { type: 'string', description: 'point | geojson' },
        geometry: { description: 'Per format_in (point: [lon, lat])' },
      },
      required: ['format_in', 'geometry'],
    },
  },
  {
    name: 'geocode_search',
    description: 'Pelias geocoder.',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string' },
        sources: { type: 'string' },
        layers: { type: 'string' },
        size: { type: 'number' },
        focus_lat: { type: 'number' },
        focus_lon: { type: 'number' },
      },
      required: ['text'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const apiKey = (args._apiKey as string | undefined)?.trim();
  if (!apiKey) throw new Error('Openrouteservice requires an API key. Set PLATFORM_ORS_KEY or pass ?_apiKey=… (free at https://openrouteservice.org/dev/#/signup).');
  const profile = String(args.profile ?? 'driving-car');
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json', 'User-Agent': UA, Authorization: apiKey };
  const post = async (path: string, body: unknown) => {
    const res = await fetch(`${BASE}${path}`, { method: 'POST', headers, body: JSON.stringify(body) });
    if (res.status === 401 || res.status === 403) throw new Error('ORS: invalid API key.');
    if (!res.ok) throw new Error(`ORS: ${res.status} ${await res.text().then((t) => t.slice(0, 200))}`);
    return res.json();
  };
  const get = async (path: string, params: URLSearchParams) => {
    const res = await fetch(`${BASE}${path}?${params}`, { headers: { ...headers, 'Content-Type': 'text/plain' } });
    if (res.status === 401 || res.status === 403) throw new Error('ORS: invalid API key.');
    if (!res.ok) throw new Error(`ORS: ${res.status}`);
    return res.json();
  };
  switch (name) {
    case 'directions': {
      const fmt = String(args.format ?? 'json');
      const body: Record<string, unknown> = { coordinates: args.coordinates };
      if (args.instructions != null) body.instructions = args.instructions;
      return post(`/v2/directions/${encodeURIComponent(profile)}${fmt !== 'json' ? `/${fmt}` : ''}`, body);
    }
    case 'matrix': {
      const body: Record<string, unknown> = { locations: args.locations };
      for (const k of ['sources', 'destinations', 'metrics'] as const) if (args[k]) body[k] = args[k];
      return post(`/v2/matrix/${encodeURIComponent(profile)}`, body);
    }
    case 'isochrones': {
      const body: Record<string, unknown> = { locations: args.locations, range: args.range };
      if (args.range_type) body.range_type = args.range_type;
      return post(`/v2/isochrones/${encodeURIComponent(profile)}`, body);
    }
    case 'snap': {
      const body: Record<string, unknown> = { locations: args.locations };
      if (args.radius != null) body.radius = args.radius;
      return post(`/v2/snap/${encodeURIComponent(profile)}`, body);
    }
    case 'elevation_line': {
      const body = { format_in: args.format_in, geometry: args.geometry };
      return post('/elevation/line', body);
    }
    case 'elevation_point': {
      const body = { format_in: args.format_in, geometry: args.geometry };
      return post('/elevation/point', body);
    }
    case 'geocode_search': {
      const p = new URLSearchParams({ api_key: apiKey, text: reqStr(args, 'text', '"Paris"') });
      for (const k of ['sources', 'layers'] as const) if (args[k]) p.set(k, String(args[k]));
      if (args.size != null) p.set('size', String(args.size));
      if (args.focus_lat != null && args.focus_lon != null) {
        p.set('focus.point.lat', String(args.focus_lat));
        p.set('focus.point.lon', String(args.focus_lon));
      }
      return get('/geocode/search', p);
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
