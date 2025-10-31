# GitHub CLI MCP Server - Available Tools

This document lists all available tools provided by the GitHub CLI MCP server.

## Repository Management

### gh_repo_list
List repositories for a user or organization.

**Parameters:**
- `owner` (string, optional): Repository owner (user or org). Defaults to authenticated user
- `limit` (number, optional): Maximum number of repositories to list (default: 30)
- `visibility` (string, optional): Filter by visibility - "public", "private", or "internal"

### gh_repo_view
View information about a repository.

**Parameters:**
- `repository` (string, required): Repository in OWNER/REPO format
- `web` (boolean, optional): Open the repository in a web browser

### gh_repo_create
Create a new repository.

**Parameters:**
- `name` (string, required): Name of the repository
- `description` (string, optional): Description of the repository
- `public` (boolean, optional): Make the repository public (default: private)
- `clone` (boolean, optional): Clone the repository after creating

---

## Pull Requests

### gh_pr_list
List pull requests in a repository.

**Parameters:**
- `repository` (string, optional): Repository in OWNER/REPO format (defaults to current repo)
- `state` (string, optional): Filter by state - "open", "closed", "merged", or "all" (default: open)
- `limit` (number, optional): Maximum number of PRs to list (default: 30)
- `assignee` (string, optional): Filter by assignee
- `author` (string, optional): Filter by author

### gh_pr_view
View a pull request.

**Parameters:**
- `number` (number, required): Pull request number
- `repository` (string, optional): Repository in OWNER/REPO format (defaults to current repo)
- `comments` (boolean, optional): View pull request comments
- `web` (boolean, optional): Open the pull request in a web browser

### gh_pr_create
Create a pull request.

**Parameters:**
- `title` (string, optional): Title of the pull request
- `body` (string, optional): Body/description of the pull request
- `base` (string, optional): Base branch (default: default branch)
- `head` (string, optional): Head branch (default: current branch)
- `draft` (boolean, optional): Create as draft pull request
- `web` (boolean, optional): Open in browser to continue

### gh_pr_merge
Merge a pull request.

**Parameters:**
- `number` (number, required): Pull request number
- `merge_method` (string, optional): Merge method - "merge", "squash", or "rebase"
- `delete_branch` (boolean, optional): Delete the branch after merging

### gh_pr_checkout
Check out a pull request in git.

**Parameters:**
- `number` (number, required): Pull request number
- `branch` (string, optional): Local branch name to use

---

## Issues

### gh_issue_list
List issues in a repository.

**Parameters:**
- `repository` (string, optional): Repository in OWNER/REPO format (defaults to current repo)
- `state` (string, optional): Filter by state - "open", "closed", or "all" (default: open)
- `limit` (number, optional): Maximum number of issues to list (default: 30)
- `assignee` (string, optional): Filter by assignee
- `author` (string, optional): Filter by author
- `label` (string, optional): Filter by label

### gh_issue_view
View an issue.

**Parameters:**
- `number` (number, required): Issue number
- `repository` (string, optional): Repository in OWNER/REPO format (defaults to current repo)
- `comments` (boolean, optional): View issue comments
- `web` (boolean, optional): Open the issue in a web browser

### gh_issue_create
Create an issue.

**Parameters:**
- `title` (string, required): Title of the issue
- `body` (string, optional): Body/description of the issue
- `assignee` (string, optional): GitHub username to assign
- `label` (string, optional): Comma-separated list of labels
- `milestone` (string, optional): Milestone to add the issue to
- `web` (boolean, optional): Open in browser to continue

### gh_issue_close
Close an issue.

**Parameters:**
- `number` (number, required): Issue number
- `comment` (string, optional): Comment to add when closing

---

## GitHub Actions

### gh_workflow_list
List workflows in a repository.

**Parameters:**
- `repository` (string, optional): Repository in OWNER/REPO format (defaults to current repo)
- `all` (boolean, optional): Include disabled workflows

