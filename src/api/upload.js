import express from "express";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
const upload = multer({ storage: multer.memoryStorage() });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const file = req.file;
    const filePath = `uploads/${Date.now()}_${file.originalname}`;

    const { error } = await supabase.storage
      .from("jaffnaexplore")
      .upload(filePath, file.buffer, { upsert: true });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from("jaffnaexplore")
      .getPublicUrl(filePath);

    res.json({ publicUrl: publicUrlData.publicUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

export default app;
