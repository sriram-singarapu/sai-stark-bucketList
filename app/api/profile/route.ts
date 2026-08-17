import { NextResponse } from "next/server";
import User from "../../models/User";
import ConnectDB from "../../db/dbConnect";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DEFAULT_PROFILE = {
  name: "Sai Stark",
  email: "dharmasaisingarapu051@gmail.com",
  avatar: "/IMG-20250714-WA0063.jpg",
  bio: "Welcome to My Bucket List! I'm Sai Stark, an avid traveler and adventure seeker. This is my personal space to share my dreams, experiences, and the places I aspire to visit.",
  instagram: "https://www.instagram.com/sai._.stark?igsh=eTRuNWF0OGppd2w2",
  whatsapp: "https://wa.me/919391953591",
  gallery: [
    "/DSC_0032.JPG",
    "/DSC_0037.JPG",
    "/IMG-20250714-WA0064.jpg",
    "/PXL_20250216_010903628.jpg",
  ],
};

export async function GET() {
  try {
    let user = null;
    try {
      await ConnectDB();
      user = await User.findOne().lean();
      if (!user) {
        // If collection is empty, create default user in DB
        user = await User.create(DEFAULT_PROFILE);
      }
    } catch (dbErr: any) {
      console.warn("MongoDB fetch failed, returning fallback profile:", dbErr.message);
      user = DEFAULT_PROFILE;
    }

    return NextResponse.json(user || DEFAULT_PROFILE, { status: 200 });
  } catch (e: any) {
    console.error("GET /api/profile error:", e);
    // Never 500, always return fallback profile
    return NextResponse.json(DEFAULT_PROFILE, { status: 200 });
  }
}
