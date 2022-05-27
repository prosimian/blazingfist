import path from 'path'

import sass from 'sass'
import fse from 'fs-extra'

import vimeoBackgrounds from '../utils/vimeoBackgrounds.js'

const archiveItem = item => ({
  title: item.title,
  picture: item.picture,
  permalink: item.permalink
})

const defaultGlobals = content => ({
  footer: {
    ...(content.navSecondary || {}),
    social: { ...(content.social || {}) }
  },
  archive: {
    articles: content.articles?.map(archiveItem) || []
  },
  nav: content.navPrimary?.items,
  settings: content.settings
})

/*
* scss to css
*/
const compileSCSS = _ => {
  const css = sass.renderSync({
    file: 'src/scss/style.scss',
    sourceMap: false,
    outputStyle: 'compressed',
  }).css

  // Share compiled css with functions.
  const functionsSrcDir = `./netlify/functions/_src/`
  fse.ensureDirSync(functionsSrcDir)
  fse.writeFile(
    functionsSrcDir + 'style.css',
    css,
    err => { if (err) { console.error(err) } }
  )

  return css
}

export const scss = compileSCSS()


/*
* globals
*/
export const globals = async content => {
  const docsWithContent = Object.values(content).flat().filter(document => {
    return document?._type && (document.content || document.sections)
  })

  const vimeo = await vimeoBackgrounds(docsWithContent)

  return {
    ...defaultGlobals(content),
    vimeo
  }
}

/*
* javascript
*/
const readJS = _ => {
  const js = {}

  fse
    .readdirSync(path.join(process.cwd(), 'src', 'js'))
    .forEach(file => {
      const { ext, name } = path.parse(file)
      if (ext === `.js`) {
        js[name] = fse.readFileSync(
          path.join(process.cwd(), 'src', 'js', file)
        ).toString('utf8')
      }
    })

  return js
}

export const js = readJS()
