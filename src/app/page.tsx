import { Button } from "@/components/ui/button";
import { FloatingIngredients, SocialProof } from "@/components/animations";
import { Metadata } from "next";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";

export const metadata: Metadata = generateSEOMetadata({
  title: "Home - Premium Dried Ramen Toppings",
  description: "Enhance your noods with the first ever dried ramen toppings. Shop our collection of premium mixes, single toppings, bundles, and seasonings. Free shipping on orders over $40.",
  path: "/",
});

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-4rem)] sm:min-h-screen flex items-center justify-center bg-linear-to-br from-white via-pink-50/30 to-pink-100/50 px-4 sm:px-6 lg:px-8 overflow-hidden pt-16 sm:pt-0">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(254,144,184,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(150,218,47,0.08),transparent_50%)]"></div>
        
        {/* Floating Ingredients Animation */}
        <FloatingIngredients className="z-0" />

        <div className="relative max-w-5xl mx-auto text-center z-10 py-8 sm:py-0">
          {/* Main Tagline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6">
            <span className="block text-gray-900 mb-2">ENHANCE YOUR</span>
            <span className="block text-primary mb-4 drop-shadow-sm">NOODS</span>
            <span className="block text-sm sm:text-base md:text-lg lg:text-xl font-medium text-gray-700 max-w-3xl mx-auto leading-relaxed px-4">
              WITH THE FIRST EVER DRIED RAMEN TOPPINGS
            </span>
          </h1>

          {/* CTA Button */}
          <div className="mt-8 sm:mt-12">
            <Button
              variant="primary"
              size="lg"
              className="text-base sm:text-lg px-8 sm:px-12 py-4 sm:py-6 h-auto rounded-full font-semibold tracking-wide hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl bg-primary hover:bg-primary/90 touch-manipulation"
              asChild
            >
              <a href="/products">Shop Now</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <SocialProof />
    </main>
  );
}
