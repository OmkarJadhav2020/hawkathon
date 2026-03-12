import type { Metadata, Viewport } from "next";
import { Public_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const publicSans = Public_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-public-sans",
});

export const metadata: Metadata = {
  title: "NearDoc - Rural Telemedicine Platform",
  description:
    "Bridging healthcare gaps for 173 villages around Nabha Civil Hospital. Low-bandwidth, offline-first telemedicine access.",
  keywords: ["telemedicine", "rural health", "India", "ASHA", "offline healthcare"],
  authors: [{ name: "NearDoc Team" }],
  manifest: "/manifest.json",
  icons: {
    apple: "/globe.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#00C9A7",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className={`${publicSans.variable} bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-sans antialiased`}>
        {/* Google Translate Integration */}
        <Script src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" strategy="afterInteractive" />
        <Script id="google-translate-config" strategy="afterInteractive">
          {`
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({ pageLanguage: 'en', includedLanguages: 'en,pa,hi,bn,te,mr,ta,ur,gu,kn,ml,or', autoDisplay: false }, 'google_translate_element');
            }
          `}
        </Script>
        <div id="google_translate_element" style={{ display: "none" }}></div>
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Completely crush the Google Translate banner */
            html { top: 0 !important; }
            body { top: 0 !important; position: static !important; }
            .skiptranslate iframe { display: none !important; visibility: hidden !important; }
            .goog-te-banner-frame { display: none !important; visibility: hidden !important; }
            .goog-te-combo { display: none !important; }
            #goog-gt-tt { display: none !important; }
            .goog-te-spinner-pos { display: none !important; }
            .goog-text-highlight { background-color: transparent !important; box-shadow: none !important; }
            
            /* Stop translating the selector itself */
            .translate-parent font { display: none !important; }
            .translate-parent font:first-child { display: inline !important; }
          `
        }} />
        {children}
      </body>
    </html>
  );
}
