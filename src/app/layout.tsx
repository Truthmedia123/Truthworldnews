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
  metadataBase: new URL("https://truthworldnews.com"),
  openGraph: {
    title: "Truth World News",
    description: "The cynical antidote to boring mainstream media. Powered by AI and blunt honesty.",
    url: "https://truthworldnews.com",
    siteName: "Truth World News",
    images: [
      {
        url: "/default-og.jpg",
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
    images: ["/default-og.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "YOUR_GSC_VERIFICATION_CODE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;

  return (
    <html
      lang="en"
      className={`${inter.variable} ${merriweather.variable} h-full antialiased bg-black text-white`}
    >
      <head>
        {gaId && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}', {
                    page_title: document.title,
                    page_location: window.location.href,
                  });
                `,
              }}
            />
          </>
        )}
        {clarityId && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "${clarityId}");
              `,
            }}
          />
        )}
      </head>
      <body className="min-h-full flex flex-col font-serif">
        <Navbar />
        <div className="flex-grow">{children}</div>
        <ConditionalAds />
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}
