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
      className="w-full bg-accent text-primary px-8 py-4 rounded-xl hover:bg-accent-light transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-primary/20"
    >
      Add to Cart
    </button>
  );
}
