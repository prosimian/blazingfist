(function () {
  'use strict'

  const hamburger = document.querySelector('.hamburger')

  if (hamburger) {
    const navLinks = document.querySelectorAll('#navigation [href]')
    const linkHome = document.querySelector('.link-home')
    const navLinkLast = navLinks[navLinks.length - 1]

    const linkTabIndex = action => {
      if (action === 'set') {
        navLinks.forEach(link => {
          link.setAttribute('tabindex', '-1')
        })
      } else {
        navLinks.forEach(link => {
          link.removeAttribute('tabindex')
        })
      }
    }

    linkTabIndex('set')

    const observer = new window.ResizeObserver(observedItems => {
      const { contentRect } = observedItems[0]
      // integer in condition must equal max-width in media query
      // at src/input/scss/common/_nav.scss
      if (contentRect.width > 700) {
        linkTabIndex('remove')
        hamburger.classList.remove('menu-active')
        document.body.classList.remove('menu-active')
      } else {
        linkTabIndex('set')
      }
    })
    observer.observe(document.body)

    hamburger.addEventListener('click', function () {
      this.classList.toggle('menu-active')
      document.body.classList.toggle('menu-active')

      if (document.body.classList.contains('menu-active')) {
        linkTabIndex('remove')
        this.focus()
      } else {
        linkTabIndex('set')
      }
    }, false)

    document.addEventListener('keydown', evt => {
      if (!document.body.classList.contains('menu-active')) return

      const isEsc = evt.key === 'Escape' || evt.keyCode === 27
      const isTab = evt.key === 'Tab' || evt.keyCode === 9

      if (!isEsc && !isTab) { return }

      if (isEsc) {
        hamburger.focus()
        hamburger.classList.remove('menu-active')
        document.body.classList.remove('menu-active')
        linkTabIndex('set')
      } else if (isTab && document.activeElement === navLinkLast && !evt.shiftKey) {
        linkHome.focus()
        evt.preventDefault()
      } else if (isTab && evt.shiftKey && document.activeElement === linkHome) {
        navLinkLast.focus()
        evt.preventDefault()
      }
    })
  }
}())
