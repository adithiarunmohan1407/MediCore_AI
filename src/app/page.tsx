"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Activity,
  Pill,
  Users,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Search,
  FileText,
  CheckCircle,
  XCircle,
  DollarSign,
  Calendar,
  Shield,
  Info,
  Lock,
  LogOut,
  Filter,
  ArrowRight,
  Database,
  Brain,
  Printer,
  ChevronRight
} from "lucide-react";

import InvoiceModal from "@/components/InvoiceModal";
import MedicineFormModal from "@/components/MedicineFormModal";
import SupplierFormModal from "@/components/SupplierFormModal";

// Definition of interfaces
interface Medicine {
  id: number;
  name: string;
  batchNumber: string;
  price: number;
  quantity: number;
  manufacturer: string | null;
  expiryDate: string;
  supplierId: number | null;
  minReorderLevel: number;
  supplierName?: string | null;
}

interface Supplier {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
}

interface Sale {
  id: number;
  medicineId: number;
  quantity: number;
  totalAmount: number;
  gstAmount: number;
  date: string;
  cashierName: string;
  medicineName?: string | null;
  unitPrice?: number | null;
  batchNumber?: string | null;
}

interface AnalyticsData {
  metrics: {
    totalMedicines: number;
    totalSuppliers: number;
    totalSalesCount: number;
    totalRevenue: number;
    totalGst: number;
    lowStockCount: number;
    atExpiryRiskCount: number;
  };
  forecasting: Array<{
    medicineId: number;
    name: string;
    currentStock: number;
    m1Sales: number;
    m2Sales: number;
    m3Sales: number;
    slope: number;
    predictedDemand: number;
    trend: string;
  }>;
  expiryPredictions: Array<{
    medicineId: number;
    name: string;
    quantity: number;
    expiryDate: string;
    daysRemaining: number;
    dailySalesRate: number;
    monthlySalesRate: number;
    expectedSalesBeforeExpiry: number;
    riskScore: number;
    predictionMessage: string;
    batchNumber: string;
  }>;
  reorders: Array<{
    medicineId: number;
    name: string;
    quantity: number;
    minReorderLevel: number;
    status: "restock" | "warning" | "safe";
    message: string;
  }>;
  charts: {
    dailySales: Array<{ date: string; amount: number; quantity: number }>;
    topSelling: Array<{ name: string; quantity: number; revenue: number }>;
    supplierRevenue: Array<{ name: string; revenue: number }>;
  };
}

