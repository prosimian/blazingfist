import pMap from 'p-map'
import fse from 'fs-extra'

import liquidEngine from './engine.js'
import renderPage from './renderPage.js'
import * as utils from './utils.js'
import { multiple, single } from '../sanity/contentTypes.js'

export default async function build (content) { // content is from Sanity CMS
  const globals = await utils.globals(content) // site meta, nav, footer, ???
  const engine = liquidEngine(globals) // globals available in all templates
  const base = { css: utils.scss, js: utils.js }

  const result = await pMap(
    [
      single.map(config => content[config.name]),
      multiple.map(config => content[config.name]).flat()
    ].flat(),
    page => renderPage(page, engine, base),
    { concurrency: 2 }
  )

  if (process.env.NETLIFY_DEV) {
    fse.writeFile(
      './site/reload',
      Date(),
      err => { if (err) { console.error(err) } }
    )
  }
}
