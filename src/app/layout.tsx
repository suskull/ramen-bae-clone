import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import { generateOrganizationSchema, generateWebsiteSchema, renderStructuredData } from "@/lib/structured-data";
import { ErrorBoundary } from "@/components/error";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = generateSEOMetadata({
  title: "Premium Dried Ramen Toppings",
  description: "Enhance your noods with the first ever dried ramen toppings. Premium quality, small batch, whole ingredients. Free shipping on orders over $40.",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebsiteSchema();

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: renderStructuredData([organizationSchema, websiteSchema]),
          }}
        />
      </head>
      <body className={`${poppins.variable} antialiased`}>
        <ErrorBoundary>
          <QueryProvider>
            <ClientLayout>
              {children}
            </ClientLayout>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
