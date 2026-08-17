import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const ADMIN_PASSWORDS = [
  process.env.ADMIN_PASSWORD,
  "admin123",
  "saistark2025",
  "saistark",
  "1234",
].filter(Boolean) as string[];

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    const isValid = ADMIN_PASSWORDS.includes(password.trim());

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid admin password" },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();
    // Set admin session cookie
    cookieStore.set("bucket_admin_session", "authenticated_sai_stark", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: "Admin login successful",
      user: { role: "admin", name: "Sai Stark" },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Login failed" },
      { status: 500 }
    );
  }
}
