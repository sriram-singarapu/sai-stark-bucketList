import dns from "dns/promises";
import mongoose from "mongoose";
import "dotenv/config";
import User from "../app/models/User.js";
import BucketItem from "../app/models/BucketItem.js";
import { DEFAULT_BUCKET_LIST } from "../app/data/defaultBucketList.ts";

async function run() {
  // Use public DNS resolvers to get SRV
  const resolver = new dns.Resolver();
  resolver.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);

  let connectionUri = process.env.MONGODB_URI;

  try {
    console.log("Resolving SRV records via Google DNS (8.8.8.8)...");
    const srvRecords = await resolver.resolveSrv("_mongodb._tcp.cluster0.9mrlzgb.mongodb.net");
    console.log("SRV Records found:", srvRecords);

    const hosts = srvRecords.map((r) => `${r.name}:${r.port}`).join(",");
    connectionUri = `mongodb://sriramsingarapu2_db_user:Sr%40057sr@${hosts}/saiStark?ssl=true&replicaSet=atlas-9mrlzgb-shard-0&authSource=admin&retryWrites=true&w=majority`;
    console.log("Constructed direct replica set URI successfully!");
  } catch (dnsErr) {
    console.warn("SRV direct resolve note:", dnsErr.message);
  }

  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(connectionUri, {
    serverSelectionTimeoutMS: 20000,
  });

  console.log(" Connected to MongoDB Atlas!");

  // 1. Profile Seed
  const profileData = {
    name: "Sai Stark",
    email: "dharmasaisingarapu051@gmail.com",
    instagram: "https://www.instagram.com/sai._.stark?igsh=eTRuNWF0OGppd2w2",
    whatsapp: "https://wa.me/919391953591",
    bio: "Welcome to My Bucket List! I'm Sai Stark, an avid traveler and adventure seeker. This is my personal space to share my dreams, experiences, and the places I aspire to visit.",
    avatar: "/IMG-20250714-WA0063.jpg",
    gallery: [
      "/DSC_0032.JPG",
      "/DSC_0037.JPG",
      "/IMG-20250714-WA0064.jpg",
      "/PXL_20250216_010903628.jpg",
    ],
  };

  await User.findOneAndUpdate(
    { email: profileData.email },
    profileData,
    { new: true, upsert: true }
  );
  console.log(" Profile Seeded: Sai Stark");

  // 2. Bucket List Items Seed
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

  console.log(` Successfully inserted ${inserted.length} bucket list goals into MongoDB Atlas!`);
  console.log("\n DATABASE SEEDING COMPLETED SUCCESSFULLY! ");

  await mongoose.disconnect();
  console.log("Database disconnected cleanly.");
}

run().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
