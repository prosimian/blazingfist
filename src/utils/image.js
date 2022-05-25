import imageUrl from '@sanity/image-url'
import sanityClient from '../sanity/sanityClient.js'

const DEFAULTWIDTH = 960
const DEFAULTWIDTHS = [320, 480, 640, 800, 960, 1120, 1280]
const MAXWIDTH = 1280

const sizes = {
  default: {
    sizesAttr: `(min-width: ${DEFAULTWIDTH}px) ${DEFAULTWIDTH}px, 100vw`,
    maxWidth: DEFAULTWIDTH,
    widths: DEFAULTWIDTHS.filter(w => w <= DEFAULTWIDTH)
  },
  full: {
    sizesAttr: `(min-width: ${MAXWIDTH}px) ${MAXWIDTH}px, 100vw`,
    maxWidth: MAXWIDTH,
    widths: DEFAULTWIDTHS
  },
  half: {
    sizesAttr: `(min-width: ${MAXWIDTH}px) ${MAXWIDTH / 2}px, (min-width: 604px) 50vw, 100vw`,
    maxWidth: MAXWIDTH / 2,
    widths: DEFAULTWIDTHS.filter(w => w <= MAXWIDTH / 2)
  },
  gallery: {
    sizesAttr: '(min-width: 1280px) 390px, (min-width: 1061px) 30vw, (min-width: 700px) 50vw, 100vw',
    maxWidth: 800,
    widths: [400, 800]
  },
  thumbnail: {
    sizesAttr: '(min-width: 601px) 320px, 100vw',
    maxWidth: 640,
    widths: [320, 480, 640]
  }
}

const defaultOptions = {
  caption: true,
  decoding: 'async',
  loading: 'lazy',
  size: 'default'
}

function getSanityUrl (image, format, width, height) {
  const sanityUrl = imageUrl(sanityClient)
    .image(image)
    .width(width)
    .height(height)
    .format(format)
    .quality(70)
    .url()

  return process.env.NETLIFY_DEV
    ? sanityUrl
    : '/' + [
        'sanityImg',
        process.env.SANITY_PROJECT_ID,
        process.env.SANITY_DATASET,
        sanityUrl.split('/').pop()
      ].join('/')
}

export default function figure ({ image, options: userOptions }) {
  if (!image?.asset) {
    return { missing: 'image' }
  }

  // Details of the original image stored at CMS.
  const {
    asset: {
      extension,
      metadata: {
        isOpaque,
        lqip,
        dimensions: {
          height: preCropHeight,
          width: preCropWidth
        }
      }
    },
    crop
  } = image

  const options = { ...defaultOptions, ...userOptions }

  const { maxWidth, sizesAttr, widths } = sizes[options.size]

  const actualWidth = crop
    ? preCropWidth - (preCropWidth * crop.left + preCropWidth * crop.right)
    : preCropWidth

  const actualHeight = crop
    ? preCropHeight - (preCropHeight * crop.bottom + preCropHeight * crop.top)
    : preCropHeight

  const aspectRatio = actualWidth / actualHeight

  // Use in fallback <img>.
  const width = Math.floor(
    actualWidth < maxWidth ? actualWidth : maxWidth
  )
  const height = Math.floor(
    width !== actualWidth ? width / aspectRatio : actualHeight
  )

  // Ensure all widths in srcset are less than or equal to image width.
  const srcsetWidths = widths.filter(w => w < width)
  srcsetWidths.push(width)

  // If transparent png, use png instead of jpg (no webp for safari pre macOS 11).
  // Image of this format type is used in fallback <img> in <picture>.
  const format = (extension === 'png' && !isOpaque) ? 'png' : 'jpg'

  // Order matters in format array. Most performant comes first.
  const formats = (format === 'png' ? ['webp', 'png'] : ['webp', 'jpg'])
    .map(f => ({
      type: f === 'jpg' ? 'jpeg' : f,
      sizes: sizesAttr,
      srcset: srcsetWidths
        .map(w => (
          `${getSanityUrl(image, f, w, Math.floor(w / aspectRatio))} ${w}w`
        )).join(', ')
    }))

  const defaultUrl = getSanityUrl(image, format, width, height)

  return defaultUrl && formats.length &&
    {
      alt: image.alt ? image.alt.replace(/"/g, "'") : '',
      decoding: options.decoding,
      formats,
      height,
      isOpaque,
      loading: options.loading,
      lqip,
      src: defaultUrl,
      width
    }
}
