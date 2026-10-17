#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
if ! command -v git >/dev/null 2>&1; then echo 'Git is required: https://git-scm.com/downloads'; exit 1; fi
if [ ! -d .git ]; then git init -b main; fi
git remote remove origin >/dev/null 2>&1 || true
git remote add origin https://github.com/myrabinthapa/kabeli.ae.git
git add .
git commit -m "Launch Kabeli website" || true
git push -u origin main
printf '\nUploaded: https://github.com/myrabinthapa/kabeli.ae\n'
