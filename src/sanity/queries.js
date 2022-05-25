import {
  articlesInCategoryProjection,
  commonFields,
  navProjection,
  pictureProjection
} from './projections.js'

const globalQueries = {
  navPrimary: `*[_type == "navPrimary"][0]
  {
    _type,
    items[]${navProjection}
  }`,

  navSecondary: `*[_type == "navSecondary"][0]
  {
    _type,
    items[]${navProjection}
  }`,

  settings: `*[_type == "siteSettings"][0]
  {
    hideSite,
    logo${pictureProjection},
    picture${pictureProjection},
    siteTitle,
    summary,
    useLogoInNav
  }`
}

const queries = {

  multiple: (type, order) => `*[
    _type == "${type}" &&
    defined(slug) &&
    !(_id in path("drafts.**"))
  ]
  ${order ? `| order(${order})` : ''}
  {
    ${type === 'category' ? `${articlesInCategoryProjection},` : ''}
    ${commonFields},
    categories[]->{
      'slug': slug.current,
      title
    },
    date,
    hidePage
  }`,

  single: type => `*[
    _type == "${type}" &&
    !(_id in path("drafts.**"))
  ][0]
  {
    ${commonFields}
  }`,

  global: type => globalQueries[type]

}

export default queries
