#!/bin/bash
# Installs the ui-ux-pro-max CLI (`uipro`) in Claude Code cloud sessions.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

UIPRO_VERSION="2.15.0"

if [ "$(npm ls -g ui-ux-pro-max-cli --depth=0 2>/dev/null | grep -o 'ui-ux-pro-max-cli@[0-9.]*' || true)" != "ui-ux-pro-max-cli@${UIPRO_VERSION}" ]; then
  npm install -g --no-audit --no-fund "ui-ux-pro-max-cli@${UIPRO_VERSION}"
fi
