#!/usr/bin/env python3
"""
Create and push a git release tag based on the current version in pyproject.toml.

This script:
1. Reads the version from pyproject.toml
2. Creates a git tag with the format v{version}
3. Pushes the tag to the origin remote
"""

import subprocess
import sys
from pathlib import Path


def get_version():
    """Get the current version from pyproject.toml."""
    pyproject_path = Path(__file__).parent.parent / "pyproject.toml"

    if not pyproject_path.exists():
        print(f"Error: {pyproject_path} not found", file=sys.stderr)
        sys.exit(1)

    content = pyproject_path.read_text()

    # Find the version line
    for line in content.split('\n'):
        if line.startswith('version = '):
            version = line.split('=')[1].strip().strip('"')
            return version

    print("Error: Could not find 'version = ' line in pyproject.toml", file=sys.stderr)
    sys.exit(1)


def run_command(cmd, error_msg):
    """Run a command and handle errors."""
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"Error: {error_msg}", file=sys.stderr)
        if e.stderr:
            print(f"Details: {e.stderr}", file=sys.stderr)
        sys.exit(1)


def push_release_tag():
    """Create and push a release tag."""
    version = get_version()
    tag = f"v{version}"

    print(f"Creating tag: {tag}")

    # Check if tag already exists
    result = subprocess.run(
        ["git", "tag", "-l", tag],
        capture_output=True,
        text=True
    )

    if result.stdout.strip():
        print(f"Warning: Tag {tag} already exists locally", file=sys.stderr)
        response = input("Delete and recreate? [y/N]: ")
        if response.lower() != 'y':
            print("Aborted")
            sys.exit(1)
        run_command(
            ["git", "tag", "-d", tag],
            f"Failed to delete existing tag {tag}"
        )

    # Create the tag
    run_command(
        ["git", "tag", tag],
        f"Failed to create tag {tag}"
    )

    print(f"Pushing tag to origin: {tag}")

    # Push the tag
    run_command(
        ["git", "push", "origin", tag],
        f"Failed to push tag {tag} to origin"
    )

    print(f"✓ Successfully created and pushed tag: {tag}")


if __name__ == "__main__":
    push_release_tag()
