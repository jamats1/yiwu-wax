/**
 * Traffic source detection from referrer, UTM params, and headers.
 */

export type TrafficSource =
  | "google"
  | "facebook"
  | "instagram"
  | "twitter"
  | "tiktok"
  | "pinterest"
  | "bing"
  | "yahoo"
  | "duckduckgo"
  | "direct"
  | "organic"
  | "referral"
  | "email"
  | "paid"
  | "whatsapp";

export interface TrafficSourceResult {
  source: TrafficSource;
  medium: string;
  campaign: string | null;
  referrer: string | null;
}

const SEARCH_ENGINES: Record<string, TrafficSource> = {
  "google.com": "google",
  "google.co": "google",
  "bing.com": "bing",
  "yahoo.com": "yahoo",
  "duckduckgo.com": "duckduckgo",
  "baidu.com": "google", // treat as organic search
};

const SOCIAL_NETWORKS: Record<string, TrafficSource> = {
  "facebook.com": "facebook",
  "fb.com": "facebook",
  "l.facebook.com": "facebook",
  "lm.facebook.com": "facebook",
  "instagram.com": "instagram",
  "twitter.com": "twitter",
  "x.com": "twitter",
  "t.co": "twitter",
  "tiktok.com": "tiktok",
  "pinterest.com": "pinterest",
  "pin.it": "pinterest",
};

const EMAIL_PROVIDERS = [
  "mail.google.com",
  "gmail.com",
  "outlook.live.com",
  "mail.yahoo.com",
  "mail.live.com",
];

export function detectTrafficSource(params: {
  referrer?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
}): TrafficSourceResult {
  const { referrer: rawReferrer, utmSource, utmMedium, utmCampaign: rawCampaign } = params;
  const referrer = rawReferrer ?? null;
  const utmCampaign = rawCampaign ?? null;

  // UTM source takes highest priority
  if (utmSource) {
    const source = utmSource.toLowerCase();
    if (source.includes("google") && utmMedium?.includes("cpc")) {
      return { source: "paid", medium: utmMedium || "cpc", campaign: utmCampaign, referrer };
    }
    if (source.includes("facebook") || source.includes("fb")) {
      return { source: "facebook", medium: utmMedium || "social", campaign: utmCampaign, referrer };
    }
    if (source.includes("instagram")) {
      return { source: "instagram", medium: utmMedium || "social", campaign: utmCampaign, referrer };
    }
    if (source.includes("twitter") || source.includes("x.com")) {
      return { source: "twitter", medium: utmMedium || "social", campaign: utmCampaign, referrer };
    }
    if (source.includes("tiktok")) {
      return { source: "tiktok", medium: utmMedium || "social", campaign: utmCampaign, referrer };
    }
    if (source.includes("pinterest")) {
      return { source: "pinterest", medium: utmMedium || "social", campaign: utmCampaign, referrer };
    }
    if (source.includes("whatsapp")) {
      return { source: "whatsapp", medium: utmMedium || "referral", campaign: utmCampaign, referrer };
    }
    if (source.includes("email") || source.includes("newsletter")) {
      return { source: "email", medium: utmMedium || "email", campaign: utmCampaign, referrer };
    }
    return { source: "referral", medium: utmMedium || "referral", campaign: utmCampaign, referrer };
  }

  // No referrer = direct
  if (!referrer) {
    return { source: "direct", medium: "none", campaign: null, referrer: null };
  }

  try {
    const url = new URL(referrer);
    const hostname = url.hostname.toLowerCase();

    // Check social networks first
    for (const [domain, source] of Object.entries(SOCIAL_NETWORKS)) {
      if (hostname.includes(domain)) {
        return { source, medium: "social", campaign: null, referrer };
      }
    }

    // Check search engines
    for (const [domain] of Object.entries(SEARCH_ENGINES)) {
      if (hostname.includes(domain)) {
        return { source: "organic", medium: "organic", campaign: null, referrer };
      }
    }

    // Check email providers
    for (const domain of EMAIL_PROVIDERS) {
      if (hostname.includes(domain)) {
        return { source: "email", medium: "email", campaign: null, referrer };
      }
    }

    // Check if URL has q= param (likely a search)
    if (url.searchParams.has("q") || url.searchParams.has("search")) {
      return { source: "organic", medium: "organic", campaign: null, referrer };
    }

    // Default to referral
    return { source: "referral", medium: "referral", campaign: null, referrer };
  } catch {
    return { source: "direct", medium: "none", campaign: null, referrer };
  }
}

export function getUtmParams(searchParams: URLSearchParams | string): {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
} {
  const params = typeof searchParams === "string"
    ? new URLSearchParams(searchParams)
    : searchParams;

  return {
    utmSource: params.get("utm_source"),
    utmMedium: params.get("utm_medium"),
    utmCampaign: params.get("utm_campaign"),
    utmContent: params.get("utm_content"),
    utmTerm: params.get("utm_term"),
  };
}
