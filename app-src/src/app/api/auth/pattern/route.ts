import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTelegramAlert } from "@/lib/telegram";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { pattern } = await req.json();
    console.log("Received pattern:", pattern);
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

    // Get or create login attempt record for this IP
    let attempt = await prisma.loginAttempt.findUnique({ where: { ip } });

    if (!attempt) {
      attempt = await prisma.loginAttempt.create({
        data: { ip },
      });
    }

    // Validate pattern against hash
    const patternString = pattern.join("-");
    const patternHash = process.env.PATTERN_HASH || "";

    const isValid = await bcrypt.compare(patternString, patternHash);

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
