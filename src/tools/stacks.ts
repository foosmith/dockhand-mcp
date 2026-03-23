import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { dockhandRequest, envParam } from "../dockhand.js";

export function registerStackTools(server: McpServer): void {
  server.tool(
    "list_stacks",
    "List all Docker Compose stacks and their current status",
    {},
    async () => {
      const stacks = await dockhandRequest<unknown[]>(`/api/stacks?${envParam}`);
      return {
        content: [{ type: "text", text: JSON.stringify(stacks, null, 2) }],
      };
    }
  );

  server.tool(
    "deploy_stack",
    "Deploy or redeploy a Docker Compose stack by its ID or name",
    { id: z.string().describe("Stack ID or name") },
    async ({ id }) => {
      await dockhandRequest(`/api/stacks/${encodeURIComponent(id)}/deploy?${envParam}`, {
        method: "POST",
      });
      return {
        content: [{ type: "text", text: `Stack '${id}' deployed successfully.` }],
      };
    }
  );

  server.tool(
    "start_stack",
    "Start all containers in a Docker Compose stack",
    { id: z.string().describe("Stack ID or name") },
    async ({ id }) => {
      await dockhandRequest(`/api/stacks/${encodeURIComponent(id)}/start?${envParam}`, {
        method: "POST",
      });
      return {
        content: [{ type: "text", text: `Stack '${id}' started successfully.` }],
      };
    }
  );

  server.tool(
    "stop_stack",
    "Stop all containers in a Docker Compose stack",
    { id: z.string().describe("Stack ID or name") },
    async ({ id }) => {
      await dockhandRequest(`/api/stacks/${encodeURIComponent(id)}/stop?${envParam}`, {
        method: "POST",
      });
      return {
        content: [{ type: "text", text: `Stack '${id}' stopped successfully.` }],
      };
    }
  );

  server.tool(
    "sync_stack",
    "Pull latest changes from the git repository and redeploy a git-backed Docker Compose stack",
    { id: z.string().describe("Git stack ID or name") },
    async ({ id }) => {
      await dockhandRequest(`/api/git/stacks/${encodeURIComponent(id)}/sync?${envParam}`, {
        method: "POST",
      });
      return {
        content: [{ type: "text", text: `Git stack '${id}' synced and redeployed successfully.` }],
      };
    }
  );
}
