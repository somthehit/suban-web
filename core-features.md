You are a senior full-stack engineer, software architect, and premium web designer. Build a complete, production-grade website for a professional wildlife photographer: showcase work, sell photos and digital products under flexible licenses, deliver paid files securely, and publish articles.

Build in PHASES (section 12). Finish one phase, summarize what was built, and wait for my confirmation before starting the next. Ask clarifying questions only if something is critical.

## 1. BRAND & DESIGN

- Brand: SUBAN Photography, specializing in [e.g. Himalayan wildlife, birds, tigers, rhinos]
- Tone: premium, cinematic, editorial (National Geographic meets modern gallery)
- Dark theme by default, optional light mode
- Typography: elegant serif for headings (Playfair Display / Cormorant), clean sans-serif for body (Inter)
- Full-bleed hero (slow-fade slideshow or video), masonry gallery, smooth hover/zoom, subtle scroll animations (Framer Motion)
- Lightbox with keyboard/swipe navigation
- Mobile-first, fast: lazy loading, WebP/AVIF, blur-up placeholders

## 2. SITE STRUCTURE

Public website:

- Home, Gallery, Shop, Collections, Photo detail, Blog, About, Contact, Licensing, FAQ, Legal (Terms, Privacy, Refund policy)

Customer area:

- Dashboard, Orders, Downloads, Favorites, Licenses, Profile

Admin:

- Dashboard, Photos, Products, Collections, Orders, Customers, Downloads, Blog, Discounts, Payments, Analytics, Media Processing, Watermark, Homepage CMS, Audit Log, Settings

## 3. CORE ARCHITECTURE: PRODUCTS + MEDIA

Do NOT make "photo" the central entity. Use Products + Media:

Product
├── Media (original, preview, thumbnail, web, large preview, watermarked preview, social/OG image)
├── Variants (Personal, Commercial, Editorial, Extended license)
├── Physical options (Print, Canvas, Framed, with shipping)
└── Metadata (species, location, EXIF, camera, conservation)

Product types, each with its own license and download rules:

- Photograph
- Lightroom preset
- E-book
- Video clip
- Tutorial
- Workshop (booking)

Tables (minimum): users, roles, products, product_variants, licenses, license_features, prices, media, media_versions, photo_metadata, collections, collection_items, carts, cart_items, abandoned_cart_events, orders, order_items, payments, downloads, favorites, user_collections, posts, categories, tags, homepage_sections, discount_codes, watermark_settings, audit_logs.

## 4. WILDLIFE METADATA & LOCATION PRIVACY

Per photo store: species, scientific name, family, habitat, conservation status, location, country, date photographed, camera, lens, ISO, aperture, shutter speed (auto-read EXIF where possible).

Location privacy (important for protecting sensitive species):

- gps_lat, gps_lng (stored privately, never exposed publicly by default)
- gps_visibility (private / approximate / public)
- location_precision (exact / region / national park / country)
- Public pages show only the safe version, e.g. "Chitwan, Nepal" instead of exact coordinates
- Strip GPS EXIF data from all public previews and free downloads

## 5. IMAGE PROCESSING PIPELINE (ASYNC)

Never process images synchronously during upload.

Upload original → private R2 bucket → background processing job → Sharp generates:

- Thumbnail
- Web size
- Large preview
- Watermarked preview
- Social/OG image
→ public CDN serves only derived, watermarked files

Media status: UPLOADING, PROCESSING, READY, FAILED, ARCHIVED (with retry for failed jobs and progress shown in admin for bulk uploads).

Versioning: if an original is replaced, keep Original v1, v2, ... and a "current" pointer. Existing purchases must stay traceable to the exact version bought.

## 6. WATERMARK SYSTEM (ADMIN-CONFIGURABLE)

Admin controls: logo, text, opacity, position, size, repeat/tiled mode, margin, preview quality, with a live preview. Watermarks are applied server-side only (Sharp), never client-side.

## 7. FREE vs PAID DOWNLOAD RULES

FREE photos:

- Anyone can download (optionally after entering an email, which feeds the newsletter list with consent)
- File is automatically watermarked, medium resolution, GPS stripped

PAID products:

- Public site serves ONLY low-res watermarked previews
- Originals live in a private bucket, never exposed by public URL
- No original URLs in HTML, source, or API responses
- Image proxy for previews, right-click/drag disabled, protective overlay
- Optional invisible digital fingerprint (buyer ID) in delivered files

