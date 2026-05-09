import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { dockhandRequest, envQuery, environmentIdSchema } from "../dockhand.js";

export function registerNetworkTools(server: McpServer): void {
  server.tool(
    "list_networks",
    "List all Docker networks and their configuration",
    { environmentId: environmentIdSchema },
    async ({ environmentId }) => {
      const networks = await dockhandRequest<unknown[]>(
        `/api/networks?${envQuery(environmentId)}`
      );
      return {
        content: [{ type: "text", text: JSON.stringify(networks, null, 2) }],
      };
    }
  );

  server.tool(
    "inspect_network",
    "Get detailed configuration for a Docker network",
    {
      id: z.string().describe("Network ID or name"),
      environmentId: environmentIdSchema,
    },
    async ({ id, environmentId }) => {
      const info = await dockhandRequest<unknown>(
        `/api/networks/${encodeURIComponent(id)}?${envQuery(environmentId)}`
      );
      return {
        content: [{ type: "text", text: JSON.stringify(info, null, 2) }],
      };
    }
  );

  server.tool(
    "remove_network",
    "Remove a Docker network (must not be in use by any container)",
    {
      id: z.string().describe("Network ID or name"),
      environmentId: environmentIdSchema,
    },
    async ({ id, environmentId }) => {
      await dockhandRequest(
        `/api/networks/${encodeURIComponent(id)}?${envQuery(environmentId)}`,
        { method: "DELETE" }
      );
      return {
        content: [{ type: "text", text: `Network '${id}' removed.` }],
      };
    }
  );

  server.tool(
    "create_network",
    "Create a new Docker network",
    {
      name: z.string().describe("Network name"),
      driver: z.string().default("bridge").describe("Network driver (default: bridge)"),
      subnet: z.string().optional().describe("Subnet in CIDR notation, e.g. 172.20.0.0/16"),
      gateway: z.string().optional().describe("Gateway IP address"),
      internal: z.boolean().optional().describe("Restrict external access to the network"),
      environmentId: environmentIdSchema,
    },
    async ({ name, driver, subnet, gateway, internal: isInternal, environmentId }) => {
      const body: Record<string, unknown> = { name, driver };
      if (subnet) body.subnet = subnet;
      if (gateway) body.gateway = gateway;
      if (isInternal !== undefined) body.internal = isInternal;

      const result = await dockhandRequest<unknown>(
        `/api/networks?${envQuery(environmentId)}`,
        {
          method: "POST",
          body: JSON.stringify(body),
        }
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );
}
