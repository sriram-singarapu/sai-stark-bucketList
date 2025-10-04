// scripts/seed.js
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import "dotenv/config";
import User from "../app/models/User.js";

const mask = (s) => (s ? s.slice(0, 4) + "…(" + s.length + ")" : "undefined");

// ---- Env + Cloudinary -------------------------------------------------------
function requireEnv(keys) {
  for (const k of keys) if (!process.env[k]) throw new Error(`Missing ${k}`);
}
function configureCloudinary() {
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config(); // reads CLOUDINARY_URL
    console.log(
      "Cloudinary via CLOUDINARY_URL:",
      process.env.CLOUDINARY_URL.replace(/:[^@]+@/, ":***@")
    );
  } else {
    requireEnv([
      "CLOUDINARY_CLOUD_NAME",
      "CLOUDINARY_API_KEY",
      "CLOUDINARY_API_SECRET",
    ]);
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    console.log(
      "Cloudinary via explicit vars:",
      `name=${process.env.CLOUDINARY_CLOUD_NAME}, key=${mask(process.env.CLOUDINARY_API_KEY)}`
    );
  }
}
async function cloudinaryPreflight() {
  // Upload a tiny 1x1 PNG from base64 to validate credentials independent of file paths
  const onePx =
    "data:image/png;base64," +
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAuMBgq3Qeb0AAAAASUVORK5CYII=";
  const res = await cloudinary.uploader.upload(onePx, {
    folder: "blog_seed/_preflight",
    public_id: "ping",
    overwrite: true,
  });
  console.log("Cloudinary preflight ok ->", res.secure_url);
}

// ---- Mongo ------------------------------------------------------------------
async function connectDb() {
  requireEnv(["MONGODB_URI"]);
  await mongoose.connect(process.env.MONGODB_URI); // remove deprecated opts
  console.log("Connected to MongoDB");
}

// ---- Upload helper ----------------------------------------------------------
function toAbs(inputPath) {
  // Accept both "/scripts/…" and "scripts\…"
  const trimmed = inputPath.replace(/^[/\\]+/, "");
  return path.join(process.cwd(), trimmed);
}
async function uploadIfExists(inputPath) {
  const abs = toAbs(inputPath);
  console.log("Resolved path:", abs);

  if (!fs.existsSync(abs)) {
    console.warn("File not found, skipping:", abs);
    return inputPath;
  }
  try {
    console.log("Uploading:", abs);
    const res = await cloudinary.uploader.upload(abs, {
      folder: "blog_seed",
      use_filename: true,
      unique_filename: false,
      resource_type: "image",
    });
    console.log("Uploaded ->", res.secure_url);
    return res.secure_url;
  } catch (err) {
    console.error("Upload failed:", err?.message ?? err);
    return inputPath;
  }
}

// ---- Main -------------------------------------------------------------------
async function seed() {
  try {
    console.log("CWD:", process.cwd());
    console.log("Env check: MONGODB_URI present?", !!process.env.MONGODB_URI);
    configureCloudinary();
    await cloudinaryPreflight(); // fails fast if api_key/secret wrong
    await connectDb();

    const localAvatar = "/scripts/seed-images/IMG-20250714-WA0063.jpg";
    const localGallery = [
      "/scripts/seed-images/DSC_0032.JPG",
      "/scripts/seed-images/DSC_0037.JPG",
      "/scripts/seed-images/IMG-20250714-WA0064.jpg",
      "/scripts/seed-images/PXL_20250216_010903628.jpg",
    ];

    const uploadedAvatar = await uploadIfExists(localAvatar);
    const uploadedGallery = [];
    for (const p of localGallery) {
      // eslint-disable-next-line no-await-in-loop
      uploadedGallery.push(await uploadIfExists(p));
    }

    const profileData = {
      name: "Sai Stark",
      email: "dharmasaisingarapu051@gmail.com",
      instagram: "https://www.instagram.com/sai._.stark?igsh=eTRuNWF0OGppd2w2",
      whatsapp: "https://wa.me/919391953591",
      bio: "Welcome to My Bucket List! I'm Sai Stark, an avid traveler and adventure seeker. This is my personal space to share my dreams, experiences, and the places I aspire to visit.",
      avatar: uploadedAvatar,
      gallery: uploadedGallery,
    };

    const result = await User.findOneAndUpdate(
      { email: profileData.email },
      profileData,
      { new: true, upsert: true, runValidators: true }
    );

    console.log("Seed complete. Profile upserted:", result._id);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  } finally {
    try {
      await mongoose.disconnect();
      console.log("Disconnected. Done.");
    } catch {}
  }
}

seed();
