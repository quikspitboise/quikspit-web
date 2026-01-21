import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navigation } from "@/components/navigation";
import PageTransition from "@/components/page-transition";
import ErrorBoundary from "@/components/error-boundary";
import { Footer } from "@/components/footer";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
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
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "QuikSpit Auto Detailing - Professional Car Detailing Services",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "QuikSpit Auto Detailing - Professional Car Detailing",
    description: "Professional car detailing services that make your vehicle shine like new.",
    images: ["/og-image.jpg"],
    creator: "@quikspit_shine",
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
    capable: true,
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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevent theme flash on first paint */}
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{
            __html: `(() => { try {
  const storageKey = 'quickspit-theme';
  const stored = localStorage.getItem(storageKey);
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const desired = stored || 'system';
  const applied = desired === 'dark' || (desired === 'system' && systemPrefersDark) ? 'dark' : 'light';
  const root = document.documentElement;
  root.classList.remove('light','dark');
  root.classList.add(applied);
  root.style.colorScheme = applied;
} catch (_) {} })();`,
          }}
        />
      </head>
      <body className="antialiased min-h-screen selection:bg-red-600/30" suppressHydrationWarning>
        {/* Skip to content for keyboard users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 bg-red-600 text-white px-4 py-2 rounded-lg shadow z-[100]"
        >
          Skip to content
        </a>
        <ThemeProvider
          defaultTheme="system"
          storageKey="quickspit-theme"
        >
          <ErrorBoundary>
            <Navigation />
            <PageTransition>
              {children}
            </PageTransition>
            <Footer />
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
