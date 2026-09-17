#!/usr/bin/env node
// The plugin is described twice: once in the portable Agent Plugins manifest
// (plugin.json) and once for Claude Code (.claude-plugin/plugin.json, plus the
// entry in .claude-plugin/marketplace.json). Nothing reads all three, so this
// check is what keeps a release from shipping two different versions of the
// same plugin.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => JSON.parse(readFileSync(join(root, file), "utf8"));

const portable = read("plugin.json");
const claude = read(".claude-plugin/plugin.json");
const marketplace = read(".claude-plugin/marketplace.json");

const entry = marketplace.plugins.find((plugin) => plugin.name === portable.name);

const problems = [];

if (!entry) {
  problems.push(
    `.claude-plugin/marketplace.json lists no plugin named "${portable.name}"`,
  );
}

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

for (const field of ["name", "version", "description", "license", "homepage", "repository", "keywords"]) {
  if (!same(portable[field], claude[field])) {
    problems.push(
      `${field}: plugin.json has ${JSON.stringify(portable[field])}, ` +
        `.claude-plugin/plugin.json has ${JSON.stringify(claude[field])}`,
    );
  }
  if (entry && field in entry && !same(portable[field], entry[field])) {
    problems.push(
      `${field}: plugin.json has ${JSON.stringify(portable[field])}, ` +
        `the marketplace entry has ${JSON.stringify(entry[field])}`,
    );
  }
}

if (!same(portable.author?.name, claude.author?.name)) {
  problems.push(
    `author.name: plugin.json has ${JSON.stringify(portable.author?.name)}, ` +
      `.claude-plugin/plugin.json has ${JSON.stringify(claude.author?.name)}`,
  );
}

const portableServers = Object.keys(read("mcp.json").mcpServers ?? {});
const claudeServers = Object.keys(read(".mcp.json").mcpServers ?? {});
if (!same(portableServers, claudeServers)) {
  problems.push(
    `MCP server names: mcp.json has ${JSON.stringify(portableServers)}, ` +
      `.mcp.json has ${JSON.stringify(claudeServers)}`,
  );
}

for (const [name, server] of Object.entries(read(".mcp.json").mcpServers ?? {})) {
  const url = read("mcp.json").mcpServers?.[name]?.url;
  if (url && server.url !== url) {
    problems.push(`${name}: mcp.json points at ${url}, .mcp.json points at ${server.url}`);
  }
}

if (problems.length > 0) {
  console.error("The plugin manifests disagree:\n");
  for (const problem of problems) console.error(`  - ${problem}`);
  console.error(
    "\nUpdate every manifest together: plugin.json, .claude-plugin/plugin.json " +
      "and the entry in .claude-plugin/marketplace.json.",
  );
  process.exit(1);
}

console.log("Manifests agree.");
