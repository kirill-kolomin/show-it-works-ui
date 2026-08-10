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

## Publish Evidence

1. Run the strongest available final verification for the task. Prefer the project's existing browser or end-to-end test and record the actual final behavior. If no recording test exists, run the application and record a focused manual verification.
2. Produce an MP4 or WebM recording. Prefer MP4/H.264 for broad browser compatibility. Do not capture API keys, credentials, private source data, or other secrets: anyone with the viewer link can watch it.
3. Call `create_video_upload` with a specific title, the recording filename, its MIME type, and its exact byte size.
4. Upload the recording bytes directly to the returned `upload.url`. Send every returned `upload.headers` value exactly, including `Content-Length`; do not use chunked transfer encoding.
5. Call `complete_video_upload` with the returned `videoId`. Do not report success unless it completes successfully.
6. Call `get_video_link` with that `videoId` after completion.
7. After all task iterations and stale-video cleanup are complete, include only the final returned public URL in the completion message. Every video posting must return a link in chat so developers can immediately verify the final run result.

Use a concise completion line such as:

```text
Verification video: https://video-sharing-rust.vercel.app/v/PUBLIC_VIDEO_ID
```

If recording, upload, completion, or link retrieval fails, state the failure clearly and do not say the task has been validated. Retry when safe or provide the exact blocker.

## Iterative Evidence Cleanup

A video is evidence only for the exact code state and verification run it records.

1. Prefer keeping recordings from intermediate verification runs local. Create and complete an upload only after the implementation and final verification are complete.
2. Keep the `videoId` for every upload created during the task until the task is complete, including uploads that are incomplete, failed verification, or superseded.
3. If a later code change, test change, or verification run is required after a video has completed, that completed video is stale. Call `delete_video` with its `videoId` before publishing replacement evidence.
4. If multiple stale videos exist, delete all of them. Do not return stale, failed, or superseded video links to the developer.
5. The final response must include exactly one verification-video link: the last successfully completed recording of the final code state.
6. If the task fails, is abandoned, or final publication cannot be completed, delete completed intermediate videos created for the task when safe. State that final video evidence is unavailable.
7. If deletion fails, do not describe the stale video as final evidence. State the cleanup failure and include only the final video link, if one exists.
