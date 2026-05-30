import { NextResponse } from "next/server";
import { verifyRecoveryCode } from "@/lib/resetCodes";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      code?: string;
    };

    const email = body.email?.trim().toLowerCase();
    const code = body.code?.trim();

    if (!email || !code) {
      return NextResponse.json(
        { ok: false, error: "Email and recovery code are required." },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { ok: false, error: "Recovery code must be 6 digits." },
        { status: 400 }
      );
    }

    const valid = verifyRecoveryCode(email, code);
    if (!valid) {
      return NextResponse.json(
        { ok: false, error: "Invalid or expired recovery code." },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, email });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Could not verify code." },
      { status: 500 }
    );
  }
}
