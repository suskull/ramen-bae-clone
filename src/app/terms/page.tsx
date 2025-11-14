import { Metadata } from "next";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";

export const metadata: Metadata = generateSEOMetadata({
  title: "Terms of Service",
  description: "Read our terms of service and understand the rules and regulations for using Ramen Bae's website and services.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-gray-600 mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Agreement to Terms
              </h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using the Ramen Bae website and services, you agree to be bound by these 
                Terms of Service and all applicable laws and regulations. If you do not agree with any of 
                these terms, you are prohibited from using this site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Use License
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Permission is granted to temporarily access the materials on Ramen Bae's website for 
                personal, non-commercial use only. This is the grant of a license, not a transfer of title.
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                Under this license, you may not:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Modify or copy the materials</li>
                <li>Use the materials for commercial purposes</li>
                <li>Attempt to reverse engineer any software on the website</li>
                <li>Remove any copyright or proprietary notations</li>
                <li>Transfer the materials to another person or "mirror" the materials on another server</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Product Information
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We strive to provide accurate product descriptions and pricing. However, we do not warrant 
                that product descriptions, pricing, or other content is accurate, complete, reliable, current, 
                or error-free. We reserve the right to correct any errors, inaccuracies, or omissions and to 
                change or update information at any time without prior notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Orders and Payment
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                By placing an order, you represent that:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>You are legally capable of entering into binding contracts</li>
                <li>You are at least 18 years of age</li>
                <li>The information you provide is accurate and complete</li>
                <li>You have the legal right to use any payment method provided</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-3">
                We reserve the right to refuse or cancel any order for any reason, including suspected 
                fraud, unauthorized transactions, or errors in product or pricing information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Shipping and Delivery
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Shipping times are estimates and not guaranteed. We are not responsible for delays caused 
                by shipping carriers or circumstances beyond our control. Risk of loss and title for items 
                pass to you upon delivery to the carrier.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Returns and Refunds
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Please refer to our Returns & Refunds policy for detailed information about returns, 
                exchanges, and refunds. Our return policy is incorporated into these Terms of Service 
                by reference.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                User Accounts
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                When you create an account, you are responsible for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Intellectual Property
              </h2>
              <p className="text-gray-700 leading-relaxed">
                All content on this website, including text, graphics, logos, images, and software, is the 
                property of Ramen Bae or its content suppliers and is protected by copyright and other 
                intellectual property laws. You may not reproduce, distribute, or create derivative works 
                without our express written permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Limitation of Liability
              </h2>
              <p className="text-gray-700 leading-relaxed">
                To the fullest extent permitted by law, Ramen Bae shall not be liable for any indirect, 
                incidental, special, consequential, or punitive damages, or any loss of profits or revenues, 
                whether incurred directly or indirectly, or any loss of data, use, goodwill, or other 
                intangible losses.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Indemnification
              </h2>
              <p className="text-gray-700 leading-relaxed">
                You agree to indemnify and hold harmless Ramen Bae and its affiliates from any claims, 
                damages, losses, liabilities, and expenses arising from your use of the website or violation 
                of these Terms of Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Governing Law
              </h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms of Service shall be governed by and construed in accordance with the laws of 
                the United States, without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Changes to Terms
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these Terms of Service at any time. Changes will be effective 
                immediately upon posting to the website. Your continued use of the website after changes 
                constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Contact Information
              </h2>
              <p className="text-gray-700 leading-relaxed">
                If you have questions about these Terms of Service, please contact us:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> legal@ramenbae.com<br />
                  <strong>Address:</strong> Ramen Bae, 123 Noodle Street, Food City, FC 12345
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
