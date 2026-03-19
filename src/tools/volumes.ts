import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { dockhandRequest, envParam } from "../dockhand.js";

export function registerVolumeTools(server: McpServer): void {
  server.tool(
    "list_volumes",
    "List all Docker volumes and their details",
    {},
    async () => {
      const volumes = await dockhandRequest<unknown[]>(`/api/volumes?${envParam}`);
      return {
        content: [{ type: "text", text: JSON.stringify(volumes, null, 2) }],
      };
    }
  );
}
