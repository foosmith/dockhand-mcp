import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
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

  server.tool(
    "inspect_volume",
    "Get detailed metadata for a Docker volume",
    { name: z.string().describe("Volume name") },
    async ({ name }) => {
      const info = await dockhandRequest<unknown>(
        `/api/volumes/${encodeURIComponent(name)}?${envParam}`
      );
      return {
        content: [{ type: "text", text: JSON.stringify(info, null, 2) }],
      };
    }
  );

  server.tool(
    "remove_volume",
    "Remove a Docker volume (must not be in use by any container)",
    { name: z.string().describe("Volume name") },
    async ({ name }) => {
      await dockhandRequest(`/api/volumes/${encodeURIComponent(name)}?${envParam}`, {
        method: "DELETE",
      });
      return {
        content: [{ type: "text", text: `Volume '${name}' removed.` }],
      };
    }
  );
}
