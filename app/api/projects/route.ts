import { NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import path from "path";

const DATA = path.join(process.cwd(), "data", "projects.json");

export async function GET() {
  const data = readFileSync(DATA, "utf-8");
  return NextResponse.json(JSON.parse(data));
}

export async function PUT(req: Request) {
  const body = await req.json();
  writeFileSync(DATA, JSON.stringify(body, null, 2));
  return NextResponse.json({ ok: true });
}
