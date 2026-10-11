import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import { eq } from "drizzle-orm";
import * as schema from "./schema";

dotenv.config({ path: ".env.local" });
dotenv.config();

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/suban_wildlife";

async function runSeed() {
  console.log("🌱 Starting SUBAN Photography database seed...");

  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client, { schema });

  try {
    // 1. Roles
    console.log("Creating RBAC roles...");
    const roleMap: Record<string, string> = {};

    const baseRoles = [
      { name: "SUPER_ADMIN", description: "Full root access to all system features and configuration" },
      { name: "ADMIN", description: "Operational manager for store, products, licenses and media" },
      { name: "EDITOR", description: "Content creator for articles and media descriptions" },
      { name: "CUSTOMER", description: "Registered collector with order history and download access" },
    ];

    for (const r of baseRoles) {
      const existing = await db
        .select()
        .from(schema.roles)
        .where(eq(schema.roles.name, r.name))
        .limit(1);

      if (existing.length > 0) {
        roleMap[r.name] = existing[0].id;
      } else {
        const [inserted] = await db
          .insert(schema.roles)
          .values({
            name: r.name,
            description: r.description,
            permissions: [],
          })
          .returning();
        roleMap[r.name] = inserted.id;
      }
    }

    // 2. Default Users
    console.log("Creating default users with bcrypt hashes...");
    const adminPasswordHash = await bcrypt.hash("Admin@123456", 10);
    const editorPasswordHash = await bcrypt.hash("Editor@123456", 10);
    const customerPasswordHash = await bcrypt.hash("Customer@123456", 10);

    const usersToCreate = [
      {
        name: "Suban (Wildlife Master)",
        email: "admin@subanphotography.com",
        passwordHash: adminPasswordHash,
        roleId: roleMap["SUPER_ADMIN"],
        status: "active",
      },
      {
        name: "Editorial Curator",
        email: "editor@subanphotography.com",
        passwordHash: editorPasswordHash,
        roleId: roleMap["EDITOR"],
        status: "active",
      },
      {
        name: "Neon Collector",
        email: "collector@gmail.com",
        passwordHash: customerPasswordHash,
        roleId: roleMap["CUSTOMER"],
        status: "active",
      },
    ];

    for (const u of usersToCreate) {
      const exists = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, u.email))
        .limit(1);

      if (exists.length === 0) {
        await db.insert(schema.users).values(u);
      }
    }

    // 3. Licenses & Features
    console.log("Creating license tiers...");
    const licenseData = [
      {
        name: "Personal Use License",
        slug: "personal-use",
        description: "Ideal for personal desktop wallpaper, screensavers, and private home displays. No commercial exploitation permitted.",
        isCommercial: false,
        isEditorial: false,
        isExclusive: false,
        maxImpressions: 1,
        canResell: false,
        features: [
          { name: "Permitted Use", value: "Personal non-commercial projects", isIncluded: true },
          { name: "Display Format", value: "Digital screens, personal mobile/desktop", isIncluded: true },
          { name: "Commercial Resale", value: "Strictly prohibited", isIncluded: false },
          { name: "Advertising", value: "Not permitted", isIncluded: false },
        ],
      },
      {
        name: "Editorial License",
        slug: "editorial-standard",
        description: "For educational articles, wildlife journals, non-fiction documentaries, and non-monetized editorial publications.",
        isCommercial: false,
        isEditorial: true,
        isExclusive: false,
        maxImpressions: 50000,
        canResell: false,
        features: [
          { name: "Permitted Use", value: "Newspapers, magazines, educational blogs", isIncluded: true },
          { name: "Max Impressions", value: "Up to 50,000 readers/views", isIncluded: true },
          { name: "Credit Line", value: "Photo by SUBAN Photography (Mandatory)", isIncluded: true },
          { name: "Merchandise Resale", value: "Strictly prohibited", isIncluded: false },
        ],
      },
      {
        name: "Commercial Standard License",
        slug: "commercial-standard",
        description: "For digital marketing, brand campaigns, corporate websites, and social media promotions.",
        isCommercial: true,
        isEditorial: false,
        isExclusive: false,
        maxImpressions: 250000,
        canResell: false,
        features: [
          { name: "Permitted Use", value: "Commercial advertising, websites & apps", isIncluded: true },
          { name: "Impression Cap", value: "Up to 250,000 digital impressions", isIncluded: true },
          { name: "Social Media Ads", value: "Full worldwide usage", isIncluded: true },
          { name: "Print Run Cap", value: "Up to 10,000 physical copies", isIncluded: true },
        ],
      },
      {
        name: "Extended Commercial License",
        slug: "extended-commercial",
        description: "Unlimited worldwide print and digital campaigns, billboard displays, and physical product incorporation.",
        isCommercial: true,
        isEditorial: false,
        isExclusive: false,
        maxImpressions: null,
        canResell: true,
        features: [
          { name: "Permitted Use", value: "Unlimited worldwide commercial campaigns", isIncluded: true },
          { name: "Impression Cap", value: "Unlimited impressions", isIncluded: true },
          { name: "Physical Merchandise", value: "Posters, calendars, book covers", isIncluded: true },
          { name: "Sublicensing", value: "Allowed under master agreement", isIncluded: true },
        ],
      },
    ];

    const licenseIdMap: Record<string, string> = {};

    for (const lic of licenseData) {
      const existing = await db
        .select()
        .from(schema.licenses)
        .where(eq(schema.licenses.slug, lic.slug))
        .limit(1);

      let licId: string;
      if (existing.length > 0) {
        licId = existing[0].id;
      } else {
        const [inserted] = await db
          .insert(schema.licenses)
          .values({
            name: lic.name,
            slug: lic.slug,
            description: lic.description,
            isCommercial: lic.isCommercial,
            isEditorial: lic.isEditorial,
            isExclusive: lic.isExclusive,
            maxImpressions: lic.maxImpressions,
            canResell: lic.canResell,
          })
          .returning();
        licId = inserted.id;

        for (const feat of lic.features) {
          await db.insert(schema.licenseFeatures).values({
            licenseId: licId,
            featureName: feat.name,
            featureValue: feat.value,
            isIncluded: feat.isIncluded,
          });
        }
      }
      licenseIdMap[lic.slug] = licId;
    }

    // 4. Products & Photography Engine
    console.log("Creating wildlife products, media and variants...");
    const samplePhotos = [
      {
        title: "The Royal Predator of Chitwan",
        slug: "royal-bengal-tiger-chitwan",
        description: "Captured during dawn patrol in the sal forests of Chitwan. A magnificent Bengal tiger steps silently through tall elephant grass, gaze locked with unwavering intensity.",
        productType: "photograph",
        imageUrl: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=1800&q=85",
        species: "Bengal Tiger",
        scientificName: "Panthera tigris tigris",
        family: "Felidae",
        habitat: "Subtropical Grassland and Sal Forest",
        conservationStatus: "Endangered",
        locationName: "Chitwan National Park, Nepal",
        country: "Nepal",
        camera: "Sony A1",
        lens: "FE 600mm f/4 GM OSS",
        focalLength: "600mm",
        iso: 800,
        aperture: "f/4.0",
        shutterSpeed: "1/2000s",
        usdPrice: "149.00",
        nprPrice: "19900.00",
      },
      {
        title: "Armored Monarch of the Mist",
        slug: "greater-one-horned-rhino-nepal",
        description: "Emerging from the early morning mist beside the Rapti River, this prehistoric Greater One-Horned Rhino showcases its signature skin folds and solitary aura.",
        productType: "photograph",
        imageUrl: "https://images.unsplash.com/photo-1575550959106-5a7defe28b56?auto=format&fit=crop&w=1800&q=85",
        species: "Greater One-Horned Rhinoceros",
        scientificName: "Rhinoceros unicornis",
        family: "Rhinocerotidae",
        habitat: "Alluvial Floodplain Grasslands",
        conservationStatus: "Vulnerable",
        locationName: "Bardia National Park, Nepal",
        country: "Nepal",
        camera: "Nikon Z9",
        lens: "NIKKOR Z 400mm f/2.8 TC VR S",
        focalLength: "400mm",
        iso: 1250,
        aperture: "f/2.8",
        shutterSpeed: "1/1600s",
        usdPrice: "129.00",
        nprPrice: "17200.00",
      },
      {
        title: "Ghost of the Trans-Himalayas",
        slug: "snow-leopard-spiti-valley",
        description: "Perched high on a jagged limestone ridge at 4,600 meters elevation. A pristine encounter with the rarest and most enigmatic big cat on earth.",
        productType: "photograph",
        imageUrl: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=1800&q=85",
        species: "Snow Leopard",
        scientificName: "Panthera uncia",
        family: "Felidae",
        habitat: "Alpine and Subalpine Rugged Cliffs",
        conservationStatus: "Vulnerable",
        locationName: "Manang / Annapurna Conservation Area",
        country: "Nepal",
        camera: "Sony A1",
        lens: "FE 400mm f/2.8 GM OSS + 1.4x Teleconverter",
        focalLength: "560mm",
        iso: 640,
        aperture: "f/4.0",
        shutterSpeed: "1/2500s",
        usdPrice: "199.00",
        nprPrice: "26500.00",
      },
      {
        title: "Kaleidoscope of High Altitudes",
        slug: "himalayan-monal-danphe-nepal",
        description: "Nepal's national bird, the Himalayan Monal (Danphe), displaying an iridescent metallic sheen reflecting the morning sun against snow-capped peaks.",
        productType: "photograph",
        imageUrl: "https://images.unsplash.com/photo-1618886614638-80e3c15cd819?auto=format&fit=crop&w=1800&q=85",
        species: "Himalayan Monal",
        scientificName: "Lophophorus impejanus",
        family: "Phasianidae",
        habitat: "Oak-Conifer Forests and Alpine Slopes",
        conservationStatus: "Least Concern",
        locationName: "Langtang National Park, Nepal",
        country: "Nepal",
        camera: "Canon EOS R5",
        lens: "RF 600mm f/4L IS USM",
        focalLength: "600mm",
        iso: 500,
        aperture: "f/4.0",
        shutterSpeed: "1/3200s",
        usdPrice: "99.00",
        nprPrice: "13200.00",
      },
      {
        title: "Shadows of the Bamboo Canopy",
        slug: "red-panda-ilam-cloud-forest",
        description: "Resting serenely among moss-covered branches in the Eastern Himalayan cloud forests of Ilam. An arboreal jewel in its native rhododendron ecosystem.",
        productType: "photograph",
        imageUrl: "https://images.unsplash.com/photo-1544943910-4c1dc44a0701?auto=format&fit=crop&w=1800&q=85",
        species: "Red Panda",
        scientificName: "Ailurus fulgens",
        family: "Ailuridae",
        habitat: "Temperate Broadleaf and Coniferous Forests",
        conservationStatus: "Endangered",
        locationName: "Ilam Highlands, Nepal",
        country: "Nepal",
        camera: "Sony A7R V",
        lens: "FE 200-600mm f/5.6-6.3 G OSS",
        focalLength: "500mm",
        iso: 1600,
        aperture: "f/6.3",
        shutterSpeed: "1/800s",
        usdPrice: "119.00",
        nprPrice: "15900.00",
      },
      {
        title: "Dawn Crossing at Rapti River",
        slug: "asian-elephant-herd-crossing",
        description: "A wild matriarch leading her family across golden, sun-drenched waters as river vapors dance in the cool Himalayan foothill breeze.",
        productType: "photograph",
        imageUrl: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=1800&q=85",
        species: "Asian Elephant",
        scientificName: "Elephas maximus",
        family: "Elephantidae",
        habitat: "Tropical Monsoon Forests and Riverine Belts",
        conservationStatus: "Endangered",
        locationName: "Chitwan National Park, Nepal",
        country: "Nepal",
        camera: "Nikon Z8",
        lens: "NIKKOR Z 70-200mm f/2.8 VR S",
        focalLength: "135mm",
        iso: 400,
        aperture: "f/4.5",
        shutterSpeed: "1/1000s",
        usdPrice: "139.00",
        nprPrice: "18500.00",
      },
    ];

    for (const item of samplePhotos) {
      const existingProduct = await db
        .select()
        .from(schema.products)
        .where(eq(schema.products.slug, item.slug))
        .limit(1);

      if (existingProduct.length === 0) {
        const [prod] = await db
          .insert(schema.products)
          .values({
            title: item.title,
            slug: item.slug,
            description: item.description,
            productType: item.productType,
            status: "published",
            isFeatured: true,
          })
          .returning();

        // Create Media
        const [med] = await db
          .insert(schema.media)
          .values({
            productId: prod.id,
            title: item.title,
            originalFilename: `${item.slug}.raw`,
            mimeType: "image/jpeg",
            fileSize: 48920110,
            width: 8256,
            height: 5504,
            aspectRatio: "3:2",
            status: "READY",
          })
          .returning();

        // Create Media Versions
        await db.insert(schema.mediaVersions).values({
          mediaId: med.id,
          versionNumber: 1,
          originalKey: `originals/${med.id}/master.raw`,
          thumbnailKey: item.imageUrl,
          webKey: item.imageUrl,
          largePreviewKey: item.imageUrl,
          watermarkedKey: item.imageUrl,
          socialKey: item.imageUrl,
          isCurrent: true,
        });

        // Link primaryMediaId
        await db
          .update(schema.products)
          .set({ primaryMediaId: med.id })
          .where(eq(schema.products.id, prod.id));

        // Create Photo Metadata (Safe location publicly, hidden GPS coordinates)
        await db.insert(schema.photoMetadata).values({
          mediaId: med.id,
          species: item.species,
          scientificName: item.scientificName,
          family: item.family,
          habitat: item.habitat,
          conservationStatus: item.conservationStatus,
          locationName: item.locationName,
          country: item.country,
          locationPrecision: "national_park",
          gpsLat: "27.5341200",
          gpsLng: "84.4532100",
          gpsVisibility: "private",
          camera: item.camera,
          lens: item.lens,
          focalLength: item.focalLength,
          iso: item.iso,
          aperture: item.aperture,
          shutterSpeed: item.shutterSpeed,
        });

        // Create Digital License Variant
        const [varLic] = await db
          .insert(schema.productVariants)
          .values({
            productId: prod.id,
            licenseId: licenseIdMap["commercial-standard"],
            variantType: "digital_license",
            name: "High-Resolution Digital License (Commercial)",
            sku: `DIG-${item.slug.slice(0, 8).toUpperCase()}-COM`,
            isDigital: true,
            shippingRequired: false,
            dimensions: "8256 x 5504 px (300 DPI)",
            isActive: true,
          })
          .returning();

        // Prices for variant
        await db.insert(schema.prices).values([
          {
            variantId: varLic.id,
            currency: "USD",
            amount: item.usdPrice,
            compareAtAmount: (parseFloat(item.usdPrice) * 1.3).toFixed(2),
            isActive: true,
          },
          {
            variantId: varLic.id,
            currency: "NPR",
            amount: item.nprPrice,
            compareAtAmount: (parseFloat(item.nprPrice) * 1.3).toFixed(2),
            isActive: true,
          },
        ]);
      }
    }

    // 5. Watermark settings
    console.log("Setting default watermark settings...");
    const existingWatermark = await db.select().from(schema.watermarkSettings).limit(1);
    if (existingWatermark.length === 0) {
      await db.insert(schema.watermarkSettings).values({
        text: "© SUBAN WILDLIFE PHOTOGRAPHY",
        opacity: "0.45",
        position: "bottom-right",
        size: 22,
        isTiled: false,
        margin: 24,
        isActive: true,
      });
    }

    // 6. Homepage CMS Sections
    console.log("Setting default homepage sections...");
    const defaultSections = [
      { sectionType: "hero", title: "Apex Shadows of the Himalayas", subtitle: "National Geographic grade wildlife fine art & digital licenses by Suban", sortOrder: 1, isVisible: true },
      { sectionType: "featured_photos", title: "Featured Fine Art Releases", subtitle: "Pristine captures from the high trans-Himalayas to the Terai lowlands", sortOrder: 2, isVisible: true },
      { sectionType: "featured_collections", title: "Curated Wildlife Series", subtitle: "Themed narratives exploring Nepal's most endangered species", sortOrder: 3, isVisible: true },
      { sectionType: "about", title: "Behind the Lens", subtitle: "20 years tracking elusive predators with conservation-first ethics", sortOrder: 4, isVisible: true },
      { sectionType: "latest_articles", title: "Field Notes & Expeditions", subtitle: "Technical gear insights, animal behavior, and tracking logs", sortOrder: 5, isVisible: true },
      { sectionType: "newsletter", title: "The Sanctuary Dispatch", subtitle: "Receive rare photo drops, print release notices, and field diaries", sortOrder: 6, isVisible: true },
    ];

    // 7. Field Journal Posts
    console.log("Setting default field journal posts...");
    const samplePosts = [
      {
        title: "Tracking the Phantom: 14 Days Above 4,500m in Dolpo",
        slug: "tracking-phantom-snow-leopard-dolpo",
        excerpt: "Sub-zero temperatures, jagged ridge lines, and the sacred encounter with the solitary monarch of the high Himalayas.",
        content: "The wind howls off the Shey Gompa ridges at -22°C. At this altitude, every breath is deliberate, every shutter click calculated. For fourteen days, we monitored fresh scrape marks and scat along an ancient ibex migration route. On the fourteenth morning, just as the first alpenglow ignited the peaks, two piercing amber eyes stared back across a 200-meter gorge. The ghost was real.",
        coverImage: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=1800&q=85",
        readingTimeMinutes: 8,
        status: "published",
        publishedAt: new Date(),
      },
      {
        title: "Dawn Across the Sal Mist: In the Territory of the Royal Bengal Tiger",
        slug: "dawn-sal-mist-royal-bengal-tiger",
        excerpt: "Reading alarm calls of spotted deer and langurs in Chitwan to anticipate the morning patrol of an apex predator.",
        content: "The jungle speaks before it reveals. First, the sharp bark of a chital deer cutting through the river mist. Then, the frantic chatter of rhesus macaques high in the canopy. Sitting motionless in a low hide beside the Rapti riverbed, the golden form emerged through the dense elephant grass without snapping a single dry twig.",
        coverImage: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=1800&q=85",
        readingTimeMinutes: 6,
        status: "published",
        publishedAt: new Date(),
      },
      {
        title: "The Chromatic Crown: Photographing the Danphe in Spring Bloom",
        slug: "chromatic-crown-photographing-himalayan-monal",
        excerpt: "Documenting Nepal's national bird as the rhododendron forests ignite in crimson across the Langtang range.",
        content: "Few sights on earth match the iridescent spectacle of a male Himalayan Monal taking flight against the backdrop of snowfields. With plumage shifting from emerald green to copper bronze and deep sapphire blue, this encounter required 5 a.m. climbs through misty birch woodlands.",
        coverImage: "https://images.unsplash.com/photo-1618886614638-80e3c15cd819?auto=format&fit=crop&w=1800&q=85",
        readingTimeMinutes: 5,
        status: "published",
        publishedAt: new Date(),
      },
    ];

    for (const post of samplePosts) {
      const existing = await db
        .select()
        .from(schema.posts)
        .where(eq(schema.posts.slug, post.slug))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(schema.posts).values(post);
      }
    }

    console.log("✅ Seed completed successfully!");
  } catch (error) {
    console.error("❌ Seed failed or DB not connected:", error);
  } finally {
    await client.end();
  }
}

runSeed();
