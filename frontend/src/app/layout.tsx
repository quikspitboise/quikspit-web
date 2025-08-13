import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navigation } from "@/components/navigation";
import PageTransition from "@/components/page-transition";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        <ThemeProvider
          defaultTheme="system"
          storageKey="quickspit-theme"
        >
          <Navigation />
          <PageTransition>
            {children}
          </PageTransition>
        </ThemeProvider>
      </body>
    </html>
  );
}
