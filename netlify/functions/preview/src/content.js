import groq from 'groq'

import {
  commonFields,
  pictureProjection
} from '../sanity/projections.js'

import client from '../sanity/sanityClient.js'

export default async function getContent (docPath) {
  if (!client) return 'error'

  const segments = docPath.split('/').filter(segment => segment && segment !== 'preview')

  const groqFilter = segments.length === 2 && segments[0] === 'articles'
    ? `*[_type == 'article' && slug.current == '${segments[1]}']`
    : segments.length === 1
      ? `*[_type == 'page' && slug.current == '${segments[0]}']`
      : segments.length === 0
        ? `*[_type == 'home']`
        : `*[_type == 'pageNotFound']`

  const page = await client
    .fetch(
      groq`${groqFilter}|order(_updatedAt desc)[0]
      {
      ...,
      ${commonFields},
      'picture': featuredImage${pictureProjection}
      }`
    )
    .catch(err => { console.error(err) })

  return page
}
