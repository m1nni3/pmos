#!/bin/bash
# Push all changes to GitHub
# Run from the pmos root directory: bash scripts/git-push.sh

cd "$(dirname "$0")/.."

echo "=== Adding all changed files..."
git add -A

echo ""
echo "=== Enter a short message describing what you changed:"
read commit_msg

if [ -z "$commit_msg" ]; then
  echo "No message entered. Cancelled."
  exit 1
fi

git commit -m "$commit_msg"

echo ""
echo "=== Pushing to GitHub..."
git push origin main

echo ""
echo "=== Done!"
