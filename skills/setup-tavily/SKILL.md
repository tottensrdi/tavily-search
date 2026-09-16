---
description: Walk a new user through getting their own free Tavily API key and getting it installed dependencies for the tavily-search plugin. Use when someone installs this plugin for the first time, asks how to set up Tavily, or the tavily_search tool errors saying no key is configured.
---

# Set up Tavily search

This plugin gives Claude a way to search real news, including major outlets (NYT, WSJ, Reuters, BBC, etc.) that Claude's built-in web tools can't reach directly. It needs the user's own Tavily API key - deliberately their own, not a shared team key, so one person's usage doesn't eat into everyone else's free quota.

Walk the user through this interactively, one step at a time - don't dump the whole thing as a wall of text. Confirm each step actually completed before moving to the next.

## Step 1: Install the server's dependencies

Run this in the plugin's own directory (`${CLAUDE_PLUGIN_ROOT}`), once, the first time:

```bash
cd "${CLAUDE_PLUGIN_ROOT}" && npm install
```

If this fails, stop and help the user resolve it (usually a missing/old Node.js - the server needs Node 18+) before continuing.

## Step 2: Get a free Tavily API key

Tell the user to:
1. Go to https://tavily.com and sign up for a free account (no credit card required as of this writing - the free "Researcher" tier includes 1,000 searches/month).
2. Once signed in, find their API key on their account dashboard (it starts with `tvly-`).

If the user gets stuck or the site's layout doesn't match this description, use WebFetch on https://tavily.com to see the current real page and guide them from what's actually there, rather than assuming the above is still accurate - UI details drift over time.

## Step 3: Confirm the key actually works

Once they give you the key, verify it for real before declaring success - don't just take it on faith:

```bash
curl -s "https://api.tavily.com/usage" -H "Authorization: Bearer <their-key>"
```

A working key returns real JSON with `account.plan_limit` and `account.plan_usage`. Show the user their real plan limit so they know their actual budget (e.g. "you're on the free tier: 1,000 searches/month").

## Step 4: Get the key into Claude Code

Don't rely on an interactive config prompt firing - it doesn't reliably happen when this plugin was installed by copying it into `~/.claude/skills/` (the no-git install path most people use) rather than through the marketplace/install flow. Instead, edit the key directly into this plugin's own `.mcp.json`, which is a certain, verified mechanism (this is literally how the server was tested during development):

1. Find `.mcp.json` in `${CLAUDE_PLUGIN_ROOT}` (the plugin's own root directory - the same folder this skill lives under).
2. Edit the `env.TAVILY_API_KEY` value to the user's real key, replacing whatever placeholder is there.
3. Tell the user they need to fully restart Claude Code once for the MCP server to pick up the new value (it reads the env var once at startup, not live).

## Step 5: Verify end to end

After the restart, actually call the `tavily_search` tool with a simple real query (e.g. "today's top news") and confirm a real result comes back rather than an error - report the real outcome to the user, don't assume it worked.
