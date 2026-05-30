import { NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import path from "path";

const AUTH = path.join(process.cwd(), "data", "auth.json");

// POST /api/auth — verify password
export async function POST(req: Request) {
  const { password } = await req.json();
  const { password: stored } = JSON.parse(readFileSync(AUTH, "utf-8"));
  if (password === stored) return NextResponse.json({ ok: true });
  return NextResponse.json({ ok: false }, { status: 401 });
}

// PUT /api/auth — change password
export async function PUT(req: Request) {
  const { current, next } = await req.json();
  const { password: stored } = JSON.parse(readFileSync(AUTH, "utf-8"));
  if (current !== stored) return NextResponse.json({ ok: false, msg: "현재 비밀번호가 틀렸습니다." }, { status: 401 });
  if (!next || next.length < 1) return NextResponse.json({ ok: false, msg: "새 비밀번호를 입력해주세요." }, { status: 400 });
  writeFileSync(AUTH, JSON.stringify({ password: next }));
  return NextResponse.json({ ok: true });
}
