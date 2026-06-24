declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

function gtag(...args: unknown[]) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag(...args);
  }
}

function fbq(...args: unknown[]) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq(...args);
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

  // Meta Pixel: ViewContent
  fbq("track", "ViewContent", {
    content_ids: [product._id],
    content_name: product.name,
    content_type: "product",
    value: product.price,
    currency: product.currency || "USD",
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

  // Meta Pixel: AddToCart
  fbq("track", "AddToCart", {
    content_ids: [item.id],
    content_name: item.name,
    content_type: "product",
    value: item.price * item.quantity,
    currency: item.currency || "USD",
    num_items: item.quantity,
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

  // Meta Pixel: InitiateCheckout
  fbq("track", "InitiateCheckout", {
    content_ids: cartItems.map((i) => i.id),
    content_type: "product",
    value: total,
    currency: "USD",
    num_items: cartItems.length,
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

  // Meta Pixel: Purchase
  fbq("track", "Purchase", {
    content_ids: cartItems.map((i) => i.id),
    content_type: "product",
    value: total,
    currency: "USD",
    num_items: cartItems.reduce((sum, i) => sum + i.quantity, 0),
    order_id: transactionId,
  });
}
