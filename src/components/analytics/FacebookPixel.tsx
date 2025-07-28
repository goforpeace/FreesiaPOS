
'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import Script from 'next/script'
import { useEffect } from 'react'
import * as fbp from '@/lib/fpixel'
import { Suspense } from 'react'

declare global {
    interface Window {
      fbq: (...args: any[]) => void;
    }
}

const FacebookPixelContent = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (fbp.FB_PIXEL_ID) {
      // This triggers pageviews on subsequent navigations
      fbp.pageview()
    }
  }, [pathname, searchParams])

  return (
    <>
      <Script
        id="fb-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${fbp.FB_PIXEL_ID}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img height="1" width="1" style={{display: 'none'}}
             src={`https://www.facebook.com/tr?id=${fbp.FB_PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  )
}

export const FacebookPixel = () => {
    return (
        <Suspense fallback={null}>
            <FacebookPixelContent />
        </Suspense>
    )
}
