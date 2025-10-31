#!/usr/bin/env python3
"""
GitHub CLI MCP Server

This server wraps the GitHub CLI (gh) tool and exposes its functionality
through the Model Context Protocol (MCP).
"""

import asyncio
import json
import subprocess
from typing import Any, Optional

from mcp.server import Server
from mcp.types import Tool, TextContent, ImageContent, EmbeddedResource


app = Server("gh-server")


def run_gh_command(args: list[str], input_data: Optional[str] = None) -> dict[str, Any]:
    """
    Execute a gh command and return the result.

    Parameters
    ----------
    args : list[str]
        Command arguments to pass to gh CLI
    input_data : Optional[str]
        Optional stdin input for the command

    Returns
    -------
    dict
        Dictionary with 'stdout', 'stderr', 'returncode' keys
    """
    try:
        result = subprocess.run(
            ["gh"] + args,
            capture_output=True,
            text=True,
            input=input_data,
            timeout=60
        )
        return {
            "stdout": result.stdout,
            "stderr": result.stderr,
            "returncode": result.returncode,
            "success": result.returncode == 0
        }
    except subprocess.TimeoutExpired:
        return {
            "stdout": "",
            "stderr": "Command timed out after 60 seconds",
            "returncode": -1,
            "success": False
        }
    except Exception as e:
        return {
            "stdout": "",
            "stderr": str(e),
            "returncode": -1,
            "success": False
        }


