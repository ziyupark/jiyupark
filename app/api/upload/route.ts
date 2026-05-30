import { NextResponse } from "next/server";
import path from "path";
import { uploadToR2 } from "@/lib/r2";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "파일 없음" }, { status: 400 });

  const ext = path.extname(file.name);
  const base = path.basename(file.name, ext);
  const key = `uploads/${base}_${Date.now()}${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const url = await uploadToR2(key, buffer, file.type || "application/octet-stream");

  return NextResponse.json({ path: url, filename: path.basename(key) });
}
