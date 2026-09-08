# Show It Works UI Agent Plugin

Show It Works UI gives AI coding agents a repeatable way to publish recorded final test runs and give developers a viewer link for immediate verification that stays stable for the recording's lifetime.

This repository is a portable [Agent Plugin](https://agent-plugins.org/specification) containing:

- `mcp.json`: a Streamable HTTP MCP connection for creating, completing, listing, finding, linking, and deleting recordings.
- `skills/show-it-works-ui/SKILL.md`: the daily-work workflow that requires agents to publish a final verification video and return its link in chat, unless the user explicitly opts out.

## Configure Authentication

1. Sign in to the Show It Works website with GitHub.
2. Visit `/settings`, create an MCP API key, and copy it when shown. It cannot be displayed again. The same page renders a ready-to-paste `.mcp.json` carrying the new key.
3. Add the key to the AI agent's local MCP configuration as an `Authorization` bearer header:

```json
{
  "mcpServers": {
    "show-it-works-ui": {
      "type": "streamable-http",
      "url": "https://showitworks.app/api/mcp",
      "headers": {
        "Authorization": "Bearer siw_YOUR_API_KEY"
      }
    }
  }
}
```

Do not put an API key in this repository or the distributed `mcp.json`. Plugin files are shareable package data, so secrets must remain in the user's local MCP configuration.

## Endpoint

The packaged MCP configuration targets `https://showitworks.app/api/mcp`.

## Project Language

A project is created in the language its team works in and keeps it for its lifetime. The MCP tool descriptions name that language, so an agent writes recording titles, task names and context in it without being told separately, and `create_video_upload` answers with a `languageWarning` when what it was sent does not look like that language — a warning rather than a refusal, so a recording is never lost to a wrong guess. Search indexes each project's recordings for its own language, while semantic matching works across languages regardless.

## Finding Recordings

`list_tasks` lists the task names already used in the API key's project, so an agent reuses an existing name instead of coining a near-duplicate. `search_videos` finds the recordings themselves by meaning as well as by wording, so an agent returning to a task a week later can locate what it already recorded. Both are scoped to the API key's own project, both take filters their tool descriptions spell out in full, and neither returns a recording past its retention deadline.

## Video Safety

Published viewer links are unrestricted and stay stable for the recording's lifetime. Recordings are deleted automatically when their retention window ends, which the project's plan sets at upload time, and the link stops working then. `list_videos` and `get_video_link` return each recording's exact `retainUntil` deadline, which is the only number worth quoting to anyone. Record only information that is safe to share with anyone who receives the link; never capture credentials, API keys, or other secrets.

Upload metadata has an explicit visibility boundary. `worktreeName` and `taskName` are public, `ownerContext` is shown only to the authenticated owner, and `publicContext` is shown publicly only when the uploading agent explicitly supplies it as safe. Agents should omit uncertain or sensitive metadata rather than infer a public value.
