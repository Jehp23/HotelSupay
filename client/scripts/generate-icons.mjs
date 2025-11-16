import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const root = path.resolve(process.cwd())
const iconsDir = path.join(root, 'public', 'icons')

const sources = [
  { svg: 'mountain-gold.svg', png: 'mountain-gold.png' },
  { svg: 'leaf-cactus.svg', png: 'leaf-cactus.png' },
  { svg: 'cutlery-terracotta.svg', png: 'cutlery-terracotta.png' },
]

const sizes = [32, 64] // generate 2 sizes for crisp rendering

async function ensureDir(dir) {
  try { await fs.mkdir(dir, { recursive: true }) } catch {}
}

async function convertAll() {
  await ensureDir(iconsDir)
  for (const { svg, png } of sources) {
    const svgPath = path.join(iconsDir, svg)
    const baseName = path.basename(png, '.png')
    for (const size of sizes) {
      const outPath = path.join(iconsDir, `${baseName}-${size}.png`)
      const svgBuffer = await fs.readFile(svgPath)
      await sharp(svgBuffer).resize(size, size, { fit: 'contain' }).png({ compressionLevel: 9 }).toFile(outPath)
      console.log('Generated', outPath)
    }
    // default png alias (64px)
    const aliasPath = path.join(iconsDir, png)
    await fs.copyFile(path.join(iconsDir, `${baseName}-64.png`), aliasPath)
  }
}

convertAll().catch((err) => { console.error(err); process.exit(1) })
