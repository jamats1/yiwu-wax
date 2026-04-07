import { client } from "@/sanity/lib/client";
import { groq } from "next-sanity";
import { urlFor } from "@/sanity/lib/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Package, RotateCcw, Truck } from "lucide-react";
import AddToCartButton from "@/components/AddToCartButton";
import { PriceDisplay } from "@/components/app/PriceDisplay";
import { ProductImageGallery } from "@/components/app/ProductImageGallery";

const productQuery = groq`
  *[_type == "product" && slug.current == $slug][0] {
    _id,
    name,
    slug,
    description,
    price,
    currency,
    pricePerYard,
    images,
    availability,
    material,
    colors,
    stock,
    sku,
    originalUrl
  }
`;

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await client.fetch(productQuery, { slug: params.slug });

  if (!product) {
    notFound();
  }

  const stock = typeof product.stock === "number" ? product.stock : 0;
  const isSoldOut = product.availability === "sold_out" || stock <= 0;
  const sixYardPrice = Number((product.price * 6).toFixed(2));
  const purchaseOptions = [
    {
      id: "1-yard",
      label: "1 yard",
      price: product.price,
    },
    {
      id: "6-yards",
      label: "6 yards bundle",
      price: sixYardPrice,
    },
  ];

  const galleryUrls: string[] = (product.images ?? []).map((img: { asset?: { _ref?: string } }) =>
    urlFor(img).width(1200).height(1200).url(),
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-8 sm:pb-12">
      <div className="mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 lg:px-8 lg:pt-8">
        <nav className="mb-6 flex flex-wrap items-center gap-1 text-sm text-gray-600" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
          <Link href="/products" className="hover:text-primary">
            Fabrics
          </Link>
          <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
          <span className="line-clamp-1 font-medium text-gray-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          <section className="lg:sticky lg:top-24 lg:self-start">
            <ProductImageGallery images={galleryUrls} productName={product.name} />
          </section>

          <section className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              African wax print fabric
            </p>
            <h1 className="mt-2 text-balance text-2xl font-bold leading-tight text-gray-900 sm:text-3xl md:text-4xl">
              {product.name}
            </h1>

            <div className="mt-5 rounded-xl bg-gray-50 px-4 py-4 sm:px-5">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">From</p>
              <p className="mt-1 text-3xl font-bold text-gray-900 sm:text-4xl">
                <PriceDisplay amount={product.price} baseCurrency={product.currency} />
              </p>
              {product.pricePerYard && (
                <p className="mt-1 text-sm text-gray-600">{product.pricePerYard}</p>
              )}
            </div>

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
                <span>See care &amp; returns in details below</span>
              </li>
            </ul>

            <div
              className="mt-5 space-y-2 rounded-xl border border-primary/15 bg-primary/[0.04] px-4 py-3 text-sm"
              role="status"
            >
              <p className="font-medium text-gray-900">
                {stock > 0 ? (
                  <>
                    In stock
                    {stock <= 10 ? (
                      <span className="text-amber-800"> — only {stock} left</span>
                    ) : null}
                  </>
                ) : (
                  <span className="text-red-700">Sold out</span>
                )}
              </p>
              <p className="text-gray-600">
                Choose yard size, then set quantity. Orders over 6 yards may ship as multiple pieces.
              </p>
            </div>

            <div className="mt-6 border-t border-gray-100 pt-6">
              <AddToCartButton
                product={product}
                stock={stock}
                soldOut={isSoldOut}
                options={purchaseOptions}
              />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 rounded-xl border border-gray-200 p-4 sm:grid-cols-2">
              {product.sku && (
                <p className="text-sm">
                  <span className="font-semibold text-gray-900">SKU:</span>{" "}
                  <span className="text-gray-700">{product.sku}</span>
                </p>
              )}
              {product.material && (
                <p className="text-sm">
                  <span className="font-semibold text-gray-900">Material:</span>{" "}
                  <span className="capitalize text-gray-700">{product.material}</span>
                </p>
              )}
              {product.colors && product.colors.length > 0 && (
                <p className="text-sm sm:col-span-2">
                  <span className="font-semibold text-gray-900">Colors:</span>{" "}
                  <span className="text-gray-700">{product.colors.join(", ")}</span>
                </p>
              )}
              {product.originalUrl && (
                <a
                  href={product.originalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-primary underline-offset-2 hover:underline sm:col-span-2"
                >
                  View original source listing
                </a>
              )}
            </div>
          </section>
        </div>

        <section className="mt-10 space-y-4 rounded-2xl border border-gray-200 bg-white p-6">
          <details open>
            <summary className="cursor-pointer text-lg font-semibold text-gray-900">Description</summary>
            <p className="mt-3 whitespace-pre-line text-gray-700">
              {product.description ||
                "High quality African wax print fabric suitable for clothing, accessories, decor, and craft projects."}
            </p>
          </details>

          <details>
            <summary className="cursor-pointer text-lg font-semibold text-gray-900">
              Size Guide & Yard Conversion
            </summary>
            <div className="mt-3 space-y-2 text-gray-700">
              <p>1 yard = 91 cm</p>
              <p>2 yards = 182 cm</p>
              <p>3 yards = 274 cm</p>
              <p>6 yards = 548 cm</p>
            </div>
          </details>

          <details>
            <summary className="cursor-pointer text-lg font-semibold text-gray-900">
              Care & Return Notes
            </summary>
            <div className="mt-3 space-y-2 text-gray-700">
              <p>Machine wash regular fabrics at max 40C. Do not tumble dry or bleach.</p>
              <p>Expect up to 5% shrinkage for natural fibers.</p>
              <p>Custom-cut fabric lengths are typically non-returnable.</p>
            </div>
          </details>
        </section>
      </div>
    </main>
  );
}
