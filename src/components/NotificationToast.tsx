import { useState, useEffect } from "react";
import { REALTIME_BD_NAMES, REALTIME_BD_LOCATIONS, KRILL_PRODUCT } from "../data";
import { Check, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function NotificationToast() {
  const [visible, setVisible] = useState(false);
  const [toastData, setToastData] = useState({
    name: "",
    location: "",
    bundle: "",
    timeAgo: ""
  });

  useEffect(() => {
    // Show first toast after 4 seconds
    const initialTimeout = setTimeout(() => {
      triggerNewToast();
    }, 4000);

    const interval = setInterval(() => {
      triggerNewToast();
    }, 15000); // Trigger every 15 seconds

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  const triggerNewToast = () => {
    setVisible(false);
    
    setTimeout(() => {
      const name = REALTIME_BD_NAMES[Math.floor(Math.random() * REALTIME_BD_NAMES.length)];
      const location = REALTIME_BD_LOCATIONS[Math.floor(Math.random() * REALTIME_BD_LOCATIONS.length)];
      const bundle = KRILL_PRODUCT.name;
      const randomSeconds = Math.floor(Math.random() * 45) + 15;
      
      setToastData({
        name,
        location,
        bundle,
        timeAgo: `${randomSeconds} সেকেন্ড আগে`
      });
      
      setVisible(true);

      // Hide after 6 seconds
      setTimeout(() => {
        setVisible(false);
      }, 6000);
    }, 500);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          id="realtime-purchase-toast"
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-50 bg-white border-2 border-green-600 rounded-xl shadow-2xl p-4 max-w-sm flex items-center gap-3.5"
        >
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0 border border-green-200 text-green-600 animate-bounce">
            <ShoppingBag id="toast-icon-bag" className="w-5 h-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-800 font-bold leading-tight">
              <span className="font-extrabold text-green-700 font-sans">{toastData.name}</span>, <span className="font-medium text-slate-600">{toastData.location}</span> থেকে
            </p>
            <p className="text-xs text-rose-600 font-extrabold mt-0.5 line-clamp-1 uppercase tracking-tight text-[11px]">
              🛒 {toastData.bundle} অর্ডার করেছেন!
            </p>
            <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400 font-bold uppercase">
              <span className="flex items-center gap-1 font-black text-green-600 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
                <Check className="w-3 h-3" /> ক্যাশ অন ডেলিভারি
              </span>
              <span>•</span>
              <span className="font-mono text-slate-500">{toastData.timeAgo}</span>
            </div>
          </div>
          
          <button 
            id="toast-close"
            onClick={() => setVisible(false)} 
            className="text-slate-400 hover:text-slate-900 font-black text-lg px-1.5 py-1 cursor-pointer"
          >
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
