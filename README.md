# tavily-search

A Claude Code plugin that gives Claude a real news-search tool via [Tavily](https://tavily.com) - reaching major outlets (NYT, WSJ, Reuters, BBC, etc.) that Claude's built-in web tools can't fetch directly.

Each person who installs this uses **their own** free Tavily account/API key - not a shared one, so usage doesn't compete for the same quota.

## Install

```bash
claude --plugin-dir /path/to/tavily-search
```

Claude Code will prompt for your Tavily API key on first load. If you don't have one yet, just ask Claude to run the `setup-tavily` skill and it'll walk you through getting one (free, no card required) and verifying it works.

## What it adds

One tool, `tavily_search(query, include_domains?, time_range?, max_results?)` - a real search that returns real article titles, URLs, and content snippets.