@app.list_tools()
async def list_tools() -> list[Tool]:
    """List all available GitHub CLI tools."""
    return [
        # Repository commands
        Tool(
            name="gh_repo_list",
            description="List repositories for a user or organization",
            inputSchema={
                "type": "object",
                "properties": {
                    "owner": {
                        "type": "string",
                        "description": "Repository owner (user or org). If not specified, lists repos for the authenticated user"
                    },
                    "limit": {
                        "type": "number",
                        "description": "Maximum number of repositories to list (default: 30)"
                    },
                    "visibility": {
                        "type": "string",
                        "enum": ["public", "private", "internal"],
                        "description": "Filter by repository visibility"
                    }
                }
            }
        ),
        Tool(
            name="gh_repo_view",
            description="View information about a repository",
            inputSchema={
                "type": "object",
                "properties": {
                    "repository": {
                        "type": "string",
                        "description": "Repository in OWNER/REPO format"
                    },
                    "web": {
                        "type": "boolean",
                        "description": "Open the repository in a web browser"
                    }
                },
                "required": ["repository"]
            }
        ),
        Tool(
            name="gh_repo_create",
            description="Create a new repository",
            inputSchema={
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "Name of the repository"
                    },
                    "description": {
                        "type": "string",
                        "description": "Description of the repository"
                    },
                    "public": {
                        "type": "boolean",
                        "description": "Make the repository public (default: private)"
                    },
                    "clone": {
                        "type": "boolean",
                        "description": "Clone the repository after creating"
                    }
                },
                "required": ["name"]
            }
        ),
        # Pull Request commands
        Tool(
            name="gh_pr_list",
            description="List pull requests in a repository",
            inputSchema={
                "type": "object",
                "properties": {
                    "repository": {
                        "type": "string",
                        "description": "Repository in OWNER/REPO format (defaults to current repo)"
                    },
                    "state": {
                        "type": "string",
                        "enum": ["open", "closed", "merged", "all"],
                        "description": "Filter by state (default: open)"
                    },
                    "limit": {
                        "type": "number",
                        "description": "Maximum number of PRs to list (default: 30)"
                    },
                    "assignee": {
                        "type": "string",
                        "description": "Filter by assignee"
                    },
                    "author": {
                        "type": "string",
                        "description": "Filter by author"
                    }
                }
            }
        ),
        Tool(
            name="gh_pr_view",
            description="View a pull request",
            inputSchema={
                "type": "object",
                "properties": {
                    "number": {
                        "type": "number",
                        "description": "Pull request number"
                    },
                    "repository": {
                        "type": "string",
                        "description": "Repository in OWNER/REPO format (defaults to current repo)"
                    },
                    "comments": {
                        "type": "boolean",
                        "description": "View pull request comments"
                    },
                    "web": {
                        "type": "boolean",
                        "description": "Open the pull request in a web browser"
                    }
                },
                "required": ["number"]
            }
        ),
        Tool(
            name="gh_pr_create",
            description="Create a pull request",
            inputSchema={
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "Title of the pull request"
                    },
                    "body": {
                        "type": "string",
                        "description": "Body/description of the pull request"
                    },
                    "base": {
                        "type": "string",
                        "description": "Base branch (default: default branch)"
                    },
                    "head": {
                        "type": "string",
                        "description": "Head branch (default: current branch)"
                    },
                    "draft": {
                        "type": "boolean",
                        "description": "Create as draft pull request"
                    },
                    "web": {
                        "type": "boolean",
                        "description": "Open in browser to continue"
                    }
                }
            }
        ),
        Tool(
            name="gh_pr_merge",
            description="Merge a pull request",
            inputSchema={
                "type": "object",
                "properties": {
                    "number": {
                        "type": "number",
                        "description": "Pull request number"
                    },
                    "merge_method": {
                        "type": "string",
                        "enum": ["merge", "squash", "rebase"],
                        "description": "Merge method to use"
                    },
                    "delete_branch": {
                        "type": "boolean",
                        "description": "Delete the branch after merging"
                    }
                },
                "required": ["number"]
            }
        ),
        Tool(
            name="gh_pr_checkout",
            description="Check out a pull request in git",
            inputSchema={
                "type": "object",
                "properties": {
                    "number": {
                        "type": "number",
                        "description": "Pull request number"
                    },
                    "branch": {
                        "type": "string",
                        "description": "Local branch name to use"
                    }
                },
                "required": ["number"]
            }
        ),
        # Issue commands
        Tool(
            name="gh_issue_list",
            description="List issues in a repository",
            inputSchema={
                "type": "object",
                "properties": {
                    "repository": {
                        "type": "string",
                        "description": "Repository in OWNER/REPO format (defaults to current repo)"
                    },
                    "state": {
                        "type": "string",
                        "enum": ["open", "closed", "all"],
                        "description": "Filter by state (default: open)"
                    },
                    "limit": {
                        "type": "number",
                        "description": "Maximum number of issues to list (default: 30)"
                    },
                    "assignee": {
                        "type": "string",
                        "description": "Filter by assignee"
                    },
                    "author": {
                        "type": "string",
                        "description": "Filter by author"
                    },
                    "label": {
                        "type": "string",
                        "description": "Filter by label"
                    }
                }
            }
        ),
        Tool(
            name="gh_issue_view",
            description="View an issue",
            inputSchema={
                "type": "object",
                "properties": {
                    "number": {
                        "type": "number",
                        "description": "Issue number"
                    },
                    "repository": {
                        "type": "string",
                        "description": "Repository in OWNER/REPO format (defaults to current repo)"
                    },
                    "comments": {
                        "type": "boolean",
                        "description": "View issue comments"
                    },
                    "web": {
                        "type": "boolean",
                        "description": "Open the issue in a web browser"
                    }
                },
                "required": ["number"]
            }
        ),
        Tool(
            name="gh_issue_create",
            description="Create an issue",
            inputSchema={
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "Title of the issue"
                    },
                    "body": {
                        "type": "string",
                        "description": "Body/description of the issue"
                    },
                    "assignee": {
                        "type": "string",
                        "description": "GitHub username to assign"
                    },
                    "label": {
                        "type": "string",
                        "description": "Comma-separated list of labels"
                    },
                    "milestone": {
                        "type": "string",
                        "description": "Milestone to add the issue to"
                    },
                    "web": {
                        "type": "boolean",
                        "description": "Open in browser to continue"
                    }
                },
                "required": ["title"]
            }
        ),
        Tool(
            name="gh_issue_close",
            description="Close an issue",
            inputSchema={
                "type": "object",
                "properties": {
                    "number": {
                        "type": "number",
                        "description": "Issue number"
                    },
                    "comment": {
                        "type": "string",
                        "description": "Comment to add when closing"
                    }
                },
                "required": ["number"]
            }
        ),
        # Workflow commands
        Tool(
            name="gh_workflow_list",
            description="List workflows in a repository",
            inputSchema={
                "type": "object",
                "properties": {
                    "repository": {
                        "type": "string",
                        "description": "Repository in OWNER/REPO format (defaults to current repo)"
                    },
                    "all": {
                        "type": "boolean",
                        "description": "Include disabled workflows"
                    }
                }
            }
        ),
        Tool(
            name="gh_workflow_view",
            description="View details about a workflow",
            inputSchema={
                "type": "object",
                "properties": {
                    "workflow": {
                        "type": "string",
                        "description": "Workflow ID or name"
                    },
                    "repository": {
                        "type": "string",
                        "description": "Repository in OWNER/REPO format (defaults to current repo)"
                    },
                    "web": {
                        "type": "boolean",
                        "description": "Open the workflow in a web browser"
                    }
                },
                "required": ["workflow"]
            }
        ),
        Tool(
            name="gh_run_list",
            description="List recent workflow runs",
            inputSchema={
                "type": "object",
                "properties": {
                    "repository": {
                        "type": "string",
                        "description": "Repository in OWNER/REPO format (defaults to current repo)"
                    },
                    "workflow": {
                        "type": "string",
                        "description": "Filter by workflow name or ID"
                    },
                    "limit": {
                        "type": "number",
                        "description": "Maximum number of runs to list (default: 20)"
                    },
                    "status": {
                        "type": "string",
                        "enum": ["completed", "success", "failure", "in_progress", "queued"],
                        "description": "Filter by run status"
                    }
                }
            }
        ),
        Tool(
            name="gh_run_view",
            description="View details about a workflow run",
            inputSchema={
                "type": "object",
                "properties": {
                    "run_id": {
                        "type": "number",
                        "description": "Workflow run ID"
                    },
                    "repository": {
                        "type": "string",
                        "description": "Repository in OWNER/REPO format (defaults to current repo)"
                    },
                    "log": {
                        "type": "boolean",
                        "description": "View full log"
                    },
                    "web": {
                        "type": "boolean",
                        "description": "Open the run in a web browser"
                    }
                },
                "required": ["run_id"]
            }
        ),
        # Release commands
        Tool(
            name="gh_release_list",
            description="List releases in a repository",
            inputSchema={
                "type": "object",
                "properties": {
                    "repository": {
                        "type": "string",
                        "description": "Repository in OWNER/REPO format (defaults to current repo)"
                    },
                    "limit": {
                        "type": "number",
                        "description": "Maximum number of releases to list (default: 30)"
                    }
                }
            }
        ),
        Tool(
            name="gh_release_view",
            description="View information about a release",
            inputSchema={
                "type": "object",
                "properties": {
                    "tag": {
                        "type": "string",
                        "description": "Release tag (defaults to latest)"
                    },
                    "repository": {
                        "type": "string",
                        "description": "Repository in OWNER/REPO format (defaults to current repo)"
                    },
                    "web": {
                        "type": "boolean",
                        "description": "Open the release in a web browser"
                    }
                }
            }
        ),
        Tool(
            name="gh_release_create",
            description="Create a new release",
            inputSchema={
                "type": "object",
                "properties": {
                    "tag": {
                        "type": "string",
                        "description": "Tag name for the release"
                    },
                    "title": {
                        "type": "string",
                        "description": "Release title"
                    },
                    "notes": {
                        "type": "string",
                        "description": "Release notes"
                    },
                    "draft": {
                        "type": "boolean",
                        "description": "Create as draft release"
                    },
                    "prerelease": {
                        "type": "boolean",
                        "description": "Mark as pre-release"
                    },
                    "generate_notes": {
                        "type": "boolean",
                        "description": "Automatically generate release notes"
                    }
                },
                "required": ["tag"]
            }
        ),
        # API and general commands
        Tool(
            name="gh_api",
            description="Make an authenticated GitHub API request",
            inputSchema={
                "type": "object",
                "properties": {
                    "endpoint": {
                        "type": "string",
                        "description": "API endpoint (e.g., /repos/OWNER/REPO/issues)"
                    },
                    "method": {
                        "type": "string",
                        "enum": ["GET", "POST", "PUT", "PATCH", "DELETE"],
                        "description": "HTTP method (default: GET)"
                    },
                    "field": {
                        "type": "string",
                        "description": "JSON field to extract from response"
                    },
                    "jq": {
                        "type": "string",
                        "description": "jq expression to filter response"
                    }
                },
                "required": ["endpoint"]
            }
        ),
        Tool(
            name="gh_auth_status",
            description="View authentication status",
            inputSchema={
                "type": "object",
                "properties": {}
            }
        ),
        Tool(
            name="gh_status",
            description="Print information about relevant issues, pull requests, and notifications",
            inputSchema={
                "type": "object",
                "properties": {
                    "org": {
                        "type": "string",
                        "description": "Filter by organization"
                    }
                }
            }
        ),
        # Search commands
        Tool(
            name="gh_search_repos",
            description="Search for repositories",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Search query"
                    },
                    "limit": {
                        "type": "number",
                        "description": "Maximum number of results (default: 30)"
                    },
                    "language": {
                        "type": "string",
                        "description": "Filter by programming language"
                    },
                    "stars": {
                        "type": "string",
                        "description": "Filter by stars (e.g., '>1000')"
                    }
                },
                "required": ["query"]
            }
        ),
        Tool(
            name="gh_search_issues",
            description="Search for issues and pull requests",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Search query"
                    },
                    "limit": {
                        "type": "number",
                        "description": "Maximum number of results (default: 30)"
                    },
                    "state": {
                        "type": "string",
                        "enum": ["open", "closed"],
                        "description": "Filter by state"
                    }
                },
                "required": ["query"]
            }
        ),
        # Gist commands
        Tool(
            name="gh_gist_list",
            description="List your gists",
            inputSchema={
                "type": "object",
                "properties": {
                    "limit": {
                        "type": "number",
                        "description": "Maximum number of gists to list (default: 10)"
                    },
                    "public": {
                        "type": "boolean",
                        "description": "Show only public gists"
                    },
                    "secret": {
                        "type": "boolean",
                        "description": "Show only secret gists"
                    }
                }
            }
        ),
        Tool(
            name="gh_gist_create",
            description="Create a new gist",
            inputSchema={
                "type": "object",
                "properties": {
                    "files": {
                        "type": "string",
                        "description": "Comma-separated list of file paths"
                    },
                    "description": {
                        "type": "string",
                        "description": "Description of the gist"
                    },
                    "public": {
                        "type": "boolean",
                        "description": "Make gist public (default: secret)"
                    }
                },
                "required": ["files"]
            }
        ),
    ]


