#!/usr/bin/env bash
# Push main to hashdev89/nordiclusxwebsite using a fine-grained PAT.
# Usage (in your Terminal — do not paste the token in chat):
#   export GITHUB_TOKEN='github_pat_...'
#   ./scripts/push-hashdev89.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -z "${GITHUB_TOKEN:-}" ]]; then
  echo "Error: Set GITHUB_TOKEN to your fine-grained personal access token first."
  echo "  export GITHUB_TOKEN='github_pat_...'"
  exit 1
fi

REMOTE_URL="https://github.com/hashdev89/nordiclusxwebsite.git"
USERNAME="hashdev89"

echo "Pushing main to hashdev89/nordiclusxwebsite ..."
git push "https://${USERNAME}:${GITHUB_TOKEN}@github.com/hashdev89/nordiclusxwebsite.git" main

git branch --set-upstream-to=hashdev89/main main 2>/dev/null || true

# Save token in macOS Keychain for future pushes (optional)
if command -v git-credential-osxkeychain >/dev/null 2>&1; then
  printf 'protocol=https\nhost=github.com\nusername=%s\npassword=%s\n\n' \
    "$USERNAME" "$GITHUB_TOKEN" | git credential-osxkeychain store
  echo "Credentials stored in Keychain. Future pushes: git push hashdev89 main"
fi

unset GITHUB_TOKEN
echo "Done."
