# SubcueAI Public MCP Server

**[SubcueAI](https://subcue.ai)** (the real-time AI interview assistant for macOS & Windows) ships a **public, unauthenticated, read-only [Model Context Protocol](https://modelcontextprotocol.io) server**. Any AI agent can query live product data — pricing, latest desktop version, product overview, FAQ — instead of scraping HTML.

- **Endpoint**: `POST https://subcue.ai/mcp`
- **Transport**: streamable-http (single JSON response), JSON-RPC 2.0, MCP protocol `2025-06-18`
- **Auth**: none. **Writes**: none — the server is strictly read-only.
- **Server card**: [`https://subcue.ai/.well-known/mcp/server-card.json`](https://subcue.ai/.well-known/mcp/server-card.json)

This repository documents the server and provides ready-to-run client examples. The server itself runs on Cloudflare Workers as part of the SubcueAI website.

## Quick start

```sh
# List tools
curl -s https://subcue.ai/mcp -X POST -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

# Live pricing
curl -s https://subcue.ai/mcp -X POST -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get_pricing"}}'
```

Sample `get_pricing` output (live data, abridged):

```markdown
# SubcueAI Pricing

## Starter — free
- Standard AI model
- Mock interview practice

## Pro — $20/mo; $16/mo when billed yearly ($192/yr)
...
```

## Tools

| Tool | Arguments | Returns |
|---|---|---|
| `get_pricing` | — | Current subscription plans and pricing (Markdown) |
| `get_latest_version` | `platform` (optional, e.g. `macos-arm64`, `windows-x64`) | Latest desktop app version, release date, download URL |

## Resources

| URI | Content |
|---|---|
| `subcue://overview` | What SubcueAI is, key features, links (Markdown) |
| `subcue://faq` | Frequently asked questions (Markdown) |

Use `resources/list` / `resources/read` per the MCP spec.

## Connect from popular clients

**Claude Code**

```sh
claude mcp add --transport http subcue https://subcue.ai/mcp
```

**Cursor / any client using `mcp.json`**

```json
{
  "mcpServers": {
    "subcue": { "url": "https://subcue.ai/mcp" }
  }
}
```

**claude.ai** — Settings → Connectors → Add custom connector → `https://subcue.ai/mcp`.

## Examples in this repo

- [`examples/list-tools.sh`](examples/list-tools.sh) — curl walkthrough of every method
- [`examples/client.mjs`](examples/client.mjs) — zero-dependency Node.js client
- [`examples/client.py`](examples/client.py) — zero-dependency Python client

## Other machine-readable entry points

SubcueAI publishes a full agent-facing surface beyond MCP:

| Endpoint | What it is |
|---|---|
| [`/llms.txt`](https://subcue.ai/llms.txt) | Plain-text site & product summary for language models |
| [`/.well-known/api-catalog`](https://subcue.ai/.well-known/api-catalog) | RFC 9727 linkset of public JSON APIs |
| [`/.well-known/agent-skills/index.json`](https://subcue.ai/.well-known/agent-skills/index.json) | Agent Skills discovery index |
| [`/.well-known/agent-skills/subcue-public-info/SKILL.md`](https://subcue.ai/.well-known/agent-skills/subcue-public-info/SKILL.md) | Agent skill: how to fetch SubcueAI public data |
| `Accept: text/markdown` | Any public marketing/legal page returns Markdown instead of HTML |

## Notes for agent developers

- Responses are deterministic JSON-RPC; notifications (`notifications/*`) are accepted and return `202` with no body.
- Data is live (pricing and versions come from the same source of truth as the website) — prefer these endpoints over scraping rendered HTML.
- Rate limiting applies at the edge; be a good citizen.
- Send a **descriptive `User-Agent`** — default library UAs (e.g. `Python-urllib/3.x`) are rejected by edge bot protection with a `403`.

## License

Documentation and examples: [MIT](LICENSE) © 2026 [Subcue AI LLC](https://subcueai.com).
