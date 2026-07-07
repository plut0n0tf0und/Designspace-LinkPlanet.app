import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST — Create a new shortened link
export async function POST(req: NextRequest) {
  try {
    const { url, slug, domain } = await req.json();
    const finalDomain = domain || process.env.NEXT_PUBLIC_DEFAULT_DOMAIN || "vignesh-designspace.vercel.app";

    // Validate URL
    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { success: false, message: "URL is required" },
        { status: 400 }
      );
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Generate or use custom slug
    const finalSlug = slug?.trim() || Math.random().toString(36).substring(2, 8);

    // Check if slug already exists
    const existing = await prisma.link.findUnique({ 
      where: { 
        domain_slug: { domain: finalDomain, slug: finalSlug } 
      } 
    });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "This custom endpoint is already taken" },
        { status: 409 }
      );
    }

    // Create the link in the database
    const link = await prisma.link.create({
      data: {
        domain: finalDomain,
        slug: finalSlug,
        originalUrl: url,
      },
    });

    return NextResponse.json({
      success: true,
      link: {
        id: link.id,
        domain: link.domain,
        slug: link.slug,
        originalUrl: link.originalUrl,
        createdAt: link.createdAt,
      },
    });
  } catch (error) {
    console.error("Create link error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create link" },
      { status: 500 }
    );
  }
}

// GET — Fetch all links for the dashboard
export async function GET() {
  try {
    const links = await prisma.link.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { clicks: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      links: links.map((l) => ({
        id: l.id,
        domain: l.domain,
        slug: l.slug,
        originalUrl: l.originalUrl,
        active: l.active,
        clicks: l._count.clicks,
        createdAt: l.createdAt,
      })),
    });
  } catch (error) {
    console.error("Fetch links error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch links" },
      { status: 500 }
    );
  }
}
