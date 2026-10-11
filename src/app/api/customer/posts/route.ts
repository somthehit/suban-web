import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { posts, categories, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function calculateReadingTime(text: string): number {
  if (!text) return 3;
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

const createStorySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  excerpt: z.string().max(400).optional(),
  content: z.string().min(30, "Story content must be at least 30 characters"),
  coverImage: z.string().optional(),
  categoryId: z.string().optional(),
  locationLabel: z.string().max(100).optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let authorId = session.user.id;
    if (session.user.email) {
      const user = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, session.user.email.toLowerCase()))
        .limit(1);
      if (user[0]?.id) authorId = user[0].id;
    }

    const myPosts = await db
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        excerpt: posts.excerpt,
        content: posts.content,
        coverImage: posts.coverImage,
        status: posts.status,
        readingTimeMinutes: posts.readingTimeMinutes,
        locationLabel: posts.locationLabel,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        categoryName: categories.name,
      })
      .from(posts)
      .leftJoin(categories, eq(posts.categoryId, categories.id))
      .where(eq(posts.authorId, authorId))
      .orderBy(desc(posts.createdAt));

    // Also fetch available categories so the submission modal can pick
    const availableCategories = await db
      .select({ id: categories.id, name: categories.name, slug: categories.slug })
      .from(categories);

    return NextResponse.json({ posts: myPosts, categories: availableCategories });
  } catch (error) {
    console.warn("GET customer posts DB unreachable, returning fallback categories:", (error as any)?.message || error);
    const defaultCategories = [
      { id: "expedition", name: "Expedition Diary", slug: "expedition" },
      { id: "field-notes", name: "Field Encounters", slug: "field-notes" },
      { id: "conservation", name: "Conservation Notes", slug: "conservation" },
    ];
    return NextResponse.json({ posts: [], categories: defaultCategories, fallback: true });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = createStorySchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0]?.message || "Invalid input data" },
        { status: 400 }
      );
    }

    const { title, excerpt, content, coverImage, categoryId, locationLabel } = validated.data;

    let authorId = session.user.id;
    if (session.user.email) {
      const user = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, session.user.email.toLowerCase()))
        .limit(1);
      if (user[0]?.id) authorId = user[0].id;
    }

    // Generate unique slug
    let baseSlug = slugify(title);
    if (!baseSlug) baseSlug = `story-${Date.now()}`;
    let uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const readingTime = calculateReadingTime(content);

    // If no categoryId provided, fallback to first category
    let finalCategoryId = categoryId;
    if (!finalCategoryId) {
      const firstCat = await db.select({ id: categories.id }).from(categories).limit(1);
      finalCategoryId = firstCat[0]?.id;
    }

    const newPost = await db
      .insert(posts)
      .values({
        title,
        slug: uniqueSlug,
        excerpt: excerpt || content.slice(0, 160) + "...",
        content,
        contentHtml: `<p>${content.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br/>")}</p>`,
        coverImage: coverImage || "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&q=80&w=1200",
        authorId,
        categoryId: finalCategoryId,
        status: "draft", // Pending Admin Review
        readingTimeMinutes: readingTime,
        locationLabel: locationLabel || "Himalayan Margin",
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "Your story has been submitted to the editorial desk for curation and approval before publishing.",
      post: newPost[0],
    });
  } catch (error) {
    console.error("POST customer story submission error:", error);
    return NextResponse.json({ error: "Failed to submit story" }, { status: 500 });
  }
}
