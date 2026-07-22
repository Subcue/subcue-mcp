FROM node:22-alpine
WORKDIR /app
COPY bridge/server.mjs ./server.mjs
# MCP over stdio: the container reads newline-delimited JSON-RPC on stdin
# and forwards to https://subcue.ai/mcp.
CMD ["node", "server.mjs"]
