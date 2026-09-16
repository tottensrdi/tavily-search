# tavily-search

A Claude Code plugin that gives Claude a real news-search tool via [Tavily](https://tavily.com) - reaching major outlets (NYT, WSJ, Reuters, BBC, etc.) that Claude's built-in web tools can't fetch directly.

Each person who installs this uses **their own** free Tavily account/API key - not a shared one, so usage doesn't compete for the same quota.

## Install (no git required)

1. On this page, click the green **Code** button → **Download ZIP**
2. Unzip it
3. Move the unzipped `tavily-search` folder into your Claude Code skills directory:
   - Windows: `C:\Users\<you>\.claude\skills\tavily-search`
   - Mac/Linux: `~/.claude/skills/tavily-search`
4. Open a terminal in that folder and run `npm install` (needs [Node.js](https://nodejs.org) installed - once, the first time)
5. Restart Claude Code

It should load automatically from then on - no `/plugin install`, no marketplace, no git. Then just ask Claude to "set up Tavily search" and it'll walk you through getting your own free API key and verifying it actually works.

## What it adds

One tool, `tavily_search(query, include_domains?, time_range?, max_results?)` - a real search that returns real article titles, URLs, and content snippets.
