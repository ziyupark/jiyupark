import { NextResponse } from "next/server";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import path from "path";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "파일 없음" }, { status: 400 });

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });

  // Preserve original filename; prefix timestamp if file already exists
  const ext = path.extname(file.name);
  const base = path.basename(file.name, ext);
  let filename = file.name;
  if (existsSync(path.join(uploadDir, filename))) {
    filename = `${base}_${Date.now()}${ext}`;
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  writeFileSync(path.join(uploadDir, filename), buffer);

  // Return URL-encoded public path
  const publicPath = "/uploads/" + encodeURIComponent(filename);
  return NextResponse.json({ path: publicPath, filename });
}
