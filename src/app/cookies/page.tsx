import { Metadata } from "next";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";

export const metadata: Metadata = generateSEOMetadata({
  title: "Cookie Policy",
  description: "Learn about how Ramen Bae uses cookies and similar technologies to enhance your browsing experience.",
  path: "/cookies",
});

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Cookie Policy
          </h1>
          <p className="text-gray-600 mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                What Are Cookies?
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Cookies are small text files that are placed on your device when you visit a website. 
                They are widely used to make websites work more efficiently and provide information to 
                website owners.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                How We Use Cookies
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Ramen Bae uses cookies to enhance your browsing experience and provide personalized 
                features. We use the following types of cookies:
              </p>

              <div className="space-y-4">
                <div className="border-l-4 border-primary pl-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Essential Cookies
                  </h3>
                  <p className="text-gray-700">
                    These cookies are necessary for the website to function properly. They enable core 
                    functionality such as security, network management, and accessibility. You cannot 
                    opt out of these cookies.
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Examples: Authentication, shopping cart, security
                  </p>
                </div>

                <div className="border-l-4 border-accent pl-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Performance Cookies
                  </h3>
                  <p className="text-gray-700">
                    These cookies collect information about how visitors use our website, such as which 
                    pages are visited most often. This helps us improve how our website works.
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Examples: Analytics, page load times, error tracking
                  </p>
                </div>

                <div className="border-l-4 border-secondary pl-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Functional Cookies
                  </h3>
                  <p className="text-gray-700">
                    These cookies allow the website to remember choices you make and provide enhanced, 
                    personalized features.
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Examples: Language preferences, region selection, user preferences
                  </p>
                </div>

                <div className="border-l-4 border-gray-400 pl-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Marketing Cookies
                  </h3>
                  <p className="text-gray-700">
                    These cookies track your online activity to help advertisers deliver more relevant 
                    advertising or to limit how many times you see an ad.
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Examples: Advertising networks, social media integration
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Third-Party Cookies
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                We may use third-party services that also set cookies on your device. These include:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Google Analytics:</strong> To analyze website traffic and usage</li>
                <li><strong>Payment Processors:</strong> To securely process transactions</li>
                <li><strong>Social Media Platforms:</strong> To enable social sharing features</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Managing Cookies
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You have the right to decide whether to accept or reject cookies. You can manage your 
                cookie preferences through:
              </p>

              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Browser Settings</h3>
                  <p className="text-gray-700 text-sm">
                    Most web browsers allow you to control cookies through their settings. You can set 
                    your browser to refuse cookies or delete certain cookies.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Cookie Preferences</h3>
                  <p className="text-gray-700 text-sm">
                    When you first visit our website, you can choose which types of cookies to accept 
                    through our cookie consent banner.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Opt-Out Tools</h3>
                  <p className="text-gray-700 text-sm">
                    You can opt out of certain third-party cookies through industry opt-out programs 
                    like the Network Advertising Initiative or Digital Advertising Alliance.
                  </p>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed mt-4">
                <strong>Note:</strong> Blocking or deleting cookies may impact your experience on our 
                website and limit certain features.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Cookie Duration
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Cookies can be either:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Session Cookies:</strong> Temporary cookies that expire when you close your browser</li>
                <li><strong>Persistent Cookies:</strong> Cookies that remain on your device for a set period or until you delete them</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Updates to This Policy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Cookie Policy from time to time to reflect changes in our practices 
                or for other operational, legal, or regulatory reasons. Please check this page periodically 
                for updates.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Contact Us
              </h2>
              <p className="text-gray-700 leading-relaxed">
                If you have questions about our use of cookies, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> privacy@ramenbae.com<br />
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
