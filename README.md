# Yiwu Wax - African Fabrics E-commerce

E-commerce platform for African fabrics, built with Next.js 16, Sanity CMS, Clerk authentication, and Stripe payments.

## Features

- 🛍️ Product catalog with categories and filters
- 🛒 Shopping cart with persistent storage
- 💳 Stripe checkout integration
- 🔐 Clerk authentication
- 📦 Sanity CMS for content management
- 📱 Responsive design
- 🕷️ Web scraping with Puppeteer

## Tech Stack

- **Next.js 16** - React framework with App Router
- **Sanity** - Headless CMS
- **Clerk** - Authentication
- **Stripe** - Payments
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety
- **Puppeteer** - Web scraping
- **Zustand** - State management

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)
- Sanity account ([Get Started](https://www.sanity.io))
- Clerk account ([Get Started](https://clerk.com))
- Stripe account ([Get Started](https://stripe.com))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd yiwu-wax
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env.local` and fill in your values:
   ```bash
   cp .env.example .env.local
   ```

   Required variables:
   - `NEXT_PUBLIC_SANITY_PROJECT_ID` - Your Sanity project ID
   - `NEXT_PUBLIC_SANITY_DATASET` - Your Sanity dataset (usually "production")
   - `SANITY_API_WRITE_TOKEN` - Sanity API token with write permissions
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
   - `CLERK_SECRET_KEY` - Clerk secret key
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
   - `STRIPE_SECRET_KEY` - Stripe secret key
   - `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret

4. **Set up Sanity**
   
   Deploy your schema:
   ```bash
   npx sanity@latest deploy
   ```

5. **Scrape product data**
   ```bash
   pnpm scrape
   ```
   
   This will scrape products from AfricanFabs.com and save to `data/scraped-products.json`.
   ⚠️ **Note**: Scraping may take 30-60 minutes for ~400 products due to rate limiting.

6. **Import data to Sanity**
   ```bash
   pnpm import
   ```
   
   This uploads images and creates product documents in Sanity.

7. **Run development server**
   ```bash
   pnpm dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/                # API routes (checkout, webhooks)
│   ├── cart/              # Shopping cart page
│   ├── checkout/           # Checkout pages
│   ├── products/           # Product pages
│   └── layout.tsx          # Root layout
├── components/             # React components
│   ├── AddToCartButton.tsx
│   └── Navigation.tsx
├── lib/                    # Utilities and helpers
│   ├── store/             # Zustand stores
│   └── sanity/            # Sanity client
├── sanity/                 # Sanity configuration
│   ├── schemaTypes/       # Document schemas
│   └── lib/               # Sanity utilities
├── scripts/                # Scraping and import scripts
│   ├── scrape-products.ts
│   └── import-to-sanity.ts
└── public/                 # Static assets
```

## Scraping Guide

The scraper uses Puppeteer with stealth plugins to extract product data. See [SCRAPING_GUIDE.md](./SCRAPING_GUIDE.md) for detailed information.

**Key Features:**
- Rate limiting (3-5 seconds between requests)
- Stealth mode to avoid detection
- Error handling and retries
- Data validation
- Image extraction with high-resolution URLs

**Run scraper:**
```bash
pnpm scrape
```

**Output:** `data/scraped-products.json`

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm scrape` - Scrape products from AfricanFabs
- `pnpm import` - Import scraped data to Sanity

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add all environment variables
4. Deploy!

### Environment Variables for Production

Make sure to set all environment variables in your hosting platform:
- Sanity credentials
- Clerk keys
- Stripe keys (use production keys)
- Stripe webhook secret (from Stripe dashboard)

### Stripe Webhook Setup

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events: `checkout.session.completed`
4. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

## License

See LICENSE file.

## Acknowledgments

- Product data scraped from [AfricanFabs.com](https://africanfabs.com)
- Built with reference to [ecommerce-ai-nextjs-16-sanity-clerk-agentkit-stripe-checkout-vercel-ai-agents](https://github.com/sonnysangha/ecommerce-ai-nextjs-16-sanity-clerk-agentkit-stripe-checkout-vercel-ai-agents)
