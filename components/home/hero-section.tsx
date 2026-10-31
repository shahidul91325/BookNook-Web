'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Keyboard } from 'swiper/modules';
import type { Swiper as SwiperInstance } from 'swiper/types';
import {
  ArrowRight,
  BookOpen,
  Sparkles,
  Users,
  ChevronLeft,
  ChevronRight,
  Star,
  CheckCircle2,
  BookmarkCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AuthLink } from '@/components/auth/auth-link';

import 'swiper/css';
import 'swiper/css/effect-fade';

interface SlideData {
  tag: string;
  headlinePrefix: string;
  headlineHighlight: string;
  subtitle: string;
  primaryCtaText: string;
  primaryCtaHref: string;
  secondaryCtaText: string;
  secondaryCtaHref: string;
  featuredBook: {
    title: string;
    author: string;
    rating: string;
    badge: string;
  };
  accentColor: string;
  image: {
    src: string;
    alt: string;
    position: string;
  };
}

const slides: SlideData[] = [
  {
    tag: 'DISCOVER • BORROW • GROW',
    headlinePrefix: 'Good Books Build',
    headlineHighlight: 'Better Tomorrows',
    subtitle:
      'Discover, borrow and enjoy your favorite books across thousands of topics. Your next great read is just a click away.',
    primaryCtaText: 'Browse Books',
    primaryCtaHref: '/books',
    secondaryCtaText: 'Join the Library',
    secondaryCtaHref: '/register',
    featuredBook: {
      title: 'Atomic Habits',
      author: 'James Clear',
      rating: '4.9',
      badge: 'Top Borrowed',
    },
    accentColor: 'from-blue-600/20 via-sky-500/10 to-transparent',
    image: {
      src: '/images/hero-books.jpg',
      alt: 'Cozy reading desk stacked with books',
      position: 'center',
    },
  },
  {
    tag: 'COMMUNITY-DRIVEN KNOWLEDGE',
    headlinePrefix: 'Expand Horizons with',
    headlineHighlight: 'Endless Stories',
    subtitle:
      'From timeless classics to cutting-edge science, explore a community library designed to make books freely accessible.',
    primaryCtaText: 'Explore Collection',
    primaryCtaHref: '/books',
    secondaryCtaText: 'Add Your Book',
    secondaryCtaHref: '/add-book',
    featuredBook: {
      title: 'Clean Code',
      author: 'Robert C. Martin',
      rating: '4.8',
      badge: 'Trending Tech',
    },
    accentColor: 'from-indigo-600/20 via-primary/15 to-transparent',
    image: {
      src: '/images/hero-books.jpg',
      alt: 'Wide view of a community library collection',
      position: 'left center',
    },
  },
  {
    tag: 'EFFORTLESS BORROWING',
    headlinePrefix: 'Borrow Easily,',
    headlineHighlight: 'Read Peacefully',
    subtitle:
      'Select your favorite title, choose your return timeframe, and track your active reading journey all in one place.',
    primaryCtaText: 'Start Reading',
    primaryCtaHref: '/books',
    secondaryCtaText: 'Sign In',
    secondaryCtaHref: '/login',
    featuredBook: {
      title: 'Sapiens: A Brief History',
      author: 'Yuval Noah Harari',
      rating: '4.9',
      badge: 'Must Read',
    },
    accentColor: 'from-sky-600/20 via-blue-500/10 to-transparent',
    image: {
      src: '/images/hero-books.jpg',
      alt: 'Quiet reading nook with an open book and warm light',
      position: 'right center',
    },
  },
];

/**
 * Content that sits ON TOP of the slide's full-bleed background image.
 * Layout, copy, colors and animations are unchanged from the original hero.
 */
