#!/usr/bin/env node
// Stdio ⇄ HTTP bridge for the SubcueAI public MCP server.
//
// Speaks MCP over stdio (newline-delimited JSON-RPC 2.0) and forwards every
// request to the remote streamable-http endpoint at https://subcue.ai/mcp.
// Zero dependencies — Node 18+ (built-in fetch).
//
// Usage:
//   node bridge/server.mjs
//   claude mcp add subcue -- node /path/to/bridge/server.mjs
//   docker build -t subcue-mcp . && docker run -i subcue-mcp

import { createInterface } from 'node:readline';

const ENDPOINT = process.env.SUBCUE_MCP_ENDPOINT ?? 'https://subcue.ai/mcp';
const USER_AGENT = 'subcue-mcp-bridge/1.0 (+https://github.com/Subcue/subcue-mcp)';

const rl = createInterface({ input: process.stdin, terminal: false });

rl.on('line', async (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;

  let message;
  try {
    message = JSON.parse(trimmed);
  } catch {
    respond({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } });
    return;
  }

  const isNotification = message.id === undefined || message.id === null;

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': USER_AGENT },
      body: JSON.stringify(message),
    });
    // Notifications get 202 + empty body from the remote — nothing to emit.
    if (isNotification) return;
    if (!res.ok) {
      respond({
        jsonrpc: '2.0',
        id: message.id,
        error: { code: -32000, message: `Upstream HTTP ${res.status}` },
      });
      return;
    }
    respond(await res.json());
  } catch (err) {
    if (isNotification) return;
    respond({
      jsonrpc: '2.0',
      id: message.id,
      error: { code: -32001, message: `Upstream unreachable: ${err?.message ?? err}` },
    });
  }
});

function respond(payload) {
  process.stdout.write(`${JSON.stringify(payload)}\n`);
}
