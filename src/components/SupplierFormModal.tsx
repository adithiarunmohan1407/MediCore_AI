import React, { useState, useEffect } from "react";
import { X, Save, Users } from "lucide-react";

interface Supplier {
  id?: number;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
}

interface SupplierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  supplier: Supplier | null; // Null means adding new
}

export default function SupplierFormModal({
  isOpen,
  onClose,
  onSave,
  supplier,
}: SupplierFormModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (supplier) {
      setName(supplier.name || "");
      setPhone(supplier.phone || "");
      setEmail(supplier.email || "");
      setAddress(supplier.address || "");
    } else {
      setName("");
      setPhone("");
      setEmail("");
      setAddress("");
    }
    setError("");
  }, [supplier, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("Supplier name is required");

    setLoading(true);
    try {
      await onSave({
        id: supplier?.id,
        name,
        phone: phone || null,
        email: email || null,
        address: address || null,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Something went wrong saving the supplier");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-teal-700 px-6 py-4 text-white">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <h3 className="font-bold text-lg">
              {supplier ? "Edit Pharmaceutical Supplier" : "Register New Supplier"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-teal-100 transition-colors hover:bg-teal-800 hover:text-white"
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

          <div className="space-y-4">
            <div>
              <label className="block font-medium text-slate-700 text-sm">Supplier Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Pfizer India, GSK Wholesale"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-xs outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                required
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 text-sm">Contact Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1-555-0192"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-xs outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 text-sm">Contact Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="orders@pfizer.com"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-xs outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 text-sm">Office Address</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="East 42nd Street, New York, USA"
                rows={3}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-xs outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
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
              className="flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2 font-bold text-white text-sm shadow-md transition-all hover:bg-teal-700 disabled:bg-slate-300"
              disabled={loading}
            >
              <Save className="h-4 w-4" />
              {loading ? "Registering..." : "Save Supplier"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
