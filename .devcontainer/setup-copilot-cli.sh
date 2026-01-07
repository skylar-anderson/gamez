#!/usr/bin/env bash
set -euo pipefail

COPILOT_CLI_BRANCH="${COPILOT_CLI_BRANCH:-webserver-haha}"
COPILOT_CLI_DIR="${COPILOT_CLI_DIR:-/home/node/.copilot-cli}"

# Clone and build
if [ ! -d "$COPILOT_CLI_DIR" ]; then
  gh repo clone github/copilot-cli "$COPILOT_CLI_DIR" -- --branch "$COPILOT_CLI_BRANCH" --single-branch --depth 1
fi

cd "$COPILOT_CLI_DIR"
echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> ~/.npmrc
echo "@github:registry=https://npm.pkg.github.com" >> ~/.npmrc
npm install && npm run build:cli