### gh_workflow_view
View details about a workflow.

**Parameters:**
- `workflow` (string, required): Workflow ID or name
- `repository` (string, optional): Repository in OWNER/REPO format (defaults to current repo)
- `web` (boolean, optional): Open the workflow in a web browser

### gh_run_list
List recent workflow runs.

**Parameters:**
- `repository` (string, optional): Repository in OWNER/REPO format (defaults to current repo)
- `workflow` (string, optional): Filter by workflow name or ID
- `limit` (number, optional): Maximum number of runs to list (default: 20)
- `status` (string, optional): Filter by status - "completed", "success", "failure", "in_progress", or "queued"

### gh_run_view
View details about a workflow run.

**Parameters:**
- `run_id` (number, required): Workflow run ID
- `repository` (string, optional): Repository in OWNER/REPO format (defaults to current repo)
- `log` (boolean, optional): View full log
- `web` (boolean, optional): Open the run in a web browser

---

## Releases

### gh_release_list
List releases in a repository.

**Parameters:**
- `repository` (string, optional): Repository in OWNER/REPO format (defaults to current repo)
- `limit` (number, optional): Maximum number of releases to list (default: 30)

### gh_release_view
View information about a release.

**Parameters:**
- `tag` (string, optional): Release tag (defaults to latest)
- `repository` (string, optional): Repository in OWNER/REPO format (defaults to current repo)
- `web` (boolean, optional): Open the release in a web browser

### gh_release_create
Create a new release.

**Parameters:**
- `tag` (string, required): Tag name for the release
- `title` (string, optional): Release title
- `notes` (string, optional): Release notes
- `draft` (boolean, optional): Create as draft release
- `prerelease` (boolean, optional): Mark as pre-release
- `generate_notes` (boolean, optional): Automatically generate release notes

---

## Search

### gh_search_repos
Search for repositories.

**Parameters:**
- `query` (string, required): Search query
- `limit` (number, optional): Maximum number of results (default: 30)
- `language` (string, optional): Filter by programming language
- `stars` (string, optional): Filter by stars (e.g., '>1000')

### gh_search_issues
Search for issues and pull requests.

**Parameters:**
- `query` (string, required): Search query
- `limit` (number, optional): Maximum number of results (default: 30)
- `state` (string, optional): Filter by state - "open" or "closed"

---

## Gists

### gh_gist_list
List your gists.

**Parameters:**
- `limit` (number, optional): Maximum number of gists to list (default: 10)
- `public` (boolean, optional): Show only public gists
- `secret` (boolean, optional): Show only secret gists

### gh_gist_create
Create a new gist.

**Parameters:**
- `files` (string, required): Comma-separated list of file paths
- `description` (string, optional): Description of the gist
- `public` (boolean, optional): Make gist public (default: secret)

---

## API & General

### gh_api
Make an authenticated GitHub API request.

**Parameters:**
- `endpoint` (string, required): API endpoint (e.g., /repos/OWNER/REPO/issues)
- `method` (string, optional): HTTP method - "GET", "POST", "PUT", "PATCH", or "DELETE" (default: GET)
- `field` (string, optional): JSON field to extract from response
- `jq` (string, optional): jq expression to filter response

### gh_auth_status
View authentication status.

**Parameters:** None

### gh_status
Print information about relevant issues, pull requests, and notifications.

**Parameters:**
- `org` (string, optional): Filter by organization

---

## Tool Count

**Total: 30 tools** covering all major GitHub CLI functionality

## Common Patterns

### Filtering
Most list commands support filtering by:
- State (open/closed)
- Author
- Assignee
- Labels (for issues)

### Output Modes
Many view commands support:
- `web`: Open in browser instead of returning data
- JSON output by default for programmatic access

### Repository Context
Commands that operate on repositories typically:
- Accept `repository` parameter in OWNER/REPO format
- Default to the current repository when run in a git context
