import "dotenv/config";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";

const uploadsDir = path.join(process.cwd(), "data", "uploads");
const cloudflareWorkerUrl = process.env.CLOUDFLARE_WORKER_URL;

if (!cloudflareWorkerUrl) {
  throw new Error("CLOUDFLARE_WORKER_URL is not set");
}

async function migrateUploads() {
  const files = fs.readdirSync(uploadsDir);

  for (const file of files) {
    const filePath = path.join(uploadsDir, file);
    const fileStream = fs.createReadStream(filePath);
    const form = new FormData();
    form.append("file", fileStream);

    try {
      const response = await axios.post(cloudflareWorkerUrl!, form, {
        headers: {
          ...form.getHeaders(),
        },
      });
      console.log(`Uploaded ${file}:`, response.data);
    } catch (error) {
      console.error(`Failed to upload ${file}:`, error);
    }
  }
}

migrateUploads();
