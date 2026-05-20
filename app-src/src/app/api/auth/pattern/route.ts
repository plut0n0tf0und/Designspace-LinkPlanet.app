import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTelegramAlert } from "@/lib/telegram";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { pattern } = await req.json();
    if (!Array.isArray(pattern) || pattern.length < 2) {
      return NextResponse.json(
        { success: false, message: "Invalid pattern payload" },
        { status: 400 }
      );
    }

    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

    // Get or create login attempt record for this IP
    let attempt = await prisma.loginAttempt.findUnique({ where: { ip } });

    if (!attempt) {
      attempt = await prisma.loginAttempt.create({
        data: { ip },
      });
    }

    // Validate pattern against hash.
    // Supports legacy 0-indexed / 1-indexed and separator variants.
    const patternHash = process.env.PATTERN_HASH || "";
    if (!patternHash) {
      console.error("PATTERN_HASH is not configured");
      return NextResponse.json(
        { success: false, message: "Pattern auth is not configured" },
        { status: 500 }
      );
    }

    const normalizedPattern = pattern
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value));

    const candidates = new Set<string>();
    const oneIndexed = normalizedPattern.join("-");
    const oneIndexedComma = normalizedPattern.join(",");
    candidates.add(oneIndexed);
    candidates.add(oneIndexedComma);

    if (normalizedPattern.every((value) => value >= 1 && value <= 9)) {
      const zeroIndexed = normalizedPattern.map((value) => value - 1);
      candidates.add(zeroIndexed.join("-"));
      candidates.add(zeroIndexed.join(","));
    }

    let isValid = false;
    for (const candidate of candidates) {
      if (patternHash.startsWith("$2")) {
        if (await bcrypt.compare(candidate, patternHash)) {
          isValid = true;
          break;
        }
      } else if (candidate === patternHash) {
        // Compatibility fallback when PATTERN_HASH was saved as plain text.
        isValid = true;
        break;
      }
    }

    if (!isValid) {
      // Increment pattern fails
      const updated = await prisma.loginAttempt.update({
        where: { ip },
        data: { patternFails: { increment: 1 } },
      });

      if (updated.patternFails >= 3) {
        await sendTelegramAlert(
          `🚨 <b>LinkPlanet Security Alert</b>\n\n` +
          `Pattern drawn wrong <b>${updated.patternFails} times</b>\n` +
          `IP: <code>${ip}</code>\n` +
          `Time: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`
        );
      }

      return NextResponse.json(
        { success: false, message: "Invalid pattern" },
        { status: 401 }
      );
    }

    // Pattern correct — reset pattern fails counter
    await prisma.loginAttempt.update({
      where: { ip },
      data: { patternFails: 0 },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Pattern validation error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
