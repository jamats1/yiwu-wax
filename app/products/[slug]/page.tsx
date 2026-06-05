import { client } from "@/sanity/lib/client";
import { groq } from "next-sanity";
import { urlFor } from "@/sanity/lib/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Package, RotateCcw, Truck } from "lucide-react";
import AddToCartButton from "@/components/AddToCartButton";
import { PriceDisplay } from "@/components/app/PriceDisplay";
import { ProductImageGallery } from "@/components/app/ProductImageGallery";
import { RelatedProducts } from "@/components/app/RelatedProducts";
import { TrustBadges } from "@/components/app/TrustBadges";
import { WholesaleTrustBlock } from "@/components/app/WholesaleTrustBlock";
import { ProductBenefits } from "@/components/app/ProductBenefits";
import { ProductReviews } from "@/components/app/ProductReviews";
import { ProductFAQ } from "@/components/app/ProductFAQ";
import { BulkCalculator } from "@/components/app/BulkCalculator";
import { StickyProductCTA } from "@/components/app/StickyProductCTA";
import { RequestQuoteButton } from "@/components/app/RequestQuoteButton";
import { ProductViewTracker } from "@/components/app/ProductViewTracker";
import { WhatsAppWidget } from "@/components/app/WhatsAppWidget";
import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { RELATED_PRODUCTS_QUERY } from "@/lib/sanity/queries/products";
import { getVideoEmbedUrl } from "@/lib/video";

const productQuery = groq`
  *[_type == "product" && slug.current == $slug && active != false][0] {
    _id, name, slug, description, price, currency, pricePerYard,
    images, availability, material, colors, stock, sku, videoUrl,
    category-> { title, slug }
  }
`;

