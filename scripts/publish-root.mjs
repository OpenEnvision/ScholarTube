import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const projectRoot = resolve(import.meta.dirname, '..')
const distRoot = resolve(projectRoot, 'dist')
const publishedAssets = resolve(projectRoot, 'assets')
const distHtml = await readFile(resolve(distRoot, 'index.html'), 'utf8')
const cssPath = distHtml.match(/href="\.\/assets\/([^"]+\.css)"/)?.[1]
const scriptPath = distHtml.match(/src="\.\/assets\/([^"]+\.js)"/)?.[1]

if (!cssPath || !scriptPath) {
  throw new Error('Could not locate the compiled CSS and JavaScript bundles.')
}

const css = await readFile(resolve(distRoot, 'assets', cssPath), 'utf8')
const script = (await readFile(resolve(distRoot, 'assets', scriptPath), 'utf8'))
  .replaceAll('</script', '<\\/script')
const standaloneHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="ScholarTube is a curated, source-linked video knowledge index for researchers." />
    <meta name="theme-color" content="#ffffff" />
    <link rel="icon" href="./assets/scholartube-logo.png" type="image/png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
    <title>ScholarTube — Research knowledge, in motion</title>
    <style>${css}</style>
  </head>
  <body>
    <div id="root"></div>
    <script>${script}</script>
  </body>
</html>
`

await rm(publishedAssets, { recursive: true, force: true })
await mkdir(publishedAssets, { recursive: true })
await cp(resolve(projectRoot, 'public', 'assets'), publishedAssets, { recursive: true })
await writeFile(resolve(projectRoot, 'index.html'), standaloneHtml)

console.log('Published a standalone index.html and its image assets to the project root.')
