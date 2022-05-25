const permalink = `'permalink': select(
  _type == 'article' => '/articles/' + slug.current + '/',
  _type == 'articleIndex' => '/articles/',
  _type == 'category' => '/categories/' + slug.current + '/',
  _type == 'categoryIndex' => '/categories/',
  _type == 'home' => '/',
  _type == 'pageNotFound' => '/404.html',
  '/' + slug.current + '/'
)`

const markDefsProjection = `markDefs[]{
  ...,
  _type == 'internalLink' => {
    _type,
    'page': pageRef->{${permalink}}
  }
}`

export const pictureProjection = `{
  alt,
  asset->{
    _id,
    extension,
    metadata {
      dimensions,
      isOpaque,
      lqip
    },
    url
  },
  caption[]{
    ...,
    ${markDefsProjection}
  },
  crop,
  hotspot
}`

const galleryProjection = `{ items[]${pictureProjection} }`

export const navProjection = `{
  _type,
  menuItemTitle,
  'page': pageRef->{${permalink}}
}`

const cardsProjection = `{
  ...,
  items[]{
    ...,
    content[]{
      ...,
      ${markDefsProjection}
    },
    picture${pictureProjection}
  }
}`

const cardsPagesProjection = `{
  ...,
  items[]{
    ...,
    'page': pageRef->{
      _type,
      'picture': featuredImage${pictureProjection},
      summary,
      title,
      ${permalink}
    },
    picture${pictureProjection}
  }
}`

export const contentProjection = `content[]{
  ...,
  ${markDefsProjection},
  _type == 'cards' => ${cardsProjection},
  _type == 'cardsPages' => ${cardsPagesProjection},
  _type == 'cta' => { ctaText, 'page': pageRef->{${permalink}} },
  _type == 'gallery' => ${galleryProjection},
  _type == 'picture' => ${pictureProjection},
  _type == 'video' => {
    ...,
    'background': select(
      provider == 'youtube' => ${process.env.NETLIFY_DEV
        ? "'https://i.ytimg.com/vi/' + videoId + '/hqdefault.jpg'"
        : "'/ytbg/' + videoId"},
      ''
    )
  },
}`

export const commonFields = `
  _createdAt,
  _type,
  _updatedAt,
  hideHeader,
  metaDescription,
  ${permalink},
  'picture': featuredImage${pictureProjection},
  'sections': contentSections[disable != true]{
    ${contentProjection},
    fragmentId,
    style
  },
  subtitle,
  summary,
  title
`

export const articlesInCategoryProjection = `
  'articles': *[
    _type == 'article' &&
    defined(slug) &&
    !(_id in path('drafts.**')) &&
    references(^._id)
  ]
  | order(date desc)
  {
    date,
    'permalink': '/articles/' + slug.current + '/',
    summary,
    title
  }
`
