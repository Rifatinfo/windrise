import sharp from "sharp";
import path from "path";
import fs from "fs/promises";

sharp.concurrency(4);

export const ensureDir = async (dir: string) => {
  await fs.mkdir(dir, { recursive: true });
};

export const optimizeAndSaveImage = async (
  file: Express.Multer.File,
  folder: string
): Promise<string> => {
  const uploadDir = path.join(process.cwd(), "uploads", folder);

  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
  const filepath = path.join(uploadDir, filename);

  await sharp(file.buffer)
    .resize(1200, 1200, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 80 })
    .toFile(filepath);

  return filename;
};
