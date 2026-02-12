import { TOOL_REGISTRY } from "./tools/registry";

export function generateToolsMarkdown(): string {
  const lines: string[] = [];
  lines.push("# MCP Tools Catalog");
  lines.push("");
  lines.push("This document is generated from the tool registry.");
  lines.push("");

  for (const tool of TOOL_REGISTRY) {
    lines.push(`## ${tool.name}`);
    lines.push("");
    lines.push(tool.description);
    lines.push("");
    lines.push("Input Schema");
    lines.push("```json");
    lines.push(JSON.stringify(tool.inputSchema, null, 2));
    lines.push("```");
    lines.push("");
    lines.push("Output Schema");
    lines.push("```json");
    lines.push(JSON.stringify(tool.outputSchema, null, 2));
    lines.push("```");
    lines.push("");
  }

  return lines.join("\n");
}
