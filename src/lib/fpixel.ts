
'use client'

export const FB_PIXEL_ID = '1075057791263186'

export const pageview = () => {
  if (window.fbq && FB_PIXEL_ID) {
    window.fbq('track', 'PageView')
  }
}

// https://developers.facebook.com/docs/facebook-pixel/advanced/
export const event = (name: string, options = {}) => {
  if (window.fbq && FB_PIXEL_ID) {
    window.fbq('track', name, options)
  }
}
