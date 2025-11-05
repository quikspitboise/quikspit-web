import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navigation } from "@/components/navigation";
import PageTransition from "@/components/page-transition";
import ErrorBoundary from "@/components/error-boundary";

export const metadata: Metadata = {
  title: "QuikSpit Shine - Professional Car Detailing",
  description: "Professional car detailing services that make your vehicle shine like new. Experience the difference with our premium cleaning and protection services.",
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
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
