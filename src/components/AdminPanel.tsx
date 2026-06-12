import React, { useState, FormEvent, useEffect } from "react";
import { Order, LandingPageImages } from "../types";
import { DEFAULT_LANDING_IMAGES, KRILL_PRODUCT } from "../data";
import { 
  LayoutDashboard, ListOrdered, Image as ImageIcon, Key, Trash2, 
  PlusCircle, Download, RefreshCw, UploadCloud, Copy, ArrowLeft, Search, Filter,
  Eye, ShieldCheck, BarChart2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Sparkles, Terminal, Activity
} from "lucide-react";
import { getMetaPixelId, setMetaPixelId, getTrackingLogs, TrackerLogEntry, registerLogCallback, trackViewContent, trackInitiateCheckout, trackPurchase } from "../lib/tracker";

interface AdminPanelProps {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  images: LandingPageImages;
  setImages: (images: LandingPageImages) => void;
  onClose: () => void;
}

const initialReports: Record<string, { summary?: any; sheet?: any; error?: string; loading?: boolean }> = {
  "1831": {
    loading: false,
    summary: {
      Summaries: {
        "Steadfast Courier": { "Total Parcels": 12, "Delivered Parcels": 11, "Canceled Parcels": 1 }
      }
    },
    sheet: {
      totalSummary: { "Total Parcels": 12, "Delivered Parcels": 11, "Canceled Parcels": 1 }
    }
  },
  "1830": {
    loading: false,
    summary: {
      Summaries: {
        "RedX Courier": { "Total Parcels": 1, "Delivered Parcels": 1, "Canceled Parcels": 0 }
      }
    },
    sheet: {
      totalSummary: { "Total Parcels": 1, "Delivered Parcels": 1, "Canceled Parcels": 0 }
    }
  },
  "1826": {
    loading: false,
    summary: {
      Summaries: {
        "Pathao Courier": { "Total Parcels": 74, "Delivered Parcels": 65, "Canceled Parcels": 9 }
      }
    },
    sheet: {
      totalSummary: { "Total Parcels": 74, "Delivered Parcels": 65, "Canceled Parcels": 9 }
    }
  },
  "1825": {
    loading: false,
    summary: {
      Summaries: {
        "Steadfast Courier": { "Total Parcels": 2, "Delivered Parcels": 1, "Canceled Parcels": 1 }
      }
    },
    sheet: {
      totalSummary: { "Total Parcels": 2, "Delivered Parcels": 1, "Canceled Parcels": 1 }
    }
  },
  "1823": {
    loading: false,
    summary: {
      Summaries: {
        "Paperfly Courier": { "Total Parcels": 3, "Delivered Parcels": 2, "Canceled Parcels": 1 }
      }
    },
    sheet: {
      totalSummary: { "Total Parcels": 3, "Delivered Parcels": 2, "Canceled Parcels": 1 }
    }
  },
  "1822": {
    loading: false,
    summary: {
      Summaries: {
        "RedX Courier": { "Total Parcels": 11, "Delivered Parcels": 11, "Canceled Parcels": 0 }
      }
    },
    sheet: {
      totalSummary: { "Total Parcels": 11, "Delivered Parcels": 11, "Canceled Parcels": 0 }
    }
  },
  "1821": {
    loading: false,
    summary: {
      Summaries: {
        "Steadfast Courier": { "Total Parcels": 2, "Delivered Parcels": 2, "Canceled Parcels": 0 }
      }
    },
    sheet: {
      totalSummary: { "Total Parcels": 2, "Delivered Parcels": 2, "Canceled Parcels": 0 }
    }
  },
  "1820": {
    loading: false,
    summary: {
      Summaries: {
        "Pathao Courier": { "Total Parcels": 12, "Delivered Parcels": 11, "Canceled Parcels": 1 }
      }
    },
    sheet: {
      totalSummary: { "Total Parcels": 12, "Delivered Parcels": 11, "Canceled Parcels": 1 }
    }
  },
  "1819": {
    loading: false,
    summary: {
      Summaries: {
        "RedX Courier": { "Total Parcels": 5, "Delivered Parcels": 3, "Canceled Parcels": 2 }
      }
    },
    sheet: {
      totalSummary: { "Total Parcels": 5, "Delivered Parcels": 3, "Canceled Parcels": 2 }
    }
  }
};

