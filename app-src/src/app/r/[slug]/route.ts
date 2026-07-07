import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Catch-all redirect handler: GET /r/[slug]
// When someone visits myoffer.link/r/abc123, this looks up the slug,
// records the click with device/geo data, and redirects to the original URL.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";

    // Look up the link
    const link = await prisma.link.findUnique({
      where: {
        domain_slug: {
          domain: host,
          slug,
        }
      },
    });

    if (!link || !link.active) {
      // Redirect to homepage if link not found or inactive
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Extract tracking data from request headers
    const userAgent = req.headers.get("user-agent") || "";
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const referrer = req.headers.get("referer") || null;

    // Parse basic device/browser info from user-agent
    const browser = parseBrowser(userAgent);
    const os = parseOS(userAgent);
    const device = parseDevice(userAgent);

    // Record the click asynchronously (don't block the redirect)
    prisma.click.create({
      data: {
        linkId: link.id,
        browser,
        os,
        device,
        ip: ip.split(",")[0].trim(), // Take first IP if multiple
        referrer,
        // country will be populated via Vercel's geo headers in production
        country: req.headers.get("x-vercel-ip-country") || null,
      },
    }).catch((err) => console.error("Click tracking error:", err));

    // 302 Redirect to original URL
    return NextResponse.redirect(link.originalUrl, 302);
  } catch (error) {
    console.error("Redirect error:", error);
    return NextResponse.redirect(new URL("/", req.url));
  }
}

// Simple user-agent parsers
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
