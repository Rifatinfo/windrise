declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & { queue?: unknown[] };
    _fbq?: unknown;
  }
}

const META_PIXEL_BASE_SNIPPET = `
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
`.trim();

/**
 * Builds the full inline Meta Pixel script: base loader + init + PageView,
 * all in one script body. These must run in the same synchronous pass —
 * next/script's onReady fires for inline scripts *before* they're attached
 * to the DOM, so window.fbq isn't defined yet when onReady runs. Embedding
 * init/track directly after the base snippet avoids that timing gap.
 * next/script dedupes by `id`, so this only ever executes once per pixel.
 */
export function buildMetaPixelSnippet(pixelId: string): string | null {
  if (!/^\d+$/.test(pixelId)) return null;

  return `
${META_PIXEL_BASE_SNIPPET}
window.fbq('init', '${pixelId}');
window.fbq('track', 'PageView');
`.trim();
}
