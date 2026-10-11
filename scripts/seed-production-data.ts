import { db } from "../src/db/index";
import * as schema from "../src/db/schema";
import { eq } from "drizzle-orm";

async function seedProductionData() {
  console.log("🚀 Seeding rich production data into database...");

  // 1. Roles & Users
  const superAdminRole = await db.select().from(schema.roles).where(eq(schema.roles.name, "SUPER_ADMIN")).limit(1);
  const customerRole = await db.select().from(schema.roles).where(eq(schema.roles.name, "CUSTOMER")).limit(1);
  const superAdminId = superAdminRole[0]?.id;
  const customerRoleId = customerRole[0]?.id;

  const somUser = await db.select().from(schema.users).where(eq(schema.users.email, "somthehit@hotmail.com")).limit(1);
  const somUserId = somUser[0]?.id;

  // 2. Licenses
  const baseLicenses = [
    {
      name: "Personal Fine Art License",
      slug: "personal-use",
      description: "For personal desktop displays, screensavers, and non-commercial fine art appreciation.",
      isCommercial: false,
      isEditorial: false,
      isExclusive: false,
      maxImpressions: 1,
      canResell: false,
    },
    {
      name: "Editorial Standard License",
      slug: "editorial-standard",
      description: "For educational articles, wildlife journals, documentaries, and editorial publications.",
      isCommercial: false,
      isEditorial: true,
      isExclusive: false,
      maxImpressions: 50000,
      canResell: false,
    },
    {
      name: "Commercial Standard License",
      slug: "commercial-standard",
      description: "For brand campaigns, digital marketing, websites, and commercial publications.",
      isCommercial: true,
      isEditorial: false,
      isExclusive: false,
      maxImpressions: 250000,
      canResell: false,
    },
    {
      name: "Master Extended Commercial License",
      slug: "extended-commercial",
      description: "Unlimited worldwide print, digital advertising, billboard displays, and physical product runs.",
      isCommercial: true,
      isEditorial: false,
      isExclusive: true,
      maxImpressions: null,
      canResell: true,
    },
  ];

  const licenseMap: Record<string, string> = {};
  for (const lic of baseLicenses) {
    const existing = await db.select().from(schema.licenses).where(eq(schema.licenses.slug, lic.slug)).limit(1);
    if (existing.length > 0) {
      licenseMap[lic.slug] = existing[0].id;
    } else {
      const [inserted] = await db.insert(schema.licenses).values(lic).returning();
      licenseMap[lic.slug] = inserted.id;
    }
  }

  // 3. Categories for Field Journal
  const baseCategories = [
    { name: "Expeditions", slug: "expeditions", description: "First-hand accounts from high-altitude and deep jungle terrain" },
    { name: "Animal Behavior", slug: "animal-behavior", description: "Observations on predator dynamics, mating calls, and territorial markings" },
    { name: "Gear & Fieldcraft", slug: "gear-fieldcraft", description: "Extreme climate optics, camera traps, camouflage, and survival notes" },
    { name: "Conservation Ethics", slug: "conservation-ethics", description: "Protecting endangered corridors with non-invasive photographic practices" },
  ];

  const categoryMap: Record<string, string> = {};
  for (const cat of baseCategories) {
    const existing = await db.select().from(schema.categories).where(eq(schema.categories.slug, cat.slug)).limit(1);
    if (existing.length > 0) {
      categoryMap[cat.slug] = existing[0].id;
    } else {
      const [inserted] = await db.insert(schema.categories).values(cat).returning();
      categoryMap[cat.slug] = inserted.id;
    }
  }

  // 4. Master Photographic Products
  const MASTER_WORKS = [
    {
      title: "Chasm Leaper (Snow Leopard)",
      slug: "chasm-leaper-snow-leopard",
      categoryKey: "predators",
      description: "Frozen mid-air across a 12-meter limestone abyss at 4,200m elevation in Manang. Archival pigment print on Hahnemühle Photo Rag 308g.",
      productType: "photograph",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBCvu5oUFUOTiYCjzw80uXC-G0Ecc6s64IQFwaLKXAoIDh6O5oR4X0mCe_9tcFVp_1DTFMcr4zFGuaoV9eNM8e4b_8YgZQvq6ShvvvUMMEMTcnrcb0liLAVQIl5psNTOetcPDhz3beot6fhXIEYi87qoxN7BCUMDVIh01kDW7kgL9_BwTrw8hLQ8RJsSQrr2QDw9Y6DB6Kgu67b8qs1kn-HPZFRLT9KUusx5DusjUy5",
      species: "Snow Leopard",
      scientificName: "Panthera uncia",
      family: "Felidae",
      habitat: "Alpine Moraine & Jagged Scree",
      conservationStatus: "Vulnerable",
      locationName: "Manang Valley • 4,200m, Nepal",
      country: "Nepal",
      elevation: "4,200m",
      camera: "Nikon Z9",
      lens: "NIKKOR Z 400mm f/2.8 TC VR S",
      focalLength: "400mm",
      iso: 800,
      aperture: "f/2.8",
      shutterSpeed: "1/2500s",
      usdPrice: "35.00",
      nprPrice: "4600.00",
      edition: "ED. 12/25",
      isFeatured: true,
      storyTitle: "The Split-Second of Trans-Himalayan Physics",
      story: "For six days, the solitary female watched an ibex herd graze beneath the limestone towers. When she launched across the 12-meter void, the mountain held its breath. The shutter fired at 20 frames per second at 1/2500s, locking the predatory poise against the frozen Annapurna massifs.",
    },
    {
      title: "The Bone Breaker (Lammergeier)",
      slug: "the-bone-breaker-lammergeier",
      categoryKey: "birds",
      description: "Full 61MP uncompressed TIFF + Editorial Rights. Cruising the thermal updrafts above Annapurna Range at 5,100m with an immense 2.8m wingspan.",
      productType: "digital_license",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDU8gnw0_YRyipuPdGB8_G3vjETzazxx6hLBIItyjsy-ka_z2wa6voYivrEhNC0mvgQrJSWVeMFebpk4M-wsjr5Dj478OGSWQ-gbB6r25C8nRbvffYSMlXAsuAeVM3YQDfGXSQWqUb2OsSlHDWOAsvitNiZ27QLk6a1tACpzv0rnL-FKjxM3gVWtup7O99n44ap0BcNJYhRfOAku8UuNh-BJ0bg0oIiXQAyxS6Q-HNj",
      species: "Bearded Vulture (Lammergeier)",
      scientificName: "Gypaetus barbatus",
      family: "Accipitridae",
      habitat: "High Altitude Windswept Cliffs",
      conservationStatus: "Near Threatened",
      locationName: "Annapurna Range • 5,100m, Nepal",
      country: "Nepal",
      elevation: "5,100m",
      camera: "Sony A1",
      lens: "FE 600mm f/4 GM OSS",
      focalLength: "600mm",
      iso: 640,
      aperture: "f/4.0",
      shutterSpeed: "1/3200s",
      usdPrice: "120.00",
      nprPrice: "15800.00",
      edition: "COMMERCIAL",
      isFeatured: true,
      storyTitle: "Gliding Through the Thin Sky",
      story: "Circling on updrafts that would freeze human skin within minutes, this ancient raptor drops marrow bones from hundred-meter heights to crack them open on designated anvil stones below.",
    },
    {
      title: "Midnight Drink (Royal Bengal)",
      slug: "midnight-drink-royal-bengal",
      categoryKey: "predators",
      description: "Canson Infinity Platine Fibre Rag museum grade print. A giant male Royal Bengal breaks the still mirror of a nocturnal jungle pool.",
      productType: "photograph",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXmS4a7kSPL4TgOZ4Tmt9W-SZTpOVAvqSwvBGX2iF4DYlpVent5waViIy_yBLI_wwzRw0kG3zODhe3VE4Tdff9LBI0pxGxXNVnjvGgThTiVymakFqyeNHfcgnZNU6ab4T3-jWKkTDfagXTvROTO6V1pHju1Pqq-l5v5om_lsbBT5pbwSTLITnIIfW2biZ6z2hl9ZZWVK_-dvOFb6zYXE3IlBHzI25FGfitDQ4oGhNl",
      species: "Royal Bengal Tiger",
      scientificName: "Panthera tigris tigris",
      family: "Felidae",
      habitat: "Riparian Lowland Sal Forest",
      conservationStatus: "Endangered",
      locationName: "Bardia Reserve • 150m, Nepal",
      country: "Nepal",
      elevation: "150m",
      camera: "Nikon Z9",
      lens: "NIKKOR Z 70-200mm f/2.8 VR S",
      focalLength: "180mm",
      iso: 3200,
      aperture: "f/2.8",
      shutterSpeed: "1/400s",
      usdPrice: "35.00",
      nprPrice: "4600.00",
      edition: "ED. 5/10",
      isFeatured: true,
      storyTitle: "The Golden Reflection in the Dark",
      story: "The temperature dropped as night enveloped the sal woods of Bardia. Positioned silently in a waterhole blind, the ripple of water preceded the vision: 240 kilograms of stealth, amber eyes glowing with nocturnal brilliance.",
    },
    {
      title: "Canopy Slumber (Twin Ailurus)",
      slug: "canopy-slumber-twin-ailurus",
      categoryKey: "mammals",
      description: "High-res 5K wallpaper package + digital storybook. A mother and juvenile red panda coiled asleep atop mossy rhododendron boughs.",
      productType: "photograph",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDFc13sZ5w7_3BkW1k9-1791286046254",
      species: "Red Panda",
      scientificName: "Ailurus fulgens",
      family: "Ailuridae",
      habitat: "Cloud Forest & Bamboo Thickets",
      conservationStatus: "Endangered",
      locationName: "Kanchenjunga Sector • 3,100m, Nepal",
      country: "Nepal",
      elevation: "3,100m",
      camera: "Sony A7R V",
      lens: "FE 200-600mm f/5.6-6.3 G OSS",
      focalLength: "500mm",
      iso: 1600,
      aperture: "f/6.3",
      shutterSpeed: "1/640s",
      usdPrice: "12.00",
      nprPrice: "1550.00",
      edition: "DIGITAL STARTER",
      isFeatured: true,
      storyTitle: "Crimson Jewels in the Lichen Mist",
      story: "At 3,100 meters, mist weaves through centuries-old rhododendrons draped with beard lichen. For hours, only a twitch of a rust-striped tail gave away their location.",
    },
    {
      title: "Armored Monarch of the Mist",
      slug: "greater-one-horned-rhino-nepal",
      categoryKey: "mammals",
      description: "Prehistoric Greater One-Horned Rhinoceros emerging from river vapors along the Rapti floodplains.",
      productType: "photograph",
      imageUrl: "https://images.unsplash.com/photo-1575550959106-5a7defe28b56?auto=format&fit=crop&w=1800&q=85",
      species: "Greater One-Horned Rhinoceros",
      scientificName: "Rhinoceros unicornis",
      family: "Rhinocerotidae",
      habitat: "Alluvial Floodplain Grasslands",
      conservationStatus: "Vulnerable",
      locationName: "Chitwan National Park, Nepal",
      country: "Nepal",
      elevation: "180m",
      camera: "Nikon Z9",
      lens: "NIKKOR Z 400mm f/2.8 TC VR S",
      focalLength: "400mm",
      iso: 1250,
      aperture: "f/2.8",
      shutterSpeed: "1/1600s",
      usdPrice: "129.00",
      nprPrice: "17200.00",
      edition: "ED. 18/50",
      isFeatured: true,
      storyTitle: "Prehistory in the Morning Vapors",
      story: "Deep folds resembling riveted armor plating gleamed with dew as this solitary bull grazed silently along the tranquil floodplains.",
    },
    {
      title: "Kaleidoscope of High Altitudes",
      slug: "himalayan-monal-danphe-nepal",
      categoryKey: "birds",
      description: "Nepal's national bird, the Himalayan Monal (Danphe), displaying its iridescent metallic sheen against the Langtang snows.",
      productType: "photograph",
      imageUrl: "https://images.unsplash.com/photo-1618886614638-80e3c15cd819?auto=format&fit=crop&w=1800&q=85",
      species: "Himalayan Monal",
      scientificName: "Lophophorus impejanus",
      family: "Phasianidae",
      habitat: "Subalpine Conifer Slopes",
      conservationStatus: "Least Concern",
      locationName: "Langtang National Park • 3,600m, Nepal",
      country: "Nepal",
      elevation: "3,600m",
      camera: "Canon EOS R5",
      lens: "RF 600mm f/4L IS USM",
      focalLength: "600mm",
      iso: 500,
      aperture: "f/4.0",
      shutterSpeed: "1/3200s",
      usdPrice: "99.00",
      nprPrice: "13200.00",
      edition: "ED. 20/30",
      isFeatured: true,
      storyTitle: "The Living Spectrum of Himalayan Dawn",
      story: "Plumage shifting from copper to sapphire and emerald as sunlight strikes the dew-soaked alpine meadows.",
    },
    {
      title: "Matriarch of the Karnali Corridors",
      slug: "asian-elephant-karnali-corridors",
      categoryKey: "mammals",
      description: "A wild matriarch leading her family across golden sun-drenched waters in Bardia's pristine riverine corridors.",
      productType: "photograph",
      imageUrl: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=1800&q=85",
      species: "Asian Elephant",
      scientificName: "Elephas maximus",
      family: "Elephantidae",
      habitat: "Tropical Monsoon Corridors",
      conservationStatus: "Endangered",
      locationName: "Bardia National Park, Nepal",
      country: "Nepal",
      elevation: "160m",
      camera: "Nikon Z8",
      lens: "NIKKOR Z 70-200mm f/2.8 VR S",
      focalLength: "135mm",
      iso: 400,
      aperture: "f/4.5",
      shutterSpeed: "1/1000s",
      usdPrice: "139.00",
      nprPrice: "18500.00",
      edition: "ED. 8/25",
      isFeatured: true,
      storyTitle: "Echoes of the River Crossing",
      story: "Silent footsteps through deep water as the herd moves rhythmically towards the dense southern sanctuaries.",
    },
    {
      title: "Vigil of the Blue Sheep",
      slug: "blue-sheep-bharal-dolpo",
      categoryKey: "mammals",
      description: "A Bharal ram poised atop sheer cliff ledges at 4,700m in Shey Phoksundo, scanning the scree for signs of feline movement.",
      productType: "photograph",
      imageUrl: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1800&q=85",
      species: "Blue Sheep (Bharal)",
      scientificName: "Pseudois nayaur",
      family: "Bovidae",
      habitat: "High Altitude Scree & Alpine Crags",
      conservationStatus: "Least Concern",
      locationName: "Shey Phoksundo National Park • 4,700m, Nepal",
      country: "Nepal",
      elevation: "4,700m",
      camera: "Sony A1",
      lens: "FE 600mm f/4 GM OSS",
      focalLength: "600mm",
      iso: 400,
      aperture: "f/5.6",
      shutterSpeed: "1/1600s",
      usdPrice: "89.00",
      nprPrice: "11900.00",
      edition: "ED. 15/40",
      isFeatured: false,
      storyTitle: "Sentinels of the High Crags",
      story: "Blended seamlessly into the slate rock, these sure-footed sentinels provide vital clues to the presence of snow leopards in the high passes.",
    },
  ];

  const createdProductsMap: Record<string, string> = {};

  for (const item of MASTER_WORKS) {
    const existing = await db.select().from(schema.products).where(eq(schema.products.slug, item.slug)).limit(1);
    let prodId: string;
    if (existing.length > 0) {
      prodId = existing[0].id;
    } else {
      const [prod] = await db.insert(schema.products).values({
        title: item.title,
        slug: item.slug,
        description: item.description,
        productType: item.productType,
        status: "published",
        isFeatured: item.isFeatured,
      }).returning();
      prodId = prod.id;

      // Media
      const [med] = await db.insert(schema.media).values({
        productId: prodId,
        title: item.title,
        originalFilename: `${item.slug}.raw`,
        mimeType: "image/jpeg",
        fileSize: 45000000,
        width: 8256,
        height: 5504,
        aspectRatio: "3:2",
        status: "READY",
      }).returning();

      // Media Versions
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
      await db.update(schema.products).set({ primaryMediaId: med.id }).where(eq(schema.products.id, prodId));

      // Photo Metadata
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

      // Digital Variant
      const [varLic] = await db.insert(schema.productVariants).values({
        productId: prodId,
        licenseId: licenseMap["commercial-standard"],
        variantType: "digital_license",
        name: "High-Resolution Digital Commercial License",
        sku: `DIG-${item.slug.slice(0, 8).toUpperCase()}-COM`,
        isDigital: true,
        shippingRequired: false,
        dimensions: "8256 × 5504 px (300 DPI)",
        isActive: true,
      }).returning();

      // Prices
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
    createdProductsMap[item.slug] = prodId;
  }

  // 5. Curated Collections
  const COLLECTIONS_DATA = [
    {
      title: "Apex Predators of the Subtropics",
      slug: "apex-predators-subtropics",
      description: "Stealth apex carnivores inside riverine sal belts. Documented using sound-dampened 600mm optics to trace territorial paths without behavioral disruption.",
      coverImageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXmS4a7kSPL4TgOZ4Tmt9W-SZTpOVAvqSwvBGX2iF4DYlpVent5waViIy_yBLI_wwzRw0kG3zODhe3VE4Tdff9LBI0pxGxXNVnjvGgThTiVymakFqyeNHfcgnZNU6ab4T3-jWKkTDfagXTvROTO6V1pHju1Pqq-l5v5om_lsbBT5pbwSTLITnIIfW2biZ6z2hl9ZZWVK_-dvOFb6zYXE3IlBHzI25FGfitDQ4oGhNl",
      isFeatured: true,
      productSlugs: ["midnight-drink-royal-bengal", "chasm-leaper-snow-leopard"],
    },
    {
      title: "Monarchs of the High Trans-Himalayas",
      slug: "monarchs-high-trans-himalayas",
      description: "Sub-zero expeditions across barren alpine moraines documenting the mountain phantom and high altitude raptors amidst blizzard-swept spires.",
      coverImageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBCvu5oUFUOTiYCjzw80uXC-G0Ecc6s64IQFwaLKXAoIDh6O5oR4X0mCe_9tcFVp_1DTFMcr4zFGuaoV9eNM8e4b_8YgZQvq6ShvvvUMMEMTcnrcb0liLAVQIl5psNTOetcPDhz3beot6fhXIEYi87qoxN7BCUMDVIh01kDW7kgL9_BwTrw8hLQ8RJsSQrr2QDw9Y6DB6Kgu67b8qs1kn-HPZFRLT9KUusx5DusjUy5",
      isFeatured: true,
      productSlugs: ["chasm-leaper-snow-leopard", "the-bone-breaker-lammergeier", "blue-sheep-bharal-dolpo"],
    },
    {
      title: "Canopy Sanctuaries of Eastern Himalaya",
      slug: "canopy-sanctuaries-eastern-himalaya",
      description: "Cloud forest canopies and moss-draped rhododendron groves sheltering rare arboreal jewels in the mist-rich Ilam highlands.",
      coverImageUrl: "https://images.unsplash.com/photo-1544943910-4c1dc44a0701?auto=format&fit=crop&w=1800&q=85",
      isFeatured: true,
      productSlugs: ["canopy-slumber-twin-ailurus", "himalayan-monal-danphe-nepal"],
    },
    {
      title: "Terai Megafauna & Riverine Belts",
      slug: "terai-megafauna-riverine-belts",
      description: "Armored prehistoric giants and matriarch herds navigating alluvial floodplains and monsoon grasslands.",
      coverImageUrl: "https://images.unsplash.com/photo-1575550959106-5a7defe28b56?auto=format&fit=crop&w=1800&q=85",
      isFeatured: true,
      productSlugs: ["greater-one-horned-rhino-nepal", "asian-elephant-karnali-corridors"],
    },
  ];

  for (const col of COLLECTIONS_DATA) {
    const existing = await db.select().from(schema.collections).where(eq(schema.collections.slug, col.slug)).limit(1);
    let colId: string;
    if (existing.length > 0) {
      colId = existing[0].id;
    } else {
      const [inserted] = await db.insert(schema.collections).values({
        title: col.title,
        slug: col.slug,
        description: col.description,
        coverImageUrl: col.coverImageUrl,
        isFeatured: col.isFeatured,
        isPublic: true,
      }).returning();
      colId = inserted.id;

      for (const pSlug of col.productSlugs) {
        const prodId = createdProductsMap[pSlug];
        if (prodId) {
          await db.insert(schema.collectionItems).values({
            collectionId: colId,
            productId: prodId,
          });
        }
      }
    }
  }

  // 6. Field Journal Posts
  const FIELD_POSTS = [
    {
      title: "Tracking the Phantom: 14 Days Above 4,500m in Dolpo",
      slug: "tracking-phantom-snow-leopard-dolpo",
      excerpt: "Sub-zero temperatures, jagged ridge lines, and the sacred encounter with the solitary monarch of the high Himalayas.",
      content: "The wind howls off the Shey Gompa ridges at -22°C. At this altitude, every breath is deliberate, every shutter click calculated. For fourteen days, we monitored fresh scrape marks and scat along an ancient ibex migration route. On the fourteenth morning, just as the first alpenglow ignited the peaks, two piercing amber eyes stared back across a 200-meter gorge. The ghost was real.",
      coverImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuBCvu5oUFUOTiYCjzw80uXC-G0Ecc6s64IQFwaLKXAoIDh6O5oR4X0mCe_9tcFVp_1DTFMcr4zFGuaoV9eNM8e4b_8YgZQvq6ShvvvUMMEMTcnrcb0liLAVQIl5psNTOetcPDhz3beot6fhXIEYi87qoxN7BCUMDVIh01kDW7kgL9_BwTrw8hLQ8RJsSQrr2QDw9Y6DB6Kgu67b8qs1kn-HPZFRLT9KUusx5DusjUy5",
      readingTimeMinutes: 8,
      status: "published",
      categoryId: categoryMap["expeditions"],
      authorId: somUserId,
      publishedAt: new Date("2026-09-15"),
    },
    {
      title: "Dawn Across the Sal Mist: In the Territory of the Royal Bengal Tiger",
      slug: "dawn-sal-mist-royal-bengal-tiger",
      excerpt: "Reading alarm calls of spotted deer and langurs in Chitwan to anticipate the morning patrol of an apex predator.",
      content: "The jungle speaks before it reveals. First, the sharp bark of a chital deer cutting through the river mist. Then, the frantic chatter of rhesus macaques high in the canopy. Sitting motionless in a low hide beside the Rapti riverbed, the golden form emerged through the dense elephant grass without snapping a single dry twig.",
      coverImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXmS4a7kSPL4TgOZ4Tmt9W-SZTpOVAvqSwvBGX2iF4DYlpVent5waViIy_yBLI_wwzRw0kG3zODhe3VE4Tdff9LBI0pxGxXNVnjvGgThTiVymakFqyeNHfcgnZNU6ab4T3-jWKkTDfagXTvROTO6V1pHju1Pqq-l5v5om_lsbBT5pbwSTLITnIIfW2biZ6z2hl9ZZWVK_-dvOFb6zYXE3IlBHzI25FGfitDQ4oGhNl",
      readingTimeMinutes: 6,
      status: "published",
      categoryId: categoryMap["animal-behavior"],
      authorId: somUserId,
      publishedAt: new Date("2026-09-22"),
    },
    {
      title: "The Chromatic Crown: Photographing the Danphe in Spring Bloom",
      slug: "chromatic-crown-photographing-himalayan-monal",
      excerpt: "Documenting Nepal's national bird as the rhododendron forests ignite in crimson across the Langtang range.",
      content: "Few sights on earth match the iridescent spectacle of a male Himalayan Monal taking flight against the backdrop of snowfields. With plumage shifting from emerald green to copper bronze and deep sapphire blue, this encounter required 5 a.m. climbs through misty birch woodlands.",
      coverImage: "https://images.unsplash.com/photo-1618886614638-80e3c15cd819?auto=format&fit=crop&w=1800&q=85",
      readingTimeMinutes: 5,
      status: "published",
      categoryId: categoryMap["conservation-ethics"],
      authorId: somUserId,
      publishedAt: new Date("2026-10-01"),
    },
    {
      title: "Ghost of the High Passes: 38 Days Tracking in Upper Mustang",
      slug: "ghost-of-the-high-passes-upper-mustang",
      excerpt: "Surviving sub-twenty winds on sheer scree fields to document elusive predators through 800mm glass under the Tibetan plateau shadows.",
      content: "Surviving sub-twenty winds on sheer scree fields to document the elusive predator through 800mm glass under the Tibetan plateau shadows. The canyon walls glowed ochre and blood-red at midday, shifting into violet by sunset.",
      coverImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuDU8gnw0_YRyipuPdGB8_G3vjETzazxx6hLBIItyjsy-ka_z2wa6voYivrEhNC0mvgQrJSWVeMFebpk4M-wsjr5Dj478OGSWQ-gbB6r25C8nRbvffYSMlXAsuAeVM3YQDfGXSQWqUb2OsSlHDWOAsvitNiZ27QLk6a1tACpzv0rnL-FKjxM3gVWtup7O99n44ap0BcNJYhRfOAku8UuNh-BJ0bg0oIiXQAyxS6Q-HNj",
      readingTimeMinutes: 12,
      status: "published",
      categoryId: categoryMap["gear-fieldcraft"],
      authorId: somUserId,
      publishedAt: new Date("2026-10-04"),
    },
  ];

  for (const post of FIELD_POSTS) {
    const existing = await db.select().from(schema.posts).where(eq(schema.posts.slug, post.slug)).limit(1);
    if (existing.length === 0) {
      await db.insert(schema.posts).values(post);
    }
  }

  // 7. Orders & Digital Vault for Authenticated Customer
  const firstProdId = createdProductsMap["chasm-leaper-snow-leopard"] || Object.values(createdProductsMap)[0];
  const secondProdId = createdProductsMap["midnight-drink-royal-bengal"] || Object.values(createdProductsMap)[1];

  const firstVariant = await db.select().from(schema.productVariants).where(eq(schema.productVariants.productId, firstProdId)).limit(1);
  const secondVariant = await db.select().from(schema.productVariants).where(eq(schema.productVariants.productId, secondProdId)).limit(1);

  if (firstVariant.length > 0 && somUserId) {
    const existingOrders = await db.select().from(schema.orders).where(eq(schema.orders.userId, somUserId)).limit(1);
    if (existingOrders.length === 0) {
      // Order 1
      const [order1] = await db.insert(schema.orders).values({
        orderNumber: "SBN-88219-NP",
        userId: somUserId,
        customerEmail: "somthehit@hotmail.com",
        customerName: "Som Prakash Chaudhary",
        customerPhone: "+977 9800000000",
        currency: "USD",
        subtotal: "1450.00",
        discountAmount: "0.00",
        taxAmount: "0.00",
        totalAmount: "1450.00",
        status: "PAID",
        notes: "Museum Acrylic Mounting Complete • Tracking: DHL-NP-99482014-FA",
      }).returning();

      const [item1] = await db.insert(schema.orderItems).values({
        orderId: order1.id,
        productId: firstProdId,
        variantId: firstVariant[0].id,
        licenseId: licenseMap["commercial-standard"],
        unitPrice: "1450.00",
        quantity: 1,
        totalPrice: "1450.00",
        licenseKey: "LIC-SUB-88219-FA-LE",
      }).returning();

      // Order 2
      const [order2] = await db.insert(schema.orders).values({
        orderNumber: "SBN-61042-BD",
        userId: somUserId,
        customerEmail: "somthehit@hotmail.com",
        customerName: "Som Prakash Chaudhary",
        currency: "USD",
        subtotal: "890.00",
        discountAmount: "0.00",
        taxAmount: "0.00",
        totalAmount: "890.00",
        status: "PAID",
        notes: "Delivered on Sep 24, 2026 • Verified Physical Seal Intact",
      }).returning();

      if (secondVariant.length > 0) {
        await db.insert(schema.orderItems).values({
          orderId: order2.id,
          productId: secondProdId,
          variantId: secondVariant[0].id,
          licenseId: licenseMap["commercial-standard"],
          unitPrice: "890.00",
          quantity: 1,
          totalPrice: "890.00",
          licenseKey: "LIC-SUB-61042-BD-EX",
        });
      }
    }
  }

  console.log("✅ Production seeding completed successfully!");
  process.exit(0);
}

seedProductionData().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
