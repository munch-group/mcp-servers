#!/usr/bin/env python3
"""
Simple test script to verify the gh MCP server is working correctly.
"""

import subprocess
import sys


def test_gh_available():
    """Test if gh CLI is available and authenticated."""
    print("Testing gh CLI availability...")
    try:
        result = subprocess.run(
            ["gh", "auth", "status"],
            capture_output=True,
            text=True,
            timeout=10
        )
        if result.returncode == 0:
            print("✓ gh CLI is installed and authenticated")
            print(result.stdout)
            return True
        else:
            print("✗ gh CLI authentication failed")
            print(result.stderr)
            return False
    except FileNotFoundError:
        print("✗ gh CLI is not installed")
        print("Install from: https://cli.github.com/")
        return False
    except Exception as e:
        print(f"✗ Error testing gh CLI: {e}")
        return False


def test_python_imports():
    """Test if required Python modules are available."""
    print("\nTesting Python imports...")
    try:
        import mcp
        print("✓ mcp module is available")
        return True
    except ImportError as e:
        print(f"✗ Failed to import mcp: {e}")
        print("Install with: pip install mcp")
        return False


def test_server_syntax():
    """Test if the server script has valid syntax."""
    print("\nTesting server.py syntax...")
    try:
        result = subprocess.run(
            [sys.executable, "-m", "py_compile", "server.py"],
            capture_output=True,
            text=True,
            timeout=10
        )
        if result.returncode == 0:
            print("✓ server.py syntax is valid")
            return True
        else:
            print("✗ server.py has syntax errors")
            print(result.stderr)
            return False
    except Exception as e:
        print(f"✗ Error checking syntax: {e}")
        return False


def main():
    """Run all tests."""
    print("=" * 60)
    print("GitHub CLI MCP Server - Test Suite")
    print("=" * 60)

    results = []
    results.append(("gh CLI", test_gh_available()))
    results.append(("Python imports", test_python_imports()))
    results.append(("Server syntax", test_server_syntax()))

    print("\n" + "=" * 60)
    print("Test Results Summary")
    print("=" * 60)

    all_passed = True
    for name, passed in results:
        status = "✓ PASS" if passed else "✗ FAIL"
        print(f"{status}: {name}")
        if not passed:
            all_passed = False

    if all_passed:
        print("\n✓ All tests passed! The server is ready to use.")
        print("\nTo use the server with Claude Code, add this to your config:")
        print("""
{
  "mcpServers": {
    "gh": {
      "command": "python",
      "args": ["/absolute/path/to/mcp-servers/gh-server/server.py"]
    }
  }
}
""")
        return 0
    else:
        print("\n✗ Some tests failed. Please fix the issues above.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
