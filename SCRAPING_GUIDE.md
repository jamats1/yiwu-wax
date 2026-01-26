# Web Scraping Guide for AfricanFabs

This guide explains the scraping approach and best practices used in this project.

## Overview

The scraper uses **Puppeteer** with stealth plugins to extract product data from AfricanFabs.com. It follows industry best practices for web scraping.

## Architecture

### Tools Used

- **Puppeteer** - Headless browser automation
- **puppeteer-extra** - Extended Puppeteer functionality
- **puppeteer-extra-plugin-stealth** - Avoids detection by anti-bot systems

### Why Puppeteer?

1. **JavaScript Rendering**: AfricanFabs is a Shopify store that loads content dynamically
2. **Full Browser Context**: Can execute JavaScript, handle SPAs, and wait for content
3. **Image Handling**: Can extract images from lazy-loaded galleries
4. **Stealth Mode**: Avoids detection with realistic browser fingerprints

## Best Practices Implemented

### 1. Rate Limiting

```typescript
// Wait 3-5 seconds between products (randomized)
const delayMs = 3000 + Math.random() * 2000;
await delay(delayMs);
```

**Why**: Prevents overwhelming the server and reduces detection risk.

### 2. Stealth Configuration

```typescript
puppeteer.use(StealthPlugin());

await page.setUserAgent(
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36..."
);
```

**Why**: Makes the scraper appear as a real browser, avoiding bot detection.

### 3. Error Handling

- Try-catch blocks around all scraping operations
- Continues processing even if individual products fail
- Logs errors for debugging

### 4. Data Validation

- Checks for required fields before saving
- Validates image URLs
- Sanitizes product titles and descriptions

### 5. Efficient Resource Management

- Closes browser after completion
- Uses `networkidle2` to wait for page load
- Limits image downloads to first 5 per product

## Scraping Flow

1. **Collect Product URLs**
   - Navigate through pagination
   - Extract all product links
   - Deduplicate URLs

2. **Scrape Product Details**
   - Visit each product page
   - Extract: title, price, images, description, availability
   - Handle multiple image variants

3. **Save Data**
   - Export to JSON format
   - Ready for Sanity import

## Running the Scraper

```bash
# Install dependencies
pnpm install

# Run scraper
pnpm scrape
```

**Output**: `data/scraped-products.json`

## Data Structure

```typescript
interface Product {
  title: string;
  slug: string;
  price: number;
  currency: string;
  pricePerYard: string;
  images: string[];        // Full-resolution image URLs
  description: string;
  availability: "in_stock" | "sold_out";
  category: string;
  colors: string[];
  material: string;
  url: string;
  sku?: string;
}
```

## Handling Challenges

### 1. Dynamic Content Loading

**Solution**: Use `waitForSelector` and `networkidle2` to ensure content is loaded.

### 2. Image Extraction

**Solution**: 
- Multiple selector strategies
- Extract from `src` attributes
- Upgrade to higher resolution (remove size constraints)

### 3. Pagination

**Solution**: 
- Detect next page button
- Loop through all pages
- Set maximum page limit as safety

### 4. Rate Limiting & Detection

**Solution**:
- Randomized delays
- Stealth plugin
- Realistic user agent
- Respectful scraping speed

## Ethical Considerations

1. **Respect robots.txt** - Check before scraping
2. **Rate Limiting** - Don't overwhelm servers
3. **Terms of Service** - Review website ToS
4. **Data Usage** - Only use for legitimate purposes
5. **Attribution** - Credit original source if required

## Troubleshooting

### Scraper Gets Blocked

- Increase delays between requests
- Use proxy rotation (not implemented, but can be added)
- Check if site has changed structure

### Missing Images

- Verify image selectors are correct
- Check if images are lazy-loaded
- Wait longer for content to load

### Incomplete Data

- Verify selectors match current site structure
- Check for JavaScript errors in console
- Review error logs

## Future Improvements

1. **Proxy Support** - Rotate IPs for large-scale scraping
2. **Retry Logic** - Automatic retries for failed requests
3. **Incremental Updates** - Only scrape new/changed products
4. **Image Optimization** - Compress images before upload
5. **Monitoring** - Track scraping success rates

## Legal Disclaimer

This scraper is for educational purposes. Always:
- Check website's Terms of Service
- Respect robots.txt
- Obtain permission for commercial use
- Use scraped data responsibly
