import { ClerkProvider } from "@/components/clerk-provider";
import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";
import { PostHogProvider } from "@/components/posthog-provider";
import { Navigation } from "@/components/navigation";
import PageTransition from "@/components/page-transition";
import ErrorBoundary from "@/components/error-boundary";
import { Footer } from "@/components/footer";
import { SiteChrome } from "@/components/content/site-chrome";
import { SiteContentProvider } from "@/components/content/site-content-context";
import { buildSiteMetadata } from "@/lib/content/metadata";
import { siteCopy } from "@/lib/content/fields";
import { getPublishedContent } from "@/lib/server/content-api";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  variable: "--font-archivo",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  colorScheme: "dark",
  themeColor: "#000000",
};

export async function generateMetadata(): Promise<Metadata> {
  return buildSiteMetadata(await getPublishedContent());
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { site } = await getPublishedContent();

  return (
    <html lang="en" className={archivo.variable} data-scroll-behavior="smooth">
      <body className="min-h-screen">
        {/* Skip to content for keyboard users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 bg-red-600 text-white px-4 py-2 rounded-md z-[100]"
        >
          {siteCopy(site, 'skipToContent', 'Skip to content')}
        </a>
        <ClerkProvider>
          <PostHogProvider>
            <SiteContentProvider site={site}>
              <ErrorBoundary>
                <SiteChrome>
                  <Navigation site={site} />
                </SiteChrome>
                <PageTransition>
                  {children}
                </PageTransition>
                <SiteChrome>
                  <Footer site={site} />
                </SiteChrome>
              </ErrorBoundary>
            </SiteContentProvider>
          </PostHogProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
