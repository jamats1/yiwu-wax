/**
 * Geolocation utilities for detecting user's country from IP.
 * Reuses the proven jama-furniture system with header detection + IP fallback.
 */

export interface LocationData {
  country: string;
  countryCode: string;
  city?: string;
  region?: string;
  currency?: string;
}

/**
 * Get user location from request headers (Next.js edge/server).
 * Priority: geo headers → IP lookup → US default.
 */
export async function getLocationFromHeaders(
  headers: Headers,
): Promise<LocationData> {
  // Try platform geo headers first (Cloudflare / Vercel / custom)
  const countryCode =
    headers.get("cf-ipcountry") ||
    headers.get("x-vercel-ip-country") ||
    headers.get("x-geo-country") ||
    headers.get("x-country-code") ||
    null;

  if (countryCode && countryCode !== "XX" && countryCode.length === 2) {
    return {
      countryCode: countryCode.toUpperCase(),
      country: getCountryName(countryCode),
      currency: getCurrencyForCountry(countryCode),
    };
  }

  // Fallback: resolve from client IP
  const ip = getClientIP(headers);
  if (ip) {
    try {
      return await getLocationFromIP(ip);
    } catch (error) {
      console.error("Failed to get location from IP:", error);
    }
  }

  return {
    country: "United States",
    countryCode: "US",
    currency: "USD",
  };
}

function getClientIP(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  const realIP = headers.get("x-real-ip");
  if (realIP) return realIP;

  const cfConnectingIP = headers.get("cf-connecting-ip");
  if (cfConnectingIP) return cfConnectingIP;

  return null;
}

async function getLocationFromIP(ip: string): Promise<LocationData> {
  if (
    ip.startsWith("127.") ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.") ||
    ip.startsWith("172.")
  ) {
    return { country: "United States", countryCode: "US", currency: "USD" };
  }

  const response = await fetch(
    `http://ip-api.com/json/${ip}?fields=status,country,countryCode,city,region`,
    {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    },
  );

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

  const data = await response.json();
  if (data.status === "success" && data.countryCode) {
    return {
      country: data.country || "United States",
      countryCode: data.countryCode.toUpperCase(),
      city: data.city,
      region: data.region,
      currency: getCurrencyForCountry(data.countryCode),
    };
  }

  throw new Error("Invalid response from IP API");
}

