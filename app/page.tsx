import Link from "next/link";
import { client } from "@/sanity/lib/client";
import { groq } from "next-sanity";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";

const featuredProductsQuery = groq`
  *[_type == "product" && featured == true][0...8] {
    _id,
    name,
    slug,
    price,
    currency,
    images,
    availability
  }
`;

export default async function Home() {
  const products = await client.fetch(featuredProductsQuery);

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">African Fabrics</h1>
        <p className="text-lg mb-8">
          High quality African wax print fabrics. Perfect for making your own
          colorful clothes.
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
                  <p className="text-lg font-bold">
                    {product.currency === "EUR" ? "€" : product.currency}{" "}
                    {product.price}
                  </p>
                  {product.availability === "sold_out" && (
                    <span className="text-red-500 text-sm">Sold Out</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/products"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            View All Products
          </Link>
        </div>
      </div>
    </main>
  );
}