export default function MediCoreAIApp() {
  // Session States
  const [currentUser, setCurrentUser] = useState<{ username: string; role: "admin" | "pharmacist"; fullName: string } | null>(null);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setErrorMsg] = useState("");

  // Data States
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  // Search & Filter States
  const [searchMedicine, setSearchMedicine] = useState("");
  const [searchSupplier, setSearchSupplier] = useState("");
  const [searchSale, setSearchSale] = useState("");
  const [filterSupplier, setFilterSupplier] = useState<string>("all");
  const [filterStockStatus, setFilterStockStatus] = useState<string>("all");

  // Cart Billing POS States
  const [cart, setCart] = useState<Array<{ medicine: Medicine; quantity: number }>>([]);
  const [cashierName, setCashierName] = useState("");

  // Loading & Refresh states
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "inventory" | "billing" | "suppliers" | "sales" | "ai_ml">("dashboard");

  // Modal Control States
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState<any>(null);

  const [isMedModalOpen, setIsMedModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);

  const [isSupModalOpen, setIsSupModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Auto Quick Login option
  const handleQuickLogin = (role: "admin" | "pharmacist") => {
    if (role === "admin") {
      setCurrentUser({
        username: "admin",
        role: "admin",
        fullName: "Dr. Clara Oswald (Admin)",
      });
    } else {
      setCurrentUser({
        username: "pharmacist",
        role: "pharmacist",
        fullName: "John Watson (Pharmacist)",
      });
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (loginUsername === "admin" && loginPassword === "admin123") {
      setCurrentUser({
        username: "admin",
        role: "admin",
        fullName: "Dr. Clara Oswald (Admin)",
      });
    } else if (loginUsername === "pharmacist" && loginPassword === "pharm123") {
      setCurrentUser({
        username: "pharmacist",
        role: "pharmacist",
        fullName: "John Watson (Pharmacist)",
      });
    } else {
      setErrorMsg("Invalid username or password. Check the quick demo buttons!");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCart([]);
    setLoginUsername("");
    setLoginPassword("");
  };

  // Fetch Core Datasets
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch suppliers
      const supRes = await fetch("/api/suppliers");
      const suppliersData = await supRes.json();
      if (!suppliersData.error) setSuppliers(suppliersData);

      // Fetch medicines
      const medRes = await fetch("/api/medicines");
      const medicinesData = await medRes.json();
      if (!medicinesData.error) setMedicines(medicinesData);

      // Fetch sales
      const salesRes = await fetch("/api/sales");
      const salesData = await salesRes.json();
      if (!salesData.error) setSales(salesData);

      // Fetch analytics
      const analyticsRes = await fetch("/api/analytics");
      const aData = await analyticsRes.json();
      if (!aData.error) setAnalytics(aData);
    } catch (e) {
      console.error("Error fetching data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchData();
      setCashierName(currentUser.fullName);
    }
  }, [currentUser]);

  // Restock action for simulation
  const handleQuickRestock = async (medicineId: number) => {
    setActionLoading(true);
    try {
      const target = medicines.find((m) => m.id === medicineId);
      if (!target) return;

      const updatedQty = target.quantity + 100; // Add 100 units
      const res = await fetch(`/api/medicines/${medicineId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...target,
          quantity: updatedQty,
        }),
      });

      if (res.ok) {
        // Refresh local data
        await fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Medicine
  const handleDeleteMedicine = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this medicine?")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/medicines/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  // Save/Edit Medicine
  const handleSaveMedicine = async (medData: any) => {
    const isEdit = !!medData.id;
    const url = isEdit ? `/api/medicines/${medData.id}` : "/api/medicines";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(medData),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to save medicine");
    }

    await fetchData();
  };

  // Delete Supplier
  const handleDeleteSupplier = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this supplier? All associated medicines will remain but have supplier set to None.")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/suppliers/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  // Save/Edit Supplier
  const handleSaveSupplier = async (supData: any) => {
    const isEdit = !!supData.id;
    const url = isEdit ? `/api/suppliers/${supData.id}` : "/api/suppliers";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(supData),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to save supplier");
    }

    await fetchData();
  };

  // POS Billing Cart Functions
  const handleAddToCart = (medicine: Medicine) => {
    if (medicine.quantity === 0) {
      alert("This medicine is currently OUT OF STOCK!");
      return;
    }

    const existingIndex = cart.findIndex((item) => item.medicine.id === medicine.id);
    if (existingIndex > -1) {
      const currentQty = cart[existingIndex].quantity;
      if (currentQty >= medicine.quantity) {
        alert(`Cannot add more. Only ${medicine.quantity} units are available in stock.`);
        return;
      }
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += 1;
      setCart(updatedCart);
    } else {
      setCart([...cart, { medicine, quantity: 1 }]);
    }
  };

  const handleUpdateCartQuantity = (medicineId: number, qty: number) => {
    const targetMed = medicines.find((m) => m.id === medicineId);
    if (!targetMed) return;

    if (qty <= 0) {
      setCart(cart.filter((item) => item.medicine.id !== medicineId));
      return;
    }

    if (qty > targetMed.quantity) {
      alert(`Cannot exceed available stock of ${targetMed.quantity} units.`);
      return;
    }

    const updatedCart = cart.map((item) => {
      if (item.medicine.id === medicineId) {
        return { ...item, quantity: qty };
      }
      return item;
    });
    setCart(updatedCart);
  };

  const handleRemoveFromCart = (medicineId: number) => {
    setCart(cart.filter((item) => item.medicine.id !== medicineId));
  };

  const handlePOSCheckout = async () => {
    if (cart.length === 0) return;
    setActionLoading(true);
    try {
      const payload = {
        items: cart.map((item) => ({
          id: item.medicine.id,
          quantity: item.quantity,
        })),
        cashierName: cashierName,
      };

      const res = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await res.json();

      if (!res.ok) {
        alert(responseData.error || "Checkout failed");
        return;
      }

      // Successful sale
      setActiveInvoice(responseData.invoice);
      setIsInvoiceOpen(true);
      setCart([]); // Clear POS
      await fetchData(); // Refresh data
    } catch (e: any) {
      alert("Error checking out: " + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered lists
  const filteredMedicines = useMemo(() => {
    return medicines.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchMedicine.toLowerCase()) ||
        (m.batchNumber && m.batchNumber.toLowerCase().includes(searchMedicine.toLowerCase())) ||
        (m.manufacturer && m.manufacturer.toLowerCase().includes(searchMedicine.toLowerCase()));

      const matchesSupplier =
        filterSupplier === "all" || m.supplierId?.toString() === filterSupplier;

      let matchesStock = true;
      if (filterStockStatus === "low") {
        matchesStock = m.quantity <= m.minReorderLevel;
      } else if (filterStockStatus === "out") {
        matchesStock = m.quantity === 0;
      } else if (filterStockStatus === "healthy") {
        matchesStock = m.quantity > m.minReorderLevel;
      }

      return matchesSearch && matchesSupplier && matchesStock;
    });
  }, [medicines, searchMedicine, filterSupplier, filterStockStatus]);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      return (
        s.name.toLowerCase().includes(searchSupplier.toLowerCase()) ||
        (s.phone && s.phone.includes(searchSupplier)) ||
        (s.email && s.email.toLowerCase().includes(searchSupplier.toLowerCase()))
      );
    });
  }, [suppliers, searchSupplier]);

  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      return (
        (s.medicineName && s.medicineName.toLowerCase().includes(searchSale.toLowerCase())) ||
        (s.cashierName && s.cashierName.toLowerCase().includes(searchSale.toLowerCase())) ||
        (s.batchNumber && s.batchNumber.toLowerCase().includes(searchSale.toLowerCase()))
      );
    });
  }, [sales, searchSale]);

  const cartTotal = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.medicine.price * item.quantity, 0);
    const gst = Number((subtotal * 0.12).toFixed(2));
    return {
      subtotal,
      gst,
      grand: subtotal + gst,
    };
  }, [cart]);

  // Linear Regression details for the selected interactive medicine in AI panel
  const [selectedForecastMedId, setSelectedForecastMedId] = useState<number | "">("");
  const activeForecastMed = useMemo(() => {
    if (!analytics || analytics.forecasting.length === 0) return null;
    if (selectedForecastMedId === "") {
      return analytics.forecasting[0];
    }
    return analytics.forecasting.find((f) => f.medicineId === Number(selectedForecastMedId)) || analytics.forecasting[0];
  }, [analytics, selectedForecastMedId]);

  // Set default selection once analytics loads
  useEffect(() => {
    if (analytics && analytics.forecasting.length > 0 && selectedForecastMedId === "") {
      setSelectedForecastMedId(analytics.forecasting[0].medicineId);
    }
  }, [analytics]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Dynamic Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 py-3.5 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-950/20">
              <Brain className="h-6 w-6 animate-pulse" />
              <div className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-slate-950 bg-emerald-400"></div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white sm:text-2xl">MEDICORE</span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-black text-[10px] text-emerald-400 uppercase tracking-widest border border-emerald-500/20">AI v1.4</span>
              </div>
              <p className="hidden text-slate-400 text-xs sm:block">Intelligent Pharmacy Management & Demand Forecasting</p>
            </div>
          </div>

          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="hidden text-right md:block">
                <p className="font-bold text-slate-200 text-sm">{currentUser.fullName}</p>
                <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">{currentUser.role === "admin" ? "🛡️ System Administrator" : "⚡ Pharmacist Staff"}</p>
              </div>
              <div className="h-9 w-9 rounded-xl bg-slate-800 flex items-center justify-center text-white border border-slate-700 font-bold">
                {currentUser.role === "admin" ? "AD" : "PH"}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/60 p-2 text-slate-400 text-xs font-bold transition-all hover:border-red-800 hover:bg-red-950/10 hover:text-red-400"
                title="Sign out of pharmacy panel"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-lg bg-slate-800/80 px-2 py-1 text-slate-400 text-xs font-mono">
                <Lock className="h-3 w-3" /> SECURED DATA ENVIRONMENT
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {!currentUser ? (
          /* LOGIN SCREEN WITH CREDENTIALS AND BYPASS DIRECT DEMO ACCESS */
          <div className="mx-auto my-12 max-w-lg">
            <div className="rounded-3xl border border-slate-800 bg-slate-950 p-8 shadow-2xl">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Brain className="h-8 w-8" />
                </div>
                <h2 className="font-black text-white text-3xl tracking-tight">System Authentication</h2>
                <p className="mt-2 text-slate-400 text-sm">Please log in to access stock inventory, sales logs, and the ML forecasting engine.</p>
              </div>

              {loginError && (
                <div className="mt-6 flex items-center gap-2 rounded-xl bg-red-950/40 border border-red-900/30 p-4 text-red-400 text-xs">
                  <XCircle className="h-5 w-5 shrink-0" />
                  <p>{loginError}</p>
                </div>
              )}

              {/* Secure Credentials Form */}
              <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider">Username</label>
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="admin or pharmacist"
                    className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-white text-sm outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider">Password</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter security password"
                    className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-white text-sm outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-emerald-600 py-3 font-bold text-white text-sm shadow-lg transition-all hover:bg-emerald-500 hover:shadow-emerald-900/10 active:scale-98"
                >
                  Authorize Identity
                </button>
              </form>

              {/* Demo Quick Access bypass buttons */}
              <div className="mt-8 border-t border-slate-800/80 pt-6">
                <p className="text-center text-slate-500 text-xs font-semibold uppercase tracking-wider mb-4">Quick Demo Single-Click Credentials</p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleQuickLogin("admin")}
                    className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40 p-4 transition-all hover:border-emerald-500/40 hover:bg-slate-900 text-center group"
                  >
                    <Shield className="mb-2 h-6 w-6 text-emerald-400 group-hover:scale-110 transition-transform" />
                    <span className="font-extrabold text-white text-sm">Login as Admin</span>
                    <span className="mt-1 text-slate-500 text-[10px]">Username: <span className="font-mono text-emerald-300">admin</span><br/>Password: <span className="font-mono">admin123</span></span>
                  </button>

                  <button
                    onClick={() => handleQuickLogin("pharmacist")}
                    className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40 p-4 transition-all hover:border-teal-500/40 hover:bg-slate-900 text-center group"
                  >
                    <ShoppingCart className="mb-2 h-6 w-6 text-teal-400 group-hover:scale-110 transition-transform" />
                    <span className="font-extrabold text-white text-sm">Login as Pharmacist</span>
                    <span className="mt-1 text-slate-500 text-[10px]">Username: <span className="font-mono text-teal-300">pharmacist</span><br/>Password: <span className="font-mono">pharm123</span></span>
                  </button>
                </div>
                <div className="mt-5 rounded-xl bg-slate-900/50 p-3.5 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <p className="font-bold text-slate-300 flex items-center gap-1"><Info className="h-3 w-3 text-emerald-400" /> System Features Preview:</p>
                  <p>• <span className="text-slate-200 font-semibold">Admin</span> can modify inventory stock, register suppliers, delete drugs, and configure prediction metrics.</p>
                  <p>• <span className="text-slate-200 font-semibold">Pharmacist</span> can checkout clients, calculate 12% GST, print invoices, and view real-time sales reports.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* PHARMACY MANAGEMENT WORKSPACE */
          <div>
            {/* Tab Navigation Menu */}
            <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-800 pb-2">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-bold text-sm transition-all ${
                  activeTab === "dashboard"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/20"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <Activity className="h-4.5 w-4.5" />
                Analytics Dashboard
              </button>

              <button
                onClick={() => setActiveTab("inventory")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-bold text-sm transition-all ${
                  activeTab === "inventory"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/20"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <Pill className="h-4.5 w-4.5" />
                Medicines Inventory
              </button>

              <button
                onClick={() => setActiveTab("billing")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-bold text-sm transition-all ${
                  activeTab === "billing"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/20"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <ShoppingCart className="h-4.5 w-4.5" />
                Billing POS {cart.length > 0 && <span className="ml-1 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white animate-bounce">{cart.length}</span>}
              </button>

              {currentUser.role === "admin" && (
                <button
                  onClick={() => setActiveTab("suppliers")}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-bold text-sm transition-all ${
                    activeTab === "suppliers"
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/20"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                  }`}
                >
                  <Users className="h-4.5 w-4.5" />
                  Supplier Records
                </button>
              )}

              <button
                onClick={() => setActiveTab("sales")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-bold text-sm transition-all ${
                  activeTab === "sales"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/20"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <FileText className="h-4.5 w-4.5" />
                Sales History
              </button>

              <button
                onClick={() => setActiveTab("ai_ml")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-bold text-sm transition-all ${
                  activeTab === "ai_ml"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/20"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <Brain className="h-4.5 w-4.5 text-emerald-300" />
                AI ML Predictor
              </button>

              <button
                onClick={() => {
                  fetchData();
                }}
                className="ml-auto flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-2 text-slate-300 text-xs font-bold transition-all hover:bg-slate-700 active:scale-95"
                disabled={loading}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                Sync System Data
              </button>
            </div>

            {loading && medicines.length === 0 ? (
              /* Initial Database Loading Spinner */
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <RefreshCw className="h-12 w-12 animate-spin text-emerald-400" />
                <p className="mt-4 font-bold text-white text-lg">Initializing MediCore AI Engines...</p>
                <p className="text-slate-400 text-sm">Accessing regional PostgreSQL database instance and training Linear Regression models.</p>
              </div>
            ) : (
              /* TAB CONTENTS */
              <div>
                {/* 1. ANALYTICS & CHARTS TAB */}
                {activeTab === "dashboard" && (
                  <div className="space-y-6">
                    {/* Header welcome banner */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-950 to-slate-950 p-6 sm:p-8 border border-emerald-500/20">
                      <div className="absolute right-0 top-0 -mr-6 -mt-6 h-40 w-40 rounded-full bg-emerald-500/5 blur-2xl"></div>
                      <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">Active Workspace</span>
                            <span className="text-slate-400 text-xs">Today is {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
                          </div>
                          <h1 className="mt-2 font-black text-white text-3xl sm:text-4xl tracking-tight">Welcome Back, {currentUser.fullName}!</h1>
                          <p className="mt-1.5 text-slate-300 text-sm sm:text-base">
                            MediCore AI is actively tracking <span className="text-emerald-400 font-bold">{analytics?.metrics.totalMedicines || 0} medicines</span>, monitoring expiry risk factors, and analyzing supplier velocity.
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => setActiveTab("billing")}
                            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-3 font-extrabold text-white text-sm shadow-lg shadow-emerald-950/30 transition-all hover:bg-emerald-500 active:scale-95"
                          >
                            <ShoppingCart className="h-4.5 w-4.5" />
                            Open Billing Terminal (POS)
                          </button>
                          <button
                            onClick={() => setActiveTab("ai_ml")}
                            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 font-bold text-slate-300 text-sm transition-all hover:bg-slate-800"
                          >
                            <Brain className="h-4.5 w-4.5 text-emerald-400" />
                            Run ML Forecasts
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Numeric Metric Cards */}
                    {analytics && (
                      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        {/* Revenue Card */}
                        <div className="rounded-2xl border border-slate-800/80 bg-slate-950 p-5 shadow-lg relative group overflow-hidden">
                          <div className="absolute right-0 top-0 h-1 bg-emerald-500 w-full"></div>
                          <div className="flex items-center justify-between text-slate-400">
                            <span className="font-semibold text-xs uppercase tracking-wider">Gross Sales Revenue</span>
                            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
                              <DollarSign className="h-5 w-5" />
                            </div>
                          </div>
                          <p className="mt-4 font-black text-white text-2xl sm:text-3xl">${analytics.metrics.totalRevenue.toFixed(2)}</p>
                          <p className="mt-1.5 text-slate-500 text-xs">Accumulated from {analytics.metrics.totalSalesCount} client receipts</p>
                        </div>

                        {/* GST Card */}
                        <div className="rounded-2xl border border-slate-800/80 bg-slate-950 p-5 shadow-lg relative overflow-hidden">
                          <div className="absolute right-0 top-0 h-1 bg-teal-500 w-full"></div>
                          <div className="flex items-center justify-between text-slate-400">
                            <span className="font-semibold text-xs uppercase tracking-wider">Calculated GST (12%)</span>
                            <div className="rounded-lg bg-teal-500/10 p-2 text-teal-400">
                              <FileText className="h-5 w-5" />
                            </div>
                          </div>
                          <p className="mt-4 font-black text-white text-2xl sm:text-3xl">${analytics.metrics.totalGst.toFixed(2)}</p>
                          <p className="mt-1.5 text-slate-500 text-xs">Compliant with regional tax schedules</p>
                        </div>

                        {/* Low Stock Warning */}
                        <div className={`rounded-2xl border bg-slate-950 p-5 shadow-lg relative overflow-hidden ${analytics.metrics.lowStockCount > 0 ? "border-amber-900/30" : "border-slate-800/80"}`}>
                          <div className={`absolute right-0 top-0 h-1 w-full ${analytics.metrics.lowStockCount > 0 ? "bg-amber-500" : "bg-emerald-500"}`}></div>
                          <div className="flex items-center justify-between text-slate-400">
                            <span className="font-semibold text-xs uppercase tracking-wider">Low Stock Warnings</span>
                            <div className={`rounded-lg p-2 ${analytics.metrics.lowStockCount > 0 ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                              <AlertTriangle className="h-5 w-5" />
                            </div>
                          </div>
                          <p className="mt-4 font-black text-white text-2xl sm:text-3xl">{analytics.metrics.lowStockCount}</p>
                          <p className="mt-1.5 text-slate-500 text-xs">
                            {analytics.metrics.lowStockCount > 0 ? "Medicines below threshold level!" : "All medicine inventory levels healthy"}
                          </p>
                        </div>

                        {/* Expiry Danger Card */}
                        <div className={`rounded-2xl border bg-slate-950 p-5 shadow-lg relative overflow-hidden ${analytics.metrics.atExpiryRiskCount > 0 ? "border-red-900/30" : "border-slate-800/80"}`}>
                          <div className={`absolute right-0 top-0 h-1 w-full ${analytics.metrics.atExpiryRiskCount > 0 ? "bg-red-500" : "bg-emerald-500"}`}></div>
                          <div className="flex items-center justify-between text-slate-400">
                            <span className="font-semibold text-xs uppercase tracking-wider">Expiry Danger List</span>
                            <div className={`rounded-lg p-2 ${analytics.metrics.atExpiryRiskCount > 0 ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                              <Calendar className="h-5 w-5" />
                            </div>
                          </div>
                          <p className="mt-4 font-black text-white text-2xl sm:text-3xl">{analytics.metrics.atExpiryRiskCount}</p>
                          <p className="mt-1.5 text-slate-500 text-xs">Items expiring or at risk within 90 days</p>
                        </div>
                      </div>
                    )}

                    {/* Sales Charts Dashboard Panels */}
                    {analytics && (
                      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                        {/* Daily Sales Chart */}
                        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5 shadow-lg lg:col-span-8">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <div>
                              <h3 className="font-black text-white text-lg tracking-tight">Daily Sales Volume</h3>
                              <p className="text-slate-400 text-xs">Gross transactional volumes over the past 10 days</p>
                            </div>
                            <span className="rounded-full bg-emerald-500/10 px-2 py-1 font-mono text-[10px] text-emerald-400 border border-emerald-500/20">LIVE DATA FEED</span>
                          </div>

                          {/* Custom SVG Line and Bar Chart */}
                          <div className="mt-6 flex h-64 items-end justify-between px-2 pt-4 relative">
                            {/* Background Grid Lines */}
                            <div className="absolute inset-0 flex flex-col justify-between py-6 pointer-events-none opacity-5">
                              <div className="border-b border-white w-full"></div>
                              <div className="border-b border-white w-full"></div>
                              <div className="border-b border-white w-full"></div>
                              <div className="border-b border-white w-full"></div>
                            </div>

                            {analytics.charts.dailySales.map((day, idx) => {
                              // Find max value to scale the bars
                              const maxAmount = Math.max(...analytics.charts.dailySales.map((d) => d.amount), 50) || 100;
                              const heightPercent = Math.min(95, Math.max(8, (day.amount / maxAmount) * 100));

                              return (
                                <div key={idx} className="flex flex-col items-center flex-1 group z-10">
                                  {/* Tooltip on Hover */}
                                  <div className="absolute bottom-20 hidden group-hover:flex flex-col items-center bg-slate-900 border border-emerald-500/30 p-2 rounded-xl text-center shadow-xl">
                                    <span className="text-[10px] font-bold text-slate-400">{day.date}</span>
                                    <span className="text-xs font-black text-white">${day.amount.toFixed(2)}</span>
                                    <span className="text-[9px] text-emerald-400">{day.quantity} units sold</span>
                                  </div>

                                  {/* Bar column */}
                                  <div className="w-8 sm:w-11 bg-slate-900 rounded-lg overflow-hidden flex flex-col justify-end border border-slate-800 group-hover:border-emerald-500/40 transition-colors h-48">
                                    <div
                                      style={{ height: `${heightPercent}%` }}
                                      className="w-full bg-gradient-to-t from-emerald-600 via-emerald-500 to-teal-400 rounded-t-md transition-all group-hover:from-emerald-500 group-hover:to-teal-300"
                                    ></div>
                                  </div>

                                  {/* Label */}
                                  <span className="mt-3 text-[10px] font-semibold text-slate-400 group-hover:text-emerald-400 transition-colors truncate w-12 text-center">
                                    {day.date.split(",")[0]}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Top Selling Medicines Chart */}
                        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5 shadow-lg lg:col-span-4">
                          <h3 className="font-black text-white text-lg tracking-tight">Top Dispensed Items</h3>
                          <p className="text-slate-400 text-xs mb-4">Highest moving drugs by total sales quantity</p>

                          <div className="space-y-4">
                            {analytics.charts.topSelling.length === 0 ? (
                              <p className="text-center text-slate-500 py-12 text-xs">No sales recorded yet.</p>
                            ) : (
                              analytics.charts.topSelling.map((med, idx) => {
                                const maxQty = Math.max(...analytics.charts.topSelling.map((m) => m.quantity), 1);
                                const pct = (med.quantity / maxQty) * 100;

                                return (
                                  <div key={idx} className="space-y-1">
                                    <div className="flex justify-between text-xs font-bold">
                                      <span className="text-slate-200 truncate max-w-[160px]">{med.name}</span>
                                      <span className="text-emerald-400 font-mono">{med.quantity} units</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800/80">
                                      <div
                                        style={{ width: `${pct}%` }}
                                        className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-400"
                                      ></div>
                                    </div>
                                    <div className="flex justify-between text-[10px] text-slate-500">
                                      <span>Rank #{idx + 1}</span>
                                      <span>Revenue: ${med.revenue.toFixed(2)}</span>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>

                          <div className="mt-6 rounded-2xl bg-emerald-950/20 p-3.5 border border-emerald-500/15">
                            <h4 className="font-bold text-emerald-400 text-xs flex items-center gap-1">
                              <Brain className="h-3.5 w-3.5" /> High Velocity Dispensation Notice
                            </h4>
                            <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
                              Paracetamol is experiencing steady compound demand growth. The AI recommends checking safety thresholds to prevent stockouts.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Expiry Risk list brief preview & Quick Restock recommendations */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      {/* Critical Reorder Warnings */}
                      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5 shadow-lg">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <h3 className="font-black text-white text-base tracking-tight flex items-center gap-2">
                            <AlertTriangle className="h-4.5 w-4.5 text-amber-500" /> Urgent Restock Recommender
                          </h3>
                          <button onClick={() => setActiveTab("ai_ml")} className="text-emerald-400 hover:text-emerald-300 text-xs font-bold flex items-center">
                            All AI Recs <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="mt-4 divide-y divide-slate-900">
                          {analytics?.reorders.filter((r) => r.status === "restock").slice(0, 4).map((r, idx) => (
                            <div key={idx} className="flex items-center justify-between py-3">
                              <div>
                                <h4 className="font-bold text-white text-sm">{r.name}</h4>
                                <p className="text-slate-400 text-xs">Stock: {r.quantity} left (Threshold: {r.minReorderLevel})</p>
                              </div>
                              <button
                                onClick={() => handleQuickRestock(r.medicineId)}
                                className="rounded-lg bg-emerald-600/10 hover:bg-emerald-600 px-3 py-1.5 font-bold text-emerald-400 hover:text-white text-xs transition-all border border-emerald-500/20 active:scale-95"
                                disabled={actionLoading}
                              >
                                Restock 100
                              </button>
                            </div>
                          ))}
                          {analytics?.reorders.filter((r) => r.status === "restock").length === 0 && (
                            <p className="text-slate-500 text-xs text-center py-12">All medicine stock levels are securely above minimum thresholds!</p>
                          )}
                        </div>
                      </div>

                      {/* Top Expiry Risks */}
                      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5 shadow-lg">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <h3 className="font-black text-white text-base tracking-tight flex items-center gap-2">
                            <Calendar className="h-4.5 w-4.5 text-red-500" /> Expiry Risk Assessment (ML Model)
                          </h3>
                          <button onClick={() => setActiveTab("ai_ml")} className="text-emerald-400 hover:text-emerald-300 text-xs font-bold flex items-center">
                            All Risks <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="mt-4 space-y-3">
                          {analytics?.expiryPredictions.slice(0, 3).map((p, idx) => (
                            <div key={idx} className="rounded-2xl bg-slate-900/60 p-3 border border-slate-800/80 flex justify-between items-center">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-white text-sm">{p.name}</span>
                                  <span className="font-mono text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">{p.batchNumber}</span>
                                </div>
                                <p className="text-slate-400 text-xs">Expires in {p.daysRemaining} days ({new Date(p.expiryDate).toLocaleDateString()})</p>
                              </div>

                              <div className="text-right">
                                <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-black border ${
                                  p.riskScore >= 75
                                    ? "bg-red-500/10 border-red-500/20 text-red-400"
                                    : p.riskScore >= 40
                                    ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                }`}>
                                  {p.riskScore}% Risk
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. MEDICINE INVENTORY TAB */}
                {activeTab === "inventory" && (
                  <div className="space-y-4">
                    {/* Toolbar and searches */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center">
                        {/* Search input */}
                        <div className="relative flex-1">
                          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                          <input
                            type="text"
                            value={searchMedicine}
                            onChange={(e) => setSearchMedicine(e.target.value)}
                            placeholder="Search by medicine name, batch number, manufacturer..."
                            className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-10 pr-4 py-2.5 text-white text-sm outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap gap-2.5">
                          {/* Supplier select */}
                          <select
                            value={filterSupplier}
                            onChange={(e) => setFilterSupplier(e.target.value)}
                            className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-slate-300 text-xs outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white dark:bg-slate-900"
                          >
                            <option value="all">All Suppliers</option>
                            {suppliers.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                          </select>

                          {/* Stock level status select */}
                          <select
                            value={filterStockStatus}
                            onChange={(e) => setFilterStockStatus(e.target.value)}
                            className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-slate-300 text-xs outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white dark:bg-slate-900"
                          >
                            <option value="all">All Stock Statuses</option>
                            <option value="low">Low Stock Warning</option>
                            <option value="out">Out of Stock</option>
                            <option value="healthy">Healthy Stock</option>
                          </select>

                          {/* Add medicine action for Admin */}
                          {currentUser.role === "admin" ? (
                            <button
                              onClick={() => {
                                setEditingMedicine(null);
                                setIsMedModalOpen(true);
                              }}
                              className="flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 font-bold text-white text-sm transition-all"
                            >
                              <Plus className="h-4 w-4" />
                              Add Medicine
                            </button>
                          ) : (
                            <div className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 px-3 py-2 rounded-xl border border-amber-500/20">
                              <Shield className="h-3.5 w-3.5" /> View Only Mode (Admin Restricted)
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Medicines List Table */}
                    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
                      <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-slate-900/60 font-semibold text-slate-200">
                          <tr className="border-b border-slate-800 uppercase tracking-wider text-xs">
                            <th className="px-4 py-3.5">Medicine Name</th>
                            <th className="px-4 py-3.5">Batch</th>
                            <th className="px-4 py-3.5 text-right">Price</th>
                            <th className="px-4 py-3.5 text-center">Qty Left</th>
                            <th className="px-4 py-3.5">Manufacturer</th>
                            <th className="px-4 py-3.5">Expiry Date</th>
                            <th className="px-4 py-3.5">Supplier</th>
                            <th className="px-4 py-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900">
                          {filteredMedicines.map((med) => {
                            const isLowStock = med.quantity <= med.minReorderLevel;
                            const isOutOfStock = med.quantity === 0;
                            const isNearExpiry = new Date(med.expiryDate).getTime() - new Date().getTime() < 30 * 24 * 60 * 60 * 1000;

                            return (
                              <tr key={med.id} className="hover:bg-slate-900/30 transition-colors">
                                <td className="px-4 py-4">
                                  <div className="font-extrabold text-white">{med.name}</div>
                                  <div className="mt-1 flex gap-1">
                                    {isOutOfStock ? (
                                      <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] text-red-400 border border-red-500/20">Out Of Stock</span>
                                    ) : isLowStock ? (
                                      <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-400 border border-amber-500/20">Low Stock</span>
                                    ) : (
                                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400 border border-emerald-500/20">Healthy</span>
                                    )}
                                    {isNearExpiry && (
                                      <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] text-red-400 border border-red-500/20">Near Expiry ⚠️</span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-4 font-mono text-xs text-slate-300">{med.batchNumber}</td>
                                <td className="px-4 py-4 text-right font-mono text-white">${med.price.toFixed(2)}</td>
                                <td className="px-4 py-4 text-center">
                                  <span className={`font-mono font-bold ${isOutOfStock ? "text-red-500" : isLowStock ? "text-amber-500" : "text-white"}`}>
                                    {med.quantity}
                                  </span>
                                  <span className="text-slate-500 text-xs"> / {med.minReorderLevel} min</span>
                                </td>
                                <td className="px-4 py-4 text-slate-300">{med.manufacturer || "N/A"}</td>
                                <td className="px-4 py-4">
                                  <div className={`text-xs ${isNearExpiry ? "text-red-400 font-bold" : "text-slate-300"}`}>
                                    {new Date(med.expiryDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                                  </div>
                                </td>
                                <td className="px-4 py-4 text-slate-300 truncate max-w-[150px]">{med.supplierName || "No Supplier"}</td>
                                <td className="px-4 py-4 text-right">
                                  <div className="flex justify-end gap-2">
                                    <button
                                      onClick={() => handleAddToCart(med)}
                                      className="rounded-lg bg-emerald-600/10 hover:bg-emerald-600 p-1.5 text-emerald-400 hover:text-white transition-all"
                                      title="Add to billing cart"
                                    >
                                      <ShoppingCart className="h-4 w-4" />
                                    </button>

                                    {currentUser.role === "admin" ? (
                                      <>
                                        <button
                                          onClick={() => {
                                            setEditingMedicine(med);
                                            setIsMedModalOpen(true);
                                          }}
                                          className="rounded-lg bg-teal-600/10 hover:bg-teal-600 p-1.5 text-teal-400 hover:text-white transition-all"
                                          title="Edit medicine details"
                                        >
                                          <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteMedicine(med.id)}
                                          className="rounded-lg bg-red-600/10 hover:bg-red-600 p-1.5 text-red-400 hover:text-white transition-all"
                                          title="Delete medicine"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </button>
                                      </>
                                    ) : null}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                          {filteredMedicines.length === 0 && (
                            <tr>
                              <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                                No medicines found matching your search. Clear filters or add medicines to list!
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 3. BILLING & POS MODULE */}
                {activeTab === "billing" && (
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* Left: Product Selector */}
                    <div className="space-y-4 lg:col-span-7">
                      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                        <h3 className="font-extrabold text-white text-lg tracking-tight mb-2">Select Dispensed Medicines</h3>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                          <input
                            type="text"
                            value={searchMedicine}
                            onChange={(e) => setSearchMedicine(e.target.value)}
                            placeholder="Type to search stock medicines..."
                            className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-9 pr-4 py-2 text-white text-sm outline-hidden focus:border-emerald-500 focus:ring-1"
                          />
                        </div>
                      </div>

                      {/* Medicine POS cards */}
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 max-h-[500px] overflow-y-auto pr-1">
                        {medicines
                          .filter((m) => m.name.toLowerCase().includes(searchMedicine.toLowerCase()))
                          .map((med) => {
                            const isOutOfStock = med.quantity === 0;
                            const isLowStock = med.quantity <= med.minReorderLevel;

                            return (
                              <div
                                key={med.id}
                                onClick={() => !isOutOfStock && handleAddToCart(med)}
                                className={`rounded-2xl border p-4 cursor-pointer transition-all hover:scale-[1.01] ${
                                  isOutOfStock
                                    ? "bg-slate-950/40 border-slate-900/60 opacity-60"
                                    : "bg-slate-950 border-slate-850 hover:border-emerald-500/50 hover:bg-slate-900/40"
                                }`}
                              >
                                <div className="flex justify-between items-start gap-2">
                                  <div>
                                    <h4 className="font-black text-white text-sm tracking-tight">{med.name}</h4>
                                    <p className="text-slate-500 text-xs font-mono mt-0.5">Batch: {med.batchNumber}</p>
                                  </div>
                                  <span className="font-mono font-bold text-emerald-400 text-sm">${med.price.toFixed(2)}</span>
                                </div>

                                <div className="mt-4 flex items-center justify-between">
                                  <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] ${
                                    isOutOfStock
                                      ? "bg-red-500/10 text-red-400"
                                      : isLowStock
                                      ? "bg-amber-500/10 text-amber-400"
                                      : "bg-slate-900 text-slate-400 border border-slate-800"
                                  }`}>
                                    {isOutOfStock ? "Out of Stock" : `${med.quantity} Units Available`}
                                  </span>
                                  {!isOutOfStock && (
                                    <span className="rounded-lg bg-emerald-600/10 group-hover:bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-emerald-400 transition-colors">
                                      + Add To Bill
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    {/* Right: Shopping Cart and GST billing checkout */}
                    <div className="lg:col-span-5">
                      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5 shadow-xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <div>
                            <h3 className="font-black text-white text-lg tracking-tight">Prescription Invoice Cart</h3>
                            <p className="text-slate-400 text-xs">Calculate tax & process stock checkout</p>
                          </div>
                          <button
                            onClick={() => setCart([])}
                            className="text-slate-500 hover:text-red-400 text-xs font-bold"
                            disabled={cart.length === 0}
                          >
                            Clear All
                          </button>
                        </div>

                        {/* Invoice Metadata Cashier name */}
                        <div>
                          <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider">Cashier / Pharmacist Name</label>
                          <input
                            type="text"
                            value={cashierName}
                            onChange={(e) => setCashierName(e.target.value)}
                            placeholder="John Watson"
                            className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-white text-sm outline-hidden focus:border-emerald-500"
                          />
                        </div>

                        {/* Cart Item rows */}
                        <div className="divide-y divide-slate-900 max-h-[250px] overflow-y-auto pr-1">
                          {cart.map((item) => (
                            <div key={item.medicine.id} className="flex items-center justify-between py-3">
                              <div className="space-y-1">
                                <h4 className="font-bold text-white text-sm">{item.medicine.name}</h4>
                                <p className="text-slate-500 font-mono text-xs">${item.medicine.price.toFixed(2)} each</p>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 bg-slate-900 rounded-lg p-1 border border-slate-800">
                                  <button
                                    onClick={() => handleUpdateCartQuantity(item.medicine.id, item.quantity - 1)}
                                    className="px-2 py-0.5 text-slate-400 hover:text-white font-bold"
                                  >
                                    -
                                  </button>
                                  <span className="px-2 font-mono font-bold text-white text-sm">{item.quantity}</span>
                                  <button
                                    onClick={() => handleUpdateCartQuantity(item.medicine.id, item.quantity + 1)}
                                    className="px-2 py-0.5 text-slate-400 hover:text-white font-bold"
                                  >
                                    +
                                  </button>
                                </div>

                                <button
                                  onClick={() => handleRemoveFromCart(item.medicine.id)}
                                  className="text-slate-500 hover:text-red-400 p-1"
                                >
                                  <XCircle className="h-4.5 w-4.5" />
                                </button>
                              </div>
                            </div>
                          ))}

                          {cart.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                              <ShoppingCart className="h-8 w-8 text-slate-600 mb-2" />
                              <p className="text-xs">Cart is empty. Select medicines from the left to begin generating the invoice.</p>
                            </div>
                          )}
                        </div>

                        {/* Calculations summary with 12% GST */}
                        <div className="rounded-2xl bg-slate-900/60 p-4 border border-slate-800 space-y-2.5 text-xs text-slate-400">
                          <div className="flex justify-between">
                            <span>Dispensing Items Subtotal:</span>
                            <span className="font-mono text-white">${cartTotal.subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>SGST + CGST Tax Amount (12%):</span>
                            <span className="font-mono text-white">${cartTotal.gst.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between border-t border-slate-800 pt-2 text-sm font-bold text-white">
                            <span className="text-emerald-400">Total Net Payable:</span>
                            <span className="font-mono text-emerald-400">${cartTotal.grand.toFixed(2)}</span>
                          </div>
                        </div>

                        <button
                          onClick={handlePOSCheckout}
                          disabled={cart.length === 0 || actionLoading}
                          className="w-full rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 py-3 font-extrabold text-white text-sm shadow-lg shadow-emerald-950/20 tracking-wide transition-all disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed active:scale-98"
                        >
                          {actionLoading ? "Processing Transactions..." : "Complete Checkout & Print Invoice"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. SUPPLIER RECORDS TAB */}
                {activeTab === "suppliers" && currentUser.role === "admin" && (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 flex flex-col gap-4 md:flex-row md:items-center justify-between">
                      <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          value={searchSupplier}
                          onChange={(e) => setSearchSupplier(e.target.value)}
                          placeholder="Search suppliers by name, phone, email..."
                          className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-10 pr-4 py-2 text-white text-sm outline-hidden focus:border-emerald-500"
                        />
                      </div>

                      <button
                        onClick={() => {
                          setEditingSupplier(null);
                          setIsSupModalOpen(true);
                        }}
                        className="flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 font-bold text-white text-sm transition-all"
                      >
                        <Plus className="h-4 w-4" />
                        Register Supplier
                      </button>
                    </div>

                    {/* Suppliers List Table */}
                    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
                      <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-slate-900/60 font-semibold text-slate-200">
                          <tr className="border-b border-slate-800 uppercase tracking-wider text-xs">
                            <th className="px-4 py-3.5">Supplier Name</th>
                            <th className="px-4 py-3.5">Phone Contact</th>
                            <th className="px-4 py-3.5">Email Contact</th>
                            <th className="px-4 py-3.5">Distribution Address</th>
                            <th className="px-4 py-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900">
                          {filteredSuppliers.map((sup) => (
                            <tr key={sup.id} className="hover:bg-slate-900/30 transition-colors">
                              <td className="px-4 py-4">
                                <div className="font-extrabold text-white">{sup.name}</div>
                                <div className="text-[10px] text-slate-500">ID: MC-SUP-{sup.id}</div>
                              </td>
                              <td className="px-4 py-4 font-mono text-xs text-slate-300">{sup.phone || "No Phone"}</td>
                              <td className="px-4 py-4 text-slate-300">{sup.email || "No Email"}</td>
                              <td className="px-4 py-4 text-slate-300 max-w-[250px] truncate" title={sup.address || ""}>{sup.address || "N/A"}</td>
                              <td className="px-4 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingSupplier(sup);
                                      setIsSupModalOpen(true);
                                    }}
                                    className="rounded-lg bg-teal-600/10 hover:bg-teal-600 p-1.5 text-teal-400 hover:text-white transition-all"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSupplier(sup.id)}
                                    className="rounded-lg bg-red-600/10 hover:bg-red-600 p-1.5 text-red-400 hover:text-white transition-all"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {filteredSuppliers.length === 0 && (
                            <tr>
                              <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                                No suppliers registered yet. Press "Register Supplier" to add!
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 5. SALES HISTORY TAB */}
                {activeTab === "sales" && (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 flex flex-col gap-4 md:flex-row md:items-center justify-between">
                      <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          value={searchSale}
                          onChange={(e) => setSearchSale(e.target.value)}
                          placeholder="Search by cashier or medicine name..."
                          className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-10 pr-4 py-2 text-white text-sm outline-hidden focus:border-emerald-500"
                        />
                      </div>

                      <div className="text-slate-400 text-xs">
                        Showing <span className="text-white font-bold">{filteredSales.length}</span> historical sales receipts
                      </div>
                    </div>

                    {/* Sales List */}
                    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
                      <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-slate-900/60 font-semibold text-slate-200">
                          <tr className="border-b border-slate-800 uppercase tracking-wider text-xs">
                            <th className="px-4 py-3.5">Receipt Date</th>
                            <th className="px-4 py-3.5">Medicine Name</th>
                            <th className="px-4 py-3.5 text-center">Batch Number</th>
                            <th className="px-4 py-3.5 text-center">Qty Dispensed</th>
                            <th className="px-4 py-3.5 text-right">Subtotal</th>
                            <th className="px-4 py-3.5 text-right">Tax (12% GST)</th>
                            <th className="px-4 py-3.5 text-right">Total Net</th>
                            <th className="px-4 py-3.5">Cashier Staff</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900">
                          {filteredSales.map((sale) => (
                            <tr key={sale.id} className="hover:bg-slate-900/30 transition-colors text-xs">
                              <td className="px-4 py-3.5 font-mono text-slate-300">
                                {new Date(sale.date).toLocaleString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })}
                              </td>
                              <td className="px-4 py-3.5 font-bold text-white">{sale.medicineName || "Deleted Drug"}</td>
                              <td className="px-4 py-3.5 text-center font-mono text-slate-400">{sale.batchNumber || "N/A"}</td>
                              <td className="px-4 py-3.5 text-center font-bold text-slate-200">{sale.quantity}</td>
                              <td className="px-4 py-3.5 text-right font-mono text-slate-300">${sale.totalAmount.toFixed(2)}</td>
                              <td className="px-4 py-3.5 text-right font-mono text-slate-500">${sale.gstAmount.toFixed(2)}</td>
                              <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-400">${(sale.totalAmount + sale.gstAmount).toFixed(2)}</td>
                              <td className="px-4 py-3.5 text-slate-300">{sale.cashierName}</td>
                            </tr>
                          ))}
                          {filteredSales.length === 0 && (
                            <tr>
                              <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                                No sales recorded in the database. Open Billing POS to generate transactions!
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 6. AI & ML PREDICTION ENGINE DASHBOARD */}
                {activeTab === "ai_ml" && (
                  <div className="space-y-6">
                    {/* Intro card explaining the ML Engine & system math formulas */}
                    <div className="rounded-3xl border border-emerald-500/20 bg-emerald-950/10 p-6 shadow-xl relative overflow-hidden">
                      <div className="absolute right-0 top-0 -mr-6 -mt-6 h-32 w-32 rounded-full bg-emerald-500/5"></div>
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                        <div className="rounded-2xl bg-emerald-600/20 p-3 text-emerald-400 border border-emerald-500/20 shrink-0">
                          <Brain className="h-8 w-8 animate-bounce" />
                        </div>
                        <div>
                          <h2 className="font-extrabold text-white text-xl tracking-tight">MediCore AI Core Predictive System</h2>
                          <p className="mt-1 text-slate-300 text-sm">
                            This panel uses clinical sales speeds alongside exact product expiry timelines to simulate predictive forecasting models. These mathematical procedures allow pharmacies to eliminate stock shortages and optimize reorder budgets.
                          </p>
                          <div className="mt-4 flex flex-wrap gap-4 text-xs font-mono text-emerald-300">
                            <span>Algorithm: <span className="text-white">Linear Regression (y = mx + c)</span></span>
                            <span>•</span>
                            <span>Data Engine: <span className="text-white">PostgreSQL + Drizzle</span></span>
                            <span>•</span>
                            <span>Risk Threshold: <span className="text-white">Confidence Bounds 90%</span></span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 5: DEMAND FORECASTING INTERACTIVE PANEL */}
                    <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-lg space-y-6">
                      <div>
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-bold text-[10px] text-emerald-400 uppercase tracking-widest border border-emerald-500/20">MODULE 5</span>
                        <h3 className="mt-1 font-black text-white text-lg tracking-tight">Interactive Demand Forecasting (Linear Regression)</h3>
                        <p className="text-slate-400 text-xs">Fits a least-squares line on the previous three months of transactional volumes to project next month's units needed.</p>
                      </div>

                      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                        {/* Selector of medicine */}
                        <div className="lg:col-span-4 space-y-4">
                          <div>
                            <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Select Drug to Analyze Formula</label>
                            <select
                              value={selectedForecastMedId}
                              onChange={(e) => setSelectedForecastMedId(e.target.value === "" ? "" : Number(e.target.value))}
                              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-white text-sm outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white dark:bg-slate-900"
                            >
                              <option value="">-- Choose Medicine --</option>
                              {analytics?.forecasting.map((f) => (
                                <option key={f.medicineId} value={f.medicineId}>
                                  {f.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {activeForecastMed && (
                            <div className="rounded-2xl bg-slate-900/50 p-4 border border-slate-800/80 space-y-3 text-xs">
                              <h4 className="font-extrabold text-white text-sm">Mathematical Formulation</h4>
                              <div className="space-y-1.5 text-slate-400 font-mono">
                                <p className="text-emerald-400">Equation: y = mx + c</p>
                                <p>• x represents time (Month index)</p>
                                <p>• y represents expected units sold</p>
                                <p>• Calculated Slope (m) = <span className="text-white font-bold">{activeForecastMed.slope}</span></p>
                                <p>• Calculated Intercept (c) = <span className="text-white font-bold">{(activeForecastMed.m1Sales - activeForecastMed.slope * 1).toFixed(1)}</span></p>
                              </div>

                              <div className="border-t border-slate-800 pt-2.5 text-slate-300 leading-relaxed">
                                {activeForecastMed.slope > 0 ? (
                                  <p>📈 This drug displays an <span className="text-emerald-400 font-bold">upward demand trend</span>. Overstocking is recommended prior to April distribution.</p>
                                ) : activeForecastMed.slope < 0 ? (
                                  <p>📉 This drug shows a <span className="text-red-400 font-bold">declining demand velocity</span>. Tight supply holding is advised.</p>
                                ) : (
                                  <p>⚪ Steady trend. Standard maintenance levels apply.</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Forecast calculations and prediction comparison */}
                        <div className="lg:col-span-8 overflow-x-auto">
                          <table className="w-full text-left text-sm text-slate-400">
                            <thead className="bg-slate-900/60 font-semibold text-slate-200">
                              <tr className="border-b border-slate-800 text-xs">
                                <th className="px-4 py-3">Medicine Name</th>
                                <th className="px-4 py-3 text-center">Month 1 (Jan)</th>
                                <th className="px-4 py-3 text-center">Month 2 (Feb)</th>
                                <th className="px-4 py-3 text-center">Month 3 (Mar)</th>
                                <th className="px-4 py-3 text-center">Calculated Slope</th>
                                <th className="px-4 py-3 text-center bg-emerald-950/30 text-emerald-400 font-bold border-l border-emerald-500/10">Predicted Next Month (April)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-900">
                              {analytics?.forecasting.map((f) => (
                                <tr
                                  key={f.medicineId}
                                  className={`hover:bg-slate-900/30 transition-colors ${
                                    selectedForecastMedId === f.medicineId ? "bg-emerald-950/20 border-y border-emerald-500/20" : ""
                                  }`}
                                >
                                  <td className="px-4 py-3.5 font-bold text-white">{f.name}</td>
                                  <td className="px-4 py-3.5 text-center font-mono">{f.m1Sales}</td>
                                  <td className="px-4 py-3.5 text-center font-mono">{f.m2Sales}</td>
                                  <td className="px-4 py-3.5 text-center font-mono">{f.m3Sales}</td>
                                  <td className={`px-4 py-3.5 text-center font-mono font-bold ${f.slope > 0 ? "text-emerald-400" : f.slope < 0 ? "text-red-400" : "text-slate-500"}`}>
                                    {f.slope > 0 ? `+${f.slope}` : f.slope}
                                  </td>
                                  <td className="px-4 py-3.5 text-center font-mono font-black bg-emerald-950/20 text-emerald-400 border-l border-emerald-500/10">
                                    <span className="rounded-lg bg-emerald-400/10 px-2 py-0.5 text-emerald-400 border border-emerald-500/20">
                                      {f.predictedDemand} units
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* Section 6 & 7: EXPIRY RISK & SMART REORDER DETAILS */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      {/* Section 6: Expiry Prediction Table */}
                      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-lg space-y-4">
                        <div>
                          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-bold text-[10px] text-emerald-400 uppercase tracking-widest border border-emerald-500/20">MODULE 6</span>
                          <h3 className="mt-1 font-black text-white text-lg tracking-tight">Expiry Risks Assessment System</h3>
                          <p className="text-slate-400 text-xs">Compares expiration countdowns against real average sales velocities to anticipate wastage.</p>
                        </div>

                        <div className="space-y-3.5 overflow-y-auto max-h-[400px] pr-1">
                          {analytics?.expiryPredictions.map((p, idx) => {
                            let progColor = "bg-emerald-500";
                            if (p.riskScore >= 75) progColor = "bg-red-500";
                            else if (p.riskScore >= 40) progColor = "bg-amber-500";

                            return (
                              <div key={idx} className="rounded-2xl border border-slate-850 bg-slate-900/30 p-4 space-y-2.5">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-extrabold text-white text-sm">{p.name}</h4>
                                    <p className="text-slate-500 text-xs">Batch: {p.batchNumber} • Expiry: {new Date(p.expiryDate).toLocaleDateString()}</p>
                                  </div>
                                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-black ${
                                    p.riskScore >= 75
                                      ? "bg-red-500/15 text-red-400 border border-red-500/25"
                                      : p.riskScore >= 40
                                      ? "bg-amber-500/15 text-amber-400 border border-amber-500/25"
                                      : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                                  }`}>
                                    {p.riskScore}% Risk
                                  </span>
                                </div>

                                <div className="space-y-1">
                                  <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                                    <div style={{ width: `${p.riskScore}%` }} className={`h-full rounded-full ${progColor}`}></div>
                                  </div>
                                  <div className="flex justify-between text-[10px] text-slate-500">
                                    <span>Stock: {p.quantity} units</span>
                                    <span>Expected Sale rate: {p.monthlySalesRate} units/mo</span>
                                  </div>
                                </div>

                                <p className="text-[11px] text-slate-400 leading-relaxed font-mono flex items-start gap-1">
                                  <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-emerald-400" />
                                  {p.predictionMessage}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Section 7: Smart Reorder Recommendations */}
                      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-lg space-y-4">
                        <div>
                          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-bold text-[10px] text-emerald-400 uppercase tracking-widest border border-emerald-500/20">MODULE 7</span>
                          <h3 className="mt-1 font-black text-white text-lg tracking-tight">AI Smart Reorder Recommendations</h3>
                          <p className="text-slate-400 text-xs">Evaluates safety buffer levels to automate purchase suggestions, avoiding both stock starvation and storage inflation.</p>
                        </div>

                        <div className="divide-y divide-slate-900 overflow-y-auto max-h-[400px] pr-1">
                          {analytics?.reorders.map((r, idx) => (
                            <div key={idx} className="py-4 space-y-2">
                              <div className="flex justify-between items-center">
                                <h4 className="font-extrabold text-white text-sm">{r.name}</h4>
                                <span className={`inline-block rounded-xl px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                  r.status === "restock"
                                    ? "bg-red-500/10 text-red-400 border border-red-500/10"
                                    : r.status === "warning"
                                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/10"
                                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10"
                                }`}>
                                  {r.status === "restock" ? "Urgent Restock" : r.status === "warning" ? "Consider Restock" : "Safe Holding"}
                                </span>
                              </div>

                              <p className="text-xs text-slate-300 leading-relaxed">{r.message}</p>

                              {r.status === "restock" && (
                                <div className="flex items-center gap-2 pt-1">
                                  <button
                                    onClick={() => handleQuickRestock(r.medicineId)}
                                    className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1 font-bold text-white text-xs transition-all active:scale-95"
                                    disabled={actionLoading}
                                  >
                                    Restock 100 Units Now
                                  </button>
                                  <span className="text-[10px] text-slate-500">Auto Supplier Request Generated</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Educational / Report Section on System Architecture & OOP Classes */}
                    <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 space-y-4">
                      <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                        <Database className="h-5 w-5 text-emerald-400" /> Academic & OOP Architecture Specifications
                      </h3>
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 text-slate-300 text-xs">
                        <div className="space-y-3 rounded-2xl bg-slate-900/40 p-4 border border-slate-800/80">
                          <h4 className="font-bold text-white uppercase tracking-wider text-xs">Used Object-Oriented Classes</h4>
                          <p className="leading-relaxed">
                            This modern system maps traditional OOP class abstractions onto specialized server side models and UI view controllers:
                          </p>
                          <ul className="list-disc list-inside space-y-1.5 font-mono text-emerald-300">
                            <li><span className="text-white font-semibold">User:</span> Controls credentials, roles, authorizations</li>
                            <li><span className="text-white font-semibold">Medicine:</span> Contains ID, batch, expiration, manufacturer</li>
                            <li><span className="text-white font-semibold">Supplier:</span> Details phone, emails, physical warehouse</li>
                            <li><span className="text-white font-semibold">Sale:</span> Deducts stock, creates invoices, calculates CGST+SGST</li>
                            <li><span className="text-white font-semibold">MLPredictor:</span> Runs trend slope and expiry risks</li>
                          </ul>
                        </div>

                        <div className="space-y-3 rounded-2xl bg-slate-900/40 p-4 border border-slate-800/80">
                          <h4 className="font-bold text-white uppercase tracking-wider text-xs">Demonstrated OOP Paradigms</h4>
                          <ul className="space-y-2">
                            <li>• <span className="text-white font-semibold">Encapsulation:</span> DB transaction locks protect inventory stock levels from concurrent race conditions during patient checkouts.</li>
                            <li>• <span className="text-white font-semibold">Polymorphism:</span> Clean left joins map different supplier records onto dynamic lists through polymorphic associations.</li>
                            <li>• <span className="text-white font-semibold">Composition:</span> Medicine records compose Supplier instances to cleanly structure procurement channels.</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="mt-20 border-t border-slate-800 bg-slate-950 py-8 text-center text-slate-500 text-xs">
        <div className="mx-auto max-w-7xl px-4">
          <p className="font-extrabold text-slate-300">MediCore AI Pharmacy Forecasting & Dispensing Dashboard</p>
          <p className="mt-1 text-slate-500">Converting traditional Swing inventory frameworks into robust Next.js and PostgreSQL engines.</p>
          <p className="mt-4 font-mono text-[10px]">Secure Sandbox Connection: {process.env.DATABASE_URL ? "🟢 ACTIVE PG DATABASE" : "🔴 OFFLINE"}</p>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. POS Printable Invoice Modal */}
      <InvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        invoice={activeInvoice}
      />

      {/* 2. Medicine Add/Edit Form Modal */}
      <MedicineFormModal
        isOpen={isMedModalOpen}
        onClose={() => setIsMedModalOpen(false)}
        onSave={handleSaveMedicine}
        medicine={editingMedicine}
        suppliers={suppliers.map((s) => ({ id: s.id, name: s.name }))}
      />

      {/* 3. Supplier Add/Edit Form Modal */}
      <SupplierFormModal
        isOpen={isSupModalOpen}
        onClose={() => setIsSupModalOpen(false)}
        onSave={handleSaveSupplier}
        supplier={editingSupplier}
      />
    </div>
  );
}
