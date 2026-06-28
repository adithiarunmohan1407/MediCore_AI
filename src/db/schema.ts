import { pgTable, serial, text, integer, doublePrecision, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(), // 'admin' | 'pharmacist'
  fullName: text("full_name").notNull(),
});

export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
});

export const medicines = pgTable("medicines", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  batchNumber: text("batch_number").notNull(),
  price: doublePrecision("price").notNull(),
  quantity: integer("quantity").notNull().default(0),
  manufacturer: text("manufacturer"),
  expiryDate: timestamp("expiry_date").notNull(),
  supplierId: integer("supplier_id").references(() => suppliers.id, { onDelete: "set null" }),
  minReorderLevel: integer("min_reorder_level").notNull().default(20),
});

export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  medicineId: integer("medicine_id").references(() => medicines.id, { onDelete: "cascade" }).notNull(),
  quantity: integer("quantity").notNull(),
  totalAmount: doublePrecision("total_amount").notNull(),
  gstAmount: doublePrecision("gst_amount").notNull().default(0),
  date: timestamp("date").notNull().defaultNow(),
  cashierName: text("cashier_name").notNull().default("Pharmacist"),
});
