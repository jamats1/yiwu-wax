import { defineField, defineType } from "sanity";

export default defineType({
  name: "pageView",
  title: "Page View",
  type: "document",
  fields: [
    defineField({
      name: "sessionId",
      title: "Session ID",
      type: "string",
      description: "Unique session identifier",
    }),
    defineField({
      name: "path",
      title: "Page Path",
      type: "string",
      description: "URL path (e.g. /products/silk-wax-print)",
    }),
    defineField({
      name: "title",
      title: "Page Title",
      type: "string",
    }),
    defineField({
      name: "referrer",
      title: "Referrer",
      type: "string",
    }),
    defineField({
      name: "source",
      title: "Traffic Source",
      type: "string",
      options: {
        list: [
          { title: "Direct", value: "direct" },
          { title: "Google", value: "google" },
          { title: "Facebook", value: "facebook" },
          { title: "Instagram", value: "instagram" },
          { title: "Twitter/X", value: "twitter" },
          { title: "TikTok", value: "tiktok" },
          { title: "Pinterest", value: "pinterest" },
          { title: "Bing", value: "bing" },
          { title: "Yahoo", value: "yahoo" },
          { title: "DuckDuckGo", value: "duckduckgo" },
          { title: "Organic Search", value: "organic" },
          { title: "Referral", value: "referral" },
          { title: "Email", value: "email" },
          { title: "Paid", value: "paid" },
          { title: "WhatsApp", value: "whatsapp" },
        ],
      },
    }),
    defineField({
      name: "medium",
      title: "Medium",
      type: "string",
    }),
    defineField({
      name: "campaign",
      title: "Campaign",
      type: "string",
    }),
    defineField({
      name: "utmSource",
      title: "UTM Source",
      type: "string",
    }),
    defineField({
      name: "utmMedium",
      title: "UTM Medium",
      type: "string",
    }),
    defineField({
      name: "utmCampaign",
      title: "UTM Campaign",
      type: "string",
    }),
    defineField({
      name: "country",
      title: "Country",
      type: "string",
    }),
    defineField({
      name: "city",
      title: "City",
      type: "string",
    }),
    defineField({
      name: "device",
      title: "Device Type",
      type: "string",
      options: {
        list: [
          { title: "Desktop", value: "desktop" },
          { title: "Mobile", value: "mobile" },
          { title: "Tablet", value: "tablet" },
        ],
      },
    }),
    defineField({
      name: "duration",
      title: "Duration (seconds)",
      type: "number",
      description: "Time spent on page in seconds",
    }),
    defineField({
      name: "productId",
      title: "Product ID",
      type: "string",
      description: "If viewing a product page, the Sanity product _id",
    }),
  ],
  preview: {
    select: {
      path: "path",
      source: "source",
      country: "country",
      createdAt: "_createdAt",
    },
    prepare(selection) {
      const { path, source, country, createdAt } = selection;
      return {
        title: path || "Unknown page",
        subtitle: `${source || "direct"} · ${country || "unknown"} · ${createdAt ? new Date(createdAt).toLocaleString() : ""}`,
      };
    },
  },
});
