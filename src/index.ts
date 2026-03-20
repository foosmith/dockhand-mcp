import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerContainerTools } from "./tools/containers.js";
import { registerStackTools } from "./tools/stacks.js";
import { registerEnvironmentTools } from "./tools/environments.js";
import { registerNetworkTools } from "./tools/networks.js";
import { registerVolumeTools } from "./tools/volumes.js";
import { registerImageTools } from "./tools/images.js";

const server = new McpServer({
  name: "dockhand-mcp",
  version: "1.1.0",
});

registerContainerTools(server);
registerStackTools(server);
registerEnvironmentTools(server);
registerNetworkTools(server);
registerVolumeTools(server);
registerImageTools(server);

const transport = new StdioServerTransport();
await server.connect(transport);
