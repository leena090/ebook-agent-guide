/* ============================================
   Gemini API 이미지 생성 스크립트
   Claude Code 에이전트 완전 정복 전자책
   imagen-4.0-generate-001 모델 사용

   실행: node js/generate-images.js
   ============================================ */

const fs = require('fs');
const path = require('path');

// ── .env 파일에서 API 키 읽기 ──
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    console.error('오류: .env 파일이 없습니다.');
    process.exit(1);
  }
  const content = fs.readFileSync(envPath, 'utf-8');
  const match = content.match(/GEMINI_API_KEY=(.+)/);
  if (!match) {
    console.error('오류: .env 파일에 GEMINI_API_KEY가 없습니다.');
    process.exit(1);
  }
  return match[1].trim();
}

// ── 이미지 생성 프롬프트 목록 ──
const imagePrompts = [
  {
    name: 'cover.png',
    prompt: 'A modern minimalist ebook cover illustration about AI agents and automation. A central robot conductor with a baton directing multiple smaller robots working in harmony on different tasks. Glowing network connections between them. Warm orange and dark blue color scheme, clean flat design, professional digital art style. No text.'
  },
  {
    name: 'ch1.png',
    prompt: 'An educational flat illustration showing the concept of an AI agent loop. A circular flowchart with three stages: a brain icon for decide, a gear icon for act, and an eye icon for observe. Arrows connecting them in a loop. A robot sitting at a desk in the center. Warm orange and dark blue colors, clean geometric shapes, tutorial book style. No text.'
  },
  {
    name: 'ch2.png',
    prompt: 'An educational illustration showing code controlling an AI robot. A laptop screen displaying code on the left, with a glowing arrow pointing to a robot on the right performing tasks. The robot holds a checklist and a wrench. Clean flat design, warm orange and dark blue color palette, ebook illustration style. No text.'
  },
  {
    name: 'ch3.png',
    prompt: 'An educational flat illustration of a team delegation concept. A large robot manager at a desk passing task cards to two smaller specialist robots. One specialist holds a magnifying glass for research, the other holds a pencil for writing. A single summary report returns to the manager. Clean flat design, warm orange and dark blue colors, professional ebook style. No text.'
  },
  {
    name: 'ch4.png',
    prompt: 'An educational illustration of parallel teamwork with robots. Four robots working simultaneously at separate desks in a shared workspace. A leader robot at the top coordinates via glowing network lines to three team members below working in parallel. Each desk has different tools. Clean flat design, warm orange and dark blue palette, modern ebook style. No text.'
  },
  {
    name: 'ch5.png',
    prompt: 'An educational comparison chart illustration showing three different robot configurations side by side. Left group: one robot with a laptop. Center group: one robot delegating to a helper robot. Right group: one leader robot connected to three parallel robots. Each group is clearly separated. Clean flat design, warm orange and dark blue colors, tutorial illustration style. No text.'
  }
];

// ── Gemini API로 이미지 생성 ──
async function generateImage(apiKey, prompt, filename) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`;

  const body = {
    instances: [{ prompt }],
    parameters: {
      sampleCount: 1,
      aspectRatio: '16:9',
      personGeneration: 'dont_allow'
    }
  };

  console.log(`  생성 중: ${filename}...`);

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API 오류 (${response.status}): ${errorText}`);
  }

  const data = await response.json();

  if (!data.predictions || data.predictions.length === 0) {
    throw new Error('이미지가 생성되지 않았습니다.');
  }

  const imageData = data.predictions[0].bytesBase64Encoded;
  const outputDir = path.join(__dirname, '..', 'assets', 'images');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, filename);
  fs.writeFileSync(outputPath, Buffer.from(imageData, 'base64'));
  console.log(`  저장 완료: ${outputPath}`);
}

// ── 메인 실행 ──
async function main() {
  console.log('========================================');
  console.log('  Claude Code 에이전트 완전 정복 이미지 생성기');
  console.log('========================================\n');

  const apiKey = loadEnv();
  console.log('API 키 확인 완료.\n');

  let successCount = 0;
  let failCount = 0;

  for (const item of imagePrompts) {
    try {
      await generateImage(apiKey, item.prompt, item.name);
      successCount++;
    } catch (err) {
      console.error(`  실패: ${item.name} — ${err.message}`);
      failCount++;
    }
    // API 속도 제한 방지 (2초 대기)
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n========================================');
  console.log(`  완료! 성공: ${successCount}개, 실패: ${failCount}개`);
  console.log('========================================');
}

main();
