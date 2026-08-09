---
name: show-it-works-ui
description: Record, upload, and report a video of every completed daily coding task through the Show It Works UI MCP server so the developer can immediately verify the result. Use by default at the end of task execution; skip all video work only when the user explicitly rejects video evidence.
---

# Show It Works UI

## Required Daily Workflow

Use this skill for daily coding work. When a task is complete, record the final test run, publish it through the Show It Works UI MCP server, and return its public viewer link in the chat.

The only exception is an explicit user opt-out, such as "do not record a video", "skip video evidence", or equivalent. In that case, do not record, upload, or post a video. Do not infer an opt-out from task scope, time pressure, or the absence of a UI request.

Never claim that a task is ready for validation until the video has been published and its viewer link has been sent in the chat.

## One-Time Setup

Before using the MCP tools:

1. Open the Show It Works website and sign in with GitHub.
2. Open `/dashboard`, create an MCP API key, and copy it immediately. The key is displayed only once.
3. Paste the key into the user-specific MCP configuration as an `Authorization: Bearer` header. Do not put it in this plugin repository or any other version-controlled file.

For example, configure the deployed endpoint and key in the AI agent's local MCP configuration:

```json
{
  "mcpServers": {
    "show-it-works-ui": {
      "type": "streamable-http",
      "url": "https://YOUR_DOMAIN/api/mcp",
      "headers": {
        "Authorization": "Bearer vsh_YOUR_API_KEY"
      }
    }
  }
}
```

Use `http://localhost:3000/api/mcp` only when the service is running locally. The packaged `mcp.json` intentionally contains no credentials; it is distributable package data.

## Publish Evidence

1. Run the strongest available final verification for the task. Prefer the project's existing browser or end-to-end test and record the actual final behavior. If no recording test exists, run the application and record a focused manual verification.
2. Produce an MP4 or WebM recording. Prefer MP4/H.264 for broad browser compatibility. Do not capture API keys, credentials, private source data, or other secrets: anyone with the viewer link can watch it.
3. Call `create_video_upload` with a specific title, the recording filename, its MIME type, and its exact byte size.
4. Upload the recording bytes directly to the returned `upload.url`. Send every returned `upload.headers` value exactly, including `Content-Length`; do not use chunked transfer encoding.
5. Call `complete_video_upload` with the returned `videoId`. Do not report success unless it completes successfully.
6. Call `get_video_link` with that `videoId` after completion.
7. In the same completion message sent to the user, include the returned public URL as the video evidence link. Every video posting must return a link in chat so developers can immediately verify the run result.

Use a concise completion line such as:

```text
Verification video: https://YOUR_DOMAIN/v/PUBLIC_VIDEO_ID
```

If recording, upload, completion, or link retrieval fails, state the failure clearly and do not say the task has been validated. Retry when safe or provide the exact blocker.
