import 'dotenv/config'

import build from './src/build/index.js'
import sanity from './src/sanity/content.js'

build(await sanity())
