# GitHub CLI MCP Server

An MCP (Model Context Protocol) server that wraps the GitHub CLI (`gh`) tool, providing comprehensive access to GitHub functionality through a standardized interface.

## Features

This server exposes the following GitHub CLI functionality:

### Repository Management
- `gh_repo_list` - List repositories for a user or organization
- `gh_repo_view` - View information about a repository
- `gh_repo_create` - Create a new repository

### Pull Requests
- `gh_pr_list` - List pull requests in a repository
- `gh_pr_view` - View a pull request
- `gh_pr_create` - Create a pull request
- `gh_pr_merge` - Merge a pull request
- `gh_pr_checkout` - Check out a pull request locally

### Issues
- `gh_issue_list` - List issues in a repository
- `gh_issue_view` - View an issue
- `gh_issue_create` - Create an issue
- `gh_issue_close` - Close an issue

### GitHub Actions
- `gh_workflow_list` - List workflows in a repository
- `gh_workflow_view` - View details about a workflow
- `gh_run_list` - List recent workflow runs
- `gh_run_view` - View details about a workflow run

### Releases
- `gh_release_list` - List releases in a repository
- `gh_release_view` - View information about a release
- `gh_release_create` - Create a new release

### Search
- `gh_search_repos` - Search for repositories
- `gh_search_issues` - Search for issues and pull requests

### Gists
- `gh_gist_list` - List your gists
- `gh_gist_create` - Create a new gist

### Other
- `gh_api` - Make authenticated GitHub API requests
- `gh_auth_status` - View authentication status
- `gh_status` - Print information about issues, PRs, and notifications

## Prerequisites

- Python 3.10 or higher
- GitHub CLI (`gh`) installed and authenticated
  - Install: https://cli.github.com/
  - Authenticate: `gh auth login`

## Installation

1. Install the MCP Python SDK:
```bash
pip install mcp
```

2. Ensure GitHub CLI is installed and authenticated:
```bash
gh auth status
```

## Usage

### With Claude Code

Add this server to your Claude Code configuration file (`.claude/config.json` or similar):

```json
{
  "mcpServers": {
    "gh": {
      "command": "python",
      "args": ["/path/to/mcp-servers/gh-server/server.py"]
    }
  }
}
```

### Standalone

Run the server directly:
```bash
python server.py
```

The server communicates via stdin/stdout using the MCP protocol.

## Examples

Once configured, you can use the tools through your MCP client. For example, with Claude Code:

- "List all open pull requests in my repository"
- "Create a new issue titled 'Bug in login page'"
- "Show me the status of workflow run #123"
- "Search for Python repositories with more than 1000 stars"
- "View release information for version v1.0.0"

## Tool Parameters

Most tools accept optional parameters for filtering and customization. See the tool descriptions in the code for full parameter details.

Common parameters include:
- `repository`: Specify repository in `OWNER/REPO` format (defaults to current repo)
- `limit`: Maximum number of items to return
- `state`: Filter by state (open, closed, all, etc.)
- `web`: Open result in web browser instead of returning data

## Error Handling

The server handles errors gracefully and returns informative error messages:
- Command timeouts (60 seconds)
- Invalid parameters
- gh CLI errors
- Authentication issues

## Security

This server executes `gh` commands with the permissions of the authenticated GitHub CLI user. Ensure you trust any client using this server, as it can perform actions on your behalf such as:
- Creating/modifying repositories
- Creating/closing issues and pull requests
- Triggering workflows
- Creating releases

## License

MIT
