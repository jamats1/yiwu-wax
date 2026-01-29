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
    stock
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

  return (
    <main className="min-h-screen bg-primary relative overflow-hidden w-full">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-pattern-dots opacity-10 pointer-events-none" />
      
      <div className="w-full max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-12 md:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            {product.images?.[0] && (
              <div className="relative aspect-square rounded-xl overflow-hidden shadow-2xl border-4 border-accent/30">
                <Image
                  src={urlFor(product.images[0]).width(800).height(800).url()}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3 mt-4">
                {product.images.slice(1, 5).map((image: any, index: number) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-lg overflow-hidden border-2 border-accent/20 hover:border-accent transition-colors cursor-pointer"
                  >
                    <Image
                      src={urlFor(image).width(200).height(200).url()}
                      alt={`${product.name} ${index + 2}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="bg-white rounded-xl p-8 shadow-2xl border-2 border-accent/20">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
              {product.name}
            </h1>

            <div className="mb-8 pb-6 border-b-2 border-secondary/20">
              <p className="text-4xl font-bold mb-2 text-primary">
                <PriceDisplay amount={product.price} baseCurrency={product.currency} />
              </p>
              {product.pricePerYard && (
                <p className="text-secondary font-medium">{product.pricePerYard}</p>
              )}
            </div>

            {product.description && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary">Description</h2>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            <div className="mb-8 space-y-3 bg-primary/5 p-6 rounded-lg">
              {product.material && (
                <p className="flex items-center gap-2">
                  <span className="font-bold text-primary">Material:</span>
                  <span className="capitalize text-gray-700 font-medium">{product.material}</span>
                </p>
              )}
              {product.colors && product.colors.length > 0 && (
                <p className="flex items-center gap-2">
                  <span className="font-bold text-primary">Colors:</span>
                  <span className="text-gray-700 font-medium">{product.colors.join(", ")}</span>
                </p>
              )}
            </div>

            {product.availability === "sold_out" ? (
              <div className="bg-red-100 text-red-800 px-6 py-4 rounded-xl font-semibold text-center border-2 border-red-300">
                Sold Out
              </div>
            ) : (
              <AddToCartButton product={product} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
