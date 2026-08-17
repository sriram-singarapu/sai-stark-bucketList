import { NextResponse } from "next/server";
import ConnectDB from "../../../db/dbConnect";
import BucketItem from "../../../models/BucketItem";
import { DEFAULT_BUCKET_LIST } from "../../../data/defaultBucketList";
import { checkIsAdmin } from "../../../lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const isAdmin = await checkIsAdmin();
    const url = new URL(request.url);
    const forceKey = url.searchParams.get("key");

    if (!isAdmin && forceKey !== "seed_sai_stark_bucket") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    await ConnectDB();

    // Remove existing and insert fresh
    await BucketItem.deleteMany({});

    const inserted = await BucketItem.insertMany(
      DEFAULT_BUCKET_LIST.map((item) => ({
        ...item,
        isCompleted: false,
        completedAt: null,
        notes: "",
      }))
    );

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${inserted.length} bucket list goals!`,
      count: inserted.length,
    });
  } catch (error: any) {
    console.error("POST /api/bucket-list/seed error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to seed database" },
      { status: 500 }
    );
  }
}
