# Building and Publishing Conda Packages

This document describes how to build and publish the MCP servers as conda packages.

## Prerequisites

1. **Install Miniconda or Anaconda**
   ```bash
   # Download and install Miniconda
   wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh
   bash Miniconda3-latest-Linux-x86_64.sh
   ```

2. **Install conda-build and anaconda-client**
   ```bash
   conda install conda-build anaconda-client
   ```

3. **Setup Anaconda.org account**
   - Create account at https://anaconda.org
   - Generate API token: Account Settings → Access
   - Save token: `anaconda login`

## Package Structure

The project contains 3 conda packages:

1. **mcp-rest-utils** - Shared utilities package
2. **ensembl-mcp** - Ensembl genomics API server
3. **string-mcp** - STRING protein interaction database server

## Building Packages Locally

### Build all packages
```bash
npm run conda:build
```

### Build individual packages
```bash
# Build rest-utils
npm run conda:build:rest-utils

# Build ensembl server
npm run conda:build:ensembl

# Build string server
npm run conda:build:string
```

Packages will be built in the `./conda-bld` directory.

## Testing Locally Built Packages

### Install from local build
```bash
# Install ensembl-mcp from local build
conda install -c local ensembl-mcp

# Install string-mcp from local build
conda install -c local string-mcp
```

### Test the installed package
```bash
# Test ensembl server
ensembl-mcp

# Test string server
string-mcp
```

## Publishing to Anaconda.org

### Manual Upload
```bash
# Upload all built packages
npm run conda:upload

# Or upload specific package
anaconda upload ./conda-bld/noarch/ensembl-mcp-1.0.0-0.tar.bz2
```

### Automated Upload via GitHub Actions

The project includes a GitHub Actions workflow that automatically builds and uploads packages.

**Trigger on tag push:**
```bash
git tag v1.0.0
git push origin v1.0.0
```

**Manual trigger:**
- Go to Actions tab in GitHub
- Select "Build and Upload Conda Packages"
- Click "Run workflow"

## GitHub Actions Setup

### Required Secrets

Add the following secret to your GitHub repository:

1. Go to: Settings → Secrets and variables → Actions
2. Add new secret:
   - Name: `ANACONDA_TOKEN`
   - Value: Your Anaconda.org API token

### Workflow Details

File: `.github/workflows/conda-build.yml`

**Triggers:**
- Push to tags matching `v*` (e.g., v1.0.0)
- Manual workflow dispatch

**Build Matrix:**
- OS: Ubuntu, macOS
- Packages: rest-utils, ensembl-mcp, string-mcp

**Outputs:**
- Conda packages uploaded to Anaconda.org
- Build artifacts available for 7 days

## Installing Published Packages

Once published to Anaconda.org:

```bash
# Add your channel
conda config --add channels yourusername

# Install packages
conda install ensembl-mcp
conda install string-mcp
```

## Package Metadata

Each package includes:
- **Version**: 1.0.0
- **Build number**: 0
- **Architecture**: noarch (platform-independent)
- **Dependencies**: nodejs >=20
- **License**: ISC

## Updating Package Version

1. Update version in `package.json` files:
   - `servers/ensembl/package.json`
   - `servers/string/package.json`
   - `packages/rest-utils/package.json`

2. Update version in conda recipes:
   - `conda-recipes/ensembl-mcp/meta.yaml`
   - `conda-recipes/string-mcp/meta.yaml`
   - `conda-recipes/rest-utils/meta.yaml`

3. Rebuild and upload:
   ```bash
   npm run build
   npm run conda:build
   npm run conda:upload
   ```

## Troubleshooting

### Build fails with "command not found"
- Ensure conda-build is installed: `conda install conda-build`
- Activate conda environment: `conda activate base`

### Upload fails with authentication error
- Login to anaconda: `anaconda login`
- Or set token: `export ANACONDA_TOKEN=your-token`

### Package not found after installation
- Check channel is added: `conda config --show channels`
- Search for package: `anaconda search -t conda ensembl-mcp`

### Node.js version mismatch
- Ensure Node.js >=20 is installed
- Update conda recipe if different version needed

## CI/CD Best Practices

1. **Version Tags**: Always tag releases with semantic versioning (v1.0.0)
2. **Test Before Upload**: Build and test locally before pushing tags
3. **Channel Management**: Use separate channels for dev/staging/production
4. **Build Numbers**: Increment build number for package updates without version change

## Additional Resources

- [Conda Build Documentation](https://docs.conda.io/projects/conda-build/)
- [Anaconda.org User Guide](https://docs.anaconda.com/anacondaorg/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
