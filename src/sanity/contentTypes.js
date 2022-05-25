export const multiple = [
  { name: 'articles', type: 'article', order: 'date desc' },
  { name: 'categories', type: 'category', order: 'title' },
  { name: 'pages', type: 'page' }
]

export const single = [
  { name: 'articleIndex' },
  { name: 'categoryIndex' },
  { name: 'home' },
  { name: 'pageNotFound' }
]

export const global = [
  { name: 'navPrimary' },
  { name: 'navSecondary' },
  { name: 'settings' },
  { name: 'social' }
]

const contentTypes = {
  multiple,
  single,
  global
}

export default contentTypes
