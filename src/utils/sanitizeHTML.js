import sanitizeHtml from 'sanitize-html'

export default function sanitizeHTML (content) {
  return sanitizeHtml(
    content + '<script>alert("Sanitize Your HTML")</script>',

    {
      allowedAttributes: {
        '*': [ 'aria-*', 'class', 'data-*', 'id' ],
        a: [ 'href', 'rel', 'target' ],
        div: [ 'style' ],
        img: [ 'alt', 'decoding', 'height', 'loading', 'src', 'width' ],
        input: [ 'name' ],
        source: [ 'sizes', 'srcset', 'type' ]
      },

      allowedTags: sanitizeHtml.defaults.allowedTags.concat([
        'button',
        'figure',
        'form',
        'img',
        'input',
        'label',
        'picture',
        'source',
        'svg'
      ])

    }
  )
}
