import { client } from "@/sanity/lib/client";
import { groq } from "next-sanity";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/AddToCartButton";

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
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            {product.images?.[0] && (
              <div className="relative aspect-square rounded-lg overflow-hidden">
                <Image
                  src={urlFor(product.images[0]).width(800).height(800).url()}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 mt-4">
                {product.images.slice(1, 5).map((image: any, index: number) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded overflow-hidden"
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
          <div>
            <h1 className="text-4xl font-bold mb-4">{product.name}</h1>

            <div className="mb-6">
              <p className="text-3xl font-bold mb-2">
                {product.currency === "EUR" ? "€" : product.currency}{" "}
                {product.price}
              </p>
              {product.pricePerYard && (
                <p className="text-gray-600">{product.pricePerYard}</p>
              )}
            </div>

            {product.description && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Description</h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            <div className="mb-6 space-y-2">
              {product.material && (
                <p>
                  <span className="font-semibold">Material:</span>{" "}
                  <span className="capitalize">{product.material}</span>
                </p>
              )}
              {product.colors && product.colors.length > 0 && (
                <p>
                  <span className="font-semibold">Colors:</span>{" "}
                  {product.colors.join(", ")}
                </p>
              )}
            </div>

            {product.availability === "sold_out" ? (
              <div className="bg-red-100 text-red-800 px-4 py-3 rounded-lg">
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
