import { Metadata } from "next";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";

export const metadata: Metadata = generateSEOMetadata({
  title: "Contact Us - Get in Touch",
  description: "Have questions about our premium ramen toppings? Contact Ramen Bae customer service. We respond within 24 hours to all inquiries about orders, products, and shipping.",
  path: "/contact",
});

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
