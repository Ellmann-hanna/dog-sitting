#!/bin/bash
set -euo pipefail

# Only run in remote (Claude Code on the web) environments
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

echo "Installing Node.js dependencies..."
npm install

echo "Installing Ruby dependencies..."
cd "$CLAUDE_PROJECT_DIR/hello_claude" && bundle _2.5.22_ install
