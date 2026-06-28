import { NextResponse } from "next/server";
import { db } from "@/db";
import { sales, medicines } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const results = await db
      .select({
        id: sales.id,
        medicineId: sales.medicineId,
        quantity: sales.quantity,
        totalAmount: sales.totalAmount,
        gstAmount: sales.gstAmount,
        date: sales.date,
        cashierName: sales.cashierName,
        medicineName: medicines.name,
        unitPrice: medicines.price,
        batchNumber: medicines.batchNumber,
      })
      .from(sales)
      .leftJoin(medicines, eq(sales.medicineId, medicines.id))
      .orderBy(desc(sales.date));

    return NextResponse.json(results);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
