import { client } from "@/sanity/lib/client";
import { groq } from "next-sanity";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/AddToCartButton";
import { PriceDisplay } from "@/components/app/PriceDisplay";

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

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <section>
            {product.images?.[0] ? (
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                <div className="relative aspect-square">
                  <Image
                    src={urlFor(product.images[0]).width(1200).height(1200).url()}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            ) : (
              <div className="flex aspect-square items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-400">
                No image available
              </div>
            )}

            {product.images && product.images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {product.images.slice(1, 5).map((image: any, index: number) => (
                  <div
                    key={index}
                    className="relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-white"
                  >
                    <Image
                      src={urlFor(image).width(240).height(240).url()}
                      alt={`${product.name} image ${index + 2}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
              African Wax Print Fabric
            </p>
            <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">{product.name}</h1>

            <div className="mt-6 border-y border-gray-200 py-6">
              <p className="text-4xl font-bold text-gray-900">
                <PriceDisplay amount={product.price} baseCurrency={product.currency} />
              </p>
              {product.pricePerYard && (
                <p className="mt-1 text-sm text-gray-600">{product.pricePerYard}</p>
              )}
            </div>

            <div className="mt-6 space-y-3 rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-700">
                {stock > 0 ? (
                  <span>
                    In stock - shipped in 1-2 business days.{" "}
                    <span className="font-semibold">Only {stock} left.</span>
                  </span>
                ) : (
                  <span className="font-semibold text-red-600">Sold out.</span>
                )}
              </p>
              <p className="text-sm text-gray-600">
                To order continuous yardage, select the preferred size and increase quantity.
                Orders above 6 yards may be split into multiple 6-yard pieces.
              </p>
            </div>

            <div className="mt-6">
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
