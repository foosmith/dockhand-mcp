import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { dockhandRequest } from "../dockhand.js";

export function registerContainerTools(server: McpServer): void {
  server.tool(
    "list_containers",
    "List all Docker containers with their status, CPU, and memory usage",
    {},
    async () => {
      const containers = await dockhandRequest<unknown[]>("/api/containers");
      return {
        content: [{ type: "text", text: JSON.stringify(containers, null, 2) }],
      };
    }
  );

  server.tool(
    "start_container",
    "Start a stopped Docker container by its ID or name",
    { id: z.string().describe("Container ID or name") },
    async ({ id }) => {
      await dockhandRequest(`/api/containers/${encodeURIComponent(id)}/start`, {
        method: "POST",
      });
      return {
        content: [{ type: "text", text: `Container '${id}' started successfully.` }],
      };
    }
  );

  server.tool(
    "stop_container",
    "Stop a running Docker container by its ID or name",
    { id: z.string().describe("Container ID or name") },
    async ({ id }) => {
      await dockhandRequest(`/api/containers/${encodeURIComponent(id)}/stop`, {
        method: "POST",
      });
      return {
        content: [{ type: "text", text: `Container '${id}' stopped successfully.` }],
      };
    }
  );

  server.tool(
    "restart_container",
    "Restart a Docker container by its ID or name",
    { id: z.string().describe("Container ID or name") },
    async ({ id }) => {
      await dockhandRequest(
        `/api/containers/${encodeURIComponent(id)}/restart`,
        { method: "POST" }
      );
      return {
        content: [{ type: "text", text: `Container '${id}' restarted successfully.` }],
      };
    }
  );

  server.tool(
    "get_container_logs",
    "Fetch recent log lines from a Docker container",
    {
      id: z.string().describe("Container ID or name"),
      lines: z
        .number()
        .int()
        .min(1)
        .max(1000)
        .default(100)
        .describe("Number of log lines to retrieve (default 100)"),
    },
    async ({ id, lines }) => {
      const logs = await dockhandRequest<string>(
        `/api/containers/${encodeURIComponent(id)}/logs?lines=${lines}`
      );
      return {
        content: [
          {
            type: "text",
            text: typeof logs === "string" ? logs : JSON.stringify(logs, null, 2),
          },
        ],
      };
    }
  );
}
