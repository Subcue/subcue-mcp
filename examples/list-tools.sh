#!/bin/sh
# Curl walkthrough of the SubcueAI public MCP server (JSON-RPC 2.0 over HTTP).
set -e
MCP=https://subcue.ai/mcp

echo '── initialize ──────────────────────────────────────────'
curl -s "$MCP" -X POST -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}'
echo; echo '── tools/list ──────────────────────────────────────────'
curl -s "$MCP" -X POST -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'
echo; echo '── tools/call get_pricing ──────────────────────────────'
curl -s "$MCP" -X POST -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"get_pricing"}}'
echo; echo '── tools/call get_latest_version ───────────────────────'
curl -s "$MCP" -X POST -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"get_latest_version","arguments":{"platform":"macos-arm64"}}}'
echo; echo '── resources/list ──────────────────────────────────────'
curl -s "$MCP" -X POST -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":5,"method":"resources/list"}'
echo; echo '── resources/read subcue://overview ────────────────────'
curl -s "$MCP" -X POST -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":6,"method":"resources/read","params":{"uri":"subcue://overview"}}'
echo