## 8. SECURE DOWNLOAD SERVICE

Use a dedicated download service, not a raw signed URL:

Download request → authenticate → check order → check license → check download limit → generate short-lived signed URL → private R2 object

Rules: links expire (e.g. 24h), limited downloads (e.g. 3-5), tied to the logged-in buyer.
Log every attempt: user, order, product, IP, user-agent, timestamp, download number, success/failure.

## 9. COMMERCE & PAYMENTS

- Cart, Buy Now, checkout, abandoned-cart tracking (for reminder emails later)
- License tiers per product with different prices; optional print/canvas/framed with shipping fields
- Multi-currency display (NPR / USD)
- Discount codes and bundles (e.g. buy 5 get 10% off)
- Auto-generated PDF invoice and license certificate per purchase
- Order/payment emails via Resend or Nodemailer

Payment provider abstraction (no payment logic scattered through the app):
PaymentService
├── StripeProvider
├── PayPalProvider
├── EsewaProvider
├── KhaltiProvider
└── FonepayProvider

Order state machine (never a simple paid=true):
PENDING → PAYMENT_PROCESSING → PAID, or FAILED / CANCELLED / REFUNDED / DISPUTED

Payment verification must be webhook/server-side. Never trust client-side success. Handle idempotency and duplicate webhooks.

## 10. CMS, BLOG & HOMEPAGE

- Homepage sections fully manageable from admin (no hard-coded content): Hero, Featured Collections, Featured Photos, Best Sellers, Latest Articles, About, Newsletter, CTA; reorder and show/hide each
- Blog: TipTap or MDX editor, categories, tags, cover image, reading time, share buttons, related posts, draft/publish/schedule, SEO fields
- Favorites/wishlist, plus optional private user collections
- Newsletter signup

## 11. AUTH, ROLES, SECURITY & SEO

Auth.js: email/password, Google OAuth, email verification, password reset, optional 2FA for admin.
Roles: CUSTOMER, EDITOR, ADMIN, SUPER_ADMIN. Enforce role checks server-side on every admin route and API. Being logged in must never be enough to access admin.

Audit log events: ADMIN_LOGIN, PHOTO_UPLOADED, PHOTO_UPDATED, PHOTO_DELETED, PRICE_CHANGED, ORDER_REFUNDED, LICENSE_CHANGED, DOWNLOAD_CREATED, USER_SUSPENDED.

Security: rate limiting, input validation (Zod), CSRF protection, security headers, secure error handling.
SEO/performance: SSR, dynamic sitemap, Open Graph/Twitter cards, schema.org (ImageObject, Article), alt text everywhere, image CDN and caching, Lighthouse 90+, analytics (Plausible/GA), cookie consent.

## 12. TECH STACK

- Next.js (App Router) + TypeScript + Tailwind CSS + Framer Motion
- Next.js API routes/server actions (or Node.js + Express if needed)
- PostgreSQL + Drizzle ORM
- Cloudflare R2 (private originals, public derived files) + Sharp
- Background jobs for image processing (e.g. Inngest, Trigger.dev, or BullMQ)
- Auth.js, Zod
- Hosting: Vercel + Neon/Supabase

## 13. BUILD PHASES (confirm after each)

Phase 1, Foundation: project structure, DB architecture, Drizzle schema, env config, Auth + RBAC
Phase 2, Photography engine: product/media model, R2 storage, Sharp pipeline, watermark engine, gallery, photo detail, collections
Phase 3, Commerce: cart, checkout, Stripe/PayPal, eSewa/Khalti/Fonepay, orders, licenses, secure downloads, invoice + license certificate
Phase 4, Content: blog CMS, SEO, newsletter, homepage CMS
Phase 5, Admin: upload manager, product manager, order manager, customer manager, analytics, download/audit logs
Phase 6, Production hardening: rate limiting, security headers, CSRF, validation, error handling, caching, image CDN, Lighthouse optimization, deployment

## 14. DELIVERABLES (per phase)

1. Folder structure and schema changes
2. Complete working code, file by file, in build order
3. .env.example with all keys
4. Setup/deployment notes
5. Seed data (sample photos, posts, licenses)
6. At the end: a short guide on how I upload and sell my first photo

