"use client";

import { useCartStore } from "@/lib/store/cart-store";

interface Product {
  _id: string;
  name: string;
  slug: { current: string };
  price: number;
  currency: string;
  images: any[];
}

export default function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem({
      id: product._id,
      name: product.name,
      slug: product.slug.current,
      price: product.price,
      currency: product.currency,
      image: product.images[0],
      quantity: 1,
    });
  };

  return (
    <button
      onClick={handleAddToCart}
      className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
    >
      Add to Cart
    </button>
  );
}