async function getProduct(slug: string) {
  return client.fetch(productQuery, { slug });
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return {};

  const siteUrl = getSiteUrl();
  const title = product.name;
  const description = product.description
    ? product.description.slice(0, 160)
    : `Buy ${product.name} — premium African wax print fabric, sold by the yard. Fast dispatch from Yiwu Wax.`;
  const canonicalUrl = `${siteUrl}/products/${product.slug.current}`;
  const ogImage = product.images?.[0] ? urlFor(product.images[0]).width(1200).height(630).url() : undefined;
  const inStock = product.availability === "in_stock" || (product.availability !== "sold_out" && (product.stock ?? 0) > 0);

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Yiwu Wax",
      type: "website",
      ...(ogImage && { images: [{ url: ogImage, width: 1200, height: 630, alt: product.name }] }),
    },
    twitter: { card: "summary_large_image", title, description, ...(ogImage && { images: [ogImage] }) },
    other: {
      "og:type": "product",
      "product:price:amount": String(product.price),
      "product:price:currency": product.currency || "USD",
      "product:availability": inStock ? "in stock" : "out of stock",
      "product:condition": "new",
      "product:brand": "Yiwu Wax",
      "product:retailer_item_id": product.sku || product._id,
    },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const categorySlug = product.category?.slug?.current ?? "";
  const relatedProducts = await client.fetch(RELATED_PRODUCTS_QUERY, { slug: params.slug, categorySlug }).catch(() => []);

  const stock = typeof product.stock === "number" ? product.stock : 0;
  const isSoldOut = product.availability === "sold_out" || (product.availability !== "in_stock" && stock <= 0);
  const perYardPrice = Number((product.price / 6).toFixed(2));

  const galleryUrls: string[] = (product.images ?? []).map((img: { asset?: { _ref?: string } }) =>
    urlFor(img).width(1200).height(1200).url(),
  );
  const thumbnailUrl = galleryUrls[0]
    ? urlFor(product.images[0]).width(120).height(120).url()
    : undefined;

  const siteUrl = getSiteUrl();

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    ...(product.description && { description: product.description }),
    ...(product.sku && { sku: product.sku }),
    ...(galleryUrls.length > 0 && { image: galleryUrls }),
    brand: { "@type": "Brand", name: "Yiwu Wax" },
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/products/${product.slug.current}`,
      price: product.price,
      priceCurrency: product.currency || "USD",
      availability: isSoldOut ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      seller: { "@type": "Organization", name: "Yiwu Wax" },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd).replace(/</g, "\\u003c") }}
      />
      <ProductViewTracker
        product={{ _id: product._id, name: product.name, price: product.price, currency: product.currency, category: product.category?.title }}
      />

      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-8 sm:pb-12">
        <div className="mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 lg:px-8 lg:pt-8">

          {/* Breadcrumb */}
          <nav className="mb-6 flex flex-wrap items-center gap-1 text-sm text-gray-600" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
            <Link href="/products" className="hover:text-primary">Fabrics</Link>
            <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
            <span className="line-clamp-1 font-medium text-gray-900">{product.name}</span>
          </nav>

          {/* SECTION 1 — Above the fold */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Gallery */}
            <section className="lg:sticky lg:top-24 lg:self-start">
              <ProductImageGallery images={galleryUrls} productName={product.name} />
            </section>

            {/* Info panel */}
            <section className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                {product.category?.title ?? "African wax print fabric"}
              </p>
              <h1 className="mt-2 text-balance text-2xl font-bold leading-tight text-gray-900 sm:text-3xl md:text-4xl">
                {product.name}
              </h1>

              {/* Social proof line */}
              <p className="mt-2 text-xs text-gray-500">
                Ordered by buyers in 🇺🇸 USA · 🇬🇧 UK · 🇨🇦 Canada · 🇳🇬 Nigeria · 🇬🇭 Ghana · 🇿🇦 South Africa
              </p>

              {/* Price */}
              <div className="mt-5 rounded-xl bg-gray-50 px-4 py-4 sm:px-5">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Price · 6-yard piece</p>
                <p className="mt-1 text-3xl font-bold text-gray-900 sm:text-4xl">
                  <PriceDisplay amount={product.price} baseCurrency={product.currency} />
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  (~<PriceDisplay amount={perYardPrice} baseCurrency={product.currency} /> per yard)
                </p>
              </div>

              {/* Feature pills */}
              <ul className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3" role="list">
                <li className="flex items-start gap-2 rounded-lg border border-gray-100 bg-white px-3 py-2.5 text-sm text-gray-700">
                  <Truck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <span>Fast dispatch · 1–2 business days</span>
                </li>
                <li className="flex items-start gap-2 rounded-lg border border-gray-100 bg-white px-3 py-2.5 text-sm text-gray-700">
                  <Package className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <span>Carefully packed rolls &amp; yardage</span>
                </li>
                <li className="flex items-start gap-2 rounded-lg border border-gray-100 bg-white px-3 py-2.5 text-sm text-gray-700">
                  <RotateCcw className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <span>7-day returns on faulty items</span>
                </li>
              </ul>

              {/* Stock status */}
              <div className="mt-5 rounded-xl border border-primary/15 bg-primary/[0.04] px-4 py-3 text-sm" role="status">
                <p className="font-medium text-gray-900">
                  {!isSoldOut ? (
                    <>
                      In stock
                      {stock > 0 && stock <= 10 && (
                        <span className="text-amber-700"> — only {stock} left</span>
                      )}
                    </>
                  ) : (
                    <span className="text-red-700">Sold out</span>
                  )}
                </p>
                <p className="mt-1 text-gray-600">
                  Each piece is a standard 6-yard cut. Order multiple pieces for more yardage.
                </p>
              </div>

              {/* CTAs */}
              <div id="add-to-cart-section" className="mt-6 space-y-3 border-t border-gray-100 pt-6">
                <AddToCartButton product={product} stock={stock} soldOut={isSoldOut} />
                <RequestQuoteButton
                  product={{ name: product.name, sku: product.sku, slug: product.slug.current }}
                />
              </div>

              {/* Trust badges */}
              <div className="mt-5">
                <TrustBadges />
              </div>

              {/* Wholesale trust block */}
              <WholesaleTrustBlock className="mt-5" />

              {/* Product meta */}
              <div className="mt-6 grid grid-cols-1 gap-3 rounded-xl border border-gray-200 p-4 sm:grid-cols-2">
                {product.sku && (
                  <p className="text-sm"><span className="font-semibold text-gray-900">SKU:</span>{" "}<span className="text-gray-700">{product.sku}</span></p>
                )}
                {product.material && (
                  <p className="text-sm"><span className="font-semibold text-gray-900">Material:</span>{" "}<span className="capitalize text-gray-700">{product.material}</span></p>
                )}
                {product.colors && product.colors.length > 0 && (
                  <p className="text-sm sm:col-span-2"><span className="font-semibold text-gray-900">Colors:</span>{" "}<span className="text-gray-700">{product.colors.join(", ")}</span></p>
                )}
              </div>
            </section>
          </div>

          {/* SECTION 2 — Benefits */}
          <ProductBenefits />

          {/* SECTION 3 — Description, specs, video */}
          <section className="mt-10 space-y-4 rounded-2xl border border-gray-200 bg-white p-6">
            <details open>
              <summary className="cursor-pointer text-lg font-semibold text-gray-900">Description</summary>
              {product.videoUrl && (() => {
                const embedUrl = getVideoEmbedUrl(product.videoUrl);
                return embedUrl ? (
                  <div className="mt-4 overflow-hidden rounded-xl border border-gray-100 bg-black">
                    <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                      <iframe
                        src={embedUrl}
                        title={`${product.name} — factory video`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 h-full w-full"
                      />
                    </div>
                    <p className="px-4 py-2 text-xs text-gray-400">
                      Factory &amp; quality walkthrough — filmed at source in Yiwu, China
                    </p>
                  </div>
                ) : null;
              })()}
              <p className="mt-3 whitespace-pre-line text-gray-700">
                {product.description || "High quality African wax print fabric suitable for clothing, accessories, decor, and craft projects."}
              </p>
            </details>

            <details>
              <summary className="cursor-pointer text-lg font-semibold text-gray-900">Fabric Size &amp; Measurements</summary>
              <div className="mt-3 space-y-2 text-gray-700">
                <p><strong>Each piece:</strong> 6 yards (548 cm / approximately 5.5 m)</p>
                <p><strong>Width:</strong> standard wax print width ~115 cm (45 inches)</p>
                <p>6 yards is the standard African wax print bolt — enough for a full outfit or dress set.</p>
              </div>
            </details>

            <details>
              <summary className="cursor-pointer text-lg font-semibold text-gray-900">Care &amp; Return Notes</summary>
              <div className="mt-3 space-y-2 text-gray-700">
                <p>Machine wash at max 40°C. Do not tumble dry or bleach.</p>
                <p>Expect up to 5% shrinkage for natural fibres on first wash.</p>
                <p>Fabric is non-returnable once cut or used. Inspect on receipt and contact us within 7 days for any issues.</p>
              </div>
            </details>
          </section>

          {/* SECTION 4 — Bulk calculator */}
          <BulkCalculator price={product.price} currency={product.currency} productName={product.name} />

          {/* SECTION 5 — Reviews */}
          <ProductReviews productId={product._id} productName={product.name} />

          {/* SECTION 6 — FAQ */}
          <ProductFAQ productName={product.name} />
        </div>
      </main>

      {/* Related Products */}
      <RelatedProducts products={relatedProducts} categoryTitle={product.category?.title} />

      {/* Sticky bar — fires when add-to-cart section scrolls out of view */}
      <StickyProductCTA
        product={product}
        soldOut={isSoldOut}
        watchElementId="add-to-cart-section"
        imageUrl={thumbnailUrl}
      />

      {/* WhatsApp widget — context-aware on product page */}
      <WhatsAppWidget productName={product.name} />
    </>
  );
}
