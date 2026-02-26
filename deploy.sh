#!/bin/bash
MSG=${1:-"update"}
git add .
git commit -m "$MSG"
git push
echo "✅ 배포 완료 — Vercel 자동 재배포 진행 중"
