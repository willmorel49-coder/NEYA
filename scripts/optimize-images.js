#!/usr/bin/env node
import sharp from 'sharp'
import { readdir, stat } from 'node:fs/promises'
import { join, parse } from 'node:path'

const ROOT = 'public'
const TARGETS = [ROOT, join(ROOT, 'cava')]

const SKIP = new Set(['cerf.svg', 'manifest.json'])
const MAX_WIDTH = 1242 // iPhone Pro Max @3x display width
const AVIF_QUALITY = 55
const WEBP_QUALITY = 75

async function processDir(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const e of entries) {
    if (e.isDirectory()) continue
    if (SKIP.has(e.name)) continue
    if (!/\.(png|jpg|jpeg)$/i.test(e.name)) continue

    const input = join(dir, e.name)
    const { name, ext } = parse(e.name)
    const avifPath = join(dir, `${name}.avif`)
    const webpPath = join(dir, `${name}.webp`)

    const meta = await sharp(input).metadata()
    const targetWidth = Math.min(MAX_WIDTH, meta.width || MAX_WIDTH)

    const beforeSize = (await stat(input)).size

    await sharp(input)
      .resize({ width: targetWidth, withoutEnlargement: true })
      .avif({ quality: AVIF_QUALITY, effort: 4 })
      .toFile(avifPath)

    await sharp(input)
      .resize({ width: targetWidth, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toFile(webpPath)

    const avifSize = (await stat(avifPath)).size
    const webpSize = (await stat(webpPath)).size
    const k = (n) => `${(n / 1024).toFixed(0)}k`
    const pct = (n) => `${Math.round((1 - n / beforeSize) * 100)}%`

    console.log(`${e.name.padEnd(28)} ${k(beforeSize).padStart(8)} → AVIF ${k(avifSize).padStart(7)} (-${pct(avifSize)}) · WebP ${k(webpSize).padStart(7)} (-${pct(webpSize)})`)
  }
}

console.log('Converting images to AVIF + WebP…\n')
for (const d of TARGETS) {
  try { await processDir(d) } catch (e) { console.error(`Skip ${d}: ${e.message}`) }
}
console.log('\n✓ Done')
