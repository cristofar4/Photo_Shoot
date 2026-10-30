// Generates responsive WebP variants for every image in media-source/{photos,demo}
// into public/media/img/<name>-<width>.webp, and prints the intrinsic sizes so
// they can be copied into src/config/media.ts.
//
//   npm run media
import { readdir, mkdir } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const WIDTHS = [480, 960, 1600]
const SOURCE_DIRS = ['media-source/photos', 'media-source/demo']
const OUT_DIR = 'public/media/img'

await mkdir(OUT_DIR, { recursive: true })

for (const dir of SOURCE_DIRS) {
  const files = (await readdir(dir)).filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f))
  for (const file of files) {
    const name = path.parse(file).name
    const input = sharp(path.join(dir, file))
    const { width, height } = await input.metadata()
    const targets = WIDTHS.filter((w) => w < width)
    if (!targets.includes(width) && targets.length < WIDTHS.length) targets.push(width)
    for (const w of targets) {
      await sharp(path.join(dir, file))
        .resize({ width: w })
        .webp({ quality: 80 })
        .toFile(path.join(OUT_DIR, `${name}-${w}.webp`))
    }
    console.log(`${name.padEnd(28)} ${width}x${height}  widths: ${targets.join(', ')}`)
  }
}
