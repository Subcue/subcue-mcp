#!/usr/bin/env node
// Zero-dependency Node.js client for the SubcueAI public MCP server.
// Usage: node client.mjs [tool] [platform]
//   node client.mjs                      → initialize + list tools/resources
//   node client.mjs get_pricing          → live pricing
//   node client.mjs get_latest_version macos-arm64

const ENDPOINT = 'https://subcue.ai/mcp';
let nextId = 0;

async function rpc(method, params) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: ++nextId, method, ...(params ? { params } : {}) }),
  });
  const body = await res.json();
  if (body.error) throw new Error(`${method}: ${body.error.code} ${body.error.message}`);
  return body.result;
}

const [tool, platform] = process.argv.slice(2);

if (!tool) {
  const init = await rpc('initialize', {});
  console.log(`server: ${init.serverInfo.name} v${init.serverInfo.version} (protocol ${init.protocolVersion})\n`);
  const { tools } = await rpc('tools/list');
  console.log('tools:', tools.map((t) => t.name).join(', '));
  const { resources } = await rpc('resources/list');
  console.log('resources:', resources.map((r) => r.uri).join(', '));
} else {
  const args = platform ? { platform } : {};
  const result = await rpc('tools/call', { name: tool, arguments: args });
  for (const item of result.content) console.log(item.text);
}