function getCountryName(countryCode: string): string {
  const countries: Record<string, string> = {
    AF: "Afghanistan", AL: "Albania", DZ: "Algeria", AD: "Andorra", AO: "Angola",
    AG: "Antigua and Barbuda", AR: "Argentina", AM: "Armenia", AU: "Australia", AT: "Austria",
    AZ: "Azerbaijan", BS: "Bahamas", BH: "Bahrain", BD: "Bangladesh", BB: "Barbados",
    BY: "Belarus", BE: "Belgium", BZ: "Belize", BJ: "Benin", BT: "Bhutan", BO: "Bolivia",
    BA: "Bosnia and Herzegovina", BW: "Botswana", BR: "Brazil", BN: "Brunei", BG: "Bulgaria",
    BF: "Burkina Faso", BI: "Burundi", KH: "Cambodia", CM: "Cameroon", CA: "Canada",
    CV: "Cape Verde", CF: "Central African Republic", TD: "Chad", CL: "Chile", CN: "China",
    CO: "Colombia", KM: "Comoros", CG: "Congo", CD: "Democratic Republic of the Congo",
    CR: "Costa Rica", CI: "Côte d'Ivoire", HR: "Croatia", CU: "Cuba", CY: "Cyprus",
    CZ: "Czechia", DK: "Denmark", DJ: "Djibouti", DM: "Dominica", DO: "Dominican Republic",
    EC: "Ecuador", EG: "Egypt", SV: "El Salvador", GQ: "Equatorial Guinea", ER: "Eritrea",
    EE: "Estonia", SZ: "Eswatini", ET: "Ethiopia", FJ: "Fiji", FI: "Finland", FR: "France",
    GA: "Gabon", GM: "Gambia", GE: "Georgia", DE: "Germany", GH: "Ghana", GR: "Greece",
    GD: "Grenada", GT: "Guatemala", GN: "Guinea", GW: "Guinea-Bissau", GY: "Guyana",
    HT: "Haiti", HN: "Honduras", HU: "Hungary", IS: "Iceland", IN: "India", ID: "Indonesia",
    IR: "Iran", IQ: "Iraq", IE: "Ireland", IL: "Israel", IT: "Italy", JM: "Jamaica",
    JP: "Japan", JO: "Jordan", KZ: "Kazakhstan", KE: "Kenya", KI: "Kiribati", KP: "North Korea",
    KR: "South Korea", KW: "Kuwait", KG: "Kyrgyzstan", LA: "Laos", LV: "Latvia", LB: "Lebanon",
    LS: "Lesotho", LR: "Liberia", LY: "Libya", LI: "Liechtenstein", LT: "Lithuania",
    LU: "Luxembourg", MG: "Madagascar", MW: "Malawi", MY: "Malaysia", MV: "Maldives",
    ML: "Mali", MT: "Malta", MH: "Marshall Islands", MR: "Mauritania", MU: "Mauritius",
    MX: "Mexico", FM: "Micronesia", MD: "Moldova", MC: "Monaco", MN: "Mongolia",
    ME: "Montenegro", MA: "Morocco", MZ: "Mozambique", MM: "Myanmar", NA: "Namibia",
    NR: "Nauru", NP: "Nepal", NL: "Netherlands", NZ: "New Zealand", NI: "Nicaragua",
    NE: "Niger", NG: "Nigeria", MK: "North Macedonia", NO: "Norway", OM: "Oman",
    PK: "Pakistan", PW: "Palau", PA: "Panama", PG: "Papua New Guinea", PY: "Paraguay",
    PE: "Peru", PH: "Philippines", PL: "Poland", PT: "Portugal", QA: "Qatar", RO: "Romania",
    RU: "Russia", RW: "Rwanda", KN: "Saint Kitts and Nevis", LC: "Saint Lucia",
    VC: "Saint Vincent and the Grenadines", WS: "Samoa", SM: "San Marino",
    ST: "São Tomé and Príncipe", SA: "Saudi Arabia", SN: "Senegal", RS: "Serbia",
    SC: "Seychelles", SL: "Sierra Leone", SG: "Singapore", SK: "Slovakia", SI: "Slovenia",
    SB: "Solomon Islands", SO: "Somalia", ZA: "South Africa", SS: "South Sudan",
    ES: "Spain", LK: "Sri Lanka", SD: "Sudan", SR: "Suriname", SE: "Sweden", CH: "Switzerland",
    SY: "Syria", TW: "Taiwan", TJ: "Tajikistan", TZ: "Tanzania", TH: "Thailand",
    TL: "Timor-Leste", TG: "Togo", TO: "Tonga", TT: "Trinidad and Tobago", TN: "Tunisia",
    TR: "Turkey", TM: "Turkmenistan", TV: "Tuvalu", UG: "Uganda", UA: "Ukraine",
    AE: "United Arab Emirates", GB: "United Kingdom", US: "United States", UY: "Uruguay",
    UZ: "Uzbekistan", VU: "Vanuatu", VA: "Vatican City", VE: "Venezuela", VN: "Vietnam",
    YE: "Yemen", ZM: "Zambia", ZW: "Zimbabwe",
  };
  return countries[countryCode.toUpperCase()] || countryCode;
}

