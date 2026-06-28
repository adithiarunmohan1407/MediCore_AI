import { NextResponse } from "next/server";
import { db } from "@/db";
import { medicines, suppliers } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { autoSeed } from "@/db/seed";

export async function GET() {
  try {
    // Run seed automatically if empty
    await autoSeed();

    const results = await db
      .select({
        id: medicines.id,
        name: medicines.name,
        batchNumber: medicines.batchNumber,
        price: medicines.price,
        quantity: medicines.quantity,
        manufacturer: medicines.manufacturer,
        expiryDate: medicines.expiryDate,
        supplierId: medicines.supplierId,
        minReorderLevel: medicines.minReorderLevel,
        supplierName: suppliers.name,
      })
      .from(medicines)
      .leftJoin(suppliers, eq(medicines.supplierId, suppliers.id))
      .orderBy(asc(medicines.name));

    return NextResponse.json(results);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      batchNumber,
      price,
      quantity,
      manufacturer,
      expiryDate,
      supplierId,
      minReorderLevel,
    } = body;

    if (!name || !batchNumber || price === undefined || quantity === undefined || !expiryDate) {
      return NextResponse.json(
        { error: "Name, batch number, price, quantity, and expiry date are required" },
        { status: 400 }
      );
    }

    const newMedicine = await db
      .insert(medicines)
      .values({
        name,
        batchNumber,
        price: parseFloat(price),
        quantity: parseInt(quantity, 10),
        manufacturer: manufacturer || null,
        expiryDate: new Date(expiryDate),
        supplierId: supplierId ? parseInt(supplierId, 10) : null,
        minReorderLevel: minReorderLevel !== undefined ? parseInt(minReorderLevel, 10) : 20,
      })
      .returning();

    return NextResponse.json(newMedicine[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
