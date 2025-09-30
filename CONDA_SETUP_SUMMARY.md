# Conda Package Setup Summary

The MCP servers project has been configured as conda packages with automated CI/CD.

## What Was Created

### 1. Conda Recipe Files

**Location:** `conda-recipes/`

Three packages configured:
- **mcp-rest-utils** (`conda-recipes/rest-utils/meta.yaml`)
  - Shared utilities library
  - Installed as npm package in conda environment

- **ensembl-mcp** (`conda-recipes/ensembl-mcp/meta.yaml`)
  - Ensembl genomics API server
  - Binary: `ensembl-mcp`
  - 31 tools for genomics data access

- **string-mcp** (`conda-recipes/string-mcp/meta.yaml`)
  - STRING protein interaction database server
  - Binary: `string-mcp`
  - 9 tools for protein network analysis

### 2. GitHub Actions Workflow

**File:** `.github/workflows/conda-build.yml`

**Features:**
- Builds on Ubuntu and macOS
- Triggers on version tags (v*.*.*)
- Manual workflow dispatch option
- Uploads to Anaconda.org automatically
- Stores artifacts for 7 days

**Build Matrix:**
- 3 packages × 2 operating systems = 6 builds per run

### 3. NPM Scripts

**Added to** `package.json`:

```json
{
  "conda:build": "Build all conda packages",
  "conda:build:rest-utils": "Build rest-utils package",
  "conda:build:ensembl": "Build ensembl-mcp package",
  "conda:build:string": "Build string-mcp package",
  "conda:upload": "Upload packages to Anaconda.org"
}
```

### 4. Documentation

- **CONDA_BUILD.md** - Complete build and publish guide
- **README.md** - Updated with conda installation instructions
- **LICENSE** - ISC license file
- **.gitignore** - Ignores conda build artifacts

## Package Configuration

### Common Settings
- **Architecture:** noarch (platform-independent)
- **Node.js requirement:** >=20
- **Build system:** npm build process
- **License:** ISC

### Installation Locations
```
$PREFIX/
├── bin/
│   ├── ensembl-mcp -> ../lib/ensembl-mcp/build/index.js
│   └── string-mcp -> ../lib/string-mcp/build/index.js
└── lib/
    ├── ensembl-mcp/
    │   ├── build/
    │   ├── node_modules/
    │   └── package.json
    ├── string-mcp/
    │   ├── build/
    │   ├── node_modules/
    │   └── package.json
    └── node_modules/
        └── @mcp/rest-utils/
```

## Usage

### Local Development Build

```bash
# Build all conda packages locally
npm run conda:build

# Packages will be in ./conda-bld/
```

### Install Locally Built Package

```bash
conda install -c local ensembl-mcp
```

### Publishing via GitHub Actions

1. **Create and push a version tag:**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **GitHub Actions will:**
   - Checkout code
   - Setup conda environment
   - Install dependencies
   - Build all 3 packages
   - Upload to Anaconda.org (if tag matches v*)
   - Store artifacts

### Manual Upload

```bash
# Login to Anaconda
anaconda login

# Upload packages
npm run conda:upload
```

## GitHub Setup Required

### 1. Create Anaconda.org Account
- Sign up at https://anaconda.org
- Generate API token in Account Settings

### 2. Add GitHub Secret
1. Go to repository Settings → Secrets and variables → Actions
2. Add new repository secret:
   - **Name:** `ANACONDA_TOKEN`
   - **Value:** Your Anaconda.org API token

### 3. Update Recipe Files
Replace `yourusername` in all `meta.yaml` files with your:
- GitHub username
- Anaconda.org username

## Installation for End Users

Once published to Anaconda.org:

```bash
# Add your channel
conda config --add channels yourusername

# Install servers
conda install ensembl-mcp string-mcp

# Use the servers
ensembl-mcp
string-mcp
```

## Benefits of Conda Distribution

1. **Easy Installation:** Single command to install with all dependencies
2. **Version Management:** Users can install specific versions
3. **Cross-platform:** Works on Linux, macOS, Windows
4. **Environment Isolation:** Clean installation per conda environment
5. **Dependency Resolution:** Conda handles Node.js dependency automatically
6. **CI/CD Integration:** Automated builds and uploads on tag push
7. **Artifact Storage:** GitHub Actions stores builds for testing

## Next Steps

1. **Test locally:**
   ```bash
   npm run conda:build
   conda install -c local ensembl-mcp
   ensembl-mcp
   ```

2. **Setup GitHub secrets:**
   - Add ANACONDA_TOKEN to repository

3. **Publish first release:**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

4. **Verify upload:**
   - Check https://anaconda.org/yourusername/ensembl-mcp
   - Test installation: `conda install -c yourusername ensembl-mcp`

## Maintenance

### Update Version
1. Edit version in `package.json` files
2. Edit version in `meta.yaml` files
3. Create new tag and push
4. GitHub Actions builds automatically

### Update Dependencies
1. Update npm dependencies in `package.json`
2. Rebuild conda packages
3. Test installation
4. Push new tag

## Troubleshooting

See [CONDA_BUILD.md](CONDA_BUILD.md) for detailed troubleshooting guide.

Common issues:
- **Build fails:** Check Node.js version (>=20 required)
- **Upload fails:** Verify ANACONDA_TOKEN is set
- **Package not found:** Check channel is added to conda config