function getCurrencyForCountry(countryCode: string): string {
  const currencyMap: Record<string, string> = {
    AF: "AFN", AL: "ALL", DZ: "DZD", AD: "EUR", AO: "AOA",
    AG: "XCD", AR: "ARS", AM: "AMD", AU: "AUD", AT: "EUR",
    AZ: "AZN", BS: "BSD", BH: "BHD", BD: "BDT", BB: "BBD",
    BY: "BYN", BE: "EUR", BZ: "BZD", BJ: "XOF", BT: "BTN",
    BO: "BOB", BA: "BAM", BW: "BWP", BR: "BRL", BN: "BND",
    BG: "BGN", BF: "XOF", BI: "BIF", KH: "KHR", CM: "XAF",
    CA: "CAD", CV: "CVE", CF: "XAF", TD: "XAF", CL: "CLP",
    CN: "CNY", CO: "COP", KM: "KMF", CG: "XAF", CD: "CDF",
    CR: "CRC", CI: "XOF", HR: "EUR", CU: "CUP", CY: "EUR",
    CZ: "CZK", DK: "DKK", DJ: "DJF", DM: "XCD", DO: "DOP",
    EC: "USD", EG: "EGP", SV: "USD", GQ: "XAF", ER: "ERN",
    EE: "EUR", SZ: "SZL", ET: "ETB", FJ: "FJD", FI: "EUR",
    FR: "EUR", GA: "XAF", GM: "GMD", GE: "GEL", DE: "EUR",
    GH: "GHS", GR: "EUR", GD: "XCD", GT: "GTQ", GN: "GNF",
    GW: "XOF", GY: "GYD", HT: "HTG", HN: "HNL", HU: "HUF",
    IS: "ISK", IN: "INR", ID: "IDR", IR: "IRR", IQ: "IQD",
    IE: "EUR", IL: "ILS", IT: "EUR", JM: "JMD", JP: "JPY",
    JO: "JOD", KZ: "KZT", KE: "KES", KI: "AUD", KP: "KPW",
    KR: "KRW", KW: "KWD", KG: "KGS", LA: "LAK", LV: "EUR",
    LB: "LBP", LS: "LSL", LR: "LRD", LY: "LYD", LI: "CHF",
    LT: "EUR", LU: "EUR", MG: "MGA", MW: "MWK", MY: "MYR",
    MV: "MVR", ML: "XOF", MT: "EUR", MH: "USD", MR: "MRU",
    MU: "MUR", MX: "MXN", FM: "USD", MD: "MDL", MC: "EUR",
    MN: "MNT", ME: "EUR", MA: "MAD", MZ: "MZN", MM: "MMK",
    NA: "NAD", NR: "AUD", NP: "NPR", NL: "EUR", NZ: "NZD",
    NI: "NIO", NE: "XOF", NG: "NGN", MK: "MKD", NO: "NOK",
    OM: "OMR", PK: "PKR", PW: "USD", PA: "PAB", PG: "PGK",
    PY: "PYG", PE: "PEN", PH: "PHP", PL: "PLN", PT: "EUR",
    QA: "QAR", RO: "RON", RU: "RUB", RW: "RWF", KN: "XCD",
    LC: "XCD", VC: "XCD", WS: "WST", SM: "EUR", ST: "STN",
    SA: "SAR", SN: "XOF", RS: "RSD", SC: "SCR", SL: "SLL",
    SG: "SGD", SK: "EUR", SI: "EUR", SB: "SBD", SO: "SOS",
    ZA: "ZAR", SS: "SSP", ES: "EUR", LK: "LKR", SD: "SDG",
    SR: "SRD", SE: "SEK", CH: "CHF", SY: "SYP", TW: "TWD",
    TJ: "TJS", TZ: "TZS", TH: "THB", TL: "USD", TG: "XOF",
    TO: "TOP", TT: "TTD", TN: "TND", TR: "TRY", TM: "TMT",
    TV: "AUD", UG: "UGX", UA: "UAH", AE: "AED", GB: "GBP",
    US: "USD", UY: "UYU", UZ: "UZS", VU: "VUV", VA: "EUR",
    VE: "VES", VN: "VND", YE: "YER", ZM: "ZMW", ZW: "USD",
  };
  return currencyMap[countryCode.toUpperCase()] || "USD";
}

/** Map a country code to an OpenGraph locale (BCP-47 language tag). */
export function getLocaleFromCountry(countryCode: string): string {
  const localeMap: Record<string, string> = {
    US: "en_US", GB: "en_GB", AU: "en_AU", NZ: "en_NZ",
    IE: "en_IE", ZA: "en_ZA", NG: "en_NG", GH: "en_GH", KE: "en_KE",
    IN: "en_IN", PH: "en_PH", SG: "en_SG", JM: "en_JM",
    CA: "en_CA",
    FR: "fr_FR", BE: "fr_BE", CH: "fr_CH",
    DE: "de_DE", AT: "de_AT",
    ES: "es_ES", MX: "es_MX", AR: "es_AR", CO: "es_CO", CL: "es_CL", PE: "es_PE",
    IT: "it_IT", PT: "pt_PT", BR: "pt_BR",
    NL: "nl_NL",
    PL: "pl_PL", CZ: "cs_CZ", SK: "sk_SK",
    RU: "ru_RU", UA: "uk_UA",
    JP: "ja_JP", KR: "ko_KR", CN: "zh_CN", TW: "zh_TW",
    SA: "ar_SA", AE: "ar_AE", EG: "ar_EG",
    TH: "th_TH", VN: "vi_VN", ID: "id_ID", MY: "ms_MY",
    TR: "tr_TR", GR: "el_GR", IL: "he_IL",
    SE: "sv_SE", NO: "no_NO", DK: "da_DK", FI: "fi_FI",
    HU: "hu_HU", RO: "ro_RO", BG: "bg_BG", HR: "hr_HR",
    LT: "lt_LT", LV: "lv_LV", EE: "et_EE",
  };
  return localeMap[countryCode.toUpperCase()] || "en_US";
}
