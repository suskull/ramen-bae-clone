import { Metadata } from "next";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";

export const metadata: Metadata = generateSEOMetadata({
  title: "Shop Premium Ramen Toppings",
  description: "Browse our collection of premium dried ramen toppings. Shop mixes, single toppings, bundles, seasonings, and sauces. Free shipping on orders over $40.",
  path: "/products",
});

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
