// pages/api/profile.js
import User from "../../models/User"; // the model defined above
import ConnectDB from "../../db/dbConnect";
export const dynamic = "force-dynamic"; // avoid static caching

export async function GET() {
  try {
    await ConnectDB();
    const user = await User.findOne().lean();
    if (!user) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify(user), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
