import React, { useState, useEffect } from "react";
import { X, Save, Pill } from "lucide-react";

interface Supplier {
  id: number;
  name: string;
}

interface Medicine {
  id?: number;
  name: string;
  batchNumber: string;
  price: number;
  quantity: number;
  manufacturer: string | null;
  expiryDate: string | Date;
  supplierId: number | null;
  minReorderLevel: number;
}

interface MedicineFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  medicine: Medicine | null; // Null means adding new
  suppliers: Supplier[];
}

export default function MedicineFormModal({
  isOpen,
  onClose,
  onSave,
  medicine,
  suppliers,
}: MedicineFormModalProps) {
  const [name, setName] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [minReorderLevel, setMinReorderLevel] = useState("20");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (medicine) {
      setName(medicine.name || "");
      setBatchNumber(medicine.batchNumber || "");
      setPrice(medicine.price?.toString() || "");
      setQuantity(medicine.quantity?.toString() || "");
      setManufacturer(medicine.manufacturer || "");
      setMinReorderLevel(medicine.minReorderLevel?.toString() || "20");
      setSupplierId(medicine.supplierId?.toString() || "");

      if (medicine.expiryDate) {
        const d = new Date(medicine.expiryDate);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        setExpiryDate(`${yyyy}-${mm}-${dd}`);
      } else {
        setExpiryDate("");
      }
    } else {
      // Defaults for adding new
      setName("");
      setBatchNumber(`BTCH-${Math.floor(1000 + Math.random() * 9000)}`);
      setPrice("");
      setQuantity("");
      setManufacturer("");
      setSupplierId("");
      setMinReorderLevel("20");
      
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 12);
      const yyyy = futureDate.getFullYear();
      const mm = String(futureDate.getMonth() + 1).padStart(2, "0");
      const dd = String(futureDate.getDate()).padStart(2, "0");
      setExpiryDate(`${yyyy}-${mm}-${dd}`);
    }
    setError("");
  }, [medicine, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("Medicine name is required");
    if (!batchNumber.trim()) return setError("Batch number is required");
    if (!price || parseFloat(price) <= 0) return setError("Please enter a valid price (> 0)");
    if (!quantity || parseInt(quantity, 10) < 0) return setError("Please enter a valid quantity (>= 0)");
    if (!expiryDate) return setError("Expiry date is required");

    setLoading(true);
    try {
      await onSave({
        id: medicine?.id,
        name,
        batchNumber,
        price: parseFloat(price),
        quantity: parseInt(quantity, 10),
        manufacturer,
        expiryDate: new Date(expiryDate).toISOString(),
        supplierId: supplierId ? parseInt(supplierId, 10) : null,
        minReorderLevel: parseInt(minReorderLevel, 10) || 20,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Something went wrong saving the medicine");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-emerald-700 px-6 py-4 text-white">
          <div className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            <h3 className="font-bold text-lg">
              {medicine ? "Edit Stock Medicine" : "Add New Medicine"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-emerald-100 transition-colors hover:bg-emerald-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 p-3 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block font-medium text-slate-700 text-sm">Medicine Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Paracetamol 650mg"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-xs outline-hidden text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 text-sm">Batch Number *</label>
              <input
                type="text"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                placeholder="PARA-2026-01"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-xs outline-hidden text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 text-sm">Price ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="4.50"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-xs outline-hidden text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 text-sm">Quantity *</label>
              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="100"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-xs outline-hidden text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 text-sm">Min Reorder Level</label>
              <input
                type="number"
                min="1"
                value={minReorderLevel}
                onChange={(e) => setMinReorderLevel(e.target.value)}
                placeholder="20"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-xs outline-hidden text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block font-medium text-slate-700 text-sm">Manufacturer</label>
              <input
                type="text"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                placeholder="Sun Pharma, Pfizer, etc."
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-xs outline-hidden text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 text-sm">Expiry Date *</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-xs outline-hidden text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 text-sm">Supplier</label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-xs bg-white text-slate-800 outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">-- No Supplier Selected --</option>
                {suppliers.map((sup) => (
                  <option key={sup.id} value={sup.id}>
                    {sup.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 text-sm transition-all hover:bg-slate-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white text-sm shadow-md transition-all hover:bg-emerald-700 disabled:bg-slate-300"
              disabled={loading}
            >
              <Save className="h-4 w-4" />
              {loading ? "Saving..." : "Save Medicine"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
