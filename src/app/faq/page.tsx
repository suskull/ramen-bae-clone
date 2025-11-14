import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Metadata } from "next";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import { generateFAQSchema, renderStructuredData } from "@/lib/structured-data";

export const metadata: Metadata = generateSEOMetadata({
  title: "FAQ - Frequently Asked Questions",
  description: "Find answers to common questions about Ramen Bae products, shipping, returns, and more. Learn about our premium dried ramen toppings and ordering process.",
  path: "/faq",
});

const faqCategories = [
  {
    category: "Products & Ingredients",
    questions: [
      {
        question: "What are Ramen Bae toppings?",
        answer: "Ramen Bae offers the first ever line of premium dried ramen toppings. Our products include mixes, single toppings, bundles, seasonings, and sauces—all designed to instantly elevate your instant ramen experience with restaurant-quality flavor."
      },
      {
        question: "Are your products made with real ingredients?",
        answer: "Absolutely! We use only whole, real ingredients in all our products. No fillers, no artificial additives, and no preservatives. Everything is made in small batches to ensure maximum freshness and quality."
      },
      {
        question: "Are Ramen Bae products gluten-free or vegan?",
        answer: "We offer several gluten-free and vegan options! Check the product description and nutrition facts on each product page for specific dietary information. We clearly label all allergens and dietary considerations."
      },
      {
        question: "How long do the toppings last?",
        answer: "Because our toppings are dried and packaged in airtight containers, they have a long shelf life—typically 12-18 months when stored in a cool, dry place. Check the best-by date on each package for specific information."
      },
      {
        question: "Can I use these toppings on things other than ramen?",
        answer: "Definitely! While designed for ramen, our toppings are versatile. Use them on rice bowls, salads, soups, stir-fries, or anywhere you want to add a burst of umami flavor and texture."
      }
    ]
  },
  {
    category: "Ordering & Shipping",
    questions: [
      {
        question: "How much is shipping?",
        answer: "We offer FREE shipping on all orders over $40! For orders under $40, standard shipping is $5.99. We also include free fish cakes as a gift when your order reaches $60 or more."
      },
      {
        question: "How long does shipping take?",
        answer: "Standard shipping typically takes 3-5 business days within the continental US. You'll receive a tracking number via email once your order ships so you can follow its journey to your door."
      },
      {
        question: "Do you ship internationally?",
        answer: "Currently, we only ship within the United States. We're working on expanding internationally—sign up for our newsletter to be notified when we start shipping to your country!"
      },
      {
        question: "Can I track my order?",
        answer: "Yes! Once your order ships, you'll receive an email with a tracking number. You can also log into your account to view your order status and tracking information."
      },
      {
        question: "What if my order arrives damaged?",
        answer: "We take great care in packaging, but if something arrives damaged, please contact us within 48 hours with photos. We'll send you a replacement right away at no additional cost."
      }
    ]
  },
  {
    category: "Returns & Refunds",
    questions: [
      {
        question: "What is your return policy?",
        answer: "We want you to love your Ramen Bae products! If you're not satisfied, you can return unopened products within 30 days of delivery for a full refund. Contact our customer service team to initiate a return."
      },
      {
        question: "How do I return a product?",
        answer: "Email us at support@ramenbae.com with your order number and reason for return. We'll provide you with a prepaid return label and instructions. Once we receive the return, we'll process your refund within 5-7 business days."
      },
      {
        question: "Can I exchange a product?",
        answer: "Yes! If you'd like to exchange a product for a different flavor or item, contact us and we'll help you out. We'll send the new product as soon as we receive your return."
      }
    ]
  },
  {
    category: "Account & Rewards",
    questions: [
      {
        question: "Do I need an account to place an order?",
        answer: "No, you can checkout as a guest. However, creating an account lets you track orders, save your favorite products, and access exclusive member perks and early access to new products."
      },
      {
        question: "How do I reset my password?",
        answer: "Click on 'Account' in the navigation menu, then select 'Forgot Password.' Enter your email address and we'll send you a link to reset your password."
      },
      {
        question: "Do you have a rewards or loyalty program?",
        answer: "We're currently developing a rewards program for our loyal customers! Sign up for our newsletter to be the first to know when it launches."
      }
    ]
  },
  {
    category: "About Our Brand",
    questions: [
      {
        question: "Why did you start Ramen Bae?",
        answer: "Ramen Bae was born from a college student's desire to elevate instant ramen without breaking the bank. We wanted to create an easy, affordable way for everyone to enjoy restaurant-quality ramen at home."
      },
      {
        question: "Where are your products made?",
        answer: "All Ramen Bae products are made in small batches in the United States. We partner with local suppliers and manufacturers who share our commitment to quality and sustainability."
      },
      {
        question: "Are you sustainable?",
        answer: "Sustainability is important to us! We use eco-friendly packaging, source ingredients responsibly, and are constantly working to reduce our environmental impact. We're committed to making great food that's good for you and the planet."
      },
      {
        question: "How can I contact customer service?",
        answer: "You can reach us through our Contact page, email us at support@ramenbae.com, or DM us on social media. We typically respond within 24 hours on business days."
      }
    ]
  }
];

export default function FAQPage() {
  // Flatten all FAQs for structured data
  const allFAQs = faqCategories.flatMap(category => 
    category.questions.map(q => ({ question: q.question, answer: q.answer }))
  );
  const faqSchema = generateFAQSchema(allFAQs);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: renderStructuredData(faqSchema),
        }}
      />
      <main className="min-h-screen bg-linear-to-b from-white to-pink-50/30">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Frequently Asked <span className="text-primary">Questions</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Got questions? We've got answers! Find everything you need to know about Ramen Bae.
          </p>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-12">
          {faqCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                {category.category}
              </h2>
              <Accordion type="single" collapsible className="w-full">
                {category.questions.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${categoryIndex}-${index}`}
                    className="border-gray-200"
                  >
                    <AccordionTrigger className="text-left text-base sm:text-lg font-semibold text-gray-900 hover:text-primary hover:no-underline py-5">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-700 leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </section>

      {/* Still Have Questions Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-primary/10 to-accent/10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Still Have Questions?
          </h2>
          <p className="text-lg text-gray-700 mb-8">
            Can't find what you're looking for? Our customer service team is here to help!
          </p>
          <a
            href="/contact"
            className="inline-block bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Contact Us
          </a>
        </div>
      </section>
    </main>
    </>
  );
}
