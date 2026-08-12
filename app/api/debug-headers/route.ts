import { NextRequest, NextResponse } from "next/server";

// Temporary diagnostic route — not part of the app, remove after use.
export async function GET(request: NextRequest) {
  return NextResponse.json({
    headers: Object.fromEntries(request.headers.entries()),
  });
}
