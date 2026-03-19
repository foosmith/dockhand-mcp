import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { dockhandRequest, envParam } from "../dockhand.js";

export function registerImageTools(server: McpServer): void {
  server.tool(
    "list_images",
    "List all Docker images available on the host",
    {},
    async () => {
      const images = await dockhandRequest<unknown[]>(`/api/images?${envParam}`);
      return {
        content: [{ type: "text", text: JSON.stringify(images, null, 2) }],
      };
    }
  );
}
