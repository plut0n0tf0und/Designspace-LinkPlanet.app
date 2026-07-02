import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET — Fetch single link details with analytics
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const link = await prisma.link.findUnique({
      where: { id },
      include: {
        clicks: {
          orderBy: { createdAt: "desc" },
          select: { id: true, country: true, device: true, createdAt: true, browser: true, os: true, referrer: true },
        },
        _count: {
          select: { clicks: true },
        },
      },
    });

    if (!link) {
      return NextResponse.json(
        { success: false, message: "Link not found" },
        { status: 404 }
      );
    }

    const allClicks = link.clicks;
    const now = new Date();

    // ── Time-series helpers ──────────────────────────────────────────────────

    // Group clicks by date string key
    function groupByDay(clicks: typeof allClicks) {
      const map: Record<string, number> = {};
      for (const c of clicks) {
        const key = c.createdAt.toISOString().slice(0, 10); // "YYYY-MM-DD"
        map[key] = (map[key] ?? 0) + 1;
      }
      return map;
    }

    // Fill missing days in a range with 0
    function fillDays(map: Record<string, number>, start: Date, end: Date) {
      const result: { date: string; views: number }[] = [];
      const cur = new Date(start);
      cur.setHours(0, 0, 0, 0);
      while (cur <= end) {
        const key = cur.toISOString().slice(0, 10);
        result.push({ date: key, views: map[key] ?? 0 });
        cur.setDate(cur.getDate() + 1);
      }
      return result;
    }

    // Month view — last 30 days, one point per day
    const monthStart = new Date(now);
    monthStart.setDate(now.getDate() - 29);
    const monthClicks = allClicks.filter((c) => c.createdAt >= monthStart);
    const monthSeries = fillDays(groupByDay(monthClicks), monthStart, now);

    // Year view — last 12 months, one point per week (Mon-Sun)
    const yearStart = new Date(now);
    yearStart.setFullYear(now.getFullYear() - 1);
    const yearClicks = allClicks.filter((c) => c.createdAt >= yearStart);
    const weekMap: Record<string, number> = {};
    for (const c of yearClicks) {
      const d = new Date(c.createdAt);
      // ISO week start (Monday)
      const day = d.getDay() || 7;
      d.setDate(d.getDate() - day + 1);
      const key = d.toISOString().slice(0, 10);
      weekMap[key] = (weekMap[key] ?? 0) + 1;
    }
    const yearSeries = Object.entries(weekMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, views]) => ({ date, views }));

    // All-time view — group by month
    const allMap: Record<string, number> = {};
    for (const c of allClicks) {
      const key = c.createdAt.toISOString().slice(0, 7); // "YYYY-MM"
      allMap[key] = (allMap[key] ?? 0) + 1;
    }
    const allSeries = Object.entries(allMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, views]) => ({ date, views }));

    // ── Breakdown helpers ────────────────────────────────────────────────────

    function countBy(field: "country" | "device") {
      const map: Record<string, number> = {};
      for (const c of allClicks) {
        const val = c[field] ?? "Unknown";
        map[val] = (map[val] ?? 0) + 1;
      }
      return Object.entries(map)
        .sort(([, a], [, b]) => b - a)
        .map(([name, views]) => ({ name, views }));
    }

    const countriesBreakdown = countBy("country");
    const devicesBreakdown = countBy("device");

    // Top 6 countries + "Other" bucket
    const topCountries = countriesBreakdown.slice(0, 6);
    const otherCountries = countriesBreakdown.slice(6).reduce((s, c) => s + c.views, 0);
    if (otherCountries > 0) topCountries.push({ name: "Other", views: otherCountries });

    // Unique countries list (for backward compat)
    const countries = Array.from(
      new Set(allClicks.map((c) => c.country).filter(Boolean))
    );

    return NextResponse.json({
      success: true,
      link: {
        id: link.id,
        slug: link.slug,
        originalUrl: link.originalUrl,
        active: link.active,
        createdAt: link.createdAt,
        updatedAt: link.updatedAt,
        totalClicks: link._count.clicks,
        countries,
        // Chart data
        timeSeries: { month: monthSeries, year: yearSeries, all: allSeries },
        countriesBreakdown: topCountries,
        devicesBreakdown,
        clicks: link.clicks,
      },
    });
  } catch (error) {
    console.error("Fetch link error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch link" },
      { status: 500 }
    );
  }
}

// PATCH — Toggle link active status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { active } = await req.json();

    if (typeof active !== "boolean") {
      return NextResponse.json(
        { success: false, message: "active must be a boolean" },
        { status: 400 }
      );
    }

    const link = await prisma.link.update({
      where: { id },
      data: { active },
    });

    return NextResponse.json({
      success: true,
      link: {
        id: link.id,
        active: link.active,
      },
    });
  } catch (error) {
    console.error("Toggle link error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to toggle link" },
      { status: 500 }
    );
  }
}

// DELETE — Delete a link
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.link.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Link deleted successfully",
    });
  } catch (error) {
    console.error("Delete link error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete link" },
      { status: 500 }
    );
  }
}
