import { NextRequest, NextResponse } from "next/server";
import { isCorrectFlag } from "@/lib/flag";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const flag = typeof body.flag === "string" ? body.flag : "";

    if (!flag.trim()) {
      return NextResponse.json(
        { correct: false, error: "Please enter a flag." },
        { status: 400 }
      );
    }

    return NextResponse.json({ correct: isCorrectFlag(flag) });
  } catch {
    return NextResponse.json(
      { correct: false, error: "Invalid request." },
      { status: 400 }
    );
  }
}
