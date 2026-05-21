import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ConditionalAds from "@/components/ConditionalAds";
import CookieConsent from "@/components/CookieConsent";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const merriweather = Merriweather({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Truth World News",
    default: "Truth World News",
  },
  description: "The cynical antidote to boring mainstream media. Powered by AI and blunt honesty.",
  openGraph: {
    title: "Truth World News",
    description: "The cynical antidote to boring mainstream media. Powered by AI and blunt honesty.",
    url: "https://truthworldnews.com",
    siteName: "Truth World News",
    images: [
      {
        url: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80", // default og image
        width: 1200,
        height: 630,
        alt: "Truth World News Banner",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Truth World News",
    description: "The cynical antidote to boring mainstream media.",
    images: ["https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80"],
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
      className={`${inter.variable} ${merriweather.variable} h-full antialiased bg-black text-white`}
    >
      <body className="min-h-full flex flex-col font-serif">
        <Navbar />
        <div className="flex-grow">
          {children}
        </div>
        {/* ── Conditional AdSense — only loads if marketing consent is given ── */}
        <ConditionalAds />
        <Footer />
        {/* ── Cookie Consent Banner (z-50, fixed bottom) ── */}
        <CookieConsent />
      </body>
    </html>
  );
}
