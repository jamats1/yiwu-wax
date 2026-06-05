import { defineField, defineType } from "sanity";

export default defineType({
  name: "inquiry",
  title: "Product Inquiry",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string" }),
    defineField({ name: "company", title: "Company", type: "string" }),
    defineField({ name: "country", title: "Country", type: "string" }),
    defineField({ name: "whatsapp", title: "WhatsApp Number", type: "string" }),
    defineField({ name: "email", title: "Email", type: "string" }),
    defineField({ name: "quantity", title: "Quantity (pieces)", type: "number" }),
    defineField({ name: "notes", title: "Notes", type: "text" }),
    defineField({ name: "productName", title: "Product Name", type: "string" }),
    defineField({ name: "productSku", title: "Product SKU", type: "string" }),
    defineField({ name: "productUrl", title: "Product URL", type: "string" }),
    defineField({ name: "createdAt", title: "Submitted At", type: "datetime" }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: { list: ["new", "contacted", "converted", "closed"], layout: "radio" },
      initialValue: "new",
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "productName" },
    prepare({ title, subtitle }) {
      return { title: title || "Unknown", subtitle: subtitle || "" };
    },
  },
});
