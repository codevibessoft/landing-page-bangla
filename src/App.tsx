import { useState, useEffect } from "react";
import { 
  Check, Phone, ShoppingCart, ShieldCheck, 
  ArrowRight, AlertCircle, Sparkles, Star, Award
} from "lucide-react";
import { AnimatePresence } from "motion/react";
import { Order, LandingPageImages } from "./types";
import { DEFAULT_LANDING_IMAGES, MOCK_COD_ORDERS } from "./data";

// Modular Clean Components
import NotificationToast from "./components/NotificationToast";
import TrustBadges from "./components/TrustBadges";
import FaqAccordion from "./components/FaqAccordion";
import OrderFormCheckout from "./components/OrderFormCheckout";
import AdminPanel from "./components/AdminPanel";

// Meta Pixel tracking integrations
import { initializeMetaPixel, trackPageView, trackViewContent } from "./lib/tracker";

export default function App() {
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Sync state with back/forward history navigation or hash changes
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", handleLocationChange);
    window.addEventListener("hashchange", handleLocationChange);
    
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener("hashchange", handleLocationChange);
    };
  }, []);

  const isAdminActive = currentPath === "/admin" || currentPath === "/admin/" || window.location.hash === "#/admin" || window.location.hash === "#admin";

  // Dynamic dynamic configurations stored via browser client state engines
  const [orders, setOrders] = useState<Order[]>([]);
  const [images, setImages] = useState<LandingPageImages>(DEFAULT_LANDING_IMAGES);

  // Load initialized datasets on load
  useEffect(() => {
    // 1. Orders database init
    const storedOrders = localStorage.getItem("krill_cod_orders");
    if (storedOrders) {
      try {
        setOrders(JSON.parse(storedOrders));
      } catch {
        setOrders(MOCK_COD_ORDERS);
        localStorage.setItem("krill_cod_orders", JSON.stringify(MOCK_COD_ORDERS));
      }
    } else {
      setOrders(MOCK_COD_ORDERS);
      localStorage.setItem("krill_cod_orders", JSON.stringify(MOCK_COD_ORDERS));
    }

    // 2. Landing page images init
    const storedImages = localStorage.getItem("krill_landing_images");
    if (storedImages) {
      try {
        setImages(JSON.parse(storedImages));
      } catch {
        setImages(DEFAULT_LANDING_IMAGES);
        localStorage.setItem("krill_landing_images", JSON.stringify(DEFAULT_LANDING_IMAGES));
      }
    } else {
      setImages(DEFAULT_LANDING_IMAGES);
      localStorage.setItem("krill_landing_images", JSON.stringify(DEFAULT_LANDING_IMAGES));
    }

    // 3. Initialize FB Meta Pixel & dataLayer events
    try {
      initializeMetaPixel();
      trackPageView();
      trackViewContent("Antarctic Krill Oil Capsules 30 Pcs", 800);
    } catch (err) {
      console.error("Initialization tracking error:", err);
    }
  }, []);

  // Callback on order submission
  const handleNewOrderPlaced = (newOrder: Order) => {
    setOrders((prev) => {
      const updated = [newOrder, ...prev];
      localStorage.setItem("krill_cod_orders", JSON.stringify(updated));
      return updated;
    });
  };

  // Scroll handler for the high-converting sticky footer CTA activation
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Soft scroll to the checkout order form
  const scrollToCheckout = () => {
    const element = document.getElementById("checkout-funnel-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div id="cod-krill-funnel" className="min-h-screen bg-white text-slate-800 font-sans antialiased overflow-x-hidden selection:bg-green-150 selection:text-green-800">
      
      {/* 1. REAL-TIME PURCHASE BANNER (Pops up matching Bangladeshi buyers) */}
      <NotificationToast />

      {/* ADMIN PANEL OVERLAY GATE */}
      {isAdminActive && (
        <AdminPanel
          orders={orders}
          setOrders={setOrders}
          images={images}
          setImages={setImages}
          onClose={() => {
            window.history.pushState({}, "", "/");
            setCurrentPath("/");
          }}
        />
      )}

      {/* 2. TOP BANNER AT TOP OF THE PAGE */}
      <div className="bg-[#FF1A00] text-white text-center py-2.5 px-4 text-xs md:text-sm font-black tracking-tight relative z-40 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-center items-center gap-2">
          <span className="animate-pulse">🔥</span>
          <span>ডেলিভারি ম্যানের সামনে পণ্য চেক করে পেমেন্ট করার সুবর্ণ সুযোগ!</span>
          <span className="hidden sm:inline bg-white text-red-650 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">COD</span>
        </div>
      </div>

      {/* SECTION 1 - HERO */}
      <section id="hero-section" className="bg-[#00A81F] text-white py-12 px-4 text-center flex flex-col items-center">
        <div className="max-w-4xl mx-auto space-y-6 flex flex-col items-center">
          
          {/* Top Image: Center aligned product/lifestyle picture */}
          <div className="max-w-[540px] w-full rounded-2xl overflow-hidden shadow-2xl bg-white p-1 hover:scale-105 transition-all duration-300">
            <img 
              src={images.heroTopImage} 
              alt="Romantic Intimacy Scene" 
              width={540}
              height={304}
              className="w-full h-auto object-cover rounded-xl"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Product Badge: Red pill shape, positioned directly below top image */}
          <div className="inline-flex bg-[#FF1A00] text-white px-5 py-2 rounded-full font-black text-sm uppercase tracking-wide shadow-md border border-red-500 animate-pulse">
            Antarctic Kirll Oil Capsules 30 Pcs
          </div>

          {/* Headline: Massive white bold Bangla text */}
          <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight text-white max-w-2xl px-2">
            হারানো যৌবন ফিরে আসবেই
          </h1>

          {/* Subtitle direct selling bullets */}
          <p className="text-base md:text-lg text-emerald-100 font-medium max-w-xl">
            শতভাগ অরিজিনাল ও ল্যাব সার্টিফাইড এন্টার্কটিক ক্রিল অয়েল গোল্ডেন রেটুল ক্যাপসুল।
          </p>

          {/* Primary CTA Red button */}
          <div className="pt-2">
            <button
              onClick={scrollToCheckout}
              className="px-8 py-4.5 bg-[#FF1A00] hover:bg-[#E00000] text-white text-lg font-black rounded-full shadow-2xl hover:shadow-[0_12px_40px_rgba(255,26,0,0.45)] transition-all flex items-center justify-center gap-2 cursor-pointer border-none uppercase transform hover:-translate-y-0.5"
            >
              <span>🛒 অর্ডার করুন</span>
            </button>
          </div>

        </div>
      </section>

      {/* SECTION 2 - BENEFIT STRIP */}
      <section id="benefit-strip" className="bg-[#000000] text-white py-4.5 px-4 text-center border-y border-slate-900 shadow-md">
        <div className="max-w-4xl mx-auto flex justify-center items-center gap-2">
          <p className="text-sm md:text-lg font-sans font-black tracking-tight leading-snug">
            স্পেশাল অফার তিনগুণ শক্তি বাড়ে{" "}
            <span className="relative inline-block px-2 text-yellow-400">
              <span className="absolute inset-0 border-2 border-dashed border-red-500 rounded-lg transform -rotate-1 pointer-events-none scale-105"></span>
              সীমিত সময়ের
            </span>{" "}
            জন্য!
          </p>
        </div>
      </section>

      {/* SECTION 3 - OFFER BOX */}
      <section id="offer-box-section" className="bg-[#00A81F] py-12 px-4 flex flex-col items-center">
        <div className="max-w-xl w-full bg-[#00A81F] border-4 border-dashed border-white rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl flex flex-col items-center">
          
          {/* 3 small lifestyle images side-by-side */}
          <div className="grid grid-cols-3 gap-2.5 w-full">
            <img 
              src={images.offerImage1} 
              alt="Couples touch" 
              className="w-full h-16 sm:h-24 object-cover rounded-xl shadow border border-emerald-400"
              referrerPolicy="no-referrer"
            />
            <img 
              src={images.offerImage2} 
              alt="Romantic closeness" 
              className="w-full h-16 sm:h-24 object-cover rounded-xl shadow border border-emerald-400"
              referrerPolicy="no-referrer"
            />
            <img 
              src={images.offerImage3} 
              alt="Sensual love glow" 
              className="w-full h-16 sm:h-24 object-cover rounded-xl shadow border border-emerald-400"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* White elegant Course card */}
          <div className="bg-white rounded-2xl p-6 w-full text-center shadow-lg border-2 border-[#E8B84C] relative overflow-hidden">
            <h3 className="text-xl md:text-2xl font-black text-[#0D1D68] leading-tight mb-2">
              30 টি ক্যাপসুল 30 দিনের কোর্স
            </h3>
            
            <div className="flex justify-center items-center gap-3">
              <span className="text-slate-400 text-sm md:text-base line-through font-bold font-sans">১৬০০/- টাকা</span>
              <span className="text-2xl md:text-3xl font-black text-red-600 bg-red-50 border border-red-100 px-3 py-1 rounded-xl">
                ৮০০/- টাকা
              </span>
            </div>
            
            <div className="mt-3.5 flex justify-center">
              <span className="bg-green-100 text-green-800 text-[10px] sm:text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border border-green-200">
                ⭐ ডেলিভারি পেয়ে মূল্য পরিশোধ করবেন
              </span>
            </div>
          </div>

          {/* Bottom aligned order button */}
          <div className="w-full pt-2">
            <button
              onClick={scrollToCheckout}
              className="w-full px-8 py-4 bg-[#FF1A00] hover:bg-[#E00000] text-white text-lg font-black rounded-xl shadow-2xl hover:shadow-[0_12px_40px_rgba(255,26,0,0.55)] transition-all flex items-center justify-center cursor-pointer border-none uppercase hover:-translate-y-0.5 transform duration-200"
            >
              <span>🛒 অর্ডার করুন</span>
            </button>
          </div>

        </div>
      </section>

      {/* SECTION 4 - PRODUCT IMAGE SECTION */}
      <section id="product-overview" className="bg-[#0D1D68] text-white py-14 px-4 flex flex-col items-center">
        <div className="max-w-4xl w-full text-center space-y-8">
          
          <h2 className="text-xl md:text-3xl font-sans font-black text-amber-400 leading-snug">
            ১০০% অথেনটিক এন্টার্কটিক ক্রিল অয়েল ক্যাপসুল শপ
          </h2>

          {/* Center Product Image inside premium white container */}
          <div className="bg-white rounded-3xl p-4 md:p-6 w-fit mx-auto shadow-2xl max-w-sm hover:scale-[1.01] transition-transform duration-300">
            <img 
              src={images.centerProductImage} 
              alt="Antarctic Krill Oil premium translucent capsules" 
              className="w-full h-56 md:h-64 object-cover rounded-2xl"
              referrerPolicy="no-referrer"
            />
            <p className="text-xs text-slate-500 font-sans font-bold mt-3">
              অরিজিনাল এন্টার্কটিক ক্রিল অয়েল পুষ্টিগুণ ও শক্তি সমৃদ্ধ রেড ক্যাপসুল
            </p>
          </div>

          {/* Question Banner in Black background, large red text */}
          <div className="bg-black/80 rounded-2xl py-5 px-6 max-w-md mx-auto shadow-lg border border-slate-900">
            <h3 className="text-2xl md:text-4xl font-sans font-black text-[#FF1A00] uppercase tracking-wide leading-none animate-pulse">
              ছোট লিঙ্গ?
            </h3>
            <p className="text-xs text-slate-400 mt-2 font-medium">
              স্থায়ী সমাধান ও পুরুষাঙ্গ সুস্থ ও সবল রাখতে ব্যবহার করুন ক্রিল অয়েল কোর্স!
            </p>
          </div>

        </div>
      </section>

      {/* SECTION 5 - BENEFITS SECTION (Arctic theme glaciers background) */}
      <section 
        id="benefits-list" 
        className="relative py-16 px-4 bg-slate-100 flex items-center justify-center border-y border-slate-200"
        style={{
          backgroundImage: `linear-gradient(rgba(240, 249, 255, 0.82), rgba(240, 249, 255, 0.88)), url('https://images.unsplash.com/photo-1548263591-190595087352?auto=format&fit=crop&w=1200&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay'
        }}
      >
        <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Title badge & checklist */}
          <div className="space-y-6">
            
            {/* Title badge in red */}
            <div className="bg-[#FF1A00] text-white px-5 py-2.5 rounded-full font-black text-sm uppercase tracking-wider w-fit shadow">
              কার্যকারিতা
            </div>

            {/* Checklist of benefits */}
            <div className="space-y-4">
              {[
                "সম্পূর্ণ প্রাকৃতিক ও রসায়নমুক্ত সম্পূর্ণ গ্যারেন্টেড ফর্মুলা।",
                "শরীর ও যৌন শক্তি বৃদ্ধিতে শতভাগ কার্যকর ও স্থায়ী প্রভাব ফেলে।",
                "সহজে ব্যবহারযোগ্য, দৈনন্দিন সুস্থ জীবনের সাথে মানিয়ে নিয়ে সেবন করা যায়।",
                "সতেজতা ও শারীরিক অবসাদ দূর করতে প্রাকৃতিকভাবে সাহায্যকারী।"
              ].map((benefit, i) => (
                <div key={i} className="flex items-start gap-3 bg-white/90 p-4 rounded-xl shadow-xs border border-blue-100">
                  <div className="w-6 h-6 rounded-full bg-[#FF1A00] flex items-center justify-center shrink-0 text-white text-xs font-bold shadow-sm">
                    ✓
                  </div>
                  <p className="text-slate-800 text-sm md:text-base font-bold leading-normal">
                    {benefit}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA button: white bubble with red outline */}
            <div className="pt-2">
              <button
                onClick={scrollToCheckout}
                className="px-6 py-3 bg-white border-2 border-[#FF1A00] hover:bg-red-50 text-[#FF1A00] text-xs font-black rounded-lg uppercase tracking-widest shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>🛒 অর্ডার করুন</span>
              </button>
            </div>

          </div>

          {/* Right Column: bedroom romantic couple with gold border frame */}
          <div className="relative">
            <div className="border-8 border-[#E8B84C] rounded-2xl overflow-hidden shadow-2xl bg-white p-1 hover:scale-[1.01] transition-transform duration-300">
              <img 
                src={images.benefitsImage} 
                alt="Lovely Couple Scene" 
                className="w-full h-80 object-cover rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Stamp badges */}
            <div className="absolute -top-4 -right-4 bg-[#0D1D68] text-white border-2 border-amber-400 py-2 px-3 rounded-xl shadow-lg text-xs font-black uppercase flex items-center gap-1">
              🎖️ ১০০% কার্যকরী ফলাফল
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 6 - USAGE INSTRUCTIONS (сеवन तिथि) */}
      <section id="usage-instructions" className="bg-[#00A81F] py-12 px-4 flex flex-col items-center border-b border-white/10">
        <div className="max-w-2xl w-full text-center space-y-6">
          
          <div className="bg-[#0D1D68]/90 text-white border-2 border-dashed border-[#E8B84C] rounded-3xl p-6 md:p-8 space-y-5 shadow-2xl text-left">
            
            {/* Title block */}
            <div className="bg-white text-[#FF1A00] border-2 border-[#FF1A00] font-black text-sm uppercase px-5 py-2.5 rounded-full w-fit tracking-wider shadow">
              সেবন বিধি:
            </div>

            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <span className="text-xl shrink-0">🍀</span>
                <p className="text-white text-sm md:text-base font-bold leading-relaxed">
                  প্রতিদিন খাবারের সাথে (বিশেষ করে চর্বিযুক্ত বা ভারী খাবারের পর) ১টি করে ক্যাপসুল পানি দিয়ে গিলে সেবন করুন।
                </p>
              </div>

              <div className="flex gap-3 items-start border-t border-white/10 pt-4">
                <span className="text-xl shrink-0 font-sans">💡</span>
                <p className="text-emerald-100 text-sm md:text-base font-bold leading-relaxed">
                  <strong>টিপস:</strong> সেরা ও দীর্ঘস্থায়ী ফলাফলের জন্য অন্তত ৩০ দিনের কোর্স সম্পূর্ণ করুন এবং স্বাস্থ্যকর জীবনযাপন বজায় রাখুন।
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 8 - PAYMENT NOTICE */}
      <section id="payment-warning" className="bg-[#00A81F] text-white py-8 px-4 text-center border-y border-white/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl md:text-3xl font-sans font-black text-white leading-tight tracking-normal">
            অর্ডার করতে আপনাকে ১টাকাও অগ্রীম পেমেন্ট করতে হবেনা
          </h2>
        </div>
      </section>

      {/* SECTION 9 - WOOCOMMERCE ORDER FORM */}
      <OrderFormCheckout onNewOrderPlaced={handleNewOrderPlaced} productImage={images.productImage} />

      {/* TRUST BADGES AREA */}
      <TrustBadges />

      {/* GENERAL FAQS */}
      <FaqAccordion />

      {/* SECTION 10 - FOOTER WARNING NOTICE */}
      <footer id="footer-warning-notice" className="bg-[#FF1A00] text-white text-center py-5 px-4 text-xs md:text-base font-sans font-black tracking-tight relative z-30">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-center items-center gap-2">
          <span>⚠️ অসাধু ব্যবসায়ী দ্বারা প্রতারিত হবেন না। পণ্য হাতে পেয়ে চেক করে মূল্য পরিশোধ করুন!</span>
        </div>
      </footer>

      <div className="bg-slate-900 text-slate-500 text-[11px] py-4 text-center font-sans">
        © {new Date().getFullYear()} Antarctic Kirll Capsules Bangladesh Distributor. All rights reserved. Registered COD Partner.
      </div>

      {/* STICKY BOTTOM FIXED BAR (H-CONVERTING FOR MOBILE & DESKTOP DESIGNS) */}
      <AnimatePresence>
        {showStickyBar && (
          <div
            id="floating-sticky-buy-bar"
            className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-slate-200 z-50 py-3 px-4 md:px-8 shadow-2xl flex items-center justify-between gap-4 animate-slide-up"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-green-200 flex items-center justify-center shrink-0 hidden xs:flex">
                <span className="text-lg">🌊</span>
              </div>
              <div className="min-w-0 font-sans">
                <p className="text-xs md:text-sm font-black text-slate-950 uppercase tracking-tight truncate">
                  Antarctic Kirll Capsules 30 Pcs
                </p>
                <div className="flex items-center gap-1.5 mt-0.5 font-bold uppercase tracking-tight text-[10px] text-slate-500">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span>৪.৯ রেটিং</span>
                  <span className="text-red-600 font-extrabold uppercase bg-red-50 px-1 rounded">অফার</span>
                </div>
              </div>
            </div>

            {/* Price plus pulsing CTA */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <span className="text-[9px] text-slate-400 font-bold line-through block font-mono">১৬০০৳</span>
                <span className="text-sm md:text-base font-black text-[#FF1A00] font-mono leading-none">৮০০৳</span>
              </div>
              
              <button
                onClick={scrollToCheckout}
                className="px-4 md:px-6 py-2.5 bg-[#FF1A00] hover:bg-[#E00000] text-white text-xs font-black uppercase tracking-wider rounded-lg transition duration-200 shadow-md cursor-pointer border-none flex items-center gap-1 h-fit"
              >
                <span>🛒 অর্ডার করুন</span>
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