****************************************************
                         SUBAN PHOTOGRAPHY
                                │
                ┌───────────────┴───────────────┐
                │                               │
          PUBLIC / CUSTOMER                 ADMIN SYSTEM
                │                               │
      ┌─────────┴─────────┐              ┌──────┴──────┐
      │                   │              │             │
   Visitor             Customer       Admin        Super Admin
      │                   │              │             │
      │             ┌─────┴─────┐       │             │
      │             │           │       │             │
      │          Google      Email      │             │
      │          OAuth     + Password   │             │
      │             │           │       │             │
      └─────────────┴───────────┘       │             │
                    │                   │             │
                    ▼                   ▼             ▼
              CUSTOMER AUTH        ADMIN AUTH    ADMIN AUTH
                    │                   │             │
                    └──────────┬────────┴─────────────┘
                               ▼
                         AUTH SERVICE
                               │
                  ┌────────────┴────────────┐
                  │                         │
             PostgreSQL                  Redis
                  │                         │
             Users/Roles              Sessions/Rate
             OAuth Accounts            Limits/Locks
             Sessions

*************************************************
VISITOR
   │
   ├── Browse website ────────────────┐
   │                                  │
   └── Login/Register                 │
          │                           │
          ├── Email + Password        │
          │                           │
          └── Google OAuth            │
                 │                    │
                 ▼                    │
          Google verifies             │
                 │                    │
                 ▼                    │
          Existing customer?          │
             │       │                │
            YES      NO               │
             │       │                │
             │       ▼                │
             │   Create CUSTOMER      │
             │       │                │
             │       ▼                │
             │   Create website       │
             │   password             │
             │       │                │
             └───────┴────────────────┘
                     │
                     ▼
              CUSTOMER SESSION
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
       Profile     Orders    Downloads

***********************************************
                    PUBLIC WEBSITE
                          │
                          ▼
                  ┌───────────────┐
                  │ Login / Signup│
                  └───────┬───────┘
                          │
                 "Continue with Google"
                          │
                          ▼
                 ┌─────────────────┐
                 │ Google OAuth    │
                 │ Authorization  │
                 └────────┬────────┘
                          │
                   User approves
                          │
                          ▼
                 Google callback
                          │
                          ▼
              Verify Google identity
                          │
                          ▼
              Find user by Google ID
                          │
                 ┌────────┴────────┐
                 │                 │
              EXISTS           NOT EXISTS
                 │                 │
                 ▼                 ▼
          Create session      Create customer
                 │                 │
                 │                 ▼
                 │       ┌──────────────────┐
                 │       │ First Google     │
                 │       │ Login?           │
                 │       └────────┬─────────┘
                 │                │
                 │                ▼
                 │       "Create Password"
                 │                │
                 │       Password + Confirm
                 │                │
                 │                ▼
                 │       Save passwordHash
                 │                │
                 └────────┬────────┘
                          ▼
                   Create session
                          │
                          ▼
                  Customer Dashboard

******************************************************************
Payment Providers: Stripe, PayPal, eSewa, Khalti, Fonepay
Payment Intent → Paid Order → License → Download
******************************************************************
                     PUBLIC / CUSTOMER
                           │
                           ▼
             ProductDetail Page (Free/Paid)
                           │
            ┌───────────────┴───────────────┐
            │                               │
        FREE Product                    PAID Product
            │                               │
            ▼                               ▼
        Watermarked                     Watermarked
        preview only                    preview only
            │                               │
            ▼                               ▼
   "Download Free Photo"
            │                               │
   ┌────────┴────────┐
   │                 │
   NO Email/Login   WITH Email/Login
   (direct)              │
      │                  ▼
      │           Email captured
      │                  │
      │          Newsletter consent? (optional)
      │                  │
      │                  ▼
      │          Newsletter subscription
      │                  │
      │                  ▼
      └──────────────────┘
      │
      ▼
   Download with
   watermarked file
      │
      ▼
   Download Logged

************************************************************************
                 CUSTOMER ACCOUNT → DOWNLOADS
                                │
                                ▼
                       List All Downloads
                                │
       ┌───────────────────────┼───────────────────────┐
       ▼                       ▼                       ▼
┌──────────┐        ┌────────────┐        ┌───────────────┐
│    Free    │        │   Personal │        │  Commercial   │
│  License   │        │  License   │        │  License      │
└──────────┘        └────────────┘        └───────────────┘
       │                       │                       │
       ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────┐
│              Show download history only               │
│              No access to original files              │
│              No access to license details           │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
                    Order History → No Downloads

******************************************************************
