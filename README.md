# Show It Works UI Agent Plugin

Show It Works UI gives AI coding agents a repeatable way to publish recorded final test runs and give developers a viewer link for immediate verification that stays stable for the recording's lifetime.

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

## Project Language

A project is created in the language its team works in and keeps it for its lifetime. The MCP tool descriptions name that language, so an agent writes recording titles, task names and context in it without being told separately. Search indexes each project's recordings for its own language, while semantic matching works across languages regardless.

## Finding Recordings

`list_tasks` lists the task names already used in the API key's project, with the spellings each one covers, how many recordings carry it, and when it was first and last used. It is the cheap, deterministic way to reuse an existing task name instead of coining a near-duplicate: copy the returned `taskName` verbatim. The list is derived from the recordings that still exist, so a name is listed while at least one of its recordings is still inside its retention window (14 to 60 days after upload, by plan) and disappears once the last of them reaches that deadline. It counts the calling key's own uploads by default — pass `mine: false` for every project member's — and takes the same optional `taskName`, `createdAfter`, `createdBefore` and `limit` filters, plus an optional `query` that returns the tasks of the recordings best matching a description of the work.

`search_videos` finds recordings in the API key's project by meaning as well as by wording, so an agent returning to a task a week later can locate what it already recorded instead of inventing a new task name. It accepts a `query` plus optional `taskName`, `mine`, `createdAfter`, `createdBefore` and `limit` filters, and never returns recordings from another project or past their retention deadline.

## Video Safety

Published viewer links are unrestricted and stay stable for the recording's lifetime. Recordings are deleted automatically when their retention window ends — 14 to 60 days after upload, depending on the uploading account's plan — after which the link stops working. `list_videos` and `get_video_link` return each recording's exact `retainUntil` deadline. Record only information that is safe to share with anyone who receives the link; never capture credentials, API keys, or other secrets.

Upload metadata has an explicit visibility boundary. `worktreeName` and `taskName` are public, `ownerContext` is shown only to the authenticated owner, and `publicContext` is shown publicly only when the uploading agent explicitly supplies it as safe. Agents should omit uncertain or sensitive metadata rather than infer a public value.
