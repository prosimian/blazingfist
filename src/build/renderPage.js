import fse from 'fs-extra'
import { PurgeCSS } from 'purgecss'
import { DOMParser } from 'linkedom'
import htmlMinify from 'html-minifier-terser'

import domMods from '../utils/domMods.js'
import sanitizeHTML from '../utils/sanitizeHTML.js'

export default async function renderPage (page, engine, base) {
  if (!page) return

  const { css, js } = base

  // Render and sanitize <main>'s content.
  const sanitized = await engine
    .renderFile('layout/page', { page })
    .then(async content => sanitizeHTML(content))

  // Render the page's html with the sanitized content.
  const htmlRaw = await engine.renderFile('document/default', { page: sanitized })

  const cssPurged = await new PurgeCSS().purge({
    content: [{ raw: htmlRaw, extension: 'html' }],
    css: [{ raw: css }],
    // add any classes added by javascript or extras to the safelist
    safelist: ['js', 'menu-active', 'video__activated', 'video__iframe']
  })

  // Tidy up.  Inline reduced CSS & any required JS.  Add style/script CSP meta.
  const htmlModded = await domMods(
    (new DOMParser).parseFromString(htmlRaw, 'text/html'),
    cssPurged[0].css,
    js
  )

  const htmlMinified = await htmlMinify.minify(htmlModded, {
    useShortDoctype: true,
    removeComments: true,
    collapseWhitespace: true
  })

  let outputPath = `./site${page.permalink}`

  if (!outputPath.endsWith('.html')) {
    fse.ensureDirSync(outputPath)
    outputPath += 'index.html'
  }

  fse.writeFile(
    outputPath,
    htmlMinified,
    err => { if (err) { console.error(err) } }
  )

  return 'success'
}
