// pages/api/upload.js
import nextConnect from "next-connect";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

export const config = {
  api: { bodyParser: false }, // Disable default body parsing so multer can handle it
};

// Use multer to handle multipart form data
const upload = multer({ storage: multer.diskStorage({}) });
const apiRoute = nextConnect();

// Parse a single file from the 'file' field
apiRoute.use(upload.single("file"));

apiRoute.post(async (req, res) => {
  try {
    // Upload image file to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);
    // Return the secure URL of the uploaded image
    res.status(200).json({ success: true, url: result.secure_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload to Cloudinary failed" });
  }
});

export default apiRoute;
