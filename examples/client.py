#!/usr/bin/env python3
"""Zero-dependency Python client for the SubcueAI public MCP server.

Usage:
    python3 client.py                       # initialize + list tools/resources
    python3 client.py get_pricing           # live pricing
    python3 client.py get_latest_version macos-arm64
"""

import json
import sys
import urllib.request

ENDPOINT = "https://subcue.ai/mcp"
_next_id = 0


def rpc(method, params=None):
    global _next_id
    _next_id += 1
    payload = {"jsonrpc": "2.0", "id": _next_id, "method": method}
    if params is not None:
        payload["params"] = params
    # Send a descriptive User-Agent: default library UAs (e.g. Python-urllib)
    # are rejected by edge bot protection with a 403.
    req = urllib.request.Request(
        ENDPOINT,
        data=json.dumps(payload).encode(),
        headers={
            "Content-Type": "application/json",
            "User-Agent": "subcue-mcp-example/1.0 (+https://github.com/Subcue/subcue-mcp)",
        },
    )
    with urllib.request.urlopen(req, timeout=15) as res:
        body = json.load(res)
    if "error" in body:
        raise RuntimeError(f"{method}: {body['error']['code']} {body['error']['message']}")
    return body["result"]


def main() -> None:
    args = sys.argv[1:]
    if not args:
        init = rpc("initialize", {})
        info = init["serverInfo"]
        print(f"server: {info['name']} v{info['version']} (protocol {init['protocolVersion']})\n")
        print("tools:", ", ".join(t["name"] for t in rpc("tools/list")["tools"]))
        print("resources:", ", ".join(r["uri"] for r in rpc("resources/list")["resources"]))
        return
    tool = args[0]
    tool_args = {"platform": args[1]} if len(args) > 1 else {}
    result = rpc("tools/call", {"name": tool, "arguments": tool_args})
    for item in result["content"]:
        print(item["text"])


if __name__ == "__main__":
    main()
