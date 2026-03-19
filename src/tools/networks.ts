import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { dockhandRequest, envParam } from "../dockhand.js";

export function registerNetworkTools(server: McpServer): void {
  server.tool(
    "list_networks",
    "List all Docker networks and their configuration",
    {},
    async () => {
      const networks = await dockhandRequest<unknown[]>(`/api/networks?${envParam}`);
      return {
        content: [{ type: "text", text: JSON.stringify(networks, null, 2) }],
      };
    }
  );
}
