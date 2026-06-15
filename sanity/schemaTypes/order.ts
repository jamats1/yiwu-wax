import { defineField, defineType } from "sanity";

export default defineType({
  name: "order",
  title: "Order",
  type: "document",
  fields: [
    defineField({
      name: "orderNumber",
      title: "Order Number",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "items",
      title: "Items",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "productName",
              title: "Product Name",
              type: "string",
            },
            {
              name: "quantity",
              title: "Quantity",
              type: "number",
            },
            {
              name: "price",
              title: "Price",
              type: "number",
            },
          ],
        },
      ],
    }),
    defineField({
      name: "total",
      title: "Total",
      type: "number",
      validation: (Rule) => Rule.required().positive(),
    }),
    defineField({
      name: "currency",
      title: "Charge Currency",
      type: "string",
      description: "Currency the customer was charged in (converted from RMB base).",
    }),
    defineField({
      name: "shippingMethod",
      title: "Shipping Method",
      type: "string",
      options: {
        list: [
          { title: "Sea freight", value: "sea" },
          { title: "Air freight", value: "air" },
          { title: "Collect from shop (Yiwu)", value: "pickup" },
        ],
      },
    }),
    defineField({
      name: "shippingCost",
      title: "Shipping Cost",
      type: "number",
    }),
    defineField({
      name: "processingFee",
      title: "Processing Fee",
      type: "number",
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Paid", value: "paid" },
          { title: "Shipped", value: "shipped" },
          { title: "Delivered", value: "delivered" },
          { title: "Cancelled", value: "cancelled" },
        ],
      },
      initialValue: "pending",
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: (Rule) => Rule.email(),
    }),
    defineField({
      name: "address",
      title: "Shipping Address",
      type: "object",
      fields: [
        {
          name: "line1",
          title: "Address Line 1",
          type: "string",
        },
        {
          name: "city",
          title: "City",
          type: "string",
        },
        {
          name: "postal_code",
          title: "Postal Code",
          type: "string",
        },
        {
          name: "country",
          title: "Country",
          type: "string",
        },
      ],
    }),
    defineField({
      name: "stripePaymentId",
      title: "Stripe Payment ID",
      type: "string",
    }),
  ],
  preview: {
    select: {
      title: "orderNumber",
      subtitle: "status",
    },
  },
});
