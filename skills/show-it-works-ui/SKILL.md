---
name: show-it-works-ui
description: Record, upload, and report final verification evidence through the Show It Works UI MCP server when the user explicitly requests video evidence or repository agent instructions require it.
---

# Show It Works UI

## When To Use

Use this skill only when either condition applies:

1. The user explicitly asks for a recording, video evidence, or an equivalent deliverable.
2. Repository-level agent instructions, such as `AGENTS.md` or `CLAUDE.md`, explicitly require video evidence for this task.

Do not record, upload, or post a video solely because a coding task was completed. An explicit request or applicable repository instruction is required.

When this skill applies, record the final test run, publish it through the Show It Works UI MCP server, and return its public viewer link in the chat. Do not claim that the task is ready for video validation until the video has been published and its viewer link has been sent.

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
      "url": "https://video-sharing-rust.vercel.app/api/mcp",
      "headers": {
        "Authorization": "Bearer vsh_YOUR_API_KEY"
      }
    }
  }
}
```

## Recording Tools

Use any safe recording method available in the current environment that can produce an MP4 or WebM showing the relevant verification. Do not require a specific browser automation or screen-recording tool.

1. Prefer the project's existing browser-test recorder, agent browser tool, operating-system recorder, or another available recording capability.
2. If no recording setup is available, follow the [Playwright recording fallback](references/playwright-recording.md). Load that reference only when needed.
3. Capture only the relevant application browser context or window. Do not record credentials, terminals, local files, unrelated browser tabs, or other private data.
4. If no safe recording method is available, state that video evidence could not be produced and provide the exact blocker. Do not claim visual verification.

## Publish Evidence

1. Run the strongest available final verification for the task. Prefer the project's existing browser or end-to-end test and record the actual final behavior. If no recording test exists, run the application and record a focused manual verification.
2. Produce an MP4 or WebM recording. Prefer MP4/H.264 for broad browser compatibility. Do not capture API keys, credentials, private source data, or other secrets: anyone with the viewer link can watch it.
3. Call `create_video_upload` with a specific title, the recording filename, its MIME type, its exact byte size, and useful metadata when available:
   - `worktreeName`: a concise git worktree or repository name that is safe to show publicly.
   - `taskName`: a concise task or verification name that is safe to show publicly.
   - `ownerContext`: the most informative non-secret context for the authenticated owner, such as intent, verified behavior, relevant commands, and result summary.
   - `publicContext`: only context you have explicitly determined is safe for anyone with the public link.
   Worktree and task are public fields. Omit a field if its real value is sensitive. Never copy, infer, or automatically summarize `ownerContext` into `publicContext`; omission is safer than guessing. Never include credentials, secrets, private source data, or sensitive paths in any metadata.
4. Upload the recording bytes directly to the returned `upload.url`. Send every returned `upload.headers` value exactly, including `Content-Length`; do not use chunked transfer encoding.
5. Call `complete_video_upload` with the returned `videoId`. Do not report success unless it completes successfully.
6. Call `get_video_link` with that `videoId` after completion.
7. Include only the latest returned public URL in the completion message. Every video posting must return a link in chat so developers can immediately verify the current run result.

Use a concise completion line such as:

```text
Verification video: https://video-sharing-rust.vercel.app/v/PUBLIC_VIDEO_ID
```

If recording, upload, completion, or link retrieval fails, state the failure clearly and do not say the task has been validated. Retry when safe or provide the exact blocker.

## Evidence Retention And Session Closeout

A video is evidence only for the exact code state and verification run it records.

1. Retain every completed recording created for the current work session. Do not delete a recording merely because a later code change, test change, or verification run supersedes it.
2. Keep the `videoId` for every recording created during the work session. Treat prior recordings as superseded after later successful verification, but retain them for rollback investigation.
3. In normal completion messages, return exactly one verification-video link: the latest successfully completed recording for the current code state. Do not include superseded links unless the developer asks for them.
4. When a developer explicitly asks to close the work session, clean up recordings, or clearly indicates that work is finished, ask whether to retain or delete the recordings created during the current work session. Do not delete recordings without confirmation.
5. On confirmed cleanup, call `delete_video` only for the `videoId` values created during the current work session. Do not delete recordings from unrelated work.
6. If deletion fails, state the cleanup failure clearly and retain the affected `videoId` values for a later retry.
