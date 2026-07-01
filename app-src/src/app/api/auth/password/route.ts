import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTelegramAlert } from "@/lib/telegram";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

    // Get attempt record
    let attempt = await prisma.loginAttempt.findUnique({ where: { ip } });
    if (!attempt) {
      attempt = await prisma.loginAttempt.create({ data: { ip } });
    }

    // Validate password
    const passwordHash = process.env.PASSWORD_HASH || "";
    const isValid = await bcrypt.compare(password, passwordHash);


    if (!isValid) {
      const updated = await prisma.loginAttempt.update({
        where: { ip },
        data: { passwordFails: { increment: 1 } },
      });

      if (updated.passwordFails >= 2) {
        await sendTelegramAlert(
          `🚨 <b>LinkPlanet Security Alert</b>\n\n` +
          `Pattern was <b>CORRECT</b> but password wrong <b>${updated.passwordFails} times</b>\n` +
          `⚠️ Someone knows your pattern!\n` +
          `IP: <code>${ip}</code>\n` +
          `Time: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`
        );
      }

      return NextResponse.json(
        { success: false, message: "Invalid password" },
        { status: 401 }
      );
    }

    // Password correct — reset all counters
    await prisma.loginAttempt.update({
      where: { ip },
      data: { patternFails: 0, passwordFails: 0 },
    });

    // Create JWT token
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
    const token = await new SignJWT({ authenticated: true })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);

    const response = NextResponse.json({ success: true });
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Password validation error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
