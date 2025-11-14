import { Metadata } from "next";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = generateSEOMetadata({
  title: "Shipping Information",
  description: "Learn about our shipping policies, delivery times, and free shipping thresholds. Fast and reliable shipping on all Ramen Bae products.",
  path: "/shipping",
});

export default function ShippingPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Shipping Information
          </h1>

          <div className="space-y-8">
            {/* Free Shipping */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Free Shipping 🎉
              </h2>
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Get FREE shipping on orders over $40!
                </p>
                <p className="text-gray-700">
                  Plus, unlock FREE Fish Cakes when you spend $60 or more.
                </p>
              </div>
            </section>

            {/* Delivery Times */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Delivery Times
              </h2>
              <div className="space-y-3 text-gray-700">
                <div className="flex items-start gap-3">
                  <span className="text-primary font-semibold">•</span>
                  <p><strong>Standard Shipping:</strong> 5-7 business days</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-primary font-semibold">•</span>
                  <p><strong>Express Shipping:</strong> 2-3 business days</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-primary font-semibold">•</span>
                  <p><strong>Processing Time:</strong> Orders are processed within 1-2 business days</p>
                </div>
              </div>
            </section>

            {/* Shipping Locations */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Where We Ship
              </h2>
              <p className="text-gray-700 mb-4">
                We currently ship to all 50 US states. International shipping coming soon!
              </p>
            </section>

            {/* Tracking */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Order Tracking
              </h2>
              <p className="text-gray-700 mb-4">
                Once your order ships, you'll receive a tracking number via email. 
                You can also track your order from your account dashboard.
              </p>
            </section>

            {/* Questions */}
            <section className="pt-6 border-t border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Have Questions?
              </h2>
              <p className="text-gray-700 mb-6">
                If you have any questions about shipping, feel free to reach out to our support team.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="primary" asChild>
                  <a href="/contact">Contact Us</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/faq">View FAQ</a>
                </Button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
