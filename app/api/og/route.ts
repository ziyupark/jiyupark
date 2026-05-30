import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ imageUrl: null }, { status: 400 });

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; portfolio-bot/1.0)" },
      signal: AbortSignal.timeout(8000),
    });
    const html = await res.text();

    // Try og:image then twitter:image meta tags (both attribute orders)
    const patterns = [
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
      /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
    ];

    let imageUrl: string | null = null;
    for (const p of patterns) {
      const m = html.match(p);
      if (m?.[1]) { imageUrl = m[1]; break; }
    }

    // Resolve relative paths
    if (imageUrl?.startsWith("/")) {
      imageUrl = new URL(url).origin + imageUrl;
    }

    return NextResponse.json({ imageUrl }, {
      headers: { "Cache-Control": "public, max-age=3600" },
    });
  } catch {
    return NextResponse.json({ imageUrl: null });
  }
}
