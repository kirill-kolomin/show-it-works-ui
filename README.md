# Show It Works UI Agent Plugin

Show It Works UI gives AI coding agents a repeatable way to publish recorded final test runs and give developers a permanent viewer link for immediate verification.

This repository is a portable [Agent Plugin](https://agent-plugins.org/specification) containing:

- `mcp.json`: a Streamable HTTP MCP connection for creating, completing, listing, linking, and deleting recordings.
- `skills/show-it-works-ui/SKILL.md`: the daily-work workflow that requires agents to publish a final verification video and return its link in chat, unless the user explicitly opts out.

## Configure Authentication

1. Sign in to the Show It Works website with GitHub.
2. Visit `/dashboard`, create an MCP API key, and copy it when shown. It cannot be displayed again.
3. Add the key to the AI agent's local MCP configuration as an `Authorization` bearer header:

```json
{
  "mcpServers": {
    "show-it-works-ui": {
      "type": "streamable-http",
      "url": "https://video-sharing-rust.vercel.app/api/mcp",
      "headers": {
        "Authorization": "Bearer vsh_YOUR_API_KEY"
      }
    }
  }
}
```

Do not put an API key in this repository or the distributed `mcp.json`. Plugin files are shareable package data, so secrets must remain in the user's local MCP configuration.

## Endpoint

The packaged MCP configuration targets `https://video-sharing-rust.vercel.app/api/mcp`.

## Video Safety

Published viewer links are permanent and unrestricted. Record only information that is safe to share with anyone who receives the link; never capture credentials, API keys, or other secrets.

Upload metadata has an explicit visibility boundary. `worktreeName` and `taskName` are public, `ownerContext` is shown only to the authenticated owner, and `publicContext` is shown publicly only when the uploading agent explicitly supplies it as safe. Agents should omit uncertain or sensitive metadata rather than infer a public value.
