import { db } from "./index";
import { users, suppliers, medicines, sales } from "./schema";
import { eq } from "drizzle-orm";

export async function autoSeed() {
  try {
    // 1. Check if users table is empty
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length > 0) {
      // Already seeded
      return { seeded: false, message: "Database already contains data" };
    }

    console.log("Seeding database...");

    // 2. Insert Users
    const insertedUsers = await db.insert(users).values([
      {
        username: "admin",
        password: "admin123", // secure simulation
        role: "admin",
        fullName: "Dr. Clara Oswald (Admin)",
      },
      {
        username: "pharmacist",
        password: "pharm123",
        role: "pharmacist",
        fullName: "John Watson (Pharmacist)",
      },
    ]).returning();

    // 3. Insert Suppliers
    const insertedSuppliers = await db.insert(suppliers).values([
      {
        name: "Sun Pharma Industries",
        phone: "+91-22-66455645",
        email: "orders@sunpharma.com",
        address: "Sun House, Goregaon East, Mumbai, India",
      },
      {
        name: "Pfizer Global Wholesalers",
        phone: "+1-555-0192",
        email: "b2b@pfizer.com",
        address: "East 42nd Street, New York, NY, USA",
      },
      {
        name: "GlaxoSmithKline Healthcare",
        phone: "+44-20-8990-9000",
        email: "retail@gsk.com",
        address: "Brentford, Middlesex, United Kingdom",
      },
      {
        name: "Apollo Pharmaceutical Distribution",
        phone: "+91-44-28290200",
        email: "logistics@apollo.com",
        address: "Ali Towers, Greams Road, Chennai, India",
      },
    ]).returning();

    const sunPharmaId = insertedSuppliers[0].id;
    const pfizerId = insertedSuppliers[1].id;
    const gskId = insertedSuppliers[2].id;
    const apolloId = insertedSuppliers[3].id;

    // 4. Insert Medicines
    // Expiry Dates
    const now = new Date();
    
    // Paracetamol: expires in 18 months
    const dateParaExpiry = new Date();
    dateParaExpiry.setMonth(now.getMonth() + 18);

    // Amoxicillin: expires in 18 days (High risk!)
    const dateAmoxExpiry = new Date();
    dateAmoxExpiry.setDate(now.getDate() + 18);

    // Vitamin D3: expires in 5 months
    const dateVitDExpiry = new Date();
    dateVitDExpiry.setMonth(now.getMonth() + 5);

    // Lipitor: expires in 11 months
    const dateLipitorExpiry = new Date();
    dateLipitorExpiry.setMonth(now.getMonth() + 11);

    // Crocin Pain Relief: expires in 14 months
    const dateCrocinExpiry = new Date();
    dateCrocinExpiry.setMonth(now.getMonth() + 14);

    // Metformin: expires in 12 months
    const dateMetforminExpiry = new Date();
    dateMetforminExpiry.setMonth(now.getMonth() + 12);

    // Ibuprofen: expires in 22 months
    const dateIbuprofenExpiry = new Date();
    dateIbuprofenExpiry.setMonth(now.getMonth() + 22);

    const insertedMedicines = await db.insert(medicines).values([
      {
        name: "Paracetamol 650mg",
        batchNumber: "PARA-2026-01",
        price: 4.50,
        quantity: 180,
        manufacturer: "Sun Pharma Industries",
        expiryDate: dateParaExpiry,
        supplierId: sunPharmaId,
        minReorderLevel: 50,
      },
      {
        name: "Amoxicillin 500mg",
        batchNumber: "AMOX-2026-X4",
        price: 12.00,
        quantity: 25,
        manufacturer: "Pfizer Global Wholesalers",
        expiryDate: dateAmoxExpiry,
        supplierId: pfizerId,
        minReorderLevel: 20,
      },
      {
        name: "Vitamin D3 60000 IU",
        batchNumber: "VITD-992",
        price: 8.00,
        quantity: 12, // Needs restocking!
        manufacturer: "Apollo Pharmaceutical Distribution",
        expiryDate: dateVitDExpiry,
        supplierId: apolloId,
        minReorderLevel: 30,
      },
      {
        name: "Lipitor 10mg",
        batchNumber: "LIP-404-B3",
        price: 24.50,
        quantity: 150,
        manufacturer: "Pfizer Global Wholesalers",
        expiryDate: dateLipitorExpiry,
        supplierId: pfizerId,
        minReorderLevel: 40,
      },
      {
        name: "Crocin Pain Relief",
        batchNumber: "CROC-777",
        price: 3.20,
        quantity: 200, // Safe stock
        manufacturer: "GlaxoSmithKline Healthcare",
        expiryDate: dateCrocinExpiry,
        supplierId: gskId,
        minReorderLevel: 15,
      },
      {
        name: "Metformin 500mg",
        batchNumber: "MET-222-A",
        price: 6.00,
        quantity: 8, // Needs restocking!
        manufacturer: "Sun Pharma Industries",
        expiryDate: dateMetforminExpiry,
        supplierId: sunPharmaId,
        minReorderLevel: 35,
      },
      {
        name: "Ibuprofen 400mg",
        batchNumber: "IBU-312-C",
        price: 5.00,
        quantity: 95,
        manufacturer: "GlaxoSmithKline Healthcare",
        expiryDate: dateIbuprofenExpiry,
        supplierId: gskId,
        minReorderLevel: 25,
      }
    ]).returning();

    // Map medicines for quick access
    const medMap: Record<string, number> = {};
    insertedMedicines.forEach(m => {
      if (m.name.startsWith("Paracetamol")) medMap["paracetamol"] = m.id;
      if (m.name.startsWith("Amoxicillin")) medMap["amoxicillin"] = m.id;
      if (m.name.startsWith("Vitamin D3")) medMap["vitD"] = m.id;
      if (m.name.startsWith("Lipitor")) medMap["lipitor"] = m.id;
      if (m.name.startsWith("Crocin")) medMap["crocin"] = m.id;
      if (m.name.startsWith("Metformin")) medMap["metformin"] = m.id;
      if (m.name.startsWith("Ibuprofen")) medMap["ibuprofen"] = m.id;
    });

    // 5. Insert Sales History
    // Let's create realistic historical sales data points to drive the Linear Regression
    // Month 1: ~90 days ago (e.g. Jan/Feb)
    // Month 2: ~60 days ago
    // Month 3: ~30 days ago
    // Month 4: Recent 1-29 days
    
    const salesData: Array<{ medicineId: number; quantity: number; totalAmount: number; date: Date; cashierName: string; gstAmount: number }> = [];

    // Helper to generate multiple small transactions summing to target quantity
    const addSalesTrend = (medId: number, basePrice: number, targetQty: number, daysAgoStart: number, daysAgoEnd: number) => {
      let remaining = targetQty;
      const daysSpan = daysAgoStart - daysAgoEnd;
      while (remaining > 0) {
        const batchQty = Math.min(remaining, Math.floor(Math.random() * 8) + 5);
        remaining -= batchQty;
        
        const saleDate = new Date();
        const randDays = daysAgoEnd + Math.floor(Math.random() * daysSpan);
        saleDate.setDate(saleDate.getDate() - randDays);
        
        const total = batchQty * basePrice;
        salesData.push({
          medicineId: medId,
          quantity: batchQty,
          totalAmount: total,
          gstAmount: Number((total * 0.12).toFixed(2)), // 12% GST
          date: saleDate,
          cashierName: "John Watson (Pharmacist)",
        });
      }
    };

    // Paracetamol: January 200, Feb 250, March 280, April 20 (recent days)
    if (medMap["paracetamol"]) {
      addSalesTrend(medMap["paracetamol"], 4.50, 200, 90, 61);
      addSalesTrend(medMap["paracetamol"], 4.50, 250, 60, 31);
      addSalesTrend(medMap["paracetamol"], 4.50, 280, 30, 2);
    }

    // Amoxicillin: Month 1: 40, Month 2: 35, Month 3: 15
    if (medMap["amoxicillin"]) {
      addSalesTrend(medMap["amoxicillin"], 12.00, 40, 90, 61);
      addSalesTrend(medMap["amoxicillin"], 12.00, 35, 60, 31);
      addSalesTrend(medMap["amoxicillin"], 12.00, 15, 30, 2);
    }

    // Vitamin D3: Month 1: 50, Month 2: 60, Month 3: 55
    if (medMap["vitD"]) {
      addSalesTrend(medMap["vitD"], 8.00, 50, 90, 61);
      addSalesTrend(medMap["vitD"], 8.00, 60, 60, 31);
      addSalesTrend(medMap["vitD"], 8.00, 55, 30, 2);
    }

    // Crocin: Month 1: 80, Month 2: 90, Month 3: 85
    if (medMap["crocin"]) {
      addSalesTrend(medMap["crocin"], 3.20, 80, 90, 61);
      addSalesTrend(medMap["crocin"], 3.20, 90, 60, 31);
      addSalesTrend(medMap["crocin"], 3.20, 85, 30, 2);
    }

    // Metformin: Month 1: 30, Month 2: 35, Month 3: 40
    if (medMap["metformin"]) {
      addSalesTrend(medMap["metformin"], 6.00, 30, 90, 61);
      addSalesTrend(medMap["metformin"], 6.00, 35, 60, 31);
      addSalesTrend(medMap["metformin"], 6.00, 40, 30, 2);
    }

    // Ibuprofen: Month 1: 70, Month 2: 65, Month 3: 75
    if (medMap["ibuprofen"]) {
      addSalesTrend(medMap["ibuprofen"], 5.00, 70, 90, 61);
      addSalesTrend(medMap["ibuprofen"], 5.00, 65, 60, 31);
      addSalesTrend(medMap["ibuprofen"], 5.00, 75, 30, 2);
    }

    await db.insert(sales).values(salesData);
    console.log(`Successfully seeded database with ${insertedMedicines.length} medicines, ${insertedSuppliers.length} suppliers, and ${salesData.length} sales rows!`);
    return { seeded: true, message: "Successfully seeded database" };
  } catch (error) {
    console.error("Seeding error:", error);
    return { seeded: false, error: String(error) };
  }
}
