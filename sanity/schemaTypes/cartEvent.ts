import { defineField, defineType } from "sanity";

export default defineType({
  name: "cartEvent",
  title: "Cart Event",
  type: "document",
  fields: [
    defineField({
      name: "sessionId",
      title: "Session ID",
      type: "string",
      description: "Unique session identifier",
    }),
    defineField({
      name: "eventType",
      title: "Event Type",
      type: "string",
      options: {
        list: [
          { title: "Add to Cart", value: "add_to_cart" },
          { title: "Begin Checkout", value: "begin_checkout" },
          { title: "Cart Captured", value: "cart_captured" },
          { title: "Cart Abandoned", value: "cart_abandoned" },
          { title: "Cart Recovered", value: "cart_recovered" },
          { title: "Cart Converted", value: "cart_converted" },
        ],
      },
    }),
    defineField({
      name: "email",
      title: "Customer Email",
      type: "string",
      description: "Email captured during checkout (for abandoned cart recovery)",
    }),
    defineField({
      name: "customerName",
      title: "Customer Name",
      type: "string",
    }),
    defineField({
      name: "phone",
      title: "Phone / WhatsApp",
      type: "string",
    }),
    defineField({
      name: "items",
      title: "Cart Items",
      type: "array",
      of: [
        defineField({
          name: "cartItem",
          type: "object",
          fields: [
            defineField({ name: "productId", type: "string", title: "Product ID" }),
            defineField({ name: "productName", type: "string", title: "Product Name" }),
            defineField({ name: "quantity", type: "number", title: "Quantity" }),
            defineField({ name: "price", type: "number", title: "Unit Price" }),
            defineField({ name: "currency", type: "string", title: "Currency" }),
          ],
          preview: {
            select: {
              name: "productName",
              qty: "quantity",
              price: "price",
            },
            prepare({ name, qty, price }) {
              return {
                title: name || "Unknown product",
                subtitle: `${qty} × $${price?.toFixed(2)}`,
              };
            },
          },
        }),
      ],
    }),
    defineField({
      name: "totalValue",
      title: "Total Value",
      type: "number",
      description: "Cart total at time of event",
    }),
    defineField({
      name: "currency",
      title: "Currency",
      type: "string",
    }),
    defineField({
      name: "stripeSessionId",
      title: "Stripe Session ID",
      type: "string",
      description: "Stripe checkout session ID (if created)",
    }),
    defineField({
      name: "orderId",
      title: "Order ID",
      type: "string",
      description: "Sanity order _id if converted",
    }),
    defineField({
      name: "source",
      title: "Traffic Source",
      type: "string",
    }),
    defineField({
      name: "country",
      title: "Country",
      type: "string",
    }),
    defineField({
      name: "recoveryMessageSent",
      title: "Recovery Message Sent",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "recoveryMessageType",
      title: "Recovery Message Type",
      type: "string",
      options: {
        list: [
          { title: "Email", value: "email" },
          { title: "WhatsApp", value: "whatsapp" },
        ],
      },
    }),
    defineField({
      name: "recoveryMessageSentAt",
      title: "Recovery Message Sent At",
      type: "datetime",
    }),
  ],
  preview: {
    select: {
      eventType: "eventType",
      email: "email",
      totalValue: "totalValue",
      currency: "currency",
      createdAt: "_createdAt",
    },
    prepare(selection) {
      const { eventType, email, totalValue, currency, createdAt } = selection;
      return {
        title: `${eventType?.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()) || "Cart event"}`,
        subtitle: `${email || "anonymous"} · ${currency || "USD"} ${totalValue?.toFixed(2)} · ${createdAt ? new Date(createdAt).toLocaleString() : ""}`,
      };
    },
  },
});
