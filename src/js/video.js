(function () {
  'use strict'

  const main = document.querySelector('main')

  const src = (videoId, videoProvider) => {
    return videoProvider === 'youtube'
      ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`
      : `https://player.vimeo.com/video/${encodeURIComponent(videoId)}`
  }

  main.addEventListener('click', e => {
    const classList = e.target.classList
    if (classList.contains('video') || classList.contains('video-play')) {
      const parent = classList.contains('video-play')
        ? e.target.parentNode
        : e.target

      const { videoId, videoProvider, videoTitle = 'A Video' } = parent.dataset

      const iframe = document.createElement('iframe')

      iframe.width = 640
      iframe.height = 360
      iframe.title = videoTitle
      iframe.frameBorder = 0
      iframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture'
      iframe.allowFullscreen = true
      iframe.src = `${src(videoId, videoProvider)}?autoplay=1`

      if (videoProvider === 'vimeo') {
        iframe.src = iframe.src + '&dnt=1'
      }

      parent.append(iframe)
      parent.classList.add('video__activated')
      parent.querySelector('iframe').focus()
    }
  })
}())
