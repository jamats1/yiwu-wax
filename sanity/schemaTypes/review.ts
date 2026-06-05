import { defineField, defineType } from "sanity";

export default defineType({
  name: "review",
  title: "Product Review",
  type: "document",
  fields: [
    defineField({ name: "productId", title: "Product ID", type: "string" }),
    defineField({ name: "productName", title: "Product Name", type: "string" }),
    defineField({ name: "userId", title: "User ID (Clerk)", type: "string" }),
    defineField({ name: "userName", title: "User Name", type: "string" }),
    defineField({
      name: "rating",
      title: "Rating (1–5)",
      type: "number",
      validation: (Rule) => Rule.min(1).max(5).integer(),
    }),
    defineField({ name: "comment", title: "Comment", type: "text" }),
    defineField({ name: "createdAt", title: "Created At", type: "datetime" }),
    defineField({
      name: "approved",
      title: "Approved",
      type: "boolean",
      initialValue: true,
      description: "Uncheck to hide this review from the site.",
    }),
  ],
  preview: {
    select: {
      title: "productName",
      subtitle: "userName",
    },
    prepare({ title, subtitle }) {
      return {
        title: title || "Unknown product",
        subtitle: subtitle || "Anonymous",
      };
    },
  },
});
