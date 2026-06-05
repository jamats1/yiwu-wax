declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function gtag(...args: unknown[]) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag(...args);
  }
}

export function trackViewItem(product: {
  _id: string;
  name: string;
  price: number;
  currency?: string;
  category?: string;
}) {
  gtag("event", "view_item", {
    currency: product.currency || "USD",
    value: product.price,
    items: [
      {
        item_id: product._id,
        item_name: product.name,
        price: product.price,
        item_category: product.category || "African Wax Print Fabrics",
        quantity: 1,
      },
    ],
  });
}

export function trackAddToCart(item: {
  id: string;
  name: string;
  price: number;
  currency?: string;
  quantity: number;
  category?: string;
}) {
  gtag("event", "add_to_cart", {
    currency: item.currency || "USD",
    value: item.price * item.quantity,
    items: [
      {
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        item_category: item.category || "African Wax Print Fabrics",
        quantity: item.quantity,
      },
    ],
  });
}

export function trackBeginCheckout(
  cartItems: Array<{
    id: string;
    name: string;
    price: number;
    currency?: string;
    quantity: number;
  }>,
  total: number,
) {
  gtag("event", "begin_checkout", {
    currency: "USD",
    value: total,
    items: cartItems.map((item) => ({
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
  });
}

export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  gtag("event", eventName, params ?? {});
}

export function trackWhatsAppClick(source: string, productName?: string) {
  gtag("event", "whatsapp_click", { source, product_name: productName ?? "" });
}

export function trackScrollDepth(depthPercent: number) {
  gtag("event", "scroll_depth", { depth_percent: depthPercent });
}

export function trackPurchase(
  transactionId: string,
  cartItems: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>,
  total: number,
) {
  gtag("event", "purchase", {
    transaction_id: transactionId,
    currency: "USD",
    value: total,
    items: cartItems.map((item) => ({
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
  });
}
