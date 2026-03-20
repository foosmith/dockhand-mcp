# Dockhand MCP Server Build Plan & Implementation Guide

## Overview

This document outlines the plan for building a custom Model Context Protocol (MCP) server that connects Claude Desktop to your Dockhand Docker management instance, enabling you to control containers and stacks via chat.

## Your Environment

| Setting | Value |
|---|---|
| Dockhand URL | http://192.168.15.53:30328/ |
| Dockhand Version | 1.16 |
| Authentication | Enabled (local users) |
| API Keys | Not yet available (planned feature) |
| Auth Method | Session cookie via username/password login |
| MCP Language | TypeScript / Node.js |
| Target Platforms | Windows & macOS |

## Authentication Approach

Dockhand v1.16 does not yet have API key support (it is listed as a roadmap feature). The current API uses session-based authentication via a `dockhand_session` cookie.

The MCP server will authenticate as follows:

- On startup, `POST` credentials to `/api/auth/login` to obtain a session cookie
- Store the session cookie in memory and attach it to every subsequent API request
- Detect `401 Unauthorized` responses and automatically re-login to refresh the session
- Credentials stored in a local `.env` file, never hardcoded

> **Recommendation:** Create a dedicated `claude` user in Dockhand (Settings > Authentication > Add User) rather than using your admin credentials. This gives you a clean audit trail in the Dockhand activity log.

## Project Structure

Create a new folder on your machine, e.g., `dockhand-mcp/`, with the following layout:

```
dockhand-mcp/
  src/
    index.ts          # MCP server entry point
    dockhand.ts       # Dockhand API client (auth + requests)
    tools/
      containers.ts   # Container tools (list, start, stop, restart, logs)
      stacks.ts       # Stack tools (list, deploy, start, stop)
  .env                # Your credentials (gitignored)
  .env.example        # Template for credentials
  package.json
  tsconfig.json
```

## MCP Tools (Claude Commands)

The following tools will be exposed to Claude. Each maps to one or more Dockhand REST API calls.

| Tool Name | What Claude Can Do | Dockhand API |
|---|---|---|
| `list_containers` | List all containers with status, CPU, memory | `GET /api/containers` |
| `start_container` | Start a stopped container by name or ID | `POST /api/containers/:id/start` |
| `stop_container` | Stop a running container | `POST /api/containers/:id/stop` |
| `restart_container` | Restart a container | `POST /api/containers/:id/restart` |
| `get_container_logs` | Fetch recent log lines from a container | `GET /api/containers/:id/logs` |
| `list_stacks` | List all Compose stacks and their status | `GET /api/stacks` |
| `deploy_stack` | Trigger a stack deploy/redeploy | `POST /api/stacks/:id/deploy` |
| `start_stack` | Start all containers in a stack | `POST /api/stacks/:id/start` |
| `stop_stack` | Stop all containers in a stack | `POST /api/stacks/:id/stop` |

## Step-by-Step Build Plan

### Step 1 — Prerequisites

Install the following on your Windows or Mac machine:

- **Node.js LTS** from [nodejs.org](https://nodejs.org) (includes npm)
- Verify install: open a terminal and run `node --version` (should show v20+)
- **Git** (optional but recommended)

### Step 2 — Scaffold the Project

Run the following commands in a terminal:

```bash
mkdir dockhand-mcp && cd dockhand-mcp
npm init -y
npm install @modelcontextprotocol/sdk zod dotenv
npm install -D typescript @types/node tsx
npx tsc --init
```

### Step 3 — Create .env File

In your project folder, create a file named `.env` with your Dockhand credentials:

```env
DOCKHAND_URL=http://192.168.15.53:30328
DOCKHAND_USERNAME=claude
DOCKHAND_PASSWORD=your_password_here
```

> **Important:** Add `.env` to `.gitignore` if you use Git. Never commit credentials.

### Step 4 — Write the Code

Three files to create (Claude will write these for you in Zed):

- `src/dockhand.ts` — HTTP client that handles login, session cookies, and re-auth
- `src/tools/containers.ts` — Tool definitions for container operations
- `src/tools/stacks.ts` — Tool definitions for stack operations
- `src/index.ts` — Main MCP server that registers all tools and starts listening

### Step 5 — Wire Into Claude Desktop

Claude Desktop reads MCP server config from a JSON file. Add your server to:

- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

Add this entry to the `mcpServers` object:

```json
{
  "mcpServers": {
    "dockhand": {
      "command": "node",
      "args": ["/full/path/to/dockhand-mcp/dist/index.js"],
      "env": {
        "DOCKHAND_URL": "http://192.168.15.53:30328",
        "DOCKHAND_USERNAME": "claude",
        "DOCKHAND_PASSWORD": "your_password_here"
      }
    }
  }
}
```

### Step 6 — Test

1. Restart Claude Desktop after saving the config
2. Look for a hammer icon in the Claude chat input — this indicates MCP tools are loaded
3. Type: `List my Dockhand containers` to verify it works
4. If it fails, check Claude Desktop logs at **Help > View Logs**

## Key Notes & Caveats

### Session Expiry

Dockhand sessions expire after some period of inactivity. The MCP server will handle this automatically by catching `401` responses and re-logging in. No manual intervention needed.

### Network Access

Your Dockhand is on a local IP (`192.168.15.53`). The MCP server runs on your local machine, so it can reach this address directly. This will **not** work if you're away from your local network unless you set up a VPN or reverse proxy with a public domain.

### Future API Key Support

Once Dockhand ships API key support (it is on their roadmap), authentication can be simplified to a single bearer token header. The `dockhand.ts` client file is designed to make this swap a one-line change.

### Security

The MCP server runs locally on your machine and only makes outbound HTTP calls to your Dockhand instance. Credentials are stored in the `.env` file (or Claude Desktop config) and never transmitted anywhere else.

## Using This Plan in Zed

To start coding with Claude in Zed:

1. Open Zed and create/open the `dockhand-mcp/` folder
2. Open the Zed AI panel (`Ctrl+?` or the AI icon)
3. Paste this prompt to get started:

```
I'm building a TypeScript MCP server for Dockhand (a Docker management tool).
Auth is session-based: POST /api/auth/login with {username, password} returns a
dockhand_session cookie. Re-auth on 401. Dockhand URL: http://192.168.15.53:30328

Please create:

src/dockhand.ts - HTTP client with auto-login and session management
src/tools/containers.ts - MCP tools: list_containers, start_container, stop_container, restart_container, get_container_logs
src/tools/stacks.ts - MCP tools: list_stacks, deploy_stack, start_stack, stop_stack
src/index.ts - MCP server entry point using @modelcontextprotocol/sdk
```
