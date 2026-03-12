import type { Metadata, Viewport } from "next";
import { Public_Sans } from "next/font/google";
import "./globals.css";

const publicSans = Public_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-public-sans",
});

export const metadata: Metadata = {
  title: "GraamSehat - Rural Telemedicine Platform",
  description:
    "Bridging healthcare gaps for 173 villages around Nabha Civil Hospital. Low-bandwidth, offline-first telemedicine access.",
  keywords: ["telemedicine", "rural health", "India", "ASHA", "offline healthcare"],
  authors: [{ name: "GraamSehat Team" }],
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
        {children}
      </body>
    </html>
  );
}
