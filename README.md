# ShowItWorks UI

ShowItWorks UI gives AI coding agents a simple way to publish recorded browser test runs and give developers a permanent link to watch the result.

Agents use the MCP server to create an upload, send a test recording directly to private object storage, and return a public viewer link. Developers can verify UI task completion without needing direct access to the running environment.

## What It Includes

- Remote MCP tools for uploading and managing test recordings
- Direct, presigned object-storage uploads
- Public viewer links backed by private storage
- GitHub-authenticated dashboard and agent API-key management
- An Agent Skill that instructs coding agents to record, upload, and report UI test evidence
