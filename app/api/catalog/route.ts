import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/site-url";

export async function GET() {
  const base = getSiteUrl();

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Yiwu Wax — Product Catalog Feeds</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 780px; margin: 40px auto; padding: 0 20px; color: #111; }
    h1 { font-size: 1.6rem; margin-bottom: 4px; }
    p.sub { color: #555; margin-top: 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 24px; }
    th { text-align: left; padding: 10px 12px; background: #f5f5f5; border-bottom: 2px solid #ddd; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; }
    td { padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 0.9rem; vertical-align: top; }
    code { background: #f0f0f0; padding: 2px 6px; border-radius: 4px; font-size: 0.85em; word-break: break-all; }
    .tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; margin-bottom: 2px; }
    .csv { background: #e0f2f1; color: #00695c; }
    .xml { background: #e3f2fd; color: #1565c0; }
    section { margin-top: 36px; }
    h2 { font-size: 1.1rem; margin-bottom: 8px; }
    ol li { margin-bottom: 6px; font-size: 0.9rem; }
    a { color: #1565c0; }
  </style>
</head>
<body>
  <h1>Yiwu Wax — Product Catalog Feeds</h1>
  <p class="sub">Live product feeds for social commerce and shopping platforms. Refresh every hour.</p>

  <table>
    <thead>
      <tr>
        <th>Platform</th>
        <th>Format</th>
        <th>Feed URL</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Meta</strong><br/><small>Facebook &amp; Instagram Shopping</small></td>
        <td><span class="tag csv">CSV</span></td>
        <td><code><a href="${base}/api/catalog/meta">${base}/api/catalog/meta</a></code></td>
      </tr>
      <tr>
        <td><strong>TikTok Shop</strong></td>
        <td><span class="tag csv">CSV</span></td>
        <td><code><a href="${base}/api/catalog/meta">${base}/api/catalog/meta</a></code><br/><small>Same feed as Meta</small></td>
      </tr>
      <tr>
        <td><strong>Google Merchant Center</strong><br/><small>Google Shopping &amp; Performance Max</small></td>
        <td><span class="tag xml">XML / RSS</span></td>
        <td><code><a href="${base}/api/catalog/google">${base}/api/catalog/google</a></code></td>
      </tr>
      <tr>
        <td><strong>Pinterest Catalogs</strong></td>
        <td><span class="tag xml">XML / RSS</span></td>
        <td><code><a href="${base}/api/catalog/pinterest">${base}/api/catalog/pinterest</a></code></td>
      </tr>
    </tbody>
  </table>

  <section>
    <h2>Setup: Meta (Facebook &amp; Instagram)</h2>
    <ol>
      <li>Go to <strong>Meta Commerce Manager</strong> → Catalog → Data Sources → Add.</li>
      <li>Choose <em>Use a data feed</em> → <em>Scheduled feed</em>.</li>
      <li>Paste the CSV URL above. Set schedule to <strong>Hourly</strong>.</li>
      <li>Map fields: <em>id, title, description, availability, condition, price, link, image_link</em> — they match automatically.</li>
      <li>Connect the catalog to your Facebook Page and Instagram account in <em>Sales channels</em>.</li>
    </ol>
  </section>

  <section>
    <h2>Setup: Google Merchant Center</h2>
    <ol>
      <li>Go to <strong>Google Merchant Center</strong> → Products → Feeds → Add feed.</li>
      <li>Choose <em>Scheduled fetch</em> → paste the XML URL above.</li>
      <li>Set fetch frequency to <strong>Daily</strong> or <strong>Every 4 hours</strong>.</li>
      <li>After approval, link to a Google Ads account to run Shopping or Performance Max campaigns.</li>
    </ol>
  </section>

  <section>
    <h2>Setup: Pinterest Catalogs</h2>
    <ol>
      <li>Go to <strong>Pinterest Business Hub</strong> → Catalogs → Create catalog.</li>
      <li>Choose <em>RSS / ATOM feed</em> and paste the Pinterest XML URL above.</li>
      <li>Pinterest will sync the catalog and enable Product Pins on your posts.</li>
    </ol>
  </section>

  <section>
    <h2>Setup: TikTok Shop</h2>
    <ol>
      <li>Go to <strong>TikTok Seller Center</strong> → Products → Bulk Import → URL import.</li>
      <li>Paste the CSV URL (same as Meta). Map columns as prompted.</li>
    </ol>
  </section>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
