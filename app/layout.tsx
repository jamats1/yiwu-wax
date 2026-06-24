import type { Metadata } from "next";
import { headers } from "next/headers";
import { Inter } from "next/font/google";
import Script from "next/script";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { NavigationProgress } from "@/components/app/NavigationProgress";
import { LocationProvider } from "@/lib/context/location-provider";
import { getLocationFromHeaders, getLocaleFromCountry } from "@/lib/geo/location";
import { getSiteUrl } from "@/lib/site-url";
import { PageTracker } from "@/components/app/PageTracker";
import { SiteChrome } from "@/components/app/SiteChrome";

const META_PIXEL_ID = "2510793769421196";
const META_PIXEL_ID_2 = "1448525160643476";
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID ?? "";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
});
const siteUrl = getSiteUrl();

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const location = await getLocationFromHeaders(headersList);

  const title = `Yiwu Wax | African Wax Print Fabrics — ${location.country}`;
  const description = `Shop premium African wax print fabrics in ${location.country}. Bold patterns, 100% cotton, fast worldwide dispatch. Buy by the yard or in bundles.`;
  const locale = getLocaleFromCountry(location.countryCode);

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    keywords: [
      "african wax prints", "ankara fabric", "wax print fabric",
      location.country, location.city || "",
      "buy fabric online", "African fashion", "cotton fabric",
    ].filter(Boolean),
    alternates: {
      canonical: "/",
      languages: { "x-default": siteUrl, [locale]: siteUrl },
    },
    openGraph: {
      type: "website",
      locale,
      url: siteUrl,
      siteName: "Yiwu Wax",
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    verification: {
      google: "jODu1tVIyv69cJLx6GD9VzLRDG1JahbJeQ2pDaNsP70",
    },
    icons: {
      icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
      shortcut: "/favicon.svg",
      apple: "/favicon.svg",
    },
  };
}

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Yiwu Wax",
  url: siteUrl,
  logo: `${siteUrl}/favicon.svg`,
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+8618058542270",
    contactType: "customer service",
    availableLanguage: "English",
  },
};

const webSiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Yiwu Wax",
  url: siteUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${siteUrl}/?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <LocationProvider>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd).replace(/</g, "\\u003c") }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd).replace(/</g, "\\u003c") }}
          />

          {/* Meta Pixel */}
          <Script id="meta-pixel" strategy="afterInteractive">{`
            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){
            n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;
            s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
            (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init','${META_PIXEL_ID}');
            fbq('track','PageView');
          `}</Script>
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img height="1" width="1" style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`} alt="" />
          </noscript>

          {/* Meta Pixel 2 */}
          <Script id="meta-pixel-2" strategy="afterInteractive">{`
            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){
            n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;
            s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
            (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init','${META_PIXEL_ID_2}');
            fbq('track','PageView');
          `}</Script>
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img height="1" width="1" style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${META_PIXEL_ID_2}&ev=PageView&noscript=1`} alt="" />
          </noscript>

          {/* Microsoft Clarity */}
          {CLARITY_ID && (
            <Script id="ms-clarity" strategy="afterInteractive">{`
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window,document,"clarity","script","${CLARITY_ID}");
            `}</Script>
          )}

          <NavigationProgress />
          <PageTracker />
          <SiteChrome>
            <div className="pb-16 md:pb-0">
              {children}
            </div>
          </SiteChrome>
          </LocationProvider>
        </body>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </html>
    </ClerkProvider>
  );
}
