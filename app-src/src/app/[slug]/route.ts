import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Root-level redirect handler: GET /[slug]
// Example: designspace.vercel.app/portfolio
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const link = await prisma.link.findUnique({
      where: { slug },
    });

    if (!link || !link.active) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    const userAgent = req.headers.get("user-agent") || "";
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const referrer = req.headers.get("referer") || null;

    const browser = parseBrowser(userAgent);
    const os = parseOS(userAgent);
    const device = parseDevice(userAgent);

    prisma.click
      .create({
        data: {
          linkId: link.id,
          browser,
          os,
          device,
          ip: ip.split(",")[0].trim(),
          referrer,
          country: req.headers.get("x-vercel-ip-country") || null,
        },
      })
      .catch((err) => console.error("Click tracking error:", err));

    return NextResponse.redirect(link.originalUrl, 302);
  } catch (error) {
    console.error("Redirect error:", error);
    return NextResponse.redirect(new URL("/", req.url));
  }
}

function parseBrowser(ua: string): string {
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edg/")) return "Edge";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  if (ua.includes("Opera") || ua.includes("OPR")) return "Opera";
  return "Other";
}

function parseOS(ua: string): string {
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Mac OS")) return "macOS";
  if (ua.includes("Linux")) return "Linux";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
  return "Other";
}

function parseDevice(ua: string): string {
  if (ua.includes("Mobile") || ua.includes("Android")) return "Mobile";
  if (ua.includes("Tablet") || ua.includes("iPad")) return "Tablet";
  return "Desktop";
}
