import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("bucket_admin_session");

    const isAdmin = session?.value === "authenticated_sai_stark";

    return NextResponse.json({
      isAdmin,
      user: isAdmin ? { role: "admin" } : null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { isAdmin: false, error: error.message },
      { status: 500 }
    );
  }
}
