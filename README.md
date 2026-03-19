# dockhand-mcp

A [Model Context Protocol](https://modelcontextprotocol.io) server that connects Claude Desktop or Claude CLI to your [Dockhand](https://github.com/fnsys/dockhand) Docker management instance. Control containers and Compose stacks through natural conversation.

## What Claude Can Do

| Command example | Tool used |
|---|---|
| "List my containers" | `list_containers` |
| "Start the nginx container" | `start_container` |
| "Stop container abc123" | `stop_container` |
| "Restart the api container" | `restart_container` |
| "Show me the last 200 lines of logs for redis" | `get_container_logs` |
| "List my stacks" | `list_stacks` |
| "Deploy the monitoring stack" | `deploy_stack` |
| "Start the media stack" | `start_stack` |
| "Stop the dev stack" | `stop_stack` |
| "What Docker environments are configured?" | `list_environments` |
| "Show me all Docker networks" | `list_networks` |
| "List my Docker volumes" | `list_volumes` |
| "What images are on the host?" | `list_images` |

## Prerequisites

- [Node.js LTS](https://nodejs.org) (v20 or later)
- A running Dockhand instance accessible from your machine
- [Claude Desktop](https://claude.ai/download) or [Claude CLI](https://github.com/anthropics/claude-code)

## Claude CLI Setup

If you use [Claude CLI](https://github.com/anthropics/claude-code) instead of Claude Desktop, register the server with one command:

```bash
claude mcp add dockhand node /full/path/to/dockhand-mcp/dist/index.js \
  --scope user \
  -e DOCKHAND_URL=http://your-dockhand-host:port \
  -e DOCKHAND_USERNAME=claude \
  -e DOCKHAND_PASSWORD=your_password_here
```

Then start a new Claude CLI session and try: **"List my Dockhand containers"**

To verify registration or remove it:

```bash
claude mcp list
claude mcp remove dockhand
```

## Claude App (Desktop) Setup

### 1. Clone and install

```bash
git clone https://github.com/foosmith/dockhand-mcp.git
cd dockhand-mcp
npm install
```

### 2. Configure credentials

```bash
cp .env.example .env
```

Edit `.env` with your Dockhand details:

```env
DOCKHAND_URL=http://192.168.1.100:30328
DOCKHAND_USERNAME=claude
DOCKHAND_PASSWORD=your_password_here
```

> **Tip:** Create a dedicated `claude` user in Dockhand (Settings > Authentication > Add User) rather than using your admin account. This gives you a clean audit trail.

### 3. Build

```bash
npm run build
```

This compiles TypeScript to `dist/`.

### 4. Configure Claude Desktop

Open the Claude Desktop config file:

- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

Add the following inside the `mcpServers` object (create the file if it doesn't exist):

```json
{
  "mcpServers": {
    "dockhand": {
      "command": "node",
      "args": ["/full/path/to/dockhand-mcp/dist/index.js"],
      "env": {
        "DOCKHAND_URL": "http://192.168.1.100:30328",
        "DOCKHAND_USERNAME": "claude",
        "DOCKHAND_PASSWORD": "your_password_here"
      }
    }
  }
}
```

Replace `/full/path/to/dockhand-mcp` with the actual path where you cloned the repo.

> **Note:** On Windows, use forward slashes or escaped backslashes in the path, e.g. `C:/Users/you/dockhand-mcp/dist/index.js`.

### 5. Restart Claude Desktop

After saving the config, fully quit and relaunch Claude Desktop. You should see a hammer icon in the chat input indicating MCP tools are loaded.

Type **"List my Dockhand containers"** to verify everything is working.

---

## Authentication

Dockhand uses session-based authentication. The MCP server:

- Logs in automatically on first use via `POST /api/auth/login`
- Stores the session cookie in memory
- Automatically re-authenticates if the session expires (401 response)

No manual session management needed.

## Troubleshooting

**Hammer icon doesn't appear in Claude Desktop**
- Confirm the path in `args` is correct and points to `dist/index.js`
- Run `node /path/to/dist/index.js` in a terminal — it should start without errors
- Check Claude Desktop logs: **Help > View Logs**

**Authentication errors**
- Verify `DOCKHAND_URL`, `DOCKHAND_USERNAME`, and `DOCKHAND_PASSWORD` are correct
- Confirm your Dockhand instance is reachable from your machine: `curl http://your-host:port/api/auth/login`

**Network not reachable**
- This server makes outbound HTTP calls to your Dockhand instance. If Dockhand is on a local network, you must be on the same network (or VPN) for it to work.

## Updating

To pull the latest changes and rebuild:

```bash
cd dockhand-mcp
git pull
npm install
npm run build
```

Then restart Claude Desktop or start a new Claude CLI session to load the updated server.

## Development

```bash
# Run without building (uses tsx)
npm run dev

# Rebuild after changes
npm run build
```
