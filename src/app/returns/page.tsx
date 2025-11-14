import { Metadata } from "next";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = generateSEOMetadata({
  title: "Returns & Refunds",
  description: "Our hassle-free return policy. Learn about our 30-day satisfaction guarantee and how to return or exchange products.",
  path: "/returns",
});

export default function ReturnsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Returns & Refunds
          </h1>

          <div className="space-y-8">
            {/* Satisfaction Guarantee */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                30-Day Satisfaction Guarantee
              </h2>
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-6">
                <p className="text-lg text-gray-900 mb-2">
                  We want you to love your Ramen Bae products!
                </p>
                <p className="text-gray-700">
                  If you're not completely satisfied, you can return any unopened products 
                  within 30 days of delivery for a full refund.
                </p>
              </div>
            </section>

            {/* Return Policy */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Return Policy
              </h2>
              <div className="space-y-3 text-gray-700">
                <div className="flex items-start gap-3">
                  <span className="text-primary font-semibold">•</span>
                  <p>Products must be unopened and in original packaging</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-primary font-semibold">•</span>
                  <p>Returns must be initiated within 30 days of delivery</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-primary font-semibold">•</span>
                  <p>Original shipping costs are non-refundable</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-primary font-semibold">•</span>
                  <p>Return shipping is the customer's responsibility</p>
                </div>
              </div>
            </section>

            {/* How to Return */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                How to Return an Item
              </h2>
              <ol className="space-y-4 text-gray-700">
                <li className="flex gap-4">
                  <span className="shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                    1
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">Contact Us</p>
                    <p>Email our support team to initiate your return</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                    2
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">Get Authorization</p>
                    <p>We'll provide you with a return authorization number</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                    3
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">Ship It Back</p>
                    <p>Package your items securely and ship to our returns address</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                    4
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">Get Your Refund</p>
                    <p>Refunds are processed within 5-7 business days of receiving your return</p>
                  </div>
                </li>
              </ol>
            </section>

            {/* Exchanges */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Exchanges
              </h2>
              <p className="text-gray-700 mb-4">
                Want to exchange for a different product? No problem! Follow the return process 
                above and place a new order for the item you'd like instead.
              </p>
            </section>

            {/* Damaged Items */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Damaged or Defective Items
              </h2>
              <p className="text-gray-700 mb-4">
                If you receive a damaged or defective product, please contact us immediately 
                with photos. We'll send you a replacement at no cost or issue a full refund.
              </p>
            </section>

            {/* Contact */}
            <section className="pt-6 border-t border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Need Help?
              </h2>
              <p className="text-gray-700 mb-6">
                Our customer support team is here to help with any return or refund questions.
              </p>
              <Button variant="primary" asChild>
                <a href="/contact">Contact Support</a>
              </Button>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