@app.call_tool()
async def call_tool(name: str, arguments: Any) -> list[TextContent]:
    """Handle tool calls by executing the appropriate gh command."""

    # Repository commands
    if name == "gh_repo_list":
        args = ["repo", "list"]
        if "owner" in arguments:
            args.append(arguments["owner"])
        if "limit" in arguments:
            args.extend(["--limit", str(arguments["limit"])])
        if "visibility" in arguments:
            args.extend(["--" + arguments["visibility"]])
        args.append("--json")
        args.append("name,description,url,isPrivate,stargazerCount,updatedAt")

    elif name == "gh_repo_view":
        args = ["repo", "view", arguments["repository"]]
        if arguments.get("web"):
            args.append("--web")
        else:
            args.extend(["--json", "name,description,url,isPrivate,stargazerCount,defaultBranchRef,createdAt,updatedAt"])

    elif name == "gh_repo_create":
        args = ["repo", "create", arguments["name"]]
        if "description" in arguments:
            args.extend(["--description", arguments["description"]])
        if arguments.get("public"):
            args.append("--public")
        else:
            args.append("--private")
        if arguments.get("clone"):
            args.append("--clone")

    # Pull Request commands
    elif name == "gh_pr_list":
        args = ["pr", "list"]
        if "repository" in arguments:
            args.extend(["--repo", arguments["repository"]])
        if "state" in arguments:
            args.extend(["--state", arguments["state"]])
        if "limit" in arguments:
            args.extend(["--limit", str(arguments["limit"])])
        if "assignee" in arguments:
            args.extend(["--assignee", arguments["assignee"]])
        if "author" in arguments:
            args.extend(["--author", arguments["author"]])
        args.extend(["--json", "number,title,state,url,author,createdAt,updatedAt"])

    elif name == "gh_pr_view":
        args = ["pr", "view", str(arguments["number"])]
        if "repository" in arguments:
            args.extend(["--repo", arguments["repository"]])
        if arguments.get("comments"):
            args.append("--comments")
        if arguments.get("web"):
            args.append("--web")
        else:
            args.extend(["--json", "number,title,body,state,url,author,createdAt,updatedAt,mergeable,baseRefName,headRefName"])

    elif name == "gh_pr_create":
        args = ["pr", "create"]
        if "title" in arguments:
            args.extend(["--title", arguments["title"]])
        if "body" in arguments:
            args.extend(["--body", arguments["body"]])
        if "base" in arguments:
            args.extend(["--base", arguments["base"]])
        if "head" in arguments:
            args.extend(["--head", arguments["head"]])
        if arguments.get("draft"):
            args.append("--draft")
        if arguments.get("web"):
            args.append("--web")

    elif name == "gh_pr_merge":
        args = ["pr", "merge", str(arguments["number"])]
        if "merge_method" in arguments:
            args.extend(["--" + arguments["merge_method"]])
        if arguments.get("delete_branch"):
            args.append("--delete-branch")

    elif name == "gh_pr_checkout":
        args = ["pr", "checkout", str(arguments["number"])]
        if "branch" in arguments:
            args.append(arguments["branch"])

    # Issue commands
    elif name == "gh_issue_list":
        args = ["issue", "list"]
        if "repository" in arguments:
            args.extend(["--repo", arguments["repository"]])
        if "state" in arguments:
            args.extend(["--state", arguments["state"]])
        if "limit" in arguments:
            args.extend(["--limit", str(arguments["limit"])])
        if "assignee" in arguments:
            args.extend(["--assignee", arguments["assignee"]])
        if "author" in arguments:
            args.extend(["--author", arguments["author"]])
        if "label" in arguments:
            args.extend(["--label", arguments["label"]])
        args.extend(["--json", "number,title,state,url,author,createdAt,updatedAt"])

    elif name == "gh_issue_view":
        args = ["issue", "view", str(arguments["number"])]
        if "repository" in arguments:
            args.extend(["--repo", arguments["repository"]])
        if arguments.get("comments"):
            args.append("--comments")
        if arguments.get("web"):
            args.append("--web")
        else:
            args.extend(["--json", "number,title,body,state,url,author,createdAt,updatedAt,labels"])

    elif name == "gh_issue_create":
        args = ["issue", "create"]
        args.extend(["--title", arguments["title"]])
        if "body" in arguments:
            args.extend(["--body", arguments["body"]])
        if "assignee" in arguments:
            args.extend(["--assignee", arguments["assignee"]])
        if "label" in arguments:
            args.extend(["--label", arguments["label"]])
        if "milestone" in arguments:
            args.extend(["--milestone", arguments["milestone"]])
        if arguments.get("web"):
            args.append("--web")

    elif name == "gh_issue_close":
        args = ["issue", "close", str(arguments["number"])]
        if "comment" in arguments:
            args.extend(["--comment", arguments["comment"]])

    # Workflow commands
    elif name == "gh_workflow_list":
        args = ["workflow", "list"]
        if "repository" in arguments:
            args.extend(["--repo", arguments["repository"]])
        if arguments.get("all"):
            args.append("--all")
        args.extend(["--json", "id,name,state,path"])

    elif name == "gh_workflow_view":
        args = ["workflow", "view", arguments["workflow"]]
        if "repository" in arguments:
            args.extend(["--repo", arguments["repository"]])
        if arguments.get("web"):
            args.append("--web")

    elif name == "gh_run_list":
        args = ["run", "list"]
        if "repository" in arguments:
            args.extend(["--repo", arguments["repository"]])
        if "workflow" in arguments:
            args.extend(["--workflow", arguments["workflow"]])
        if "limit" in arguments:
            args.extend(["--limit", str(arguments["limit"])])
        if "status" in arguments:
            args.extend(["--status", arguments["status"]])
        args.extend(["--json", "databaseId,name,displayTitle,status,conclusion,createdAt,updatedAt,url"])

    elif name == "gh_run_view":
        args = ["run", "view", str(arguments["run_id"])]
        if "repository" in arguments:
            args.extend(["--repo", arguments["repository"]])
        if arguments.get("log"):
            args.append("--log")
        if arguments.get("web"):
            args.append("--web")
        else:
            args.extend(["--json", "databaseId,name,displayTitle,status,conclusion,createdAt,updatedAt,url,jobs"])

    # Release commands
    elif name == "gh_release_list":
        args = ["release", "list"]
        if "repository" in arguments:
            args.extend(["--repo", arguments["repository"]])
        if "limit" in arguments:
            args.extend(["--limit", str(arguments["limit"])])
        args.extend(["--json", "tagName,name,createdAt,publishedAt,url,isPrerelease,isDraft"])

    elif name == "gh_release_view":
        args = ["release", "view"]
        if "tag" in arguments:
            args.append(arguments["tag"])
        if "repository" in arguments:
            args.extend(["--repo", arguments["repository"]])
        if arguments.get("web"):
            args.append("--web")
        else:
            args.extend(["--json", "tagName,name,body,createdAt,publishedAt,url,isPrerelease,isDraft"])

    elif name == "gh_release_create":
        args = ["release", "create", arguments["tag"]]
        if "title" in arguments:
            args.extend(["--title", arguments["title"]])
        if "notes" in arguments:
            args.extend(["--notes", arguments["notes"]])
        if arguments.get("draft"):
            args.append("--draft")
        if arguments.get("prerelease"):
            args.append("--prerelease")
        if arguments.get("generate_notes"):
            args.append("--generate-notes")

    # API and general commands
    elif name == "gh_api":
        args = ["api", arguments["endpoint"]]
        if "method" in arguments:
            args.extend(["--method", arguments["method"]])
        if "field" in arguments:
            args.extend(["--jq", f'.{arguments["field"]}'])
        elif "jq" in arguments:
            args.extend(["--jq", arguments["jq"]])

    elif name == "gh_auth_status":
        args = ["auth", "status"]

    elif name == "gh_status":
        args = ["status"]
        if "org" in arguments:
            args.extend(["--org", arguments["org"]])

    # Search commands
    elif name == "gh_search_repos":
        query = arguments["query"]
        if "language" in arguments:
            query += f" language:{arguments['language']}"
        if "stars" in arguments:
            query += f" stars:{arguments['stars']}"
        args = ["search", "repos", query]
        if "limit" in arguments:
            args.extend(["--limit", str(arguments["limit"])])
        args.extend(["--json", "name,description,url,stargazerCount,language"])

    elif name == "gh_search_issues":
        query = arguments["query"]
        if "state" in arguments:
            query += f" state:{arguments['state']}"
        args = ["search", "issues", query]
        if "limit" in arguments:
            args.extend(["--limit", str(arguments["limit"])])
        args.extend(["--json", "number,title,state,url,repository"])

    # Gist commands
    elif name == "gh_gist_list":
        args = ["gist", "list"]
        if "limit" in arguments:
            args.extend(["--limit", str(arguments["limit"])])
        if arguments.get("public"):
            args.append("--public")
        if arguments.get("secret"):
            args.append("--secret")

    elif name == "gh_gist_create":
        args = ["gist", "create"]
        for file in arguments["files"].split(","):
            args.append(file.strip())
        if "description" in arguments:
            args.extend(["--desc", arguments["description"]])
        if arguments.get("public"):
            args.append("--public")

    else:
        return [TextContent(type="text", text=f"Unknown tool: {name}")]

    # Execute the command
    result = run_gh_command(args)

    # Format the response
    if result["success"]:
        output = result["stdout"]
        # Try to pretty-print JSON if possible
        try:
            json_data = json.loads(output)
            output = json.dumps(json_data, indent=2)
        except:
            pass
        return [TextContent(type="text", text=output)]
    else:
        error_msg = f"Command failed with return code {result['returncode']}\n"
        if result["stderr"]:
            error_msg += f"Error: {result['stderr']}\n"
        if result["stdout"]:
            error_msg += f"Output: {result['stdout']}"
        return [TextContent(type="text", text=error_msg)]


async def main():
    """Run the MCP server."""
    from mcp.server.stdio import stdio_server

    async with stdio_server() as (read_stream, write_stream):
        await app.run(
            read_stream,
            write_stream,
            app.create_initialization_options()
        )


if __name__ == "__main__":
    asyncio.run(main())
