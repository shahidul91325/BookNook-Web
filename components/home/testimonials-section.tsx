"use client";

import * as React from "react";
import Image from "next/image";
import { Star, MessageSquareQuote, User } from "lucide-react";
import { apiRequest } from "@/lib/api/client";
import type { Testimonial } from "@/types";

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = React.useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let isCancelled = false;

    async function loadTestimonials() {
      try {
        // Query real testimonials from backend API if implemented
        const data = await apiRequest<Testimonial[]>("/api/testimonials");
        if (!isCancelled && Array.isArray(data) && data.length > 0) {
          setTestimonials(data);
        }
      } catch {
        // Backend does not provide testimonials or route returned 404
        // In accordance with instructions: Do NOT fabricate user reviews.
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadTestimonials();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Do not render if loading or if the backend provides no real testimonials
  if (isLoading || testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-16 sm:py-20 border-b border-border/80 bg-background transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider mb-2">
            <MessageSquareQuote className="h-4 w-4" />
            <span>Community Feedback</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            What Our Readers Say
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Real feedback from verified BookNook community members.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((item) => (
            <div
              key={item.id || item._id}
              className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
            >
              <div>
                {/* Rating stars if provided */}
                {item.rating !== undefined && (
                  <div className="flex items-center gap-1 mb-4 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < (item.rating || 5)
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                )}
                <p className="text-sm text-foreground/90 italic leading-relaxed">
                  &ldquo;{item.comment}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-border/60">
                <div className="relative h-10 w-10 rounded-full overflow-hidden bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                  {item.userAvatar ? (
                    <Image
                      src={item.userAvatar}
                      alt={item.userName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    item.userName?.slice(0, 2).toUpperCase() || <User className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-foreground">
                    {item.userName}
                  </h4>
                  {item.userRole && (
                    <p className="text-[11px] text-muted-foreground">
                      {item.userRole}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
