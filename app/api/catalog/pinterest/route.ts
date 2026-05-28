// Pinterest Catalogs accept the same Google Merchant Center XML format.
// This endpoint proxies /api/catalog/google so you can register a separate
// URL in Pinterest Business Hub without coupling the two platforms.
export { GET } from "../google/route";
