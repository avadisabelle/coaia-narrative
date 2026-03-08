#!/usr/bin/env bash
set -euo pipefail
# Ensure submodules are initialized, then fetch and update them
# Usage: ./scripts/submodules-updates.sh
git submodule update --init --recursive
# Fetch and fast-forward each submodule to its tracked remote branch if possible
git submodule update --remote --recursive
