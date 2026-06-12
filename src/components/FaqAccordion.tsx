import { useState } from "react";
import { BANGLA_FAQ_ITEMS } from "../data";
import { Plus, Minus, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function FaqAccordion() {
  const [openId, setOpenId] = useState<string | null>("faq-bd-1");

  const toggleFaq = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq-section" className="py-16 md:py-24 px-4 bg-white border-t border-slate-200">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-[#00A81F] text-xs font-black uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5" /> সাধারণ প্রশ্ন ও উত্তর
          </div>
          <h2 className="text-2xl md:text-4xl font-sans font-black text-[#0D1D68] tracking-tight leading-tight uppercase">
            কমন কিছু প্রশ্ন ও উত্তর (FAQs)
          </h2>
          <p className="text-slate-600 text-sm mt-3.5 max-w-lg mx-auto">
            এন্টার্কটিক ক্রিল অয়েল ক্যাপসুল সম্পর্কে কাস্টমারদের সচরাচর জানতে চাওয়া কিছু তথ্যের সহজ সমাধান নিচে দেওয়া হলো।
          </p>
        </div>

        {/* Faq List */}
        <div id="faq-list-container" className="space-y-4">
          <AnimatePresence mode="popLayout">
            {BANGLA_FAQ_ITEMS.map((item) => {
              const isOpen = openId === item.id;
              return (
                <motion.div
                  id={`faq-item-${item.id}`}
                  key={item.id}
                  layout
                  className={`border-2 rounded-xl overflow-hidden transition-all duration-300 ${
                    isOpen 
                      ? "border-[#00A81F] shadow-sm bg-green-50/10" 
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  <button
                    id={`faq-trigger-${item.id}`}
                    onClick={() => toggleFaq(item.id)}
                    className="w-full flex items-center justify-between text-left p-5 font-sans font-bold text-slate-800 hover:text-[#0D1D68] transition-colors focus:outline-none"
                  >
                    <span className="text-sm md:text-base font-black text-slate-900 leading-snug">
                      {item.question}
                    </span>
                    <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0 ml-4">
                      <span className="text-sm font-black text-slate-800 leading-none">
                        {isOpen ? "−" : "+"}
                      </span>
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                      >
                        <div className="px-5 pb-5 pt-2 text-[#0D1D68] text-sm font-semibold leading-relaxed border-t-2 border-dashed border-slate-200 bg-slate-50/50">
                          {item.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
