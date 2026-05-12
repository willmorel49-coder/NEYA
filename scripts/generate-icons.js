#!/usr/bin/env node
// Génère les icônes PWA depuis un SVG inline (couleurs charte NÉYA).
// Output: public/icon-192.png · icon-512.png · icon-maskable-512.png · apple-touch-icon-180.png
import sharp from 'sharp'
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const OUT = 'public'

// SVG icon — fond #050810 + halo indigo + N stylisé blanc
function makeSvg(size, maskable = false) {
  // Pour maskable: safe-zone 80% au centre (10% padding chaque côté)
  const inset = maskable ? size * 0.10 : 0
  const cx = size / 2
  const cy = size / 2
  const haloR = (size - inset * 2) / 2 * 0.85
  const fontSize = (size - inset * 2) * 0.42

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <radialGradient id="bg" cx="50%" cy="42%" r="62%">
      <stop offset="0%" stop-color="#1a2040"/>
      <stop offset="55%" stop-color="#0a1024"/>
      <stop offset="100%" stop-color="#050810"/>
    </radialGradient>
    <radialGradient id="halo" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#6366f1" stop-opacity="0.42"/>
      <stop offset="55%" stop-color="#ec4899" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="#050810" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="text" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="65%" stop-color="#c7c9ff"/>
      <stop offset="100%" stop-color="#a5a9f0"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#bg)"/>
  <circle cx="${cx}" cy="${cy}" r="${haloR}" fill="url(#halo)"/>
  <circle cx="${cx}" cy="${cy}" r="${haloR * 0.62}" fill="none" stroke="#6366f1" stroke-opacity="0.22" stroke-width="${size * 0.004}"/>
  <text x="50%" y="50%"
    text-anchor="middle"
    dominant-baseline="central"
    font-family="Sora, system-ui, sans-serif"
    font-size="${fontSize}"
    font-weight="300"
    letter-spacing="${fontSize * 0.05}"
    fill="url(#text)">N</text>
  <circle cx="${cx + fontSize * 0.18}" cy="${cy - fontSize * 0.36}" r="${size * 0.012}" fill="#f59e0b" opacity="0.85"/>
</svg>`
}

const TARGETS = [
  { name: 'icon-192.png',          size: 192, maskable: false },
  { name: 'icon-512.png',          size: 512, maskable: false },
  { name: 'icon-maskable-512.png', size: 512, maskable: true  },
  { name: 'apple-touch-icon.png',  size: 180, maskable: false },
]

console.log('Génération icônes PWA…\n')
for (const t of TARGETS) {
  const svg = makeSvg(t.size, t.maskable)
  const buf = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer()
  await writeFile(join(OUT, t.name), buf)
  console.log(`  ✓ ${t.name.padEnd(28)} ${(buf.length / 1024).toFixed(1).padStart(6)} kB`)
}
console.log('\n✓ Done')
