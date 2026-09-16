#!/usr/bin/env node
// Minimal MCP server wrapping Tavily's search API - lets Claude call the
// same search backend RDI Reader already uses for domain-restricted news
// search, bypassing WebFetch's blanket block on major news domains (NYT,
// WSJ, Reuters, BBC all confirmed blocked there regardless of paywall
// status - Tavily's own crawler isn't subject to that restriction, and
// has been reaching those exact domains in RDI Reader's real production
// ingestion all along).
//
// Each installer supplies their OWN Tavily API key (see the setup-tavily
// skill) - deliberately not a shared key, so one person's usage doesn't
// eat into everyone else's free-tier quota.

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
if (!TAVILY_API_KEY || TAVILY_API_KEY === "PASTE_YOUR_TAVILY_KEY_HERE") {
  console.error(
    "TAVILY_API_KEY is not set. Run the setup-tavily skill (/tavily-search:setup-tavily) to get your own free key and configure it."
  );
  process.exit(1);
}

const server = new McpServer({ name: "tavily-search", version: "1.0.0" });

server.registerTool(
  "tavily_search",
  {
    title: "Tavily news search",
    description:
      "Search real, current news via Tavily - reaches major outlets (NYT, WSJ, Reuters, BBC, etc.) that Claude's " +
      "built-in WebFetch tool cannot access directly. Returns real article titles, URLs, and content snippets. " +
      "Use this instead of WebSearch/WebFetch when you specifically need coverage from a named major outlet, or " +
      "when you want results restricted to a specific set of domains.",
    inputSchema: {
      query: z.string().describe("The search query"),
      include_domains: z
        .array(z.string())
        .optional()
        .describe('Restrict results to these domains only, e.g. ["nytimes.com", "wsj.com"]. Omit for unrestricted search.'),
      time_range: z
        .enum(["day", "week", "month", "year"])
        .optional()
        .describe("How far back to search. Defaults to no restriction."),
      max_results: z.number().int().min(1).max(20).optional().describe("Max results to return (default 10, max 20)."),
    },
  },
  async ({ query, include_domains, time_range, max_results }) => {
    const body = {
      api_key: TAVILY_API_KEY,
      query,
      topic: "news",
      max_results: max_results ?? 10,
      ...(include_domains && include_domains.length > 0 ? { include_domains } : {}),
      ...(time_range ? { time_range } : {}),
    };

    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      const hint =
        res.status === 401 || res.status === 403
          ? " (this usually means the API key is missing or invalid - re-run the setup-tavily skill)"
          : res.status === 432
            ? " (this usually means the account's monthly search quota is used up)"
            : "";
      return {
        content: [{ type: "text", text: `Tavily request failed: ${res.status} ${text}${hint}` }],
        isError: true,
      };
    }

    const data = await res.json();
    const results = data.results ?? [];
    if (results.length === 0) {
      return { content: [{ type: "text", text: "No results found." }] };
    }

    const formatted = results
      .map((r, i) => `${i + 1}. ${r.title}\n   URL: ${r.url}\n   Published: ${r.published_date ?? "unknown"}\n   ${(r.content ?? "").slice(0, 500)}`)
      .join("\n\n");

    return { content: [{ type: "text", text: formatted }] };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
