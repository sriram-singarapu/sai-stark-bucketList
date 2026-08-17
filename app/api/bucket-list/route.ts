import { NextResponse } from "next/server";
import ConnectDB from "../../db/dbConnect";
import BucketItem from "../../models/BucketItem";
import { DEFAULT_BUCKET_LIST } from "../../data/defaultBucketList";
import { checkIsAdmin } from "../../lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// In-memory store fallback if MongoDB is briefly offline
let fallbackStore: any[] = DEFAULT_BUCKET_LIST.map((item, idx) => ({
  _id: `fallback_${idx + 1}`,
  ...item,
  isCompleted: false,
  completedAt: null,
  notes: "",
  createdAt: new Date(),
}));

export async function GET(request: Request) {
  try {
    let allItems: any[] = [];
    let dbConnected = false;

    try {
      await ConnectDB();
      const count = await BucketItem.countDocuments();
      if (count === 0) {
        await BucketItem.insertMany(
          DEFAULT_BUCKET_LIST.map((item) => ({
            ...item,
            isCompleted: false,
            completedAt: null,
            notes: "",
          }))
        );
      }
      allItems = await BucketItem.find({}).sort({ order: 1, createdAt: 1 }).lean();
      dbConnected = true;
    } catch (dbErr: any) {
      console.warn("Using fallback memory store:", dbErr.message);
      allItems = fallbackStore;
    }

    const total = allItems.length;
    const completed = allItems.filter((i: any) => i.isCompleted).length;
    const percentage = total > 0 ? Number(((completed / total) * 100).toFixed(1)) : 0;

    // Category-wise statistics
    const categoryMap: Record<
      string,
      {
        total: number;
        completed: number;
        percentage: number;
        subcategories: Record<
          string,
          { total: number; completed: number; percentage: number }
        >;
      }
    > = {};

    for (const item of allItems as any[]) {
      const cat = item.category || "Uncategorized";
      if (!categoryMap[cat]) {
        categoryMap[cat] = {
          total: 0,
          completed: 0,
          percentage: 0,
          subcategories: {},
        };
      }
      categoryMap[cat].total += 1;
      if (item.isCompleted) {
        categoryMap[cat].completed += 1;
      }

      if (item.subcategory) {
        const sub = item.subcategory;
        if (!categoryMap[cat].subcategories[sub]) {
          categoryMap[cat].subcategories[sub] = {
            total: 0,
            completed: 0,
            percentage: 0,
          };
        }
        categoryMap[cat].subcategories[sub].total += 1;
        if (item.isCompleted) {
          categoryMap[cat].subcategories[sub].completed += 1;
        }
      }
    }

    for (const cat of Object.keys(categoryMap)) {
      const c = categoryMap[cat];
      c.percentage = c.total > 0 ? Number(((c.completed / c.total) * 100).toFixed(1)) : 0;
      for (const sub of Object.keys(c.subcategories)) {
        const s = c.subcategories[sub];
        s.percentage = s.total > 0 ? Number(((s.completed / s.total) * 100).toFixed(1)) : 0;
      }
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const status = searchParams.get("status");

    let filteredItems = allItems;

    if (category && category !== "All") {
      filteredItems = filteredItems.filter(
        (i: any) => i.category === category || i.subcategory === category
      );
    }

    if (status === "completed") {
      filteredItems = filteredItems.filter((i: any) => i.isCompleted);
    } else if (status === "pending") {
      filteredItems = filteredItems.filter((i: any) => !i.isCompleted);
    }

    if (search) {
      const q = search.toLowerCase();
      filteredItems = filteredItems.filter(
        (i: any) =>
          i.title.toLowerCase().includes(q) ||
          (i.subcategory && i.subcategory.toLowerCase().includes(q)) ||
          (i.category && i.category.toLowerCase().includes(q)) ||
          (i.notes && i.notes.toLowerCase().includes(q))
      );
    }

    return NextResponse.json({
      success: true,
      dbConnected,
      stats: {
        total,
        completed,
        pending: total - completed,
        percentage,
        categoryStats: categoryMap,
      },
      items: filteredItems,
    });
  } catch (error: any) {
    console.error("GET /api/bucket-list error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch bucket list" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      emoji = "✨",
      category,
      subcategory = "",
      notes = "",
      proofImage = "",
      location = "",
      targetYear = "",
      isCompleted = false,
    } = body;

    if (!title || !category) {
      return NextResponse.json(
        { error: "Title and category are required" },
        { status: 400 }
      );
    }

    try {
      await ConnectDB();
      const highestOrderDoc = await BucketItem.findOne({})
        .sort({ order: -1 })
        .lean();
      const nextOrder =
        highestOrderDoc && (highestOrderDoc as any).order
          ? (highestOrderDoc as any).order + 1
          : 1;

      const newItem = await BucketItem.create({
        title: title.trim(),
        emoji: emoji.trim() || "✨",
        category: category.trim(),
        subcategory: subcategory ? subcategory.trim() : "",
        notes: notes ? notes.trim() : "",
        proofImage: proofImage ? proofImage.trim() : "",
        location: location ? location.trim() : "",
        targetYear: targetYear ? targetYear.trim() : "",
        isCompleted: !!isCompleted,
        completedAt: isCompleted ? new Date() : null,
        order: nextOrder,
      });

      return NextResponse.json(
        {
          success: true,
          message: "Bucket item created successfully",
          item: newItem,
        },
        { status: 201 }
      );
    } catch {
      // Fallback in-memory save
      const newItem = {
        _id: `custom_${Date.now()}`,
        title: title.trim(),
        emoji: emoji.trim() || "✨",
        category: category.trim(),
        subcategory: subcategory ? subcategory.trim() : "",
        notes: notes ? notes.trim() : "",
        proofImage: proofImage ? proofImage.trim() : "",
        location: location ? location.trim() : "",
        targetYear: targetYear ? targetYear.trim() : "",
        isCompleted: !!isCompleted,
        completedAt: isCompleted ? new Date() : null,
        order: fallbackStore.length + 1,
        createdAt: new Date(),
      };
      fallbackStore.push(newItem);
      return NextResponse.json(
        {
          success: true,
          message: "Bucket item created successfully",
          item: newItem,
        },
        { status: 201 }
      );
    }
  } catch (error: any) {
    console.error("POST /api/bucket-list error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create bucket item" },
      { status: 500 }
    );
  }
}