export default function AdminPanel({ orders, setOrders, images, setImages, onClose }: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState<"dashboard" | "orders" | "images" | "pixel">("dashboard");
  const [pixelInput, setPixelInput] = useState(getMetaPixelId());
  const [logs, setLogs] = useState<TrackerLogEntry[]>([]);

  useEffect(() => {
    setLogs(getTrackingLogs());
    registerLogCallback((newLog) => {
      setLogs(prev => [newLog, ...prev].slice(0, 50));
    });
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [notifyMsg, setNotifyMsg] = useState<string | null>(null);

  // Manual order form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newShipping, setNewShipping] = useState<number>(100);

  // Courier Search API state management
  const [courierApiKey, setCourierApiKey] = useState(() => localStorage.getItem("krill_courier_api_key") || "");
  const [courierReports, setCourierReports] = useState<Record<string, { summary?: any; sheet?: any; error?: string; loading?: boolean }>>(() => {
    const saved = localStorage.getItem("krill_courier_cached_reports");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return initialReports;
  });

  const [expandedReports, setExpandedReports] = useState<Record<string, boolean>>({});
  const [selectedOrders, setSelectedOrders] = useState<Record<string, boolean>>({});

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset pagination to first page when search query, filter, or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, pageSize]);

  const toggleExpanded = (orderId: string) => {
    setExpandedReports(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const handleSaveApiKey = (key: string) => {
    setCourierApiKey(key);
    localStorage.setItem("krill_courier_api_key", key);
    showToast("কুরিয়ার API কি সফলভাবে সেভ হয়েছে!");
  };

  const handleCheckFraud = async (orderId: string, phone: string) => {
    const cleanedPhone = phone.trim().replace(/\s+/g, "");
    if (!cleanedPhone) {
      alert("মোবাইল নম্বরটি সঠিক নয়!");
      return;
    }

    setCourierReports(prev => ({
      ...prev,
      [orderId]: { loading: true }
    }));

    try {
      // Fetch both endpoints via custom server proxy routes
      const summaryUrl = `/api/courier/summary?searchTerm=${encodeURIComponent(cleanedPhone)}&apiKey=${encodeURIComponent(courierApiKey)}`;
      const sheetUrl = `/api/courier/sheet?searchTerm=${encodeURIComponent(cleanedPhone)}&apiKey=${encodeURIComponent(courierApiKey)}`;

      const [summaryRes, sheetRes] = await Promise.all([
        fetch(summaryUrl),
        fetch(sheetUrl)
      ]);

      if (!summaryRes.ok) {
        const errJson = await summaryRes.json().catch(() => ({}));
        throw new Error(errJson.error || `Summary API returned error (Status: ${summaryRes.status})`);
      }

      if (!sheetRes.ok) {
        const errJson = await sheetRes.json().catch(() => ({}));
        throw new Error(errJson.error || `Sheet API returned error (Status: ${sheetRes.status})`);
      }

      const summaryData = await summaryRes.json();
      const sheetData = await sheetRes.json();

      setCourierReports(prev => ({
        ...prev,
        [orderId]: {
          summary: summaryData,
          sheet: sheetData,
          loading: false
        }
      }));
      showToast("কুরিয়ার ফ্রড চেক সম্পন্ন হয়েছে!");
    } catch (err: any) {
      console.error(err);
      setCourierReports(prev => ({
        ...prev,
        [orderId]: {
          loading: false,
          error: err.message || "রিপোর্ট নিয়ে আসতে সমস্যা হয়েছে।"
        }
      }));
      showToast("ফ্রড চেক ব্যর্থ হয়েছে! অনুগ্রহ করে API Key বা কানেকশন যাচাই করুন।");
    }
  };

  const getRiskAnalysis = (sheetData: any, summaryData: any) => {
    let total = 0;
    let delivered = 0;
    let canceled = 0;

    if (sheetData?.totalSummary) {
      total = sheetData.totalSummary["Total Parcels"] ?? 0;
      delivered = sheetData.totalSummary["Delivered Parcels"] ?? 0;
      canceled = sheetData.totalSummary["Canceled Parcels"] ?? 0;
    } else if (summaryData?.Summaries) {
      Object.values(summaryData.Summaries).forEach((s: any) => {
        const t = s["Total Parcels"] || s["Total Delivery"] || 0;
        const d = s["Delivered Parcels"] || s["Successful Delivery"] || 0;
        const c = s["Canceled Parcels"] || s["Canceled Delivery"] || 0;
        total += t;
        delivered += d;
        canceled += c;
      });
    }

    const successRate = total > 0 ? (delivered / total) * 100 : 100;
    
    let riskLevel: "VIP" | "Low" | "Medium" | "High" | "None" = "None";
    let riskColor = "text-slate-500 bg-slate-50 border-slate-200";
    let riskBgColor = "bg-slate-500/10";
    let riskActionColor = "text-slate-750 bg-slate-100 border-slate-250";
    let riskLabel = "কোনো পূর্ব ইতিহাস নেই";
    let adviceBangla = "উক্ত মোবাইল নম্বরের কোনো কুরিয়ার রেকর্ড খুঁজে পাওয়া যায়নি।";

    if (total > 0) {
      if (successRate >= 90) {
        riskLevel = "VIP";
        riskColor = "text-emerald-700 bg-emerald-50 border-emerald-250";
        riskBgColor = "bg-emerald-500";
        riskActionColor = "text-emerald-800 bg-emerald-100 border-emerald-250";
        riskLabel = "নির্ভরযোগ্য কাস্টমার (VIP ⭐)";
        adviceBangla = "এই কাস্টমারের সফল ডেলিভারি রেকর্ড অত্যন্ত চমৎকার (৯০%+)। আপনি নিরাপদে অর্ডারটি শিপ করতে পারেন।";
      } else if (successRate >= 70) {
        riskLevel = "Low";
        riskColor = "text-green-700 bg-green-50 border-green-250";
        riskBgColor = "bg-green-600";
        riskActionColor = "text-green-800 bg-green-100 border-green-205";
        riskLabel = "স্বল্প রিস্ক (নিরাপদ)";
        adviceBangla = "কাস্টমারের ডেলিভারি সম্পন্ন রেট সন্তোষজনক (৭০%-৯০%)। কনফার্ম করে পার্সেল বুকিং করতে পারেন।";
      } else if (successRate >= 45) {
        riskLevel = "Medium";
        riskColor = "text-amber-700 bg-amber-50 border-amber-250";
        riskBgColor = "bg-amber-500";
        riskActionColor = "text-amber-800 bg-amber-100 border-amber-250";
        riskLabel = "মাঝারি রিস্ক (সতর্ক হউন ⚠️)";
        adviceBangla = "ডেলিভারি রেকর্ড মাঝারি মাত্রার (৪৫%-৭০%)। পার্সেল ডেলিভারি ফেরত আসার সুযোগ রয়েছে। বুকিং করার পূর্বে ফোনে নিশ্চিত করুন।";
      } else {
        riskLevel = "High";
        riskColor = "text-red-700 bg-red-50 border-red-250";
        riskBgColor = "bg-red-600";
        riskActionColor = "text-red-800 bg-red-100 border-red-250";
        riskLabel = "উচ্চ রিস্ক (RETURNING FRAUD RISK! 🚨)";
        adviceBangla = "সতর্কতা! এই গ্রাহকের ক্যানসেল ও রিটার্ন রেট অনেক বেশি। বুকিং এর আগে সম্পূর্ণ শিপিং চার্জ বা আংশিক অগ্রিম পেমেন্ট নিতে সুপারিশ করা হচ্ছে।";
      }
    }

    return {
      total,
      delivered,
      canceled,
      successRate: Math.round(successRate),
      riskLevel,
      riskColor,
      riskBgColor,
      riskActionColor,
      riskLabel,
      adviceBangla
    };
  };

  const showToast = (msg: string) => {
    setNotifyMsg(msg);
    setTimeout(() => setNotifyMsg(null), 3000);
  };

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (password.toLowerCase() === "admin") {
      setIsAuthenticated(true);
      setLoginError("");
      showToast("অ্যাডমিন লগইন সফল হয়েছে!");
    } else {
      setLoginError("ভুল পাসওয়ার্ড! অনুগ্রহ করে 'admin' ব্যবহার করুন।");
    }
  };

  const handleDemoBypass = () => {
    setIsAuthenticated(true);
    showToast("অ্যাডমিন ড্যাশবোর্ড চালু হয়েছে!");
  };

  const handleDelete = (orderId: string) => {
    if (window.confirm(`অর্ডার ${orderId} ডিলিট করতে চান?`)) {
      const updated = orders.filter(o => o.orderId !== orderId);
      setOrders(updated);
      localStorage.setItem("krill_cod_orders", JSON.stringify(updated));
      showToast("অর্ডারটি সফলভাবে ডিলিট করা হয়েছে।");
    }
  };

  const handleStatusChange = (orderId: string, status: Order["status"]) => {
    const updated = orders.map(o => o.orderId === orderId ? { ...o, status } : o);
    setOrders(updated);
    localStorage.setItem("krill_cod_orders", JSON.stringify(updated));
    showToast(`স্ট্যাটাস আপডেট করে "${status}" করা হয়েছে।`);
  };

  const handleAddOrder = (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim() || !newAddress.trim()) {
      alert("অনুগ্রহ করে সব তথ্য সঠিক দিন।");
      return;
    }
    const manualOrder: Order = {
      orderId: "COD-" + Math.floor(100000 + Math.random() * 900000),
      name: newName,
      phone: newPhone,
      address: newAddress,
      shippingCost: newShipping,
      total: KRILL_PRODUCT.salePrice + newShipping,
      product: KRILL_PRODUCT.name,
      timestamp: new Date().toISOString(),
      status: "Pending"
    };

    const updated = [manualOrder, ...orders];
    setOrders(updated);
    localStorage.setItem("krill_cod_orders", JSON.stringify(updated));
    
    setNewName("");
    setNewPhone("");
    setNewAddress("");
    setShowAddForm(false);
    showToast("নতুন ম্যানুয়াল অর্ডার যুক্ত হয়েছে।");
  };

  const handleResetImages = () => {
    if (window.confirm("ডিফল্ট ছবিতে ফ্যাক্টরি রিসেট করতে চান?")) {
      setImages(DEFAULT_LANDING_IMAGES);
      localStorage.setItem("krill_landing_images", JSON.stringify(DEFAULT_LANDING_IMAGES));
      showToast("সব ছবি রিসেট করা হয়েছে।");
    }
  };

  const handleImageUpload = (key: keyof LandingPageImages, file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("শুধুমাত্র ছবি আপলোড করুন।");
      return;
    }
    if (file.size > 2.5 * 1024 * 1024) {
      alert("ফাইলের সাইজ ২.৫ মেগাবাইটের নিচে হতে হবে।");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        const updated = { ...images, [key]: reader.result };
        setImages(updated);
        localStorage.setItem("krill_landing_images", JSON.stringify(updated));
        showToast("ছবি সফলভাবে আপলোড করা হয়েছে!");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImageUrlChange = (key: keyof LandingPageImages, url: string) => {
    const updated = { ...images, [key]: url };
    setImages(updated);
    localStorage.setItem("krill_landing_images", JSON.stringify(updated));
  };

  const handleExportCSV = () => {
    let csv = "Order ID,Name,Phone,Address,Shipping Cost,Total,Status,Date\n";
    orders.forEach(o => {
      csv += `${o.orderId},"${o.name}","${o.phone}","${o.address.replace(/"/g, '""')}",${o.shippingCost},${o.total},${o.status},"${o.timestamp}"\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "store_orders_list.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV ফাইল সফলভাবে ডাউনলোড হয়েছে!");
  };

  const handleCopySummary = (o: Order) => {
    const summary = `📦 আইডি: ${o.orderId}\n👤 নাম: ${o.name}\n📞 ফোন: ${o.phone}\n📍 ঠিকানা: ${o.address}\n💵 মোট: ${o.total}৳\n⏳ স্ট্যাটাস: ${o.status}`;
    navigator.clipboard.writeText(summary);
    showToast("অর্ডারের বিবরণ কপি করা হয়েছে!");
  };

  // Stats
  const totalSales = orders.length;
  const pendingCount = orders.filter(o => o.status === "Pending").length;
  const confirmedCount = orders.filter(o => o.status === "Confirmed").length;
  const shippedCount = orders.filter(o => o.status === "Shipped").length;
  const cancelledCount = orders.filter(o => o.status === "Cancelled").length;
  const confirmedRev = orders
    .filter(o => o.status === "Confirmed" || o.status === "Shipped")
    .reduce((sum, o) => sum + o.total, 0);

  const filteredOrders = orders.filter(o => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = o.name.toLowerCase().includes(query) || o.phone.includes(query) || o.orderId.toLowerCase().includes(query) || o.address.toLowerCase().includes(query);
    if (statusFilter === "All") return matchesSearch;
    return matchesSearch && o.status === statusFilter;
  });

  const totalFiltered = filteredOrders.length;
  const totalPages = Math.ceil(totalFiltered / pageSize) || 1;
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const displayedOrders = filteredOrders.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

  return (
    <div id="admin-panel-overlay" className="fixed inset-0 bg-slate-900/90 z-50 overflow-y-auto flex items-start justify-center p-2 sm:p-6 backdrop-blur-sm min-h-screen">
      
      {/* Dynamic Notification Toast */}
      {notifyMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#0D1D68] text-white py-3 px-6 rounded-2xl border-2 border-[#E8B84C] shadow-2xl font-bold text-xs">
          ✨ {notifyMsg}
        </div>
      )}

      {!isAuthenticated ? (
        <div className="bg-white rounded-3xl w-full max-w-md border-4 border-[#00A81F] p-6 md:p-8 shadow-2xl relative mt-20">
          <div className="text-center space-y-3 pt-2">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-[#00A81F] mx-auto">
              <Key className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-sans font-black text-[#0D1D68]">অ্যাডমিন প্যানেল লগইন</h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 mt-6">
            <div className="space-y-1.5 text-xs text-left">
              <label className="block font-black text-slate-700">ডিফল্ট পাসওয়ার্ড (Password) *</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00A81F]"
              />
              {loginError && <p className="text-red-500 text-[10px] font-bold mt-1">{loginError}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#00A81F] hover:bg-green-700 text-white text-xs font-black uppercase border-none cursor-pointer shadow-md"
            >
              🔑 লগইন করুন
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-550">
            Design and Develop by{" "}
            <a
              href="https://xcelsoftbd.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:text-emerald-500 font-bold hover:underline inline-block"
            >
              XcelSoftBD
            </a>
          </div>

          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 font-bold text-lg cursor-pointer border-none bg-transparent">×</button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl w-full max-w-7xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px] mt-10 md:mt-0">
          
          {/* Side Tabs Navigation */}
          <div className="w-full md:w-64 bg-slate-900 text-slate-100 p-5 space-y-6 flex flex-col justify-between shrink-0">
            <div className="space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <span className="text-xl">🛡️</span>
                <div>
                  <h3 className="font-sans font-black text-xs text-amber-400">মাস্টার ড্যাশবোর্ড</h3>
                </div>
              </div>

              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-black uppercase cursor-pointer border-none ${
                    activeTab === "dashboard" ? "bg-[#00A81F] text-white" : "text-slate-300 hover:bg-slate-805"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  <span>ব্যবসায়িক ড্যাশবোর্ড</span>
                </button>

                <button
                  onClick={() => setActiveTab("orders")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-black uppercase cursor-pointer border-none ${
                    activeTab === "orders" ? "bg-[#00A81F] text-white" : "text-slate-300 hover:bg-slate-805"
                  }`}
                >
                  <ListOrdered className="w-4 h-4 shrink-0" />
                  <span>অর্ডার তালিকা ({orders.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab("images")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-black uppercase cursor-pointer border-none ${
                    activeTab === "images" ? "bg-[#00A81F] text-white" : "text-slate-300 hover:bg-slate-805"
                  }`}
                >
                  <ImageIcon className="w-4 h-4 shrink-0" />
                  <span>ফটো কাস্টমাইজেশন</span>
                </button>

                <button
                  onClick={() => setActiveTab("pixel")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-black uppercase cursor-pointer border-none ${
                    activeTab === "pixel" ? "bg-[#00A81F] text-white" : "text-slate-300 hover:bg-slate-805"
                  }`}
                >
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>ফেসবুক পিক্সেল ও ট্র্যাকিং</span>
                </button>
              </nav>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-800">
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold uppercase transition-colors pointer border-none cursor-pointer flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>ল্যান্ডিং ভিজিট করুন</span>
              </button>

              <div className="text-center text-[10px] text-slate-500 pt-2 border-t border-slate-800/40">
                Design and Develop by{" "}
                <a
                  href="https://xcelsoftbd.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-500 hover:text-emerald-400 font-bold hover:underline inline-block"
                >
                  XcelSoftBD
                </a>
              </div>
            </div>
          </div>

          {/* Main Workspace Frame */}
          <div className="flex-1 bg-slate-50 p-4 sm:p-7 overflow-x-hidden">
            
            <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-5">
              <div>
                <h2 className="text-xl font-black text-[#0D1D68] uppercase">
                  {activeTab === "dashboard" && "সেলস এনালিটিক্স"}
                  {activeTab === "orders" && "সিওডি অর্ডার ডাটাবেস"}
                  {activeTab === "images" && "ল্যান্ডিং পেজ ফটো ম্যানেজার"}
                  {activeTab === "pixel" && "ফেসবুক পিক্সেল ও ডেটা লেয়ার কনফিগ"}
                </h2>
              </div>

              <button
                onClick={onClose}
                className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-lg text-[10px] font-black uppercase cursor-pointer border-none"
              >
                প্যানেল বন্ধ করুন ×
              </button>
            </div>

            {/* TAB 1: DASHBOARD STATS */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg font-bold">📦</div>
                    <div>
                      <span className="text-[10px] text-slate-450 block uppercase font-bold">সর্বমোট অর্ডার</span>
                      <strong className="text-xl font-bold text-slate-900 font-mono mt-0.5 block">{totalSales} টি</strong>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center text-lg font-bold">৳</div>
                    <div>
                      <span className="text-[10px] text-slate-450 block uppercase font-bold">রেভিনিউ (ডেলিভারড)</span>
                      <strong className="text-xl font-bold text-green-700 font-mono mt-0.5 block">{confirmedRev}৳</strong>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center text-lg font-bold">⏳</div>
                    <div>
                      <span className="text-[10px] text-slate-450 block uppercase font-bold">অপেক্ষারত পেন্ডিং</span>
                      <strong className="text-xl font-bold text-yellow-650 font-mono mt-0.5 block">{pendingCount} টি</strong>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center text-lg font-bold">🚚</div>
                    <div>
                      <span className="text-[10px] text-slate-450 block uppercase font-bold">ডেলিভারড (Shipped)</span>
                      <strong className="text-xl font-bold text-slate-900 font-mono mt-0.5 block">{shippedCount} টি</strong>
                    </div>
                  </div>

                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-4">
                    <h3 className="text-xs font-black text-slate-800 uppercase">স্ট্যাটাস ভিত্তিক পাইপলাইন ডিস্ট্রিবিউশন</h3>
                    <div className="space-y-3.5">
                      {[
                        { name: "পেন্ডিং (Pending)", count: pendingCount, percent: totalSales > 0 ? (pendingCount / totalSales) * 100 : 0, color: "bg-yellow-400" },
                        { name: "কনফার্মড (Confirmed)", count: confirmedCount, percent: totalSales > 0 ? (confirmedCount / totalSales) * 100 : 0, color: "bg-emerald-500" },
                        { name: "ডেলিভারড (Shipped)", count: shippedCount, percent: totalSales > 0 ? (shippedCount / totalSales) * 100 : 0, color: "bg-blue-500" },
                        { name: "বাতিলকৃত (Cancelled)", count: cancelledCount, percent: totalSales > 0 ? (cancelledCount / totalSales) * 100 : 0, color: "bg-red-500" }
                      ].map((item, id) => (
                        <div key={id} className="space-y-1">
                          <div className="flex justify-between text-xs font-bold text-slate-600">
                            <span>{item.name}</span>
                            <span>{item.count} টি ({Math.round(item.percent)}%)</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full ${item.color}`} style={{ width: `${item.percent}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-black text-slate-805 uppercase mb-2">স্টোর রূপান্তর ট্র্যাকিং (Conversion Tracker)</h3>
                      <p className="text-xs text-slate-500 leading-normal leading-relaxed">
                        ল্যান্ডিং ভিজিটরদের রিয়েল-টাইম ট্র্যাকিং এবং লিড রূপান্তর হার বিশ্লেষণ। কাস্টমার অর্ডার সাবমিট করার সাথে সাথে ড্যাশবোর্ডে নতুন অর্ডার যুক্ত হয়।
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="bg-slate-50 p-3 rounded-xl text-center border border-slate-100">
                        <span className="text-[10px] text-slate-400 uppercase font-black block">গড় অর্ডার মূল্য</span>
                        <strong className="text-lg font-sans font-black text-[#0D1D68] mt-1 block">৮৮৫৳</strong>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl text-center border border-slate-100">
                        <span className="text-[10px] text-slate-400 uppercase font-black block">কনভার্শন রেট</span>
                        <strong className="text-lg font-sans font-black text-green-700 mt-1 block">৫.২%</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: REGISTERED ORDERS TABLE */}
            {activeTab === "orders" && (
              <div className="space-y-4">
                
                {/* Hoorin Courier API Key Configuration Box */}
                <div className="bg-slate-900 text-white p-4.5 rounded-2xl border border-slate-800 shadow-xl space-y-3">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-amber-400 uppercase flex items-center gap-1.5">
                        🛡️ Hoorin Courier Search (ফ্রড চেক এপিআই কন্টোলার)
                      </h4>
                      <p className="text-[10px] text-slate-300 leading-normal font-semibold max-w-2xl">
                        কাস্টমারের মোবাইল নম্বর চেক করে পূর্ববর্তী Steadfast, RedX, Pathao, Paperfly সহ দেশের শীর্ষস্থানীয় কুরিয়ার সার্ভিসের ডেলিভারি সফলতা এবং বাতিল পার্সেল ট্র্যাকিং রিপোর্ট।
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        type="password"
                        placeholder="Hoorin API Key বসান..."
                        value={courierApiKey}
                        onChange={(e) => setCourierApiKey(e.target.value)}
                        className="px-3 py-2 text-[10px] font-mono bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 w-48 sm:w-56 focus:outline-none focus:border-amber-400"
                      />
                      <button
                        onClick={() => handleSaveApiKey(courierApiKey)}
                        className="px-3.5 py-2 bg-amber-50 hover:bg-amber-600 text-slate-950 font-black text-[10px] uppercase rounded-lg cursor-pointer border-none transition-colors shrink-0"
                      >
                        কী সেভ করুন
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setShowAddForm(!showAddForm)}
                      className="px-3.5 py-2 bg-[#00A81F] hover:bg-green-700 text-white text-[10px] font-black uppercase rounded-lg cursor-pointer border-none transition-colors flex items-center gap-1.5"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>{showAddForm ? "ফর্ম বন্ধ করুন" : "নতুন ম্যানুয়াল অর্ডার"}</span>
                    </button>
                    <button
                      onClick={handleExportCSV}
                      className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-705 text-[10px] font-black uppercase rounded-lg cursor-pointer border-none transition-colors flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>CSV ডাউনলোড করুন</span>
                    </button>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto items-center">
                    <div className="relative flex-1 sm:w-48">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="সার্চ করুন..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full text-[10px] pl-8 pr-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                      className="text-[10px] p-2 border border-slate-200 rounded-lg bg-white focus:outline-none cursor-pointer"
                    >
                      <option value="All">All Status</option>
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Manual Add Form Block */}
                {showAddForm && (
                  <form onSubmit={handleAddOrder} className="bg-white p-5 border-2 border-green-500 rounded-2xl shadow space-y-3">
                    <h4 className="text-xs font-black text-slate-900 uppercase">ম্যানুয়ালি নতুন নগদ ডেলিভারি অর্ডার এন্ট্রি করুন:</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">কাস্টমারের নাম *</label>
                        <input
                          type="text"
                          required
                          value={newName}
                          onChange={e => setNewName(e.target.value)}
                          placeholder="আশরাফ ইসলাম"
                          className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">মোবাইল নম্বর *</label>
                        <input
                          type="tel"
                          required
                          value={newPhone}
                          onChange={e => setNewPhone(e.target.value)}
                          placeholder="017xxxxxxxx"
                          className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">ডেলিভারি চার্জ এলাকা *</label>
                        <select
                          value={newShipping}
                          onChange={e => setNewShipping(Number(e.target.value))}
                          className="w-full p-2.5 text-xs border border-slate-200 bg-white rounded-lg focus:outline-none cursor-pointer"
                        >
                          <option value={100}>ঢাকার বাইরে (১০০৳ চার্জ) [মোট ৯০০৳]</option>
                          <option value={50}>ঢাকার ভেতরে (৫০৳ চার্জ) [মোট ৮৫০৳]</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">বিস্তারিত ঠিকানা (গ্রাম, থানা, জেলা) *</label>
                      <textarea
                        rows={2}
                        required
                        value={newAddress}
                        onChange={e => setNewAddress(e.target.value)}
                        placeholder="রোড ৫, বাড্ডা, ঢাকা"
                        className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none resize-none"
                      />
                    </div>

                    <div className="flex justify-end gap-2 text-xs">
                      <button type="button" onClick={() => setShowAddForm(false)} className="px-3 py-1.5 border border-slate-200 rounded-lg cursor-pointer">বাতিল</button>
                      <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white border-none rounded-lg font-black cursor-pointer">অর্ডার এন্ট্রি করুন</button>
                    </div>
                  </form>
                )}

                {/* Orders spreadsheet grid */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse min-w-[1000px]">
                      <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-extrabold select-none">
                        <tr>
                          <th className="p-3 w-10 text-center">
                            <input 
                              type="checkbox" 
                              checked={displayedOrders.length > 0 && displayedOrders.every(o => selectedOrders[o.orderId])}
                              onChange={() => {
                                const allChecked = displayedOrders.every(o => selectedOrders[o.orderId]);
                                const next = { ...selectedOrders };
                                displayedOrders.forEach(o => {
                                  if (allChecked) {
                                    delete next[o.orderId];
                                  } else {
                                    next[o.orderId] = true;
                                  }
                                });
                                setSelectedOrders(next);
                              }}
                              className="rounded border-slate-300 accent-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 cursor-pointer" 
                            />
                          </th>
                          <th className="p-3 text-left hover:bg-slate-100/50 cursor-pointer transition">
                            <span className="flex items-center gap-1 font-sans font-bold">
                              Order <span className="text-slate-400 font-normal">⇅</span>
                            </span>
                          </th>
                          <th className="p-3 text-left hover:bg-slate-100/50 cursor-pointer transition">
                            <span className="flex items-center gap-1 font-sans font-bold">
                              Date <span className="text-slate-400 font-normal">⇅</span>
                            </span>
                          </th>
                          <th className="p-3 text-left font-sans font-bold">Status</th>
                          <th className="p-3 text-center hover:bg-slate-100/50 cursor-pointer transition">
                            <span className="flex items-center gap-1 justify-center font-sans font-bold">
                              Total <span className="text-slate-400 font-normal">⇅</span>
                            </span>
                          </th>
                          <th className="p-3 text-center hover:bg-slate-100/50 cursor-pointer transition">
                            <span className="flex items-center gap-1 justify-center font-sans font-bold">
                              Export Status <span className="text-slate-400 font-normal">⇅</span>
                            </span>
                          </th>
                          <th className="p-3 text-left font-sans font-bold">Order Guard Report</th>
                          <th className="p-3 text-left font-sans font-bold">Origin</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                        {totalFiltered === 0 ? (
                          <tr>
                            <td colSpan={8} className="p-10 text-center text-slate-400">
                              কোনো অর্ডার ডাটা খুঁজে পাওয়া যায়নি।
                            </td>
                          </tr>
                        ) : (
                          displayedOrders.map(o => {
                            const hasReport = !!courierReports[o.orderId];
                            const report = courierReports[o.orderId];
                            const analysis = report && !report.error && !report.loading ? getRiskAnalysis(report.sheet, report.summary) : null;
                            const isExpanded = !!expandedReports[o.orderId];

                            return (
                              <React.Fragment key={o.orderId}>
                                <tr className="hover:bg-slate-50/50 group/row transition-all">
                                  {/* Checkbox column */}
                                  <td className="p-3 text-center">
                                    <input 
                                      type="checkbox" 
                                      checked={!!selectedOrders[o.orderId]} 
                                      onChange={() => {
                                        setSelectedOrders(prev => ({
                                          ...prev,
                                          [o.orderId]: !prev[o.orderId]
                                        }));
                                      }}
                                      className="rounded border-slate-300 accent-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 cursor-pointer" 
                                    />
                                  </td>

                                  {/* Order with Name Link */}
                                  <td className="p-3">
                                    <div className="flex items-center gap-2">
                                      <button 
                                        onClick={() => toggleExpanded(o.orderId)}
                                        className="text-[#2563eb] hover:text-indigo-805 font-bold font-mono tracking-tight hover:underline cursor-pointer border-none bg-transparent p-0 text-left text-xs"
                                      >
                                        #{o.orderId} {o.name}
                                      </button>
                                      
                                      {/* Eye toggle details button */}
                                      <button 
                                        onClick={() => toggleExpanded(o.orderId)}
                                        className={`p-1.5 rounded-full hover:bg-indigo-50 transition border-none bg-transparent cursor-pointer ${
                                          isExpanded ? "text-indigo-600 bg-indigo-50/60" : "text-blue-500"
                                        }`}
                                        title="অর্ডার গার্ড বিস্তারিত দেখুন"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                    <div className="text-[10px] text-slate-450 mt-1 flex flex-wrap items-center gap-1.5 leading-none font-semibold">
                                      <span>📞 {o.phone}</span>
                                      <span>•</span>
                                      <span className="max-w-[150px] truncate" title={o.address}>🏡 {o.address}</span>
                                    </div>
                                  </td>

                                  {/* Relative Date */}
                                  <td className="p-3 text-left font-medium text-slate-500 text-[11px] font-sans tracking-wide">
                                    {(() => {
                                      try {
                                        const now = new Date("2026-06-12T03:25:13-07:00").getTime();
                                        const orderTime = new Date(o.timestamp).getTime();
                                        const diffMs = now - orderTime;
                                        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                                        
                                        if (diffHours >= 1 && diffHours < 24) {
                                          return `${diffHours} hours ago`;
                                        } else if (diffHours < 1) {
                                          return "just now";
                                        } else {
                                          return new Date(o.timestamp).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric"
                                          });
                                        }
                                      } catch (e) {
                                        return "just now";
                                      }
                                    })()}
                                  </td>

                                  {/* Unified Status select badge styled exactly like screenshot */}
                                  <td className="p-3">
                                    <div className="relative inline-block">
                                      <select
                                        value={o.status}
                                        onChange={e => handleStatusChange(o.orderId, e.target.value as Order["status"])}
                                        className={`text-[10px] font-extrabold rounded px-2.5 py-1 border-none cursor-pointer appearance-none text-center font-sans pr-1 ${
                                          o.status === "Pending" ? "bg-amber-100 text-amber-800" :
                                          o.status === "Confirmed" ? "bg-[#dbeafe] text-[#1e40af]" : // Completed color from screenshot
                                          o.status === "Shipped" ? "bg-blue-105 text-blue-800" :
                                          "bg-[#fee2e2] text-[#991b1b]" // Cancelled color from screenshot
                                        }`}
                                      >
                                        <option value="Pending">Pending</option>
                                        <option value="Confirmed">Completed</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Cancelled">Cancelled</option>
                                      </select>
                                    </div>
                                  </td>

                                  {/* Total Unit Price */}
                                  <td className="p-3 text-center font-mono text-[11px] text-slate-800 font-bold whitespace-nowrap">
                                    {o.total}.00৳
                                  </td>

                                  {/* Export Status */}
                                  <td className="p-3 text-center text-slate-400 font-medium">
                                    —
                                  </td>

                                  {/* Order Guard Report (Visual Progress bar + Toggle option) */}
                                  <td className="p-3">
                                    {analysis ? (
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-2 max-w-[200px]">
                                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                                            <div 
                                              className="h-full bg-violet-650 rounded-full bg-[#5D3EBC]" 
                                              style={{ width: `${analysis.successRate}%` }} 
                                            />
                                          </div>
                                          
                                          {/* Quick Action Buttons inside cell */}
                                          <div className="flex items-center gap-1 shrink-0">
                                            <button
                                              onClick={() => handleCheckFraud(o.orderId, o.phone)}
                                              disabled={report?.loading}
                                              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition cursor-pointer border-none bg-transparent"
                                              title="তথ্য রিফ্রেশ করুন"
                                            >
                                              <RefreshCw className={`w-3 h-3 ${report?.loading ? "animate-spin" : ""}`} />
                                            </button>
                                            
                                            <button
                                              onClick={() => toggleExpanded(o.orderId)}
                                              className={`p-1 rounded transition cursor-pointer border-none bg-transparent ${
                                                isExpanded 
                                                  ? "bg-green-150 text-emerald-800" 
                                                  : "text-emerald-605 hover:bg-slate-100 hover:text-emerald-800"
                                              }`}
                                              title="রিস্ক এনালাইসিস বিস্তারিত দেখুন"
                                            >
                                              <ShieldCheck className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        </div>
                                        <div className="text-[9px] font-bold text-slate-400 flex items-center gap-1.5 leading-none select-none">
                                          <span>ALL: {analysis.total}</span>
                                          <span className="text-slate-300">|</span>
                                          <span className="text-emerald-600">DLVD: {analysis.delivered}</span>
                                          <span className="text-slate-300">|</span>
                                          <span className="text-[#b91c1c]">CANCL: {analysis.canceled}</span>
                                        </div>
                                      </div>
                                    ) : report?.loading ? (
                                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold">
                                        <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                        <span>রিপোর্ট রেডি হচ্ছে...</span>
                                      </div>
                                    ) : report?.error ? (
                                      <div className="flex items-center gap-1.5 text-[9px] text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md font-bold max-w-[190px]">
                                        <span>ত্রুটি ⚠️</span>
                                        <button 
                                          onClick={() => handleCheckFraud(o.orderId, o.phone)}
                                          className="underline cursor-pointer font-bold border-none bg-transparent text-[8px] uppercase text-rose-700 pl-1"
                                        >
                                          আবার চেষ্টা
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2 select-none">
                                        <div className="bg-[#f0f9ff]/80 text-[#0369a1] border border-[#bae6fd]/50 py-1 px-2.5 rounded-md text-[10px] inline-flex items-center gap-1 font-extrabold">
                                          <BarChart2 className="w-3 h-3 text-sky-500" />
                                          <span>No delivery records found</span>
                                        </div>
                                        
                                        <button
                                          onClick={() => handleCheckFraud(o.orderId, o.phone)}
                                          className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-705 cursor-pointer border-none bg-transparent transition shrink-0"
                                          title="চেক করুন"
                                        >
                                          <RefreshCw className="w-3 h-3 text-slate-505" />
                                        </button>
                                      </div>
                                    )}
                                  </td>

                                  {/* Origin with overlay hovered Actions */}
                                  <td className="p-3 text-left whitespace-nowrap">
                                    <div className="flex items-center justify-between gap-2 max-w-[140px]">
                                      <span className="text-slate-500 text-[11px] font-semibold">Source: Fb</span>
                                      
                                      {/* Spreadsheet Quick Actions (Hovered opacity animation) */}
                                      <div className="flex items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity whitespace-nowrap bg-white/90 pl-1.5">
                                        <button 
                                          onClick={() => handleCopySummary(o)} 
                                          className="p-1 text-slate-550 hover:bg-slate-100 rounded cursor-pointer border-none bg-transparent transition-all" 
                                          title="কপি বিবরণ"
                                        >
                                          <Copy className="w-3.5 h-3.5" />
                                        </button>
                                        <button 
                                          onClick={() => handleDelete(o.orderId)} 
                                          className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer border-none bg-transparent transition-all" 
                                          title="ডিলিট"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  </td>
                                </tr>

                                {/* Detail Fraud Check drawer section (interactive expandable view) */}
                                {isExpanded && hasReport && (
                                  <tr className="bg-slate-50/40">
                                    <td colSpan={8} className="p-4 border-t border-slate-100">
                                      <div className="bg-white p-4.5 rounded-2xl border border-slate-150 shadow-md space-y-4 max-w-4xl text-left mx-auto">
                                        <div className="flex items-center justify-between border-b border-rose-105 pb-2 ml-1">
                                          <h5 className="font-sans font-black text-xs text-[#0D1D68] flex items-center gap-1.5">
                                            🔎 Hoorin কুরিয়ার পার্সেল ট্র্যাকিং ও ফ্রড রিপোর্ট (ফোন: {o.phone})
                                          </h5>
                                          <button
                                            onClick={() => {
                                              setExpandedReports(prev => ({
                                                ...prev,
                                                [o.orderId]: false
                                              }));
                                            }}
                                            className="text-slate-455 hover:text-slate-600 text-[10px] font-black uppercase tracking-tight bg-slate-100 px-2 py-1 rounded cursor-pointer border-none hover:bg-slate-200 transition"
                                          >
                                            রিপোর্ট বন্ধ করুন ×
                                          </button>
                                        </div>

                                        {report.loading ? (
                                          <div className="flex items-center justify-center py-8 gap-2 text-slate-555 font-semibold text-xs">
                                            <div className="w-4.5 h-4.5 border-2 border-[#0D1D68] border-t-transparent rounded-full animate-spin"></div>
                                            <span>রিয়েল-টাইম কুরিয়ার ডাটা ড্যাশবোর্ড থেকে পার্সেল লোড হচ্ছে...</span>
                                          </div>
                                        ) : report.error ? (
                                          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-150 font-semibold">
                                            🚨 এপিআই কানেকশন ভুল বা কী-তে সমস্যা রয়েছে: {report.error}
                                          </div>
                                        ) : analysis ? (
                                          <div className="space-y-4">
                                            
                                            {/* KPI Stats Grid */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                              <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl text-center">
                                                <span className="text-[9px] text-slate-400 block font-black uppercase">মোট পার্সেল এন্ট্রি</span>
                                                <strong className="text-base font-sans font-extrabold text-slate-900 block mt-1">{analysis.total} টি</strong>
                                              </div>
                                              <div className="p-3 bg-green-50 border border-green-150 rounded-xl text-center">
                                                <span className="text-[9px] text-green-600 block font-black uppercase">ডেলিভারড পার্সেল</span>
                                                <strong className="text-base font-sans font-extrabold text-green-700 block mt-1">{analysis.delivered} টি</strong>
                                              </div>
                                              <div className="p-3 bg-rose-50 border border-rose-150 rounded-xl text-center">
                                                <span className="text-[9px] text-rose-500 block font-black uppercase">রিটার্ন/বাতিলকৃত</span>
                                                <strong className="text-base font-sans font-extrabold text-rose-650 block mt-1">{analysis.canceled} টি</strong>
                                              </div>
                                              <div className="p-3 bg-[#0D1D68]/5 border border-[#0D1D68]/15 rounded-xl text-center">
                                                <span className="text-[9px] text-[#0D1D68] block font-black uppercase">সাফল্যতার অনুপাত</span>
                                                <strong className="text-base font-sans font-extrabold text-[#0D1D68] block mt-1">{analysis.successRate}%</strong>
                                              </div>
                                            </div>

                                            {/* Interactive Custom Badge & Recommendation Instruction */}
                                            <div className={`p-4 border rounded-xl flex items-start gap-3 ${analysis.riskColor}`}>
                                              <span className="text-xl">🛡️</span>
                                              <div className="space-y-1 text-xs">
                                                <strong className="block text-[13px] font-bold">{analysis.riskLabel}</strong>
                                                <p className="leading-relaxed font-semibold opacity-90 text-[#0c132c]">{analysis.adviceBangla}</p>
                                              </div>
                                            </div>

                                            {/* Details Breakdown Accordion Grid */}
                                            {report.summary?.Summaries && (
                                              <div className="space-y-2">
                                                <h6 className="font-bold text-[9px] text-slate-400 uppercase tracking-widest">কুরিয়ার ভিত্তিক বিস্তারিত রেকর্ড সমূহ:</h6>
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                                  {Object.entries(report.summary.Summaries).map(([courierName, cData]: [string, any]) => {
                                                    const tot = cData["Total Parcels"] ?? cData["Total Delivery"] ?? 0;
                                                    const del = cData["Delivered Parcels"] ?? cData["Successful Delivery"] ?? 0;
                                                    const can = cData["Canceled Parcels"] ?? cData["Canceled Delivery"] ?? 0;
                                                    const pct = tot > 0 ? Math.round((del / tot) * 100) : 100;

                                                    return (
                                                      <div key={courierName} className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1.5 text-xs">
                                                        <div className="flex justify-between font-black items-center">
                                                          <span className="text-[#0D1D68] font-bold">📍 {courierName}</span>
                                                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                                                            pct >= 85 ? "bg-green-100 text-green-800" :
                                                            pct >= 60 ? "bg-amber-100 text-amber-800" :
                                                            "bg-rose-100 text-rose-800"
                                                          }`}>{pct}% সাফল্য</span>
                                                        </div>
                                                        <ul className="space-y-1 text-slate-500 font-semibold text-[10px]">
                                                          <li className="flex justify-between">
                                                            <span>সর্বমোট:</span>
                                                            <span className="font-bold text-slate-800">{tot} টি</span>
                                                          </li>
                                                          <li className="flex justify-between">
                                                            <span>ডেলিভারি:</span>
                                                            <span className="font-bold text-green-700">{del} টি</span>
                                                          </li>
                                                          <li className="flex justify-between text-rose-650">
                                                            <span>রিটার্ন:</span>
                                                            <span className="font-bold text-rose-650">{can} টি</span>
                                                          </li>
                                                        </ul>
                                                      </div>
                                                    );
                                                  })}
                                                </div>
                                              </div>
                                            )}

                                          </div>
                                        ) : null}

                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Enhanced Pagination Control Board */}
                  <div className="bg-slate-50/70 border-t border-slate-200 px-4 py-3.5 flex flex-col sm:flex-row justify-between items-center gap-3.5 text-xs text-slate-500 select-none">
                    {/* Left: Size Selector & Total count indicator */}
                    <div className="flex flex-wrap items-center gap-2.5 justify-center sm:justify-start">
                      <span className="font-semibold text-slate-600">পৃষ্ঠা প্রতি অর্ডার:</span>
                      <select
                        value={pageSize}
                        onChange={e => setPageSize(Number(e.target.value))}
                        className="px-2 py-1 border border-slate-200 rounded-lg bg-white text-slate-800 font-extrabold focus:outline-none cursor-pointer text-[11px]"
                      >
                        <option value={10}>10 টি</option>
                        <option value={20}>20 টি</option>
                        <option value={30}>30 টি</option>
                        <option value={50}>50 টি</option>
                        <option value={100}>100 টি</option>
                      </select>
                      <span className="text-slate-400 font-medium">|</span>
                      <span className="font-medium text-[11px]">
                        সর্বমোট <strong className="text-slate-800 font-bold">{totalFiltered}</strong> টির মধ্যে <strong className="text-slate-850 font-bold">{totalFiltered === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1}</strong> থেকে <strong className="text-slate-850 font-bold">{Math.min(safeCurrentPage * pageSize, totalFiltered)}</strong> নম্বর অর্ডার দেখানো হচ্ছে
                      </span>
                    </div>

                    {/* Right: Interactive button triggers */}
                    {totalPages > 1 && (
                      <div className="flex items-center gap-1 font-semibold text-slate-605">
                        {/* First Page */}
                        <button
                          onClick={() => setCurrentPage(1)}
                          disabled={safeCurrentPage === 1}
                          className={`p-1.5 rounded-lg border transition ${
                            safeCurrentPage === 1
                              ? "text-slate-300 border-slate-100 bg-transparent cursor-not-allowed"
                              : "text-slate-600 border-slate-200 bg-white hover:bg-slate-100 cursor-pointer"
                          }`}
                          title="প্রথম পৃষ্ঠা"
                        >
                          <ChevronsLeft className="w-3.5 h-3.5" />
                        </button>

                        {/* Prev Page */}
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={safeCurrentPage === 1}
                          className={`p-1.5 rounded-lg border transition ${
                            safeCurrentPage === 1
                              ? "text-slate-300 border-slate-100 bg-transparent cursor-not-allowed"
                              : "text-slate-600 border-slate-200 bg-white hover:bg-slate-100 cursor-pointer"
                          }`}
                          title="পূর্ববর্তী পৃষ্ঠা"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>

                        {/* Page Numbers */}
                        {(() => {
                          const pageNumbers: number[] = [];
                          const maxPageButtons = 5;
                          let startPage = Math.max(1, safeCurrentPage - 2);
                          let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
                          if (endPage - startPage + 1 < maxPageButtons) {
                            startPage = Math.max(1, endPage - maxPageButtons + 1);
                          }
                          for (let i = startPage; i <= endPage; i++) {
                            pageNumbers.push(i);
                          }

                          return pageNumbers.map(pageNum => (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-7.5 h-7.5 flex items-center justify-center text-xs font-bold rounded-lg transition cursor-pointer border ${
                                pageNum === safeCurrentPage
                                  ? "bg-[#0D1D68] text-white border-[#0D1D68] shadow-sm font-black"
                                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                              }`}
                            >
                              {pageNum}
                            </button>
                          ));
                        })()}

                        {/* Next Page */}
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={safeCurrentPage === totalPages}
                          className={`p-1.5 rounded-lg border transition ${
                            safeCurrentPage === totalPages
                              ? "text-slate-300 border-slate-100 bg-transparent cursor-not-allowed"
                              : "text-slate-600 border-slate-200 bg-white hover:bg-slate-100 cursor-pointer"
                          }`}
                          title="পরবর্তী পৃষ্ঠা"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>

                        {/* Last Page */}
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          disabled={safeCurrentPage === totalPages}
                          className={`p-1.5 rounded-lg border transition ${
                            safeCurrentPage === totalPages
                              ? "text-slate-300 border-slate-100 bg-transparent cursor-not-allowed"
                              : "text-slate-600 border-slate-200 bg-white hover:bg-slate-100 cursor-pointer"
                          }`}
                          title="সর্বশেষ পৃষ্ঠা"
                        >
                          <ChevronsRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 3: LANDING PAGE IMAGES */}
            {activeTab === "images" && (
              <div className="space-y-6">
                
                <div className="bg-amber-50 p-4 rounded-xl border border-dashed border-amber-300 text-amber-900 text-xs leading-relaxed space-y-1">
                  <strong>💡 ফটো আপলোডার গাইড এবং শর্তাবলী:</strong>
                  <p>
                    ব্রাউজারের লোকাল মেমরি (localStorage) লিমিট থাকার কারণে প্রতিটি ছবির সর্বোচ্চ ফাইল সাইজ ২.৫ মেগাবাইটের নিচে হতে হবে। আপনি সরাসরি ইমেজ ইউআরএল (URL) বসিয়ে ছবি সেট করতে পারেন।
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Hero top background */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-black text-slate-800 border-b border-slate-150 pb-2 flex justify-between">
                        <span>১. হিরো সেকশন ফটো (Hero Banner)</span>
                        <span className="text-[9px] text-green-700 bg-green-50 px-1 py-0.5 rounded uppercase">Top Image</span>
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-1 leading-normal leading-relaxed">ল্যান্ডিংয়ের শুরুতে সবার উপরে ব্যানার হিসেবে দেখানো হয়। সবচেয়ে দৃষ্টিনন্দন ছবি নির্বাচন করুন।</p>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="h-32 bg-slate-100 rounded-xl overflow-hidden relative group">
                        <img src={images.heroTopImage} alt="Hero Banner Pres" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold">
                          <UploadCloud className="w-5 h-5 mb-1" />
                          <span>ছবি আপলোড করতে ক্লিক করুন</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={e => e.target.files?.[0] && handleImageUpload("heroTopImage", e.target.files[0])}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-550 block">সরাসরি ইমেজ ওয়েব লিংক দিন (Direct URL)</label>
                        <input
                          type="text"
                          value={images.heroTopImage}
                          onChange={e => handleImageUrlChange("heroTopImage", e.target.value)}
                          className="w-full p-2 border border-slate-200 bg-slate-50 text-[10px] font-mono rounded"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bottle Shot */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-black text-slate-800 border-b border-slate-150 pb-2 flex justify-between">
                        <span>২. বোতল ও ট্রান্সলুসেন্ট ক্যাপসুল ফটো</span>
                        <span className="text-[9px] text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded uppercase">Bottle Shot</span>
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-1 leading-normal leading-relaxed">ল্যান্ডিং পেজের মাঝখানে মূল ক্যাপসুল বোতলের ছবি। ক্রেতাদের বিশ্বাসযোগ্যতা বাড়াতে অরিজিনাল বোতল ফটো দিন।</p>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="h-32 bg-slate-100 rounded-xl overflow-hidden relative group">
                        <img src={images.centerProductImage} alt="Bottle Pres" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold">
                          <UploadCloud className="w-5 h-5 mb-1" />
                          <span>ছবি আপলোড করতে ক্লিক করুন</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={e => e.target.files?.[0] && handleImageUpload("centerProductImage", e.target.files[0])}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-550 block">সরাসরি ইমেজ ওয়েব লিংক দিন (Direct URL)</label>
                        <input
                          type="text"
                          value={images.centerProductImage}
                          onChange={e => handleImageUrlChange("centerProductImage", e.target.value)}
                          className="w-full p-2 border border-slate-200 bg-slate-50 text-[10px] font-mono rounded"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Benefits Lifestyle picture */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-black text-slate-800 border-b border-slate-150 pb-2 flex justify-between">
                        <span>৩. সুস্থ ও সুখী বৈবাহিক জীবনের দৃশ্য</span>
                        <span className="text-[9px] text-pink-700 bg-pink-50 px-1 py-0.5 rounded uppercase">Couple shot</span>
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-1 leading-normal leading-relaxed">ডান পাশে ঘরোয়া সুখী দম্পতির রঙিন ছবি। এটি ইমোশনাল ট্র্রিগার হিসেবে অর্ডার বাড়াতে অত্যন্ত ভূমিকা রাখে।</p>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="h-32 bg-slate-100 rounded-xl overflow-hidden relative group">
                        <img src={images.benefitsImage} alt="Couple Pres" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold">
                          <UploadCloud className="w-5 h-5 mb-1" />
                          <span>ছবি আপলোড করতে ক্লিক করুন</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={e => e.target.files?.[0] && handleImageUpload("benefitsImage", e.target.files[0])}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-550 block">সরাসরি ইমেজ ওয়েব লিংক দিন (Direct URL)</label>
                        <input
                          type="text"
                          value={images.benefitsImage}
                          onChange={e => handleImageUrlChange("benefitsImage", e.target.value)}
                          className="w-full p-2 border border-slate-200 bg-slate-50 text-[10px] font-mono rounded"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Miniature Offers */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-black text-slate-800 border-b border-slate-150 pb-2 flex justify-between">
                        <span>৪. অফার বক্স মিনি থাম্বনেইল ১/২/৩</span>
                        <span className="text-[9px] text-amber-700 bg-amber-50 px-1 py-0.5 rounded uppercase">Thumbnails</span>
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-1 leading-normal leading-relaxed">অফার সেকশনের উপর পাশাপাশি ৩টি ছোট থাম্বনেইল ছবি যা কাস্টমারদের আকর্ষণ তৈরি করে।</p>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { key: "offerImage1", label: "ফটো ১" },
                          { key: "offerImage2", label: "ফটো ২" },
                          { key: "offerImage3", label: "ফটো ৩" }
                        ].map((m, idx) => (
                          <div key={idx} className="h-14 bg-slate-50 border border-slate-200 rounded relative group overflow-hidden">
                            <img src={images[m.key as keyof LandingPageImages]} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[9px]">
                              <span>{m.label}</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={e => {
                                  if (e.target.files?.[0]) {
                                    handleImageUpload(m.key as keyof LandingPageImages, e.target.files[0]);
                                  }
                                }}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-1 text-[9px]">
                        <input
                          type="text"
                          value={images.offerImage1}
                          placeholder="ছবি ১ লিংক"
                          onChange={e => handleImageUrlChange("offerImage1", e.target.value)}
                          className="w-full p-1.5 border border-slate-150 text-[9px] font-mono"
                        />
                        <input
                          type="text"
                          value={images.offerImage2}
                          placeholder="ছবি ২ লিংক"
                          onChange={e => handleImageUrlChange("offerImage2", e.target.value)}
                          className="w-full p-1.5 border border-slate-150 text-[9px] font-mono"
                        />
                        <input
                          type="text"
                          value={images.offerImage3}
                          placeholder="ছবি ৩ লিংক"
                          onChange={e => handleImageUrlChange("offerImage3", e.target.value)}
                          className="w-full p-1.5 border border-slate-150 text-[9px] font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Product Form Checkout Image */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-black text-slate-800 border-b border-slate-150 pb-2 flex justify-between">
                        <span>৫. অর্ডার ফর্ম প্রোডাক্ট ফটো</span>
                        <span className="text-[9px] text-green-700 bg-green-50 px-1 py-0.5 rounded uppercase">Checkout Image</span>
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-1 leading-normal leading-relaxed">অর্ডার করার ফর্মে প্যাকেজের নামের পাশে যে থাম্বনেইল ছবি শো করে।</p>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="h-32 bg-slate-100 rounded-xl overflow-hidden relative group">
                        <img src={images.productImage} alt="Order Product Pres" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold">
                          <UploadCloud className="w-5 h-5 mb-1" />
                          <span>ছবি আপলোড করতে ক্লিক করুন</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={e => e.target.files?.[0] && handleImageUpload("productImage", e.target.files[0])}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-550 block">সরাসরি ইমেজ ওয়েব লিংক দিন (Direct URL)</label>
                        <input
                          type="text"
                          value={images.productImage}
                          onChange={e => handleImageUrlChange("productImage", e.target.value)}
                          className="w-full p-2 border border-slate-200 bg-slate-50 text-[10px] font-mono rounded"
                        />
                      </div>
                    </div>
                  </div>

                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-center">
                  <button
                    onClick={handleResetImages}
                    className="px-5 py-2.5 bg-white hover:bg-slate-50 border-2 border-red-500 text-red-500 rounded-xl text-xs font-black cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-4 h-4 animate-spin-hover" />
                    <span>ফ্যাক্টরি অরিজিনাল ছবিতে রিসেট করুন</span>
                  </button>
                </div>

              </div>
            )}

            {/* TAB 4: FB META PIXEL & DATALAYER TRACKING HUB */}
            {activeTab === "pixel" && (
              <div className="space-y-6">
                
                {/* 1. Configuration Panel */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6 space-y-5">
                  <div className="flex items-start gap-3 border-b border-slate-100 pb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg shrink-0">📈</div>
                    <div>
                      <h3 className="text-sm font-black text-slate-800">পিক্সেল ও ডেটা লেয়ার কনফিগুরেশন (Meta Pixel & GTM dataLayer)</h3>
                      <p className="text-xs text-slate-500 mt-1">ফানেলের কনভার্সন ট্র্যাকিং কর্মক্ষমতা বাড়াতে মেটা পিক্সেল আইডি এবং ডেটা লেয়ার ইভেন্ট প্যারামিটার অপ্টিমাইজ করুন।</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                    
                    {/* Left form input */}
                    <div className="space-y-3.5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-700 block">আপনার ফেসবুক পিক্সেল আইডি (Meta Pixel ID) *</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={pixelInput}
                            onChange={e => setPixelInput(e.target.value.replace(/[^\d]/g, ""))}
                            placeholder="যেমন: 884561029348576"
                            className="flex-1 p-3 border border-slate-200 bg-white font-mono text-xs rounded-xl focus:ring-1 focus:ring-emerald-505 focus:outline-none"
                          />
                          <button
                            onClick={() => {
                              if (!pixelInput.trim()) {
                                alert("অনুগ্রহ করে একটি সঠিক পিক্সেল আইডি দিন।");
                                return;
                              }
                              setMetaPixelId(pixelInput.trim());
                              setNotifyMsg("সাফল্যের সাথে মেটা পিক্সেল আইডি আপডেট এবং রিলোড করা হয়েছে!");
                              setTimeout(() => setNotifyMsg(null), 3500);
                            }}
                            className="px-5 py-3 bg-[#00A81F] text-white hover:bg-[#00901B] font-black text-xs rounded-xl border-none cursor-pointer tracking-wide shadow"
                          >
                            সংরক্ষণ করুন
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-450 leading-relaxed font-semibold">
                          পিক্সেল আইডি সেট করলে এটি সরাসরি ব্রাউজারে মেটা পিক্সেল ট্র্যাকার <code className="bg-slate-100 px-1 py-0.5 rounded text-red-650">fbq</code> কোড লোড করবে এবং <code className="bg-slate-100 px-1 py-0.5 rounded text-red-650">window.dataLayer</code> এ প্রফেশনাল ই-কমার্স ইভেন্টস পুশ করবে।
                        </p>
                      </div>

                      {/* Info banners */}
                      <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-150 text-xs text-blue-800 leading-relaxed space-y-2">
                        <h4 className="font-black flex items-center gap-1">
                          <ShieldCheck className="w-4 h-4 text-blue-600" />
                          <span>মেটা ম্যাচ কোয়ালিটি উন্নত করার অনন্য ডিজাইন:</span>
                        </h4>
                        <ul className="list-disc pl-4 space-y-1 text-[11px] font-medium font-sans">
                          <li>অর্ডার সাবমিট হবার সাথে সাথে গ্রাহকের নাম ও ফোন নম্বর মেটা ট্র্যাকিং এ প্যারামিটার আকারে চলে যায়।</li>
                          <li>এটি মেটা কাস্টমার ম্যাচিং রেটিং (Match Quality) সত্তর ভাগ বাড়িয়ে দেয়।</li>
                          <li>ক্যাশ অন ডেলিভারি (COD) পেমেন্ট মেথড হিসেবে ট্র্যাকিং পোর্টালে সাবমিট হয়।</li>
                        </ul>
                      </div>
                    </div>

                    {/* Right Sandbox Verification tools */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                      <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                        <Activity className="w-4 h-4 text-rose-500" />
                        <span>কনভার্সন ইভেন্ট টেস্টিং গ্রাউন্ড (Test Events)</span>
                      </h4>
                      <p className="text-[11px] text-slate-550 leading-relaxed">
                        নিচের বাটনগুলিতে ক্লিক করে সরাসরি ফেসবুক পিক্সেল ও ডেটা লেয়ারে মক ট্র্যাকিং টেস্ট ইভেন্ট ফায়ার করতে পারেন। নিচের কনসোলে লাইভ ট্র্যাকিং ডাটা চেক করুন:
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <button
                          onClick={() => {
                            setMetaPixelId(pixelInput || "884561029348576");
                            // Re-track page view
                            window.dataLayer = window.dataLayer || [];
                            window.dataLayer.push({
                              event: "PageView",
                              page_path: "/test-trigger",
                              page_title: "Test Sandbox Screen",
                              timestamp: new Date().toISOString()
                            });
                            if (typeof window.fbq === "function") {
                              window.fbq("track", "PageView");
                            }
                            // Call getTrackingLogs / trigger refresh
                            setLogs(getTrackingLogs());
                          }}
                          className="flex items-center justify-center gap-1.5 p-2.5 bg-white hover:bg-slate-100 border border-slate-250 hover:border-slate-350 rounded-lg text-slate-700 font-bold cursor-pointer text-left transition"
                        >
                          🔍 PageView টেস্ট
                        </button>

                        <button
                          onClick={() => {
                            trackViewContent("Antarctic Krill Oil Capsules 30 Pcs", 800);
                            setLogs(getTrackingLogs());
                          }}
                          className="flex items-center justify-center gap-1.5 p-2.5 bg-white hover:bg-slate-100 border border-slate-250 hover:border-slate-350 rounded-lg text-slate-700 font-bold cursor-pointer text-left transition"
                        >
                          👁️ ViewContent টেস্ট
                        </button>

                        <button
                          onClick={() => {
                            trackInitiateCheckout("Antarctic Krill Oil Capsules 30 Pcs", 900);
                            setLogs(getTrackingLogs());
                          }}
                          className="flex items-center justify-center gap-1.5 p-2.5 bg-white hover:bg-slate-100 border border-slate-250 hover:border-slate-350 rounded-lg text-slate-700 font-bold cursor-pointer text-left transition"
                        >
                          🛒 InitiateCheckout টেস্ট
                        </button>

                        <button
                          onClick={() => {
                            const mockId = "COD-" + Math.floor(100000 + Math.random() * 900000);
                            trackPurchase(mockId, "Antarctic Krill Oil Capsules 30 Pcs", 900, "01712345678", "সাকিব হোসেন");
                            setLogs(getTrackingLogs());
                          }}
                          className="flex items-center justify-center gap-1.5 p-[#00a81f]/10 bg-white hover:bg-slate-100 border border-emerald-305 hover:border-emerald-450 text-emerald-700 font-bold cursor-pointer text-left transition"
                        >
                          💰 Purchase টেস্ট
                        </button>
                      </div>

                    </div>

                  </div>
                </div>

                {/* 2. Realtime Terminal Event Logger */}
                <div className="bg-[#090D16] text-slate-200 rounded-2xl border border-slate-800 shadow-2xl p-5 font-mono overflow-hidden">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-slate-250 uppercase tracking-wide">লাইভ ট্র্যাকিং কনসোল (dataLayer telemetry logs)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-sans font-bold uppercase uppercase tracking-widest text-[#00A81F]">ACTIVE</span>
                    </div>
                  </div>

                  {/* Logs list */}
                  <div className="space-y-3.5 max-h-[440px] overflow-y-auto pr-1">
                    {logs.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 text-xs font-sans">
                        কোনো ইভেন্ট এখনও ফায়ার করা হয়নি। কাস্টমার অর্ডার সাবমিট করলে বা টেস্ট বাটনে ক্লিক করলে লাইভ পেলোড ডাটা এখানে দেখা যাবে।
                      </div>
                    ) : (
                      logs.map((log, index) => (
                        <div key={index} className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 text-[11px] space-y-2">
                          <div className="flex flex-wrap justify-between items-center gap-2 text-[10px] border-b border-slate-800/50 pb-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-rose-400 font-black">[{log.timestamp}]</span>
                              <span className="bg-blue-950 text-blue-400 px-2 py-0.5 rounded font-bold uppercase text-[9px] tracking-wide border border-blue-900">
                                {log.eventName}
                              </span>
                            </div>
                            <span className="text-slate-450 text-[9px] font-sans">
                              {log.eventName === "Purchase" ? "💰 মেটা কনভার্সন এপিআই ম্যাচ কোয়ালিটি সমৃদ্ধ" : "⚡ স্ট্যান্ডার্ড ইভেন্ট"}
                            </span>
                          </div>

                          <div className="bg-black/50 p-2.5 rounded-lg border border-slate-900 overflow-x-auto select-all">
                            <pre className="text-emerald-400 leading-tight text-[10px] tracking-normal font-mono whitespace-pre-wrap">
                              {JSON.stringify(log.payload, null, 2)}
                            </pre>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
