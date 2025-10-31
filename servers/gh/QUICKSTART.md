# Quick Start Guide - GitHub CLI MCP Server

## Prerequisites Check

Run the test script to verify everything is ready:

```bash
cd mcp-servers/gh-server
python test_server.py
```

If all tests pass, you're ready to go!

## Installation

### 1. Install MCP Python SDK

```bash
pip install mcp
```

Or using pixi (if in this project):
```bash
pixi run -e dev pip install mcp
```

### 2. Ensure GitHub CLI is authenticated

```bash
gh auth status
```

If not authenticated, run:
```bash
gh auth login
```

## Configuration

### For Claude Code

Add this to your Claude Code configuration (typically `.claude/config.json`):

```json
{
  "mcpServers": {
    "gh": {
      "command": "python",
      "args": ["/Users/kmt/ai/notion-utils/mcp-servers/gh-server/server.py"]
    }
  }
}
```

**Note:** Replace the path with the absolute path to your `server.py` file.

### For Pixi Environment

If using pixi, you can run the server in the dev environment:

```json
{
  "mcpServers": {
    "gh": {
      "command": "pixi",
      "args": ["run", "-e", "dev", "python", "/Users/kmt/ai/notion-utils/mcp-servers/gh-server/server.py"]
    }
  }
}
```

## Usage Examples

Once configured with Claude Code, you can:

### Repository Operations
- "List all my repositories"
- "Create a new public repository called 'my-project' with description 'A cool project'"
- "Show me info about the munch-group/notion-utils repository"

### Pull Requests
- "List all open pull requests in this repository"
- "Show me details of pull request #42"
- "Create a pull request titled 'Add new feature' with body 'This PR adds...'"
- "Merge pull request #42 using squash"

### Issues
- "List all open issues in this repository"
- "Create an issue titled 'Bug: Login fails' with description 'When I try to login...'"
- "Close issue #123 with comment 'Fixed in v1.2'"

### GitHub Actions
- "Show me all workflows in this repository"
- "List recent workflow runs"
- "Show me the status of workflow run #456"

### Releases
- "List all releases"
- "View the latest release"
- "Create a new release v1.2.0 with auto-generated notes"

### Search
- "Search for Python repositories with more than 1000 stars"
- "Search issues containing 'bug' in munch-group repos"

### Other
- "Check my GitHub authentication status"
- "Show my GitHub status (issues, PRs, notifications)"
- "Make an API request to /repos/owner/repo/issues"

## Available Tools

The server provides 30+ tools covering:

- **Repository management** (list, view, create)
- **Pull requests** (list, view, create, merge, checkout)
- **Issues** (list, view, create, close)
- **GitHub Actions** (workflows, runs)
- **Releases** (list, view, create)
- **Search** (repos, issues)
- **Gists** (list, create)
- **API** (direct GitHub API access)

See the [README.md](README.md) for complete tool documentation.

## Troubleshooting

### "gh: command not found"
Install GitHub CLI from https://cli.github.com/

### "gh auth status" fails
Run `gh auth login` to authenticate

### "No module named 'mcp'"
Install with `pip install mcp`

### Server not responding
Check that:
1. The path in your config is absolute (not relative)
2. Python can be found in your PATH
3. The gh CLI is working: `gh auth status`

## Testing

Test individual gh commands directly:
```bash
gh repo list
gh pr list
gh issue list
```

If these work, the MCP server should work too!
