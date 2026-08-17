import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import ConnectDB from "../../db/dbConnect";
import User from "../../models/User";
import { checkIsAdmin } from "../../lib/auth";

// Configure Cloudinary from environment
if (process.env.CLOUDINARY_URL) {
  cloudinary.config();
} else if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DEFAULT_GALLERY = [
  "/DSC_0032.JPG",
  "/DSC_0037.JPG",
  "/IMG-20250714-WA0064.jpg",
  "/PXL_20250216_010903628.jpg",
];

// GET: Fetch all gallery images
export async function GET() {
  try {
    await ConnectDB();
    const user = await User.findOne().lean();
    const gallery = user?.gallery && user.gallery.length > 0 ? user.gallery : DEFAULT_GALLERY;

    return NextResponse.json({
      success: true,
      gallery,
    });
  } catch (error: any) {
    console.warn("GET /api/gallery error, returning default:", error.message);
    return NextResponse.json({
      success: true,
      gallery: DEFAULT_GALLERY,
    });
  }
}

// POST: Upload a new photo to Cloudinary and append to gallery in MongoDB
export async function POST(request: Request) {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin credentials required to upload." },
        { status: 403 }
      );
    }

    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = `data:${file.type || "image/jpeg"};base64,${buffer.toString("base64")}`;

    // Upload directly to Cloudinary
    const result = await cloudinary.uploader.upload(base64Data, {
      folder: "sai_stark_gallery",
      resource_type: "image",
    });

    const secureUrl = result.secure_url;

    // Save URL to MongoDB User.gallery
    await ConnectDB();
    let user = await User.findOne();
    if (!user) {
      user = await User.create({
        name: "Sai Stark",
        email: "dharmasaisingarapu051@gmail.com",
        gallery: [secureUrl],
      });
    } else {
      user.gallery = user.gallery || [];
      user.gallery.unshift(secureUrl); // Put newest photo first
      await user.save();
    }

    return NextResponse.json({
      success: true,
      message: "Image uploaded to Cloudinary successfully! 📸",
      url: secureUrl,
      gallery: user.gallery,
    });
  } catch (error: any) {
    console.error("POST /api/gallery error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload image to Cloudinary" },
      { status: 500 }
    );
  }
}

// DELETE: Remove an image URL from gallery in MongoDB
export async function DELETE(request: Request) {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin credentials required." },
        { status: 403 }
      );
    }

    const { imageUrl } = await request.json();
    if (!imageUrl) {
      return NextResponse.json({ error: "imageUrl is required" }, { status: 400 });
    }

    await ConnectDB();
    const user = await User.findOne();
    if (user && user.gallery) {
      user.gallery = user.gallery.filter((img: string) => img !== imageUrl);
      await user.save();
    }

    return NextResponse.json({
      success: true,
      message: "Image removed from gallery",
      gallery: user ? user.gallery : [],
    });
  } catch (error: any) {
    console.error("DELETE /api/gallery error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete image" },
      { status: 500 }
    );
  }
}
