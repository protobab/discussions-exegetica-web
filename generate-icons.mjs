#!/usr/bin/env node
// generate-icons.mjs
// Run: node generate-icons.mjs
// Generates PNG icons from the flame SVG for all required app sizes
// Requires: npm install sharp (run once locally on your Mac)

import sharp from 'sharp'
import { writeFileSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dir = dirname(fileURLToPath(import.meta.url))

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512]

// The flame SVG at 512x512
const flameSVG = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <radialGradient id="glow" cx="50%" cy="75%" r="55%">
      <stop offset="0%" stop-color="#E8C97A" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#C9A84C" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <!-- Dark navy background with rounded corners -->
  <rect width="${size}" height="${size}" rx="${Math.round(size/5.5)}" fill="#0a0f1e"/>
  <!-- Flame centred, scaled to fit with padding -->
  <g transform="translate(${size*0.14}, ${size*0.06}) scale(${size/90})">
    <ellipse cx="36" cy="62" rx="28" ry="12" fill="url(#glow)"/>
    <path d="M36 4 Q46 16 48 28 Q53 20 50 10 Q62 24 58 42 Q55 54 36 62 Q17 54 14 42 Q10 24 22 10 Q19 20 24 28 Q26 16 36 4Z" fill="#C9A84C"/>
    <path d="M36 16 Q42 26 43 36 Q46 28 44 20 Q52 32 49 44 Q47 52 36 58 Q25 52 23 44 Q20 32 28 20 Q26 28 29 36 Q30 26 36 16Z" fill="#E8C97A" opacity="0.85"/>
    <path d="M36 28 Q39 34 39.5 40 Q41 36 40.5 32 Q44 37 42 43 Q40 49 36 51 Q32 49 30 43 Q28 37 31.5 32 Q31 36 32.5 40 Q33 34 36 28Z" fill="#fff" opacity="0.65"/>
    <path d="M16 66 Q36 63 56 66" stroke="#C9A84C" stroke-width="1.8" stroke-linecap="round" fill="none" opacity="0.5"/>
  </g>
</svg>`

async function generateIcons() {
  const iconDir = join(__dir, 'public', 'icons')
  mkdirSync(iconDir, { recursive: true })

  for (const size of SIZES) {
    const svg = Buffer.from(flameSVG(size))
    const outPath = join(iconDir, `icon-${size}.png`)
    await sharp(svg).png().toFile(outPath)
    console.log(`✓ Generated icon-${size}.png`)
  }

  // Also generate splash screens
  const splashDir = join(__dir, 'public', 'splash')
  mkdirSync(splashDir, { recursive: true })

  // Android splash: 2732x2732 (scales to all densities)
  // iOS splash: various sizes — we generate one large one
  for (const [w, h, name] of [
    [2732, 2732, 'splash-android'],
    [1290, 2796, 'splash-ios-14pro'],
    [1179, 2556, 'splash-ios-14'],
    [1284, 2778, 'splash-ios-13pro'],
  ]) {
    const splashSVG = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <rect width="${w}" height="${h}" fill="#0a0f1e"/>
      <g transform="translate(${w/2-220}, ${h/2-280}) scale(6)">
        <path d="M36 4 Q46 16 48 28 Q53 20 50 10 Q62 24 58 42 Q55 54 36 62 Q17 54 14 42 Q10 24 22 10 Q19 20 24 28 Q26 16 36 4Z" fill="#C9A84C"/>
        <path d="M36 16 Q42 26 43 36 Q46 28 44 20 Q52 32 49 44 Q47 52 36 58 Q25 52 23 44 Q20 32 28 20 Q26 28 29 36 Q30 26 36 16Z" fill="#E8C97A" opacity="0.85"/>
        <path d="M36 28 Q39 34 39.5 40 Q41 36 40.5 32 Q44 37 42 43 Q40 49 36 51 Q32 49 30 43 Q28 37 31.5 32 Q31 36 32.5 40 Q33 34 36 28Z" fill="#fff" opacity="0.65"/>
      </g>
      <text x="${w/2}" y="${h/2+180}" font-family="Georgia,serif" font-size="72" font-weight="700" fill="#C9A84C" text-anchor="middle">Discussions Exegetica</text>
      <text x="${w/2}" y="${h/2+260}" font-family="Arial,sans-serif" font-size="36" fill="rgba(255,255,255,0.4)" text-anchor="middle">Where Scripture is opened together</text>
    </svg>`
    const outPath = join(splashDir, `${name}.png`)
    await sharp(Buffer.from(splashSVG)).png().toFile(outPath)
    console.log(`✓ Generated ${name}.png (${w}x${h})`)
  }

  console.log('\n✅ All icons and splash screens generated!')
  console.log('Next: run "npm run build:android" or "npm run build:ios"')
}

generateIcons().catch(console.error)
