const fs = require("node:fs");
const path = require("node:path");
const { generateToolsMarkdown } = require("../packages/mcp-server/dist/docgen");

const outputPath = path.resolve(process.cwd(), "docs/mcp_tools_catalog.md");
const content = generateToolsMarkdown();
fs.writeFileSync(outputPath, content, "utf8");
console.log(`Generated ${outputPath}`);
