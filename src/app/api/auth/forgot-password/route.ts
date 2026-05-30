import { NextResponse } from "next/server";
import { sendRecoveryEmail } from "@/lib/email";
import {
  generateRecoveryCode,
  saveRecoveryCode,
} from "@/lib/resetCodes";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { ok: false, error: "Enter a valid email address." },
        { status: 400 }
      );
    }

    const code = generateRecoveryCode();
    saveRecoveryCode(email, code);

    const result = await sendRecoveryEmail(email, code);

    return NextResponse.json({
      ok: true,
      message: result.sent
        ? "Recovery code sent. Check your inbox."
        : "Recovery code generated. Check your email or the code shown below (SMTP not configured).",
      emailSent: result.sent,
      devCode: result.sent ? undefined : result.preview,
    });
  } catch (err) {
    console.error("[forgot-password]", err);
    return NextResponse.json(
      {
        ok: false,
        error: "Could not send recovery email. Try again in a moment.",
      },
      { status: 500 }
    );
  }
}
