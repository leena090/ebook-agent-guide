#!/bin/bash
export PATH="$PATH:/c/Program Files/GitHub CLI"
MSG=${1:-"update"}
git add .
git commit -m "$MSG"
git push origin master
echo "✅ 배포 완료 — Vercel 자동 재배포 진행 중"
