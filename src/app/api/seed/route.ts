import { NextResponse } from "next/server";
import { autoSeed } from "@/db/seed";

export async function GET() {
  const result = await autoSeed();
  return NextResponse.json(result);
}

export async function POST() {
  const result = await autoSeed();
  return NextResponse.json(result);
}
