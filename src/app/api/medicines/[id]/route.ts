import { NextResponse } from "next/server";
import { db } from "@/db";
import { medicines } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const medicineId = parseInt(id, 10);
    if (isNaN(medicineId)) {
      return NextResponse.json({ error: "Invalid medicine ID" }, { status: 400 });
    }

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

    const updated = await db
      .update(medicines)
      .set({
        name,
        batchNumber,
        price: parseFloat(price),
        quantity: parseInt(quantity, 10),
        manufacturer: manufacturer || null,
        expiryDate: new Date(expiryDate),
        supplierId: supplierId ? parseInt(supplierId, 10) : null,
        minReorderLevel: minReorderLevel !== undefined ? parseInt(minReorderLevel, 10) : 20,
      })
      .where(eq(medicines.id, medicineId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Medicine not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const medicineId = parseInt(id, 10);
    if (isNaN(medicineId)) {
      return NextResponse.json({ error: "Invalid medicine ID" }, { status: 400 });
    }

    await db.delete(medicines).where(eq(medicines.id, medicineId));
    return NextResponse.json({ success: true, message: "Medicine deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
