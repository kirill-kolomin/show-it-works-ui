# Playwright Recording Fallback

Use this fallback only when the environment has no suitable browser recorder. It supports agent-generated or agent-adapted actions and produces a WebM that can be published through the Show It Works UI MCP tools.

## Safety Rules

1. Do not record sign-in, credentials, API keys, private source data, or unrelated browser content.
2. Ask the user to authenticate manually when required. Start the final recording only after the authenticated application page is visible.
3. Install Playwright in a temporary directory outside the repository when it is needed only for recording evidence. Do not modify the project's dependencies or require a global installation.
4. If the user explicitly asks for a project-local installation, honor that request and add generated scripts, browser state, screenshots, traces, and recordings to `.gitignore`.
5. Treat exported browser storage state as a secret. Store it only in the temporary or ignored working directory and never upload or commit it.
6. Prefer Playwright's native WebM output. Convert to MP4 only when the hosting service requires it and a safe converter is already available.

## Install In A Temporary Directory

Create a disposable working directory appropriate for the operating system. On Linux or macOS:

```bash
workdir="$(mktemp -d)"
cd "$workdir"
npm init -y
npm install playwright@latest
npx playwright install chromium
```

Use the platform's temporary-directory equivalent on Windows. Keep all scripts, browser state, and recordings inside this directory.

## Prepare Authentication Without Recording It

If the target page requires authentication:

1. Open the site with an available agent browser or Playwright browser session.
2. Ask the user to complete authentication manually in that browser. Never request credentials in chat or enter them into generated scripts.
3. Confirm that the intended application page is visible.
4. If the browser tool permits context access, export its Playwright storage state into the temporary directory:

```js
await page.context().storageState({ path: "/absolute/temp/path/storage-state.json" });
```

5. Load that state in the recording context. If authenticated state cannot be transferred safely, stop and report the blocker rather than recording sign-in.

## Inspect Before Recording

Use the available browser or accessibility snapshot tools to identify the intended controls and resulting page state before starting the final recording. Prefer resilient, user-facing locators such as roles and accessible names:

```js
page.getByRole("link", { name: "Manage", exact: true }).first()
```

Do not use a destructive or externally visible action merely to discover a selector. Ask for confirmation before actions that delete data, publish content, spend money, revoke access, or have comparable side effects.

## Record The Final Run

Create `record.mjs` in the temporary directory. Adapt the URL and actions to the requested verification:

```js
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  storageState: "storage-state.json", // Remove when authentication is unnecessary.
  viewport: { width: 1280, height: 720 },
  recordVideo: {
    dir: "recordings",
    size: { width: 1280, height: 720 },
  },
});

const page = await context.newPage();
const video = page.video();

try {
  await page.goto("https://example.com/dashboard", {
    waitUntil: "networkidle",
  });

  const target = page.getByRole("link", {
    name: "Manage",
    exact: true,
  }).first();

  await target.waitFor({ state: "visible" });
  await page.waitForTimeout(1000);
  await target.click();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1500);
} finally {
  // Closing the context is required to finalize the WebM file.
  await context.close();
  await browser.close();
}

console.log(await video.path());
```

Run it from the temporary working directory:

```bash
node record.mjs
```

The agent should adapt locators and branching to the live page state discovered during inspection. Avoid fixed coordinates and brittle CSS selectors. Use explicit waits around meaningful UI states rather than long arbitrary delays; short delays before and after the relevant action are acceptable so a human viewer can follow the recording.

For a directly agent-driven browser session, the browser context must be created with `recordVideo` before the agent starts acting. Video recording cannot be enabled retroactively on an existing context. If the available browser MCP does not expose video-enabled context creation, use the generated Playwright script approach above or report that direct interactive recording is unavailable.

## Validate The Recording

Confirm that the file exists, has a nonzero exact byte size, and is a valid WebM before creating an upload. If `ffprobe` is available:

```bash
ffprobe -v error \
  -show_entries format=duration,size,format_name \
  -of default=noprint_wrappers=1 \
  recordings/*.webm
```

Obtain the exact byte size with a platform-appropriate file metadata command. Pass that exact size and `video/webm` to `create_video_upload`, then follow the publishing steps in the main skill.

If recording or validation fails, retry only when safe. Otherwise report the exact blocker and do not claim visual verification.
