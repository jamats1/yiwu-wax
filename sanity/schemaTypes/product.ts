import { defineField, defineType } from "sanity";
import { FABRIC_TYPES } from "../../lib/fabric-types";

export default defineType({
  name: "product",
  title: "Product",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
    }),
    defineField({
      name: "videoUrl",
      title: "Factory / Product Video URL",
      type: "url",
      description:
        "Paste a YouTube or Vimeo URL (e.g. https://youtu.be/abc123). The video will be embedded in the Description section on the product page.",
    }),
    defineField({
      name: "fabricType",
      title: "Fabric Type",
      type: "string",
      description:
        "Sets the factory base price (in RMB). Choose the fabric quality — the price is derived from this unless you set a price override below.",
      options: {
        list: FABRIC_TYPES.map((t) => ({
          title: `${t.title} (¥${t.basePriceRmb})`,
          value: t.value,
        })),
      },
    }),
    defineField({
      name: "priceRmb",
      title: "Price Override (RMB)",
      type: "number",
      description:
        "Optional. Overrides the fabric-type base price for this product. Leave empty to use the type price.",
      validation: (Rule) => Rule.positive(),
    }),
    defineField({
      name: "price",
      title: "Legacy Price",
      type: "number",
      description:
        "Deprecated. Base price now comes from Fabric Type / Price Override (in RMB). Kept for products not yet migrated.",
    }),
    defineField({
      name: "currency",
      title: "Currency",
      type: "string",
      readOnly: true,
      initialValue: "CNY",
      description: "Base currency is RMB (CNY). Prices are converted to the visitor's currency at display.",
      options: {
        list: [
          { title: "Chinese Yuan (¥)", value: "CNY" },
          { title: "Euro (€)", value: "EUR" },
          { title: "US Dollar ($)", value: "USD" },
          { title: "British Pound (£)", value: "GBP" },
        ],
      },
    }),
    defineField({
      name: "pricePerYard",
      title: "Price Per Yard",
      type: "string",
    }),
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      of: [
        {
          type: "image",
          options: {
            hotspot: true,
          },
        },
      ],
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
    }),
    defineField({
      name: "material",
      title: "Material",
      type: "string",
      options: {
        list: [
          { title: "100% Cotton", value: "cotton" },
          { title: "Polyester", value: "polyester" },
          { title: "Cotton Mix", value: "cotton-mix" },
        ],
      },
      initialValue: "cotton",
    }),
    defineField({
      name: "colors",
      title: "Colors",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "stock",
      title: "Stock",
      type: "number",
      initialValue: 0,
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "availability",
      title: "Availability",
      type: "string",
      options: {
        list: [
          { title: "In Stock", value: "in_stock" },
          { title: "Sold Out", value: "sold_out" },
        ],
      },
      initialValue: "in_stock",
    }),
    defineField({
      name: "sku",
      title: "SKU",
      type: "string",
    }),
    defineField({
      name: "originalUrl",
      title: "Original URL",
      type: "url",
      description: "URL from the scraped source",
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "active",
      title: "Active",
      type: "boolean",
      initialValue: true,
      description: "Inactive products are hidden from the storefront",
    }),
  ],
  preview: {
    select: {
      title: "name",
      media: "images.0",
      fabricType: "fabricType",
      priceRmb: "priceRmb",
      price: "price",
    },
    prepare({ title, media, fabricType, priceRmb, price }) {
      const typePrice = FABRIC_TYPES.find((t) => t.value === fabricType)?.basePriceRmb;
      const rmb = priceRmb ?? typePrice ?? price;
      return {
        title,
        media,
        subtitle: rmb ? `¥${rmb}${fabricType ? ` · ${fabricType}` : ""}` : "No price",
      };
    },
  },
});
