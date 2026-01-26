import { client } from "@/sanity/lib/client";
import { groq } from "next-sanity";
import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";

const allProductsQuery = groq`
  *[_type == "product"] | order(_createdAt desc) {
    _id,
    name,
    slug,
    price,
    currency,
    images,
    availability,
    material,
    colors
  }
`;

export default async function ProductsPage() {
  const products = await client.fetch(allProductsQuery);

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">All Products</h1>
        <p className="text-lg mb-8 text-gray-600">
          {products.length} products available
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product: any) => (
            <Link
              key={product._id}
              href={`/products/${product.slug.current}`}
              className="group"
            >
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {product.images?.[0] && (
                  <div className="relative aspect-square">
                    <Image
                      src={urlFor(product.images[0]).width(400).height(400).url()}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-lg font-bold mb-1">
                    {product.currency === "EUR" ? "€" : product.currency}{" "}
                    {product.price}
                  </p>
                  {product.material && (
                    <p className="text-sm text-gray-600 capitalize">
                      {product.material}
                    </p>
                  )}
                  {product.availability === "sold_out" && (
                    <span className="text-red-500 text-sm">Sold Out</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
