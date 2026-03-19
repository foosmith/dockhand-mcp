import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { dockhandRequest } from "../dockhand.js";

export function registerEnvironmentTools(server: McpServer): void {
  server.tool(
    "list_environments",
    "List all configured Docker environments (hosts) in Dockhand",
    {},
    async () => {
      const environments = await dockhandRequest<unknown[]>("/api/environments");
      return {
        content: [{ type: "text", text: JSON.stringify(environments, null, 2) }],
      };
    }
  );
}
