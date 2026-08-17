import { cookies } from "next/headers";

export async function checkIsAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("bucket_admin_session");
    return session?.value === "authenticated_sai_stark";
  } catch {
    return false;
  }
}
