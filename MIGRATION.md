# Migration Guide: Monorepo to Separate Repositories

As of December 2025, the MCP servers have been split into separate GitHub repositories for better maintainability and independent versioning.

## New Repository Structure

The monorepo has been split into 4 independent repositories:

1. **[@mcp/rest-utils](https://github.com/munch-group/mcp-rest-utils)** - Shared REST API utilities
2. **[ensembl-mcp](https://github.com/munch-group/ensembl-mcp)** - Ensembl genomics server
3. **[string-mcp](https://github.com/munch-group/string-mcp)** - STRING protein interaction server
4. **[gh-mcp](https://github.com/munch-group/gh-mcp)** - GitHub CLI wrapper server

## Why the Split?

- **Independent versioning**: Each server can evolve at its own pace
- **Easier discovery**: Users can find and install only what they need
- **Better maintenance**: Clearer ownership and issue tracking
- **Simplified CI/CD**: Each repo has its own build and release process

## Installation Changes

### Before (Monorepo)

```bash
git clone https://github.com/munch-group/mcp-servers.git
cd mcp-servers
npm install
npm run build
```

### After (Separate Repos)

Install only what you need:

```bash
# REST utilities (only if building your own server)
git clone https://github.com/munch-group/mcp-rest-utils.git

# Ensembl server
git clone https://github.com/munch-group/ensembl-mcp.git
cd ensembl-mcp
npm install
npm run build

# STRING server
git clone https://github.com/munch-group/string-mcp.git
cd string-mcp
npm install
npm run build

# GitHub CLI server
git clone https://github.com/munch-group/gh-mcp.git
cd gh-mcp
pip install -e .
```

## Dependency Changes

The TypeScript servers (ensembl-mcp and string-mcp) now reference @mcp/rest-utils via git URL:

```json
{
  "dependencies": {
    "@mcp/rest-utils": "git+https://github.com/munch-group/mcp-rest-utils.git"
  }
}
```

This means npm will automatically fetch the latest version from GitHub when you run `npm install`.

## Conda Packages

Each repository now includes its own conda recipe in the `conda-recipe/` directory. Conda packages will be available separately:

```bash
conda install -c munch-group mcp-rest-utils
conda install -c munch-group ensembl-mcp
conda install -c munch-group string-mcp
conda install -c munch-group gh-mcp
```

## Claude Desktop Configuration

Update your Claude Desktop config to point to the new repos:

```json
{
  "mcpServers": {
    "ensembl": {
      "command": "node",
      "args": ["/path/to/ensembl-mcp/build/index.js"]
    },
    "string": {
      "command": "node",
      "args": ["/path/to/string-mcp/build/index.js"]
    },
    "gh": {
      "command": "python",
      "args": ["/path/to/gh-mcp/server.py"]
    }
  }
}
```

## Git History

All repositories preserve their git history from the monorepo using git filter-branch. You can see the full history of each component in its respective repository.

## Questions or Issues?

- For rest-utils: https://github.com/munch-group/mcp-rest-utils/issues
- For ensembl-mcp: https://github.com/munch-group/ensembl-mcp/issues
- For string-mcp: https://github.com/munch-group/string-mcp/issues
- For gh-mcp: https://github.com/munch-group/gh-mcp/issues

## This Repository

This original monorepo will be archived and maintained for historical reference only. All future development will happen in the separate repositories.
