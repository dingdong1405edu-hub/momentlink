import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Check DB readiness with quick query
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "ready",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      {
        status: "not_ready",
        database: "disconnected",
        error: "Database check failed",
      },
      { status: 503 }
    );
  }
}

