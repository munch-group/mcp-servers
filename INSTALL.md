# Installation Guide

## Python Package Installation with pip

The `mcp-servers` package can now be installed using pip, making it easy to use the GitHub CLI MCP server.

### Prerequisites

- Python 3.10 or higher
- pip (Python package installer)
- GitHub CLI (`gh`) installed and authenticated (for the GitHub server)

### Installation Options

#### 1. Install in Development Mode (Editable)

This is recommended for local development:

```bash
cd /path/to/mcp-servers
pip install -e .
```

This creates a link to your source code, so any changes you make are immediately reflected.

#### 2. Install from Source

```bash
cd /path/to/mcp-servers
pip install .
```

#### 3. Install Directly from Git

```bash
pip install git+https://github.com/yourusername/mcp-servers.git
```

#### 4. Install with Development Dependencies

```bash
pip install -e ".[dev]"
```

This includes additional tools for development like pytest, black, and ruff.

### Using the Installed Package

After installation, the `gh-mcp-server` command will be available in your PATH:

```bash
# Run the server directly
gh-mcp-server

# Register with Claude Desktop
claude mcp add gh gh-mcp-server
```

### Package Structure

The package includes:
- `servers.gh.server`: GitHub CLI MCP server
- All required dependencies (mcp, requests, json5)

### Verifying Installation

```bash
# Check if the command is available
which gh-mcp-server

# Or test the Python module
python -c "from servers.gh import server; print('Import successful')"
```

### Uninstallation

```bash
pip uninstall mcp-servers
```

## Alternative Installation Methods

### Using Conda

See the main README.md for Conda installation instructions.

### Using npm (for TypeScript servers)

See the main README.md for npm installation instructions for the Ensembl and STRING servers.

## Troubleshooting

### Python Version Issues

Make sure you're using Python 3.10 or higher:

```bash
python --version
```

If you have multiple Python versions, you may need to use `python3.10` or `python3.11` explicitly.

### Permission Errors

If you get permission errors, you can:

1. Use a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -e .
```

2. Use the `--user` flag:
```bash
pip install --user -e .
```

### GitHub CLI Not Found

The GitHub CLI server requires `gh` to be installed and authenticated:

```bash
# Install GitHub CLI (macOS)
brew install gh

# Authenticate
gh auth login
```
