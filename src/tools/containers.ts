import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { dockhandRequest, envQuery, environmentIdSchema } from "../dockhand.js";

export function registerContainerTools(server: McpServer): void {
  server.tool(
    "list_containers",
    "List all Docker containers with their status, CPU, and memory usage",
    { environmentId: environmentIdSchema },
    async ({ environmentId }) => {
      const containers = await dockhandRequest<unknown[]>(
        `/api/containers?${envQuery(environmentId)}`
      );
      return {
        content: [{ type: "text", text: JSON.stringify(containers, null, 2) }],
      };
    }
  );

  server.tool(
    "start_container",
    "Start a stopped Docker container by its ID or name",
    {
      id: z.string().describe("Container ID or name"),
      environmentId: environmentIdSchema,
    },
    async ({ id, environmentId }) => {
      await dockhandRequest(
        `/api/containers/${encodeURIComponent(id)}/start?${envQuery(environmentId)}`,
        { method: "POST" }
      );
      return {
        content: [{ type: "text", text: `Container '${id}' started successfully.` }],
      };
    }
  );

  server.tool(
    "stop_container",
    "Stop a running Docker container by its ID or name",
    {
      id: z.string().describe("Container ID or name"),
      environmentId: environmentIdSchema,
    },
    async ({ id, environmentId }) => {
      await dockhandRequest(
        `/api/containers/${encodeURIComponent(id)}/stop?${envQuery(environmentId)}`,
        { method: "POST" }
      );
      return {
        content: [{ type: "text", text: `Container '${id}' stopped successfully.` }],
      };
    }
  );

  server.tool(
    "restart_container",
    "Restart a Docker container by its ID or name",
    {
      id: z.string().describe("Container ID or name"),
      environmentId: environmentIdSchema,
    },
    async ({ id, environmentId }) => {
      await dockhandRequest(
        `/api/containers/${encodeURIComponent(id)}/restart?${envQuery(environmentId)}`,
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
      environmentId: environmentIdSchema,
    },
    async ({ id, lines, environmentId }) => {
      const logs = await dockhandRequest<string>(
        `/api/containers/${encodeURIComponent(id)}/logs?lines=${lines}&${envQuery(environmentId)}`
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

  server.tool(
    "inspect_container",
    "Get detailed configuration and state information for a Docker container",
    {
      id: z.string().describe("Container ID or name"),
      environmentId: environmentIdSchema,
    },
    async ({ id, environmentId }) => {
      const info = await dockhandRequest<unknown>(
        `/api/containers/${encodeURIComponent(id)}?${envQuery(environmentId)}`
      );
      return {
        content: [{ type: "text", text: JSON.stringify(info, null, 2) }],
      };
    }
  );

  server.tool(
    "pause_container",
    "Pause a running Docker container (suspends all processes)",
    {
      id: z.string().describe("Container ID or name"),
      environmentId: environmentIdSchema,
    },
    async ({ id, environmentId }) => {
      await dockhandRequest(
        `/api/containers/${encodeURIComponent(id)}/pause?${envQuery(environmentId)}`,
        { method: "POST" }
      );
      return {
        content: [{ type: "text", text: `Container '${id}' paused.` }],
      };
    }
  );

  server.tool(
    "unpause_container",
    "Unpause a paused Docker container (resumes all processes)",
    {
      id: z.string().describe("Container ID or name"),
      environmentId: environmentIdSchema,
    },
    async ({ id, environmentId }) => {
      await dockhandRequest(
        `/api/containers/${encodeURIComponent(id)}/unpause?${envQuery(environmentId)}`,
        { method: "POST" }
      );
      return {
        content: [{ type: "text", text: `Container '${id}' unpaused.` }],
      };
    }
  );

  server.tool(
    "remove_container",
    "Remove a stopped Docker container",
    {
      id: z.string().describe("Container ID or name"),
      environmentId: environmentIdSchema,
    },
    async ({ id, environmentId }) => {
      await dockhandRequest(
        `/api/containers/${encodeURIComponent(id)}?${envQuery(environmentId)}`,
        { method: "DELETE" }
      );
      return {
        content: [{ type: "text", text: `Container '${id}' removed.` }],
      };
    }
  );
}
