#!/usr/bin/env python3
"""
Register an MCP server with Claude Desktop.

Usage:
    python scripts/register-claude.py [server_name]

Available servers:
    gh        - GitHub CLI MCP server (Python)
    ensembl   - Ensembl genomics API server (Node.js)
    string    - STRING protein interaction server (Node.js)

If no server name is provided, defaults to 'gh'.
"""

import argparse
import subprocess
import sys
from pathlib import Path


# Server configurations
SERVERS = {
    "gh": {
        "type": "python",
        "script": "servers/gh/server.py",
        "description": "GitHub CLI MCP server",
    },
    "ensembl": {
        "type": "node",
        "script": "servers/ensembl/build/index.js",
        "description": "Ensembl genomics API server",
    },
    "string": {
        "type": "node",
        "script": "servers/string/build/index.js",
        "description": "STRING protein interaction server",
    },
}


def get_node_path():
    """Get the path to node executable."""
    try:
        result = subprocess.run(
            ["which", "node"],
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError:
        return None


def register_server(server_name):
    """Register the specified MCP server with Claude Desktop."""
    # Validate server name
    if server_name not in SERVERS:
        print(f"Error: Unknown server '{server_name}'", file=sys.stderr)
        print(f"\nAvailable servers:", file=sys.stderr)
        for name, config in SERVERS.items():
            print(f"  {name:10} - {config['description']}", file=sys.stderr)
        sys.exit(1)

    server_config = SERVERS[server_name]
    project_root = Path(__file__).parent.parent

    # Get the appropriate runtime path
    if server_config["type"] == "python":
        runtime_path = project_root / ".pixi" / "envs" / "default" / "bin" / "python"
        runtime_name = "Python"

        # Check if pixi environment exists
        if not runtime_path.exists():
            print("Error: Pixi environment not found. Run 'pixi install' first.", file=sys.stderr)
            sys.exit(1)
    else:  # node
        runtime_path = get_node_path()
        runtime_name = "Node.js"

        if not runtime_path:
            print("Error: Node.js not found. Please install Node.js.", file=sys.stderr)
            sys.exit(1)
        runtime_path = Path(runtime_path)

    # Path to the server script
    server_path = project_root / server_config["script"]

    # Check if server script exists
    if not server_path.exists():
        print(f"Error: Server script not found at {server_path}", file=sys.stderr)
        if server_config["type"] == "node":
            print(f"\nFor Node.js servers, you need to build them first:", file=sys.stderr)
            print(f"  npm install", file=sys.stderr)
            print(f"  npm run build:{server_name}", file=sys.stderr)
        sys.exit(1)

    # Register with Claude Desktop
    cmd = [
        "claude",
        "mcp",
        "add",
        server_name,
        str(runtime_path),
        str(server_path)
    ]

    print(f"Registering {server_config['description']} with Claude Desktop...")
    print(f"Runtime: {runtime_name} ({runtime_path})")
    print(f"Script: {server_path}")
    print(f"\nCommand: {' '.join(cmd)}")

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=True
        )

        if result.stdout:
            print(result.stdout)

        print(f"✓ Successfully registered '{server_name}' MCP server with Claude Desktop")
        print("\nRestart Claude Desktop to load the server.")

    except subprocess.CalledProcessError as e:
        print(f"Error: Failed to register MCP server", file=sys.stderr)
        if e.stderr:
            print(f"Details: {e.stderr}", file=sys.stderr)
        sys.exit(1)
    except FileNotFoundError:
        print("Error: 'claude' command not found. Make sure Claude CLI is installed.", file=sys.stderr)
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(
        description="Register an MCP server with Claude Desktop",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Available servers:
  gh        - GitHub CLI MCP server (Python)
  ensembl   - Ensembl genomics API server (Node.js)
  string    - STRING protein interaction server (Node.js)

Examples:
  python scripts/register-claude.py gh
  python scripts/register-claude.py ensembl
  python scripts/register-claude.py string
        """
    )
    parser.add_argument(
        "server",
        nargs="?",
        default="gh",
        choices=SERVERS.keys(),
        help="Name of the server to register (default: gh)"
    )

    args = parser.parse_args()
    register_server(args.server)


if __name__ == "__main__":
    main()
