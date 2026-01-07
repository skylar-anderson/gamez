#!/usr/bin/env bash
set -euo pipefail

COPILOT_CLI_DIR="${COPILOT_CLI_DIR:-/home/node/.copilot-cli}"

# Kill existing server if running
[ -f /tmp/copilot.pid ] && kill $(cat /tmp/copilot.pid) 2>/dev/null || true

# Start server
cd "$COPILOT_CLI_DIR"
nohup node dist-cli/index.js --http-server --http-port 8080 > /tmp/copilot.log 2>&1 &
echo $! > /tmp/copilot.pid

# Wait for ready
for i in {1..30}; do
  curl -s http://localhost:8080/health > /dev/null && echo "✅ Server ready on :8080" && exit 0
  sleep 1
done
echo "❌ Server failed to start" && exit 1
