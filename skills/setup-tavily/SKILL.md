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

Claude Code should prompt for `tavily_api_key` automatically when this plugin is enabled (declared in `.claude-plugin/plugin.json`'s `userConfig`). If it doesn't prompt, or the user needs to change it later, tell them to check the plugin's configuration in Claude Code's `/plugin` settings for `tavily-search`, or reinstall the plugin to trigger the prompt again.

## Step 5: Verify end to end

Once configured, actually call the `tavily_search` tool with a simple real query (e.g. "today's top news") and confirm a real result comes back rather than an error - report the real outcome to the user, don't assume it worked.
