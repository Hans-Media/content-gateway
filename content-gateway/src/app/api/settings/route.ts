import { NextRequest, NextResponse } from "next/server";
import { getDb, Settings } from "@/lib/db";

export async function GET() {
  const db = await getDb();
  return NextResponse.json({ settings: db.data.settings });
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Settings;
  const db = await getDb();
  db.data.settings = { ...db.data.settings, ...body };
  await db.write();
  return NextResponse.json({ settings: db.data.settings });
}
