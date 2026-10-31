'use client';

import dynamic from 'next/dynamic';

/**
 * Swiper reads `new Date()` while initialising, which Next.js refuses to
 * prerender. Loading it with `ssr: false` keeps the hero client-only (the
 * hero is below-the-fold decoration, so no SEO or LCP loss) and lets the
 * rest of the page still be statically prerendered.
 */
const HeroSlider = dynamic(() => import('./hero-section').then((mod) => mod.HeroSection), {
  ssr: false,
  loading: () => (
    <section
      className="relative isolate overflow-hidden border-b border-border/80 bg-background"
      aria-label="Hero Banner"
      aria-busy="true"
    >
      {/* Reserve the hero's height so the layout does not jump on mount */}
      <div className="min-h-[620px] w-full sm:min-h-[660px] lg:min-h-[720px]" />
    </section>
  ),
});

export default HeroSlider;
