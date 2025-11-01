#!/usr/bin/env python3
"""
Bump the version number in pyproject.toml.

This script increments the patch version number (e.g., 0.1.0 -> 0.1.1).
"""

import sys
from pathlib import Path


def bump_version():
    """Bump the patch version in pyproject.toml."""
    pyproject_path = Path(__file__).parent.parent / "pyproject.toml"

    if not pyproject_path.exists():
        print(f"Error: {pyproject_path} not found", file=sys.stderr)
        sys.exit(1)

    content = pyproject_path.read_text()
    lines = content.split('\n')

    # Find the version line
    version_line = None
    version_line_idx = None
    for idx, line in enumerate(lines):
        if line.startswith('version = '):
            version_line = line
            version_line_idx = idx
            break

    if version_line is None:
        print("Error: Could not find 'version = ' line in pyproject.toml", file=sys.stderr)
        sys.exit(1)

    # Extract current version
    current_version = version_line.split('=')[1].strip().strip('"')

    # Bump the patch version
    parts = current_version.split('.')
    if len(parts) != 3:
        print(f"Error: Version format should be X.Y.Z, got {current_version}", file=sys.stderr)
        sys.exit(1)

    try:
        parts[-1] = str(int(parts[-1]) + 1)
    except ValueError:
        print(f"Error: Could not parse patch version number: {parts[-1]}", file=sys.stderr)
        sys.exit(1)

    new_version = '.'.join(parts)

    # Update the version line
    lines[version_line_idx] = f'version = "{new_version}"'

    # Write back to file
    pyproject_path.write_text('\n'.join(lines))

    print(f"Bumped version: {current_version} -> {new_version}")
    return new_version


if __name__ == "__main__":
    bump_version()
