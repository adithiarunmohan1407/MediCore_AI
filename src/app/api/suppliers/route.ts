import { NextResponse } from "next/server";
import { db } from "@/db";
import { suppliers } from "@/db/schema";
import { asc } from "drizzle-orm";
import { autoSeed } from "@/db/seed";

export async function GET() {
  try {
    // Run seed automatically if empty
    await autoSeed();
    
    const allSuppliers = await db.select().from(suppliers).orderBy(asc(suppliers.name));
    return NextResponse.json(allSuppliers);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, email, address } = body;
    
    if (!name) {
      return NextResponse.json({ error: "Supplier name is required" }, { status: 400 });
    }
    
    const newSupplier = await db.insert(suppliers).values({
      name,
      phone: phone || null,
      email: email || null,
      address: address || null,
    }).returning();
    
    return NextResponse.json(newSupplier[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
