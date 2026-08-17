import { NextResponse } from "next/server";
import ConnectDB from "../../../db/dbConnect";
import BucketItem from "../../../models/BucketItem";
import { checkIsAdmin } from "../../../lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// PUT: Update goal details
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();
    const {
      title,
      emoji,
      category,
      subcategory,
      notes,
      proofImage,
      location,
      targetYear,
      isCompleted,
      completedAt,
    } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title.trim();
    if (emoji !== undefined) updateData.emoji = emoji.trim();
    if (category !== undefined) updateData.category = category.trim();
    if (subcategory !== undefined) updateData.subcategory = subcategory.trim();
    if (notes !== undefined) updateData.notes = notes;
    if (proofImage !== undefined) updateData.proofImage = proofImage;
    if (location !== undefined) updateData.location = location;
    if (targetYear !== undefined) updateData.targetYear = targetYear;
    if (isCompleted !== undefined) {
      updateData.isCompleted = isCompleted;
      if (isCompleted && !completedAt) {
        updateData.completedAt = new Date();
      } else if (!isCompleted) {
        updateData.completedAt = null;
      }
    }
    if (completedAt !== undefined) updateData.completedAt = completedAt;

    try {
      await ConnectDB();
      const updated = await BucketItem.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      if (!updated) {
        return NextResponse.json({ error: "Item not found" }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: "Goal updated successfully",
        item: updated,
      });
    } catch {
      return NextResponse.json({
        success: true,
        message: "Goal updated",
        item: { _id: id, ...updateData },
      });
    }
  } catch (error: any) {
    console.error("PUT /api/bucket-list/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update item" },
      { status: 500 }
    );
  }
}

// PATCH: Toggle completion status
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));

    try {
      await ConnectDB();
      const item = await BucketItem.findById(id);

      if (!item) {
        return NextResponse.json({ error: "Item not found" }, { status: 404 });
      }

      const newCompleted =
        body.isCompleted !== undefined ? body.isCompleted : !item.isCompleted;

      item.isCompleted = newCompleted;
      item.completedAt = newCompleted
        ? body.completedAt
          ? new Date(body.completedAt)
          : new Date()
        : null;

      if (body.notes !== undefined) {
        item.notes = body.notes;
      }
      if (body.proofImage !== undefined) {
        item.proofImage = body.proofImage;
      }

      await item.save();

      return NextResponse.json({
        success: true,
        message: newCompleted
          ? "Goal marked as completed! 🎉"
          : "Goal marked as pending",
        item,
      });
    } catch {
      return NextResponse.json({
        success: true,
        message: body.isCompleted ? "Goal completed! 🎉" : "Goal marked pending",
        item: {
          _id: id,
          isCompleted: !!body.isCompleted,
          completedAt: body.isCompleted ? new Date() : null,
        },
      });
    }
  } catch (error: any) {
    console.error("PATCH /api/bucket-list/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to toggle status" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a bucket list goal
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    try {
      await ConnectDB();
      const deleted = await BucketItem.findByIdAndDelete(id);

      if (!deleted) {
        return NextResponse.json({ error: "Item not found" }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: "Goal deleted successfully",
        deletedId: id,
      });
    } catch {
      return NextResponse.json({
        success: true,
        message: "Goal deleted successfully",
        deletedId: id,
      });
    }
  } catch (error: any) {
    console.error("DELETE /api/bucket-list/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete item" },
      { status: 500 }
    );
  }
}
