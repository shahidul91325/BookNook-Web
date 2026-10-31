import { HeroSection } from "@/components/home/hero-section";
import { FeaturesSection } from "@/components/home/features-section";
import { FeaturedBooksSection } from "@/components/home/featured-books-section";
import { CategoriesSection } from "@/components/home/categories-section";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { StatisticsSection } from "@/components/home/statistics-section";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { CtaSection } from "@/components/home/cta-section";

export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroSection />
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
