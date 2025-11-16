// Node script to generate WebP variants for images in client/public/images
// Usage: npm run optimize:images
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const imagesDir = path.resolve(process.cwd(), 'public', 'images')

async function ensureWebp(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  if (!['.png', '.jpg', '.jpeg'].includes(ext)) return
  const webpPath = filePath.replace(ext, '.webp')
  try {
    await fs.promises.access(webpPath, fs.constants.F_OK)
    console.log('✓ exists', path.basename(webpPath))
    return
  } catch (_) {
    // continue to create
  }
  try {
    await sharp(filePath).webp({ quality: 80 }).toFile(webpPath)
    console.log('→ created', path.basename(webpPath))
  } catch (err) {
    console.error('× failed', filePath, err.message)
  }
}

async function run() {
  if (!fs.existsSync(imagesDir)) {
    console.error('Images directory not found:', imagesDir)
    process.exit(1)
  }
  const entries = await fs.promises.readdir(imagesDir)
  for (const name of entries) {
    const full = path.join(imagesDir, name)
    const stat = await fs.promises.stat(full)
    if (stat.isDirectory()) continue
    await ensureWebp(full)
  }
}

run()