function HeroSlideContent({ slide }: { slide: SlideData }) {
  return (
    <div className="relative z-10 mx-auto flex min-h-[550px] w-full max-w-7xl flex-col justify-center px-4 py-20 sm:min-h-[620px] sm:px-6 sm:py-24 lg:min-h-[620px] lg:px-8 lg:py-28">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 items-center">
        {/* Left Column: Headline, Subtitle, CTAs, Trust Badges */}
        <div className="lg:col-span-7 flex flex-col justify-center space-y-6 sm:space-y-8 text-center lg:text-left">
          {/* Tag Badge */}
          <div className="flex justify-center lg:justify-start">
            <Badge
              variant="default"
              className="gap-2 px-3.5 py-1 text-xs font-semibold tracking-wider uppercase bg-primary/10 border-primary/25 text-primary shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
              <span>{slide.tag}</span>
            </Badge>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.12]">
            {slide.headlinePrefix}{' '}
            <span className="text-gradient-electric block sm:inline">{slide.headlineHighlight}</span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto lg:mx-0 text-base sm:text-lg text-muted-foreground leading-relaxed">
            {slide.subtitle}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto px-7 py-3 font-semibold text-sm shadow-lg shadow-primary/25 hover:shadow-primary/35 gap-2 group transition-all duration-300"
            >
              <Link href={slide.primaryCtaHref}>
                {slide.primaryCtaText}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto px-6 py-3 font-semibold text-sm border-border/90 hover:border-primary/50 hover:bg-surface-hover transition-all duration-300"
            >
              <AuthLink href={slide.secondaryCtaHref}>{slide.secondaryCtaText}</AuthLink>
            </Button>
          </div>

          {/* Micro Stats / Social Proof */}
          <div className="pt-4 border-t border-border/60 grid grid-cols-3 gap-4 sm:gap-6 max-w-lg mx-auto lg:mx-0 text-left">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface border border-border/80 text-primary shrink-0">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-bold text-foreground">1,200+</p>
                <p className="text-[11px] text-muted-foreground">Curated Books</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface border border-border/80 text-primary shrink-0">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-bold text-foreground">4,800+</p>
                <p className="text-[11px] text-muted-foreground">Active Readers</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface border border-border/80 text-emerald-500 shrink-0">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-bold text-foreground">100% Free</p>
                <p className="text-[11px] text-muted-foreground">To Borrow</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Composition with Layered Book Artwork & Floating Badges */}
        <div className="lg:col-span-5 relative flex items-center justify-center">
          {/* Visual Container */}
          <div className="relative w-full max-w-md aspect-[4/3] sm:aspect-[1.15/1] rounded-2xl overflow-hidden border border-border/80 bg-gradient-to-b from-surface/80 to-card shadow-2xl p-4 sm:p-6 group">
            {/* Background ambient picture or book graphics */}
            <div className="relative h-full w-full rounded-xl overflow-hidden bg-surface flex items-center justify-center">
              <Image
                src="/images/hero-books.jpg"
                alt="Cozy reading desk with books"
                fill
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 450px"
              />
              {/* Dark gradient overlay for typography readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />

              {/* Overlaid Book Quote / Tagline */}
              <div className="absolute bottom-4 left-4 right-4 p-3 rounded-lg bg-card/85 backdrop-blur-md border border-border/80">
                <p className="text-xs font-semibold text-foreground truncate">
                  &ldquo;A reader lives a thousand lives before he dies.&rdquo;
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">George R.R. Martin</p>
              </div>
            </div>

            {/* Top Floating Glass Badge: Trending Highlight */}
            <div className="absolute top-3 right-3 sm:-top-3 sm:-right-3 rounded-xl border border-border/80 bg-card/90 backdrop-blur-md px-3.5 py-2 shadow-xl animate-in fade-in duration-300">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-500 font-bold">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    {slide.featuredBook.badge}
                  </span>
                  <span className="text-xs font-bold text-foreground">{slide.featuredBook.title}</span>
                </div>
              </div>
            </div>

            {/* Bottom-left Floating Glass Badge: Instant Borrow Verification */}
            <div className="absolute -bottom-3 -left-3 sm:bottom-6 sm:-left-4 rounded-xl border border-border/80 bg-card/90 backdrop-blur-md px-3.5 py-2 shadow-xl animate-in fade-in duration-300">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <BookmarkCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Instant Borrowing</p>
                  <p className="text-[10px] text-muted-foreground">Zero hidden fees</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  const swiperRef = React.useRef<SwiperInstance | null>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);

  const handleSlideChange = React.useCallback((swiper: SwiperInstance) => {
    setActiveIndex(swiper.realIndex);
  }, []);

  const handlePrev = () => swiperRef.current?.slidePrev();
  const handleNext = () => swiperRef.current?.slideNext();

  return (
    <section
      className="relative isolate overflow-hidden border-b border-border/80 bg-background transition-colors"
      aria-label="Hero Banner"
    >
      {/* Full-bleed slider: every slide's image covers the whole hero section */}
      <Swiper
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
          handleSlideChange(swiper);
        }}
        onSlideChange={handleSlideChange}
        modules={[Autoplay, EffectFade, Keyboard]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        autoHeight
        speed={900}
        loop
        keyboard={{ enabled: true }}
        autoplay={{
          delay: 7000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        className="hero-swiper relative z-0 w-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={slide.tag} className="h-auto">
            {/* Slide backdrop: image fills 100% width / 100% height of the slide */}
            <div className="relative h-full w-full overflow-hidden">
              <Image
                src={slide.image.src}
                alt={slide.image.alt}
                fill
                priority={index === 0}
                sizes="100vw"
                className="hero-slide-image object-cover"
                style={{ objectPosition: slide.image.position }}
              />

              {/* Ambient glow blobs, preserved from the original hero */}
              <div
                className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[130px] dark:bg-primary/20"
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute top-1/2 -right-40 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-accent/10 blur-[140px] dark:bg-accent/15"
                aria-hidden="true"
              />

              {/* Readable overlay: base tint + directional gradient behind the copy */}
              <div className="absolute inset-0 bg-background/70 dark:bg-background/75" aria-hidden="true" />
              <div
                className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent"
                aria-hidden="true"
              />
              <div
                className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background/80 to-transparent"
                aria-hidden="true"
              />

              {/* Content sits on top of the background image */}
              <HeroSlideContent slide={slide} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Slider Navigation Arrows */}
      <button
        type="button"
        onClick={handlePrev}
        aria-label="Previous slide"
        className="absolute left-2 sm:left-4 lg:left-6 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] top-auto sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-border/80 bg-card/90 backdrop-blur-md text-muted-foreground hover:text-primary hover:border-primary/50 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-primary z-20"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={handleNext}
        aria-label="Next slide"
        className="absolute right-2 sm:right-4 lg:right-6 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] top-auto sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-border/80 bg-card/90 backdrop-blur-md text-muted-foreground hover:text-primary hover:border-primary/50 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-primary z-20"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* Slide Indicators (Dots) */}
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.tag}
            onClick={() => swiperRef.current?.slideToLoop(index)}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === activeIndex}
            className={`h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary ${
              index === activeIndex
                ? 'w-2 bg-primary shadow-sm shadow-primary/30'
                : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
