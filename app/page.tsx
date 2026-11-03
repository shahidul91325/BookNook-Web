import type { Metadata } from "next";
import HeroSlider from "@/components/home/hero-slider";
import { FeaturesSection } from "@/components/home/features-section";
import { FeaturedBooksSection } from "@/components/home/featured-books-section";
import { CategoriesSection } from "@/components/home/categories-section";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { StatisticsSection } from "@/components/home/statistics-section";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { CtaSection } from "@/components/home/cta-section";

export const metadata: Metadata = {
  title: "BookNook | Home",
  description:
    "A small library. A big world of stories. Discover, borrow and manage your favorite books easily.",
};

export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroSlider />
      <FeaturesSection />
      <FeaturedBooksSection />
      <CategoriesSection />
      <HowItWorksSection />
      <StatisticsSection />
      <TestimonialsSection />
      <CtaSection />
    </div>
  );
}
