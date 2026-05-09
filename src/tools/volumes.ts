import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { dockhandRequest, envQuery, environmentIdSchema } from "../dockhand.js";

export function registerVolumeTools(server: McpServer): void {
  server.tool(
    "list_volumes",
    "List all Docker volumes and their details",
    { environmentId: environmentIdSchema },
    async ({ environmentId }) => {
      const volumes = await dockhandRequest<unknown[]>(
        `/api/volumes?${envQuery(environmentId)}`
      );
      return {
        content: [{ type: "text", text: JSON.stringify(volumes, null, 2) }],
      };
    }
  );

  server.tool(
    "inspect_volume",
    "Get detailed metadata for a Docker volume",
    {
      name: z.string().describe("Volume name"),
      environmentId: environmentIdSchema,
    },
    async ({ name, environmentId }) => {
      const info = await dockhandRequest<unknown>(
        `/api/volumes/${encodeURIComponent(name)}?${envQuery(environmentId)}`
      );
      return {
        content: [{ type: "text", text: JSON.stringify(info, null, 2) }],
      };
    }
  );

  server.tool(
    "remove_volume",
    "Remove a Docker volume (must not be in use by any container)",
    {
      name: z.string().describe("Volume name"),
      environmentId: environmentIdSchema,
    },
    async ({ name, environmentId }) => {
      await dockhandRequest(
        `/api/volumes/${encodeURIComponent(name)}?${envQuery(environmentId)}`,
        { method: "DELETE" }
      );
      return {
        content: [{ type: "text", text: `Volume '${name}' removed.` }],
      };
    }
  );
}
