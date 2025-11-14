import Image from "next/image";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "About Us - Ramen Bae",
  description: "Learn about the story behind Ramen Bae and our mission to enhance your ramen experience.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-linear-to-b from-white to-pink-50/30">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Our <span className="text-primary">Story</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From a college dorm room to kitchens across the country
          </p>
        </div>
      </section>

      {/* Founder Story Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                The Beginning
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  It all started in a tiny college apartment where instant ramen was a staple. 
                  Like many students, our founder was living on a tight budget but craved something 
                  more than plain noodles in broth.
                </p>
                <p>
                  After countless experiments with different toppings and seasonings, the idea struck: 
                  what if there was an easy way to elevate instant ramen without the hassle of fresh 
                  ingredients that go bad quickly?
                </p>
                <p>
                  That's when Ramen Bae was born—the first ever line of premium dried ramen toppings 
                  designed to transform your bowl from basic to bae-sic (in the best way possible).
                </p>
              </div>
            </div>
            <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="text-6xl mb-4">🍜</div>
                  <p className="text-gray-700 font-medium">Founder's Story Image</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl order-2 md:order-1">
              <div className="absolute inset-0 bg-linear-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="text-6xl mb-4">🌱</div>
                  <p className="text-gray-700 font-medium">Mission Image</p>
                </div>
              </div>
            </div>
            <div className="space-y-6 order-1 md:order-2">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Our Mission
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  We believe that everyone deserves a delicious, satisfying meal—no matter 
                  their budget or cooking skills. Our mission is to make gourmet ramen 
                  accessible to all.
                </p>
                <p>
                  Every Ramen Bae product is crafted with whole ingredients, made in small 
                  batches, and designed to bring restaurant-quality flavor to your home in 
                  seconds.
                </p>
                <p>
                  We're committed to sustainability, using eco-friendly packaging and 
                  sourcing ingredients responsibly. Because great food should be good for 
                  you and the planet.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-12">
            What We Stand For
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: "🌾",
                title: "Whole Ingredients",
                description: "Real food, no fillers or artificial additives"
              },
              {
                icon: "👨‍🍳",
                title: "Small Batch",
                description: "Handcrafted in small quantities for maximum freshness"
              },
              {
                icon: "💚",
                title: "Health Conscious",
                description: "Low fat, non-GMO, and nutritious options"
              },
              {
                icon: "🌍",
                title: "Sustainable",
                description: "Eco-friendly packaging and responsible sourcing"
              }
            ].map((value, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center"
              >
                <div className="text-5xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-primary/10 to-accent/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Join the Ramen Bae Community
          </h2>
          <p className="text-lg text-gray-700 mb-8 leading-relaxed">
            With over 300,000 satisfied customers and a passionate community of ramen lovers, 
            we're more than just a brand—we're a movement. Join us in revolutionizing the way 
            people enjoy instant ramen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="primary"
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white rounded-full px-8"
              asChild
            >
              <a href="/products">Shop Our Products</a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-primary text-primary hover:bg-primary/10 rounded-full px-8"
              asChild
            >
              <a href="/contact">Get in Touch</a>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
