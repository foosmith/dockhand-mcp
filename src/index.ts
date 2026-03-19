import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerContainerTools } from "./tools/containers.js";
import { registerStackTools } from "./tools/stacks.js";

const server = new McpServer({
  name: "dockhand-mcp",
  version: "1.0.0",
});

registerContainerTools(server);
registerStackTools(server);

const transport = new StdioServerTransport();
await server.connect(transport);
