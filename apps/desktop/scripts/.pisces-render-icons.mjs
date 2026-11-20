import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const resources = fileURLToPath(new URL('../resources', import.meta.url))
const svg = await readFile(`${resources}/icon-windows.svg`)

await writeFile(`${resources}/icon-windows.png`, await sharp(svg).resize(1024, 1024).png().toBuffer())
await writeFile(`${resources}/icon-macos.png`, await sharp(svg).resize(824, 824).extend({
  top: 100, bottom: 100, left: 100, right: 100, background: { r: 0, g: 0, b: 0, alpha: 0 },
}).png().toBuffer())
await writeFile(`${resources}/icon.png`, await sharp(svg).resize(1024, 1024).png().toBuffer())

console.log('icons rendered')
