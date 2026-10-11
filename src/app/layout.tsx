import type { Metadata } from "next";
import { Inter, Sora, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { SiteSettingsProvider } from "@/context/SiteSettingsContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthProvider";
import { CartProvider } from "@/context/CartContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SUBAN — Wildlife Photography Home & Cinematic Showcase",
  description:
    "High-fidelity chronicles from Earth’s untouched altitudinal margins. Capturing the tension, pulse, and ephemeral spirits of the eastern Himalaya and subtropical terai.",
  keywords: [
    "wildlife photography",
    "Nepal wildlife",
    "bengal tiger",
    "snow leopard",
    "commercial photo licenses",
    "Himalayan wildlife",
    "fine art prints",
  ],
  authors: [{ name: "Suban" }],
  openGraph: {
    title: "SUBAN — Wildlife Photography Home & Cinematic Showcase",
    description:
      "Aim, Passion, and Life in the Wild. National Geographic grade wildlife fine art, prints & commercial licensing.",
    siteName: "SUBAN Photography",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${sora.variable} ${spaceGrotesk.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var saved = localStorage.getItem('suban_theme_mode');
                var theme = (saved === 'light' || saved === 'dark') ? saved : 'dark';
                document.documentElement.classList.add(theme);
                document.documentElement.setAttribute('data-theme', theme);
                document.documentElement.style.colorScheme = theme;
              } catch (e) {}
            `,
          }}
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>

      <body className="bg-background text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container antialiased min-h-screen flex flex-col transition-colors duration-300">
        <AuthProvider>
          <ThemeProvider>
            <SiteSettingsProvider>
              <CartProvider>
                <AppShell>{children}</AppShell>
              </CartProvider>
            </SiteSettingsProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
