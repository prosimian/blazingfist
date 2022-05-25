import path from 'path'

import fse from 'fs-extra'
import { Liquid } from 'liquidjs'
import { PurgeCSS } from 'purgecss'
import { DOMParser } from 'linkedom'
import htmlMinify from 'html-minifier-terser'

import getContent from './src/content.js'

import image from './utils/image.js'
import domMods from './utils/domMods.js'
import blocksToHTML from './utils/blocksToHTML.js'
import sanitizeHTML from './utils/sanitizeHTML.js'
import vimeoBackgrounds from './utils/vimeoBackgrounds.js'

export async function handler (event) {
  const page = await getContent(event.path)

  if (page === 'error') {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'text/html; charset=UTF-8'
      },
      body: '<h1>something went wrong</h1>' // TODO improve
    }
  } else if (!page) {
    return {
      statusCode: 301, // TODO ?
      headers: {
        Location: '/404.html',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify({})
    }
  }

  // Get a liquid engine and add some filters
  const engine = new Liquid({
    extname: '.liquid',
    jsTruthy: true,
    globals: {
      preview: true,
      vimeo: await vimeoBackgrounds([page])
    },
    root: path.join(process.cwd(), 'netlify/functions/preview/liquid')
  })
  engine.registerFilter(
    'figure',
    picture => engine.renderFileSync(
      'partial/figure',
      { image: image({ image: picture, options: {} }) }
    )
  )
  engine.registerFilter('toHTML', blocks => blocksToHTML(engine, blocks))

  // Get sanitized <main> content.
  const content = await engine
    .renderFile('layout/page', { page })
    .then(async content => sanitizeHTML(content))
  // Render the page's html with sanitized content.
  const htmlRaw = await engine
    .renderFile('document/preview', { page, content })

  // Purge the CSS
  const cssPath = path.join(process.cwd(), 'netlify/functions/preview/style.css')
  const css = fse.existsSync(cssPath)
    ? fse.readFileSync(cssPath).toString('utf8')
    : ''
  const cssPurged = css
    ? await new PurgeCSS().purge({
        content: [{ raw: htmlRaw, extension: 'html' }],
        css: [{ raw: css }],
        // add any classes added by javascript or extras to the safelist
        safelist: ['js', 'menu-active', 'video__activated', 'video__iframe']
      })
    : [{ css: '' }]

  // Collect the JS
  const js = {}
  const jsPath = path.join(process.cwd(), 'netlify/functions/preview/js')
  fse
    .readdirSync(jsPath)
    .forEach(file => {
      const { ext, name } = path.parse(file)
      if (ext === `.js`) {
        js[name] = fse.readFileSync(path.join(jsPath, file)).toString('utf8')
      }
    })

  // Tidy up.  Inline reduced CSS & any required JS.  Add style/script CSP meta.
  const htmlModded = await domMods(
    (new DOMParser).parseFromString(htmlRaw, 'text/html'),
    cssPurged[0].css,
    js
  )

  const body = await htmlMinify.minify(htmlModded, {
    useShortDoctype: true,
    removeComments: true,
    collapseWhitespace: true
  })

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html; charset=UTF-8'
    },
    body
  }
}
