import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.error("ADMIN_PASSWORD environment variable is not configured");
      return NextResponse.json(
        { error: "Server authentication misconfigured" },
        { status: 500 }
      );
    }

    if (password.trim() !== adminPassword.trim()) {
      return NextResponse.json(
        { error: "Invalid admin credentials" },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();
    cookieStore.set("bucket_admin_session", "authenticated_sai_stark", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: "Admin authentication successful",
      user: { role: "admin" },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Login failed" },
      { status: 500 }
    );
  }
}
