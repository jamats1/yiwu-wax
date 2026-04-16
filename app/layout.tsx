import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Header } from "@/components/app/Header";
import { CartTray } from "@/components/app/CartTray";
import { getSiteUrl } from "@/lib/site-url";

const inter = Inter({ subsets: ["latin"] });

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Yiwu Wax - African Fabrics",
  description: "High quality African fabrics and wax prints",
  alternates: {
    canonical: "/",
    languages: { "x-default": siteUrl, en: siteUrl },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Yiwu Wax",
    title: "Yiwu Wax - African Fabrics",
    description: "High quality African fabrics and wax prints",
  },
  icons: {
    icon: [{ url: "/favicon.ico", type: "image/x-icon" }],
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <Header />
          <CartTray />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
