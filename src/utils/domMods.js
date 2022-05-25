import crypto from 'crypto'
import { minify } from 'terser'

const appendJS = async (document, js) => {
  const content = Object.keys(js)
    .filter(script => document.querySelector(`[data-${script}]`))
    .map(script => js[script])
    .join(';')

  if (!content) { return }

  const min = (await minify(content)).code

  const element = document.createElement('script')
  element.textContent = min
  document.body.appendChild(element)

  return min
}

const domMods = async (document, css, js) => {
  // CSP rules for style/script
  const csp = { style: [], script: [] }

  const head = document.querySelector('head')
  const body = document.querySelector('body')
  const title = head.querySelector('title')

  const firstImg = document.querySelector('img')
  if (firstImg && firstImg.getAttribute('loading') !== 'eager') {
    firstImg.setAttribute('loading', 'eager')
    firstImg.setAttribute('decoding', 'sync')
  }

  const styleAttrs = []
  document.querySelectorAll('[style]').forEach((el, i) => {
    const style = el.getAttribute('style')
    const className = `style${i}`
    el.classList.add(className)
    el.removeAttribute('style')
    styleAttrs.push(`.${className} { ${style}${style.endsWith(';') ? '' : ';'} }`)
  })
  document.querySelectorAll('[data-background]').forEach((el, i) => {
    const className = `background${i}`
    const backgroundImage = `.${className} {
      background-image: url(${el.dataset.background});
    }`
    el.dataset.background = className
    styleAttrs.push(backgroundImage)
  })

  const headStyle = document.createElement('style')
  const headCSS = css + styleAttrs.join(' ')
  headStyle.textContent = headCSS
  head.appendChild(headStyle)

  const headScript = document.createElement('script')
  const headJS = 'document.documentElement.classList.add("js")'
  headScript.textContent = headJS
  head.appendChild(headScript)

  const extraJS = await appendJS(document, js)

  csp.style.push(
    `'sha256-${crypto.createHash('sha256').update(headCSS).digest('base64')}'`
  )
  csp.script.push(
    `'sha256-${crypto.createHash('sha256').update(headJS).digest('base64')}'`
  )
  if (extraJS) {
    csp.script.push(
      `'sha256-${crypto.createHash('sha256').update(extraJS).digest('base64')}'`
    )
  }

  const cspPolicies = [
    `style-src 'self' 'unsafe-hashes' ${csp.style.join(' ')}`,
    // `script-src 'self' ${csp.script.join(' ')} https: 'unsafe-inline'`
    // Testing for dev here because we want live-server reloading to work.
    // Replace the ternary below with the policy above if you want to test
    // csp, but no reload in that case.
    process.env.NETLIFY_DEV
      ? ''
      : `script-src 'self' ${csp.script.join(' ')} https: 'unsafe-inline'`
  ]

  const metaCSP = document.createElement('meta')
  metaCSP.setAttribute('http-equiv', 'Content-Security-Policy')
  metaCSP.setAttribute('content', cspPolicies.join(';'))

  head.insertBefore(metaCSP, title)

  return document.toString()
}

export default domMods
