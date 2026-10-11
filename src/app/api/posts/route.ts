import { NextResponse } from "next/server";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { desc, eq, and, sql, or, ilike, inArray } from "drizzle-orm";

// Auto calculate reading time in minutes
function calculateReadingTime(text: string): number {
  if (!text) return 3;
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

// Generate clean unique slug
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const action = searchParams.get("action");

    // 1. Check Slug Availability
    if (action === "check-slug") {
      const slugToCheck = searchParams.get("slug")?.trim();
      const excludeId = searchParams.get("excludeId");
      if (!slugToCheck) {
        return NextResponse.json({ success: true, available: false, error: "Empty slug" });
      }
      const existing = await db
        .select({ id: schema.posts.id })
        .from(schema.posts)
        .where(
          excludeId
            ? and(eq(schema.posts.slug, slugToCheck), sql`${schema.posts.id} != ${excludeId}`)
            : eq(schema.posts.slug, slugToCheck)
        )
        .limit(1);

      return NextResponse.json({
        success: true,
        available: existing.length === 0,
        slug: slugToCheck,
      });
    }

    // 2. Fetch single post by ID or Slug
    const slugParam = searchParams.get("slug");
    if (id || slugParam) {
      const condition = id ? eq(schema.posts.id, id) : eq(schema.posts.slug, slugParam!);
      const [singlePost] = await db
        .select({
          id: schema.posts.id,
          title: schema.posts.title,
          slug: schema.posts.slug,
          excerpt: schema.posts.excerpt,
          content: schema.posts.content,
          contentJson: schema.posts.contentJson,
          contentHtml: schema.posts.contentHtml,
          coverImage: schema.posts.coverImage,
          coverMediaId: schema.posts.coverMediaId,
          coverFocalX: schema.posts.coverFocalX,
          coverFocalY: schema.posts.coverFocalY,
          readingTimeMinutes: schema.posts.readingTimeMinutes,
          authorId: schema.posts.authorId,
          categoryId: schema.posts.categoryId,
          categoryName: schema.categories.name,
          categorySlug: schema.categories.slug,
          status: schema.posts.status,
          publishedAt: schema.posts.publishedAt,
          scheduledAt: schema.posts.scheduledAt,
          isFeatured: schema.posts.isFeatured,
          views: schema.posts.views,
          seoTitle: schema.posts.seoTitle,
          seoDescription: schema.posts.seoDescription,
          locationLabel: schema.posts.locationLabel,
          locationPrecision: schema.posts.locationPrecision,
          createdAt: schema.posts.createdAt,
          updatedAt: schema.posts.updatedAt,
        })
        .from(schema.posts)
        .leftJoin(schema.categories, eq(schema.posts.categoryId, schema.categories.id))
        .where(condition)
        .limit(1);

      if (!singlePost) {
        return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true, post: singlePost });
    }

    const limit = Number(searchParams.get("limit")) || 100;
    const status = searchParams.get("status"); // 'all' | 'published' | 'draft' | 'scheduled' | 'archived'
    const categoryId = searchParams.get("categoryId");
    const query = searchParams.get("q")?.trim();

    // Base query with joins
    let queryBuilder = db
      .select({
        id: schema.posts.id,
        title: schema.posts.title,
        slug: schema.posts.slug,
        excerpt: schema.posts.excerpt,
        content: schema.posts.content,
        contentJson: schema.posts.contentJson,
        contentHtml: schema.posts.contentHtml,
        coverImage: schema.posts.coverImage,
        coverMediaId: schema.posts.coverMediaId,
        coverFocalX: schema.posts.coverFocalX,
        coverFocalY: schema.posts.coverFocalY,
        readingTimeMinutes: schema.posts.readingTimeMinutes,
        authorId: schema.posts.authorId,
        categoryId: schema.posts.categoryId,
        categoryName: schema.categories.name,
        categorySlug: schema.categories.slug,
        status: schema.posts.status,
        publishedAt: schema.posts.publishedAt,
        scheduledAt: schema.posts.scheduledAt,
        isFeatured: schema.posts.isFeatured,
        views: schema.posts.views,
        seoTitle: schema.posts.seoTitle,
        seoDescription: schema.posts.seoDescription,
        locationLabel: schema.posts.locationLabel,
        locationPrecision: schema.posts.locationPrecision,
        createdAt: schema.posts.createdAt,
        updatedAt: schema.posts.updatedAt,
      })
      .from(schema.posts)
      .leftJoin(schema.categories, eq(schema.posts.categoryId, schema.categories.id))
      .orderBy(desc(schema.posts.createdAt))
      .limit(limit);

    const conditions = [];

    if (status && status !== "all") {
      conditions.push(eq(schema.posts.status, status));
    }

    if (categoryId) {
      conditions.push(eq(schema.posts.categoryId, categoryId));
    }

    if (query) {
      conditions.push(
        or(
          ilike(schema.posts.title, `%${query}%`),
          ilike(schema.posts.slug, `%${query}%`),
          ilike(schema.posts.excerpt, `%${query}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const allPosts = whereClause ? await queryBuilder.where(whereClause) : await queryBuilder;

    // Fetch tab counts across all posts in database
    const countRows = await db
      .select({
        status: schema.posts.status,
        count: sql<number>`count(*)::int`,
      })
      .from(schema.posts)
      .groupBy(schema.posts.status);

    const counts: Record<string, number> = {
      all: 0,
      published: 0,
      draft: 0,
      scheduled: 0,
      archived: 0,
    };

    countRows.forEach((r) => {
      const s = (r.status || "draft").toLowerCase();
      if (counts[s] !== undefined) {
        counts[s] = r.count;
      }
      counts.all += r.count;
    });

    // Also fetch categories list for filtering
    const allCategories = await db
      .select({ id: schema.categories.id, name: schema.categories.name, slug: schema.categories.slug })
      .from(schema.categories)
      .orderBy(schema.categories.name);

    return NextResponse.json({
      success: true,
      count: allPosts.length,
      counts,
      posts: allPosts,
      categories: allCategories,
    });
  } catch (err: any) {
    console.error("Posts API GET error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      slug: inputSlug,
      excerpt,
      content,
      contentJson,
      contentHtml,
      coverImage,
      coverMediaId,
      coverFocalX = 50,
      coverFocalY = 50,
      readingTimeMinutes,
      status = "draft",
      scheduledAt,
      isFeatured = false,
      categoryId,
      seoTitle,
      seoDescription,
      locationLabel,
      locationPrecision = "national_park",
    } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: "Title is required" },
        { status: 400 }
      );
    }

    // Auto-generate or sanitize slug
    let finalSlug = slugify(inputSlug || title);
    if (!finalSlug) finalSlug = `dispatch-${Date.now()}`;

    // Verify uniqueness
    const existing = await db
      .select({ id: schema.posts.id })
      .from(schema.posts)
      .where(eq(schema.posts.slug, finalSlug))
      .limit(1);

    if (existing.length > 0) {
      finalSlug = `${finalSlug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    const calculatedReadTime = readingTimeMinutes || calculateReadingTime(content || excerpt || "");
    const publishedAt = status === "published" ? new Date() : null;

    const [post] = await db
      .insert(schema.posts)
      .values({
        title,
        slug: finalSlug,
        excerpt: excerpt || "",
        content: content || "",
        contentJson: contentJson || null,
        contentHtml: contentHtml || null,
        coverImage: coverImage || null,
        coverMediaId: coverMediaId || null,
        coverFocalX,
        coverFocalY,
        readingTimeMinutes: calculatedReadTime,
        status,
        publishedAt,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        isFeatured: Boolean(isFeatured),
        categoryId: categoryId || null,
        seoTitle: seoTitle || title,
        seoDescription: seoDescription || excerpt || "",
        locationLabel: locationLabel || null,
        locationPrecision,
        views: 0,
      })
      .returning();

    return NextResponse.json({
      success: true,
      post,
      message: `Dispatch "${post.title}" created successfully!`,
    });
  } catch (err: any) {
    console.error("Create post error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to create post" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    // 1. Bulk Operations
    if (body.action === "bulk" && Array.isArray(body.ids) && body.ids.length > 0) {
      const { ids, operation, value } = body;

      if (operation === "publish") {
        await db
          .update(schema.posts)
          .set({ status: "published", publishedAt: new Date(), updatedAt: new Date() })
          .where(inArray(schema.posts.id, ids));
      } else if (operation === "archive") {
        await db
          .update(schema.posts)
          .set({ status: "archived", updatedAt: new Date() })
          .where(inArray(schema.posts.id, ids));
      } else if (operation === "draft") {
        await db
          .update(schema.posts)
          .set({ status: "draft", updatedAt: new Date() })
          .where(inArray(schema.posts.id, ids));
      } else if (operation === "category") {
        await db
          .update(schema.posts)
          .set({ categoryId: value || null, updatedAt: new Date() })
          .where(inArray(schema.posts.id, ids));
      } else if (operation === "delete") {
        await db.delete(schema.posts).where(inArray(schema.posts.id, ids));
      }

      return NextResponse.json({
        success: true,
        message: `Bulk ${operation} applied to ${ids.length} dispatches`,
      });
    }

    // 2. Duplicate Post
    if (body.action === "duplicate" && body.id) {
      const [orig] = await db
        .select()
        .from(schema.posts)
        .where(eq(schema.posts.id, body.id))
        .limit(1);

      if (!orig) {
        return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
      }

      const dupTitle = `${orig.title} (Copy)`;
      const dupSlug = `${orig.slug}-copy-${Math.random().toString(36).substring(2, 6)}`;

      const [duplicated] = await db
        .insert(schema.posts)
        .values({
          ...orig,
          id: undefined, // generates new uuid
          title: dupTitle,
          slug: dupSlug,
          status: "draft",
          publishedAt: null,
          scheduledAt: null,
          views: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return NextResponse.json({
        success: true,
        post: duplicated,
        message: `Duplicated "${orig.title}" as draft.`,
      });
    }

    // 3. Quick Status Toggle or Field Update
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: "Post ID is required" }, { status: 400 });
    }

    const payload: Record<string, any> = { updatedAt: new Date() };

    if (updates.status !== undefined) {
      payload.status = updates.status;
      if (updates.status === "published" && !updates.publishedAt) {
        payload.publishedAt = new Date();
      }
    }
    if (updates.isFeatured !== undefined) payload.isFeatured = updates.isFeatured;
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.slug !== undefined) payload.slug = slugify(updates.slug);
    if (updates.excerpt !== undefined) payload.excerpt = updates.excerpt;
    if (updates.content !== undefined) payload.content = updates.content;
    if (updates.contentJson !== undefined) payload.contentJson = updates.contentJson;
    if (updates.contentHtml !== undefined) payload.contentHtml = updates.contentHtml;
    if (updates.coverImage !== undefined) payload.coverImage = updates.coverImage;
    if (updates.coverMediaId !== undefined) payload.coverMediaId = updates.coverMediaId;
    if (updates.coverFocalX !== undefined) payload.coverFocalX = updates.coverFocalX;
    if (updates.coverFocalY !== undefined) payload.coverFocalY = updates.coverFocalY;
    if (updates.readingTimeMinutes !== undefined) payload.readingTimeMinutes = updates.readingTimeMinutes;
    if (updates.categoryId !== undefined) payload.categoryId = updates.categoryId;
    if (updates.scheduledAt !== undefined) payload.scheduledAt = updates.scheduledAt ? new Date(updates.scheduledAt) : null;
    if (updates.seoTitle !== undefined) payload.seoTitle = updates.seoTitle;
    if (updates.seoDescription !== undefined) payload.seoDescription = updates.seoDescription;
    if (updates.locationLabel !== undefined) payload.locationLabel = updates.locationLabel;
    if (updates.locationPrecision !== undefined) payload.locationPrecision = updates.locationPrecision;

    const [updatedPost] = await db
      .update(schema.posts)
      .set(payload)
      .where(eq(schema.posts.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      post: updatedPost,
      message: "Post updated successfully",
    });
  } catch (err: any) {
    console.error("Update post error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update post" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Post ID is required" }, { status: 400 });
    }

    const [deleted] = await db
      .delete(schema.posts)
      .where(eq(schema.posts.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Deleted dispatch "${deleted.title}"`,
    });
  } catch (err: any) {
    console.error("Delete post error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete post" },
      { status: 500 }
    );
  }
}
