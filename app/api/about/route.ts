import { NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import path from "path";

const DATA = path.join(process.cwd(), "data", "about.json");

export async function GET() {
  return NextResponse.json(JSON.parse(readFileSync(DATA, "utf-8")));
}

export async function PUT(req: Request) {
  const body = await req.json();
  writeFileSync(DATA, JSON.stringify(body, null, 2));
  return NextResponse.json({ ok: true });
}
