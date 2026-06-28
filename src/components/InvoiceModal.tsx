import React from "react";
import { X, Printer, CheckCircle } from "lucide-react";

interface InvoiceItem {
  medicineId: number;
  name: string;
  batchNumber: string;
  unitPrice: number;
  quantity: number;
  total: number;
  gst: number;
}

interface Invoice {
  items: InvoiceItem[];
  subtotal: number;
  gstTotal: number;
  grandTotal: number;
  cashier: string;
  date: string | Date;
}

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

export default function InvoiceModal({ isOpen, onClose, invoice }: InvoiceModalProps) {
  if (!isOpen || !invoice) return null;

  const dateObj = new Date(invoice.date);
  const formattedDate = dateObj.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const invoiceNumber = `MC-${Math.floor(100000 + Math.random() * 900000)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
        {/* Header (Hidden on system print but visible on screen) */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-emerald-600 px-6 py-4 text-white print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6" />
            <h3 className="font-semibold text-lg">Invoice Generated Successfully</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-emerald-100 transition-colors hover:bg-emerald-700 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Printable Area */}
        <div className="p-8 print:p-0" id="printable-invoice">
          {/* Invoice Header */}
          <div className="flex justify-between border-b-2 border-slate-100 pb-6">
            <div>
              <div className="flex items-center gap-2 text-emerald-600">
                <span className="font-extrabold text-2xl tracking-wider text-emerald-700">MEDICORE AI</span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-bold text-xs text-emerald-800">SMART SYSTEM</span>
              </div>
              <p className="mt-1 text-slate-500 text-sm">Automated Healthcare Dispensing & Analytics</p>
              <p className="text-slate-400 text-xs">Lic No: DL-392019/MC2</p>
            </div>
            <div className="text-right">
              <h2 className="font-black text-slate-800 text-3xl">INVOICE</h2>
              <p className="font-mono text-slate-600 text-sm">Invoice #: {invoiceNumber}</p>
              <p className="text-slate-500 text-xs">Date: {formattedDate}</p>
            </div>
          </div>

          {/* Metadata */}
          <div className="my-6 grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            <div>
              <p className="font-semibold text-slate-800 uppercase tracking-wider text-xs">Issued By</p>
              <p className="font-medium text-slate-700">{invoice.cashier}</p>
              <p className="text-slate-500 text-xs">MediCore AI Smart Pharmacy</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-slate-800 uppercase tracking-wider text-xs">Patient / Customer</p>
              <p className="font-medium text-slate-700">General Walk-in Patient</p>
              <p className="text-slate-500 text-xs">Payment Method: Cash/UPI</p>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead>
                <tr className="border-b border-slate-200 text-slate-800 font-semibold uppercase tracking-wider text-xs">
                  <th className="py-2">Medicine Name</th>
                  <th className="py-2 text-center">Batch No</th>
                  <th className="py-2 text-right">Price</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">GST (12%)</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items.map((item, index) => (
                  <tr key={index} className="text-slate-700">
                    <td className="py-3 font-medium text-slate-900">{item.name}</td>
                    <td className="py-3 text-center font-mono text-xs">{item.batchNumber}</td>
                    <td className="py-3 text-right">${item.unitPrice.toFixed(2)}</td>
                    <td className="py-3 text-center">{item.quantity}</td>
                    <td className="py-3 text-right text-slate-500">${item.gst.toFixed(2)}</td>
                    <td className="py-3 text-right font-medium text-slate-900">${item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="mt-6 border-t border-slate-200 pt-4">
            <div className="ml-auto w-full max-w-xs space-y-2 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-mono text-slate-900">${invoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (12% CGST+SGST):</span>
                <span className="font-mono text-slate-900">${invoice.gstTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2 font-bold text-slate-900 text-base">
                <span className="text-emerald-700">Net Payable:</span>
                <span className="font-mono text-emerald-700">${invoice.grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Disclaimer & Footer */}
          <div className="mt-12 border-t border-dashed border-slate-200 pt-6 text-center text-slate-400 text-xs">
            <p className="font-semibold text-slate-500">Thank you for your trust! Get Well Soon.</p>
            <p className="mt-1">Computer generated smart invoice. No signature required. Medicines once sold cannot be returned.</p>
            <p className="mt-1 font-mono text-[9px]">Powered by MediCore AI Predictive System</p>
          </div>
        </div>

        {/* Buttons (Hidden on system print) */}
        <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 print:hidden">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 text-sm transition-all hover:bg-slate-50"
          >
            Close Receipt
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white text-sm shadow-md transition-all hover:bg-emerald-700 hover:shadow-lg active:scale-95"
          >
            <Printer className="h-4 w-4" />
            Print Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
