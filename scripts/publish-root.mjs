import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

// Publishes the Vite build to the repository root, which is what GitHub Pages
// serves. The JavaScript and CSS stay in their own content-hashed files under
// `assets/` instead of being inlined into `index.html`: GitHub Pages only caches
// HTML for ten minutes, so an inlined bundle made every visit download and parse
// the whole application and catalog again. Hashed files are fetched once and
// reused until their contents change.

const projectRoot = resolve(import.meta.dirname, '..')
const distRoot = resolve(projectRoot, 'dist')
const distAssets = resolve(distRoot, 'assets')
const publishedAssets = resolve(projectRoot, 'assets')
const preservedAssets = await Promise.all(['scholartube_new.png'].map(async (name) => ({
  name,
  contents: await readFile(resolve(publishedAssets, name)).catch(() => null),
})))
const distHtmlPath = resolve(distRoot, 'index.html')
const rawDistHtml = await readFile(distHtmlPath, 'utf8')
const distHtml = rawDistHtml
  .replaceAll('\r\n', '\n')
  .replaceAll('\r', '\n')
  .replace('\n\n  </body>', '\n  </body>')
if (distHtml !== rawDistHtml) await writeFile(distHtmlPath, distHtml)
const cssPath = distHtml.match(/href="\.\/assets\/([^"]+\.css)"/)?.[1]
const scriptPath = distHtml.match(/src="\.\/assets\/([^"]+\.js)"/)?.[1]

if (!cssPath || !scriptPath) {
  throw new Error('Could not locate the compiled CSS and JavaScript bundles.')
}

// `dist/assets` already holds everything the page needs: the hashed bundles plus
// the images Vite copied from `public/assets`.
await rm(publishedAssets, { recursive: true, force: true })
await mkdir(publishedAssets, { recursive: true })
await cp(distAssets, publishedAssets, { recursive: true })
for (const asset of preservedAssets) {
  if (asset.contents) await writeFile(resolve(publishedAssets, asset.name), asset.contents)
}
await writeFile(resolve(projectRoot, 'index.html'), distHtml)

console.log('Published index.html and its hashed bundles and image assets to the project root.')
