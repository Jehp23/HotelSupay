import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const root = path.resolve(process.cwd())
const iconsDir = path.join(root, 'public', 'icons')

const sources = [
  { in: 'mountain.png', out: 'mountain-clean.png' },
  { in: 'leaf.png', out: 'leaf-clean.png' },
  { in: 'cutlery.png', out: 'cutlery-clean.png' },
]

async function exists(p) { try { await fs.access(p); return true } catch { return false } }

async function run() {
  for (const { in: input, out } of sources) {
    const inputPath = path.join(iconsDir, input)
    const outPath = path.join(iconsDir, out)
    if (!(await exists(inputPath))) {
      console.warn('Skipping (not found):', input)
      continue
    }
    const img = sharp(inputPath)
    const meta = await img.metadata()
    // Trim transparent margins, then fit into a square canvas 128x128
    const trimmed = img.trim(10)
    const buf = await trimmed
      .resize(128, 128, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toBuffer()
    await fs.writeFile(outPath, buf)
    console.log('Wrote', outPath, `(from ${input}, ${meta.width}x${meta.height})`)
  }
}

run().catch((e) => { console.error(e); process.exit(1) })
