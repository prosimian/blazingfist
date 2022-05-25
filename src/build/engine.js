import { Liquid } from 'liquidjs'

import blocksToHTML from '../utils/blocksToHTML.js'
import image from '../utils/image.js'

const engine = (globals) => {
  const newEngine = new Liquid({
    extname: '.liquid',
    globals,
    jsTruthy: true,
    root: './src/liquid/'
  })

  newEngine.registerFilter(
    'figure',
    picture => newEngine.renderFileSync(
      'partial/figure',
      { image: image({ image: picture, options: {} }) }
    )
  )

  newEngine.registerFilter('toHTML', blocks => blocksToHTML(newEngine, blocks))

  return newEngine
}

export default engine
