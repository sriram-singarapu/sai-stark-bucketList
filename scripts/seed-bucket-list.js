import mongoose from "mongoose";
import "dotenv/config";
import User from "../app/models/User.js";
import BucketItem from "../app/models/BucketItem.js";
import { DEFAULT_BUCKET_LIST } from "../app/data/defaultBucketList.ts";

const MONGODB_URI = process.env.MONGODB_URI;

async function runSeed() {
  if (!MONGODB_URI) {
    console.error("Error: MONGODB_URI is not defined in environment variables");
    process.exit(1);
  }

  console.log("Connecting to database...");
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    await BucketItem.deleteMany({});
    const inserted = await BucketItem.insertMany(
      DEFAULT_BUCKET_LIST.map((item) => ({
        ...item,
        isCompleted: false,
        completedAt: null,
        notes: "",
        location: "",
        targetYear: "",
      }))
    );

    console.log(`Successfully seeded ${inserted.length} bucket list goals.`);
  } catch (err) {
    console.error("Seed error:", err.message);
  } finally {
    await mongoose.disconnect();
  }
}

runSeed();
