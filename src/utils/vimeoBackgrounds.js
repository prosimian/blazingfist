import fetch from 'node-fetch'
import pMap from 'p-map'
import jsonata from 'jsonata'

const vimeoBackground = async (video = {}) => {
  const { videoId } = video
  try {
    const res = await fetch(`https://vimeo.com/api/v2/video/${videoId}.json`)
    const background = await res.json()
    const urlParts = background[0].thumbnail_large.split('/')

    return [
      videoId,
      process.env.NETLIFY_DEV
        ? `${background[0].thumbnail_large}.jpg?q=70`
        : `/vbg/${urlParts[urlParts.length - 1]}.jpg`
    ]
  } catch (e) {
    console.log(`Failed getting Vimeo background for id ${videoId}`)
    console.log(e)
    return null
  }
}

export default async function vimeoBackgrounds (content) {
  // find all vimeo videos then async fetch their background images
  // TODO need to get standalone content too
  const expression = jsonata("sections.content[provider = 'vimeo']")
  const backgrounds = await pMap(
    [expression.evaluate(content)].flat().filter(Boolean),
    vimeoBackground,
    { concurrency: 2 }
  )

  return backgrounds.reduce((backgrounds, video) => (video
    ? { ...backgrounds, [video[0]]: video[1] }
    : backgrounds
  ), {})

  return { scooby: 'hello' }
}
