import { ClerkProvider } from "@/components/clerk-provider";
import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";
import { PostHogProvider } from "@/components/posthog-provider";
import { Navigation } from "@/components/navigation";
import PageTransition from "@/components/page-transition";
import ErrorBoundary from "@/components/error-boundary";
import { Footer } from "@/components/footer";

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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://quikspitboise.com'),
  title: {
    default: "QuikSpit Auto Detailing - Professional Car Detailing",
    template: "%s | QuikSpit Auto Detailing",
  },
  description: "Professional car detailing services that make your vehicle shine like new. Experience the difference with our premium cleaning and protection services.",
  keywords: ["car detailing", "auto detailing", "car wash", "vehicle cleaning", "paint protection", "ceramic coating", "mobile detailing"],
  authors: [{ name: "QuikSpit Auto Detailing" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "QuikSpit Auto Detailing",
    title: "QuikSpit Auto Detailing - Professional Car Detailing",
    description: "Professional car detailing services that make your vehicle shine like new. Experience the difference with our premium cleaning and protection services.",
    images: [
      {
        url: "/hero_fallback.jpg",
        width: 1179,
        height: 1769,
        alt: "QuikSpit Auto Detailing - Professional Car Detailing Services",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "QuikSpit Auto Detailing - Professional Car Detailing",
    description: "Professional car detailing services that make your vehicle shine like new.",
    images: ["/hero_fallback.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: false,
    statusBarStyle: "default",
    title: "QuikSpit Auto Detailing",
  },
  formatDetection: {
    telephone: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={archivo.variable} data-scroll-behavior="smooth">
      <body className="min-h-screen">
        {/* Skip to content for keyboard users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 bg-red-600 text-white px-4 py-2 rounded-md z-[100]"
        >
          Skip to content
        </a>
        <ClerkProvider>
          <PostHogProvider>
            <ErrorBoundary>
              <Navigation />
              <PageTransition>
                {children}
              </PageTransition>
              <Footer />
            </ErrorBoundary>
          </PostHogProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
