(function () {
  'use strict'

  const bgObserver = new window.IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting || entry.intersectionRatio) {
        const element = entry.target
        element.classList.add(element.dataset.background)
        element.removeAttribute('data-background')
        observer.unobserve(element)
      }
    })
  })

  const backgrounds = document.querySelectorAll('[data-background]')
  backgrounds.forEach(element => { bgObserver.observe(element) })
}())
