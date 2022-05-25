import { toHTML } from '@portabletext/to-html'

import image from './image.js'

const blocksToHTML = (engine, blocks) => {

  const components = {
    marks: {

      internalLink: ({ children, value: { page } }) => {
        const href = page.permalink
        return href
          ? `<a href="${href}">${children}</a>`
          : `<span>${children}</span>`
      },

      link: ({ children, value: { href } }) => {
        return href
          ? `<a href="${href}" target="_blank" rel="noopener noreferrer">${children}</a>`
          : `<span>${children}</span>`
      }

    },

    types: {

      address: ({ value: { address } }) => {
        return engine.renderFileSync(
          'partial/address',
          { address }
        )
      },

      cards: ({ value: { items } }) => {
        return items.length
          ? (
            `<div class="grid-common g-8">
              ${items
                .map(item => {
                  return engine.renderFileSync(
                    'partial/card',
                    { ...item }
                  )
                })
                .join(' ')}
            </div>`
            )
          : ''
      },

      cardsPages: ({ value: { items } }) => {
        return items.length
          ? (
            `<div class="grid-common g-8">
              ${items
                .map(({ page }) => {
                  return engine.renderFileSync(
                    'partial/cardPage',
                    { page: page }
                  )
                })
                .join(' ')}
            </div>`
            )
          : ''
      },

      cta: ({ value }) => {
        return engine.renderFileSync(
          'partial/cta',
          { ...value }
        )
      },

      form: ({ value: { formType } }) => {
        return engine.renderFileSync(`partial/${formType}Form`)
      },

      gallery: ({ value }) => {
        const { items = [] } = value
        return items.length
          ? (
            `<div class="grid-common g-84">
              ${items
                .map(item => engine.renderFileSync(
                  'partial/figure',
                  { image: image({ image: item, options: {} }) }
                ))
                .join(' ')}
            </div>`
            )
          : ''
      },

      picture: ({ value }) => {
        return engine.renderFileSync(
          'partial/figure',
          { image: image({ image: value, options: {} }) }
        )
      },

      quote: ({ value }) => {
        return engine.renderFileSync(
          'partial/quote',
          { ...value }
        )
      },

      video: ({ value }) => {
        return engine.renderFileSync(
          'partial/video',
          { ...value }
        )
      }

    }
  }

  return toHTML(blocks, { components })
}

export default blocksToHTML
