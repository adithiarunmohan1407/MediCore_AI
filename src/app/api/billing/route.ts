import { NextResponse } from "next/server";
import { db } from "@/db";
import { medicines, sales } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, cashierName } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items provided for billing" }, { status: 400 });
    }

    const cashier = cashierName || "Pharmacist";
    const processedItems: Array<any> = [];
    const invoiceSales: Array<any> = [];

    // Let's run inside a database transaction to ensure atomic consistency
    const result = await db.transaction(async (tx) => {
      let grandTotal = 0;
      let grandGst = 0;

      for (const item of items) {
        const medId = parseInt(item.id, 10);
        const qtyToBuy = parseInt(item.quantity, 10);

        if (isNaN(medId) || isNaN(qtyToBuy) || qtyToBuy <= 0) {
          throw new Error("Invalid medicine ID or quantity");
        }

        // Fetch medicine to check stock
        const [med] = await tx
          .select()
          .from(medicines)
          .where(eq(medicines.id, medId));

        if (!med) {
          throw new Error(`Medicine with ID ${medId} not found`);
        }

        if (med.quantity < qtyToBuy) {
          throw new Error(`Insufficient stock for ${med.name}. Available: ${med.quantity}, requested: ${qtyToBuy}`);
        }

        // Calculations
        const itemPrice = med.price;
        const totalAmount = itemPrice * qtyToBuy;
        const gstAmount = Number((totalAmount * 0.12).toFixed(2)); // 12% GST

        grandTotal += totalAmount;
        grandGst += gstAmount;

        // Deduct stock
        const updatedQty = med.quantity - qtyToBuy;
        await tx
          .update(medicines)
          .set({ quantity: updatedQty })
          .where(eq(medicines.id, medId));

        // Create sale record
        const [newSale] = await tx
          .insert(sales)
          .values({
            medicineId: medId,
            quantity: qtyToBuy,
            totalAmount: totalAmount,
            gstAmount: gstAmount,
            cashierName: cashier,
          })
          .returning();

        processedItems.push({
          medicineId: medId,
          name: med.name,
          batchNumber: med.batchNumber,
          unitPrice: itemPrice,
          quantity: qtyToBuy,
          total: totalAmount,
          gst: gstAmount,
        });

        invoiceSales.push(newSale);
      }

      return {
        success: true,
        invoice: {
          items: processedItems,
          subtotal: grandTotal,
          gstTotal: grandGst,
          grandTotal: grandTotal + grandGst,
          cashier: cashier,
          date: new Date(),
        }
      };
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
