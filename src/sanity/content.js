import groq from 'groq'
import fse from 'fs-extra'

import noCMS from './noCMS.js'
import queries from './queries.js'
import client from './sanityClient.js'
import contentTypes from './contentTypes.js'

const sanityCacheLocation = './.sanity'

const sanityCache = _ => {
  console.log('CONTENT: SANITY CACHE')
  return JSON.parse(fse.readFileSync(sanityCacheLocation, 'utf8'))
}

const sanityFetch = async _ => {
  if (!client) {
    console.log('CONTENT: FAKE SANITY')
    return noCMS
  }

  console.log('CONTENT: FETCHING FROM SANITY')
  const content = await client
    .fetch(
      groq`{
        ${Object.keys(contentTypes).map(key => (
          contentTypes[key].map(type => (
            `'${type.name}': ${queries[key](type.type || type.name, type.order)}`
          )).join(',')
        )).join(',')}
      }`
    )
    .catch(err => { console.error(err) })

  fse.writeFile(
    sanityCacheLocation,
    JSON.stringify(content),
    err => { if (err) { console.error(err) } }
  )

  return content
}

export default async function getContent () {
  return fse.existsSync(sanityCacheLocation)
    ? sanityCache()
    : await sanityFetch()
}
