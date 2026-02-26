/**
 * auto-deploy watcher
 * 파일 변경 감지 → 5초 디바운스 → git add . → commit → push → Vercel 자동배포
 * 실행: node watch.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = __dirname;
const DEBOUNCE_MS = 5000;
const IGNORE = ['.git', 'node_modules', '.vercel'];

let timer = null;
let pendingFiles = new Set();

function deploy() {
  if (pendingFiles.size === 0) return;

  const files = [...pendingFiles].join(', ');
  pendingFiles.clear();

  const msg = `auto: ${files}`;
  console.log(`\n🔄 변경 감지: ${files}`);
  console.log('📦 커밋 & 푸시 중...');

  try {
    execSync('git add .', { cwd: ROOT, stdio: 'inherit' });
    execSync(`git commit -m "${msg}"`, { cwd: ROOT, stdio: 'inherit' });
    execSync('git push origin master', { cwd: ROOT, stdio: 'inherit' });
    console.log('✅ 완료 — Vercel 자동 재배포 진행 중\n');
  } catch (e) {
    // 변경사항 없으면 조용히 무시
    if (e.message.includes('nothing to commit')) {
      console.log('ℹ️  변경사항 없음\n');
    } else {
      console.error('❌ 오류:', e.message);
    }
  }
}

function watch(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (IGNORE.some(i => fullPath.includes(i))) return;

    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      watch(fullPath);
    } else {
      fs.watch(fullPath, () => {
        const rel = path.relative(ROOT, fullPath);
        pendingFiles.add(rel);
        clearTimeout(timer);
        timer = setTimeout(deploy, DEBOUNCE_MS);
        console.log(`👀 감지: ${rel} (${DEBOUNCE_MS/1000}초 후 배포)`);
      });
    }
  });
}

console.log('🚀 자동 배포 와처 시작');
console.log(`📁 감시 대상: ${ROOT}`);
console.log(`⏱️  디바운스: ${DEBOUNCE_MS/1000}초\n`);

watch(ROOT);
