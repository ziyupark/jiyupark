import { NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { getJsonFromR2, putJsonToR2 } from "@/lib/r2";

const LOCAL = path.join(process.cwd(), "data", "projects.json");
const KEY = "data/projects.json";

export async function GET() {
  const data = await getJsonFromR2(KEY);
  if (data) return NextResponse.json(data);
  return NextResponse.json(JSON.parse(readFileSync(LOCAL, "utf-8")));
}

export async function PUT(req: Request) {
  const body = await req.json();
  try {
    await putJsonToR2(KEY, body);
  } catch {
    writeFileSync(LOCAL, JSON.stringify(body, null, 2));
  }
  return NextResponse.json({ ok: true });
}
