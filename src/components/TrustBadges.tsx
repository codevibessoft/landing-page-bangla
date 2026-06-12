import { Truck, ShieldCheck, HeartHandshake } from "lucide-react";

export default function TrustBadges() {
  const badgeDetails = [
    {
      id: "badge-cod",
      icon: <ShieldCheck id="icon-shield" className="w-6 h-6 text-green-600" />,
      title: "ক্যাশ অন ডেলিভারি (COD)",
      description: "অর্ডার করতে কোনো অগ্রিম বিকাশ বা পেমেন্ট করতে হবে না। পণ্য হাতে পেয়ে সম্পূর্ণ দেখে মূল্য পরিশোধ করুন।"
    },
    {
      id: "badge-original",
      icon: <HeartHandshake id="icon-handshake" className="w-6 h-6 text-red-650" />,
      title: "১০০% আসল প্রোডাক্ট",
      description: "সরাসরি গুণগত ল্যাব টেস্ট সহ আমদানীকৃত আসল এন্টার্কটিক ক্রিল অয়েল ক্যাপসুল, যা শতভাগ নিরাপদ।"
    },
    {
      id: "badge-delivery",
      icon: <Truck id="icon-truck" className="w-6 h-6 text-green-600" />,
      title: "গোপনীয়তা রক্ষা ও দ্রুত ডেলিভারি",
      description: "আপনার গোপনীয়তা আমাদের সর্বোচ্চ অগ্রাধিকার। সম্পূর্ণ প্লেন বক্সে কোনো নাম বা বিবরণ ছাড়াই পার্সেল পাঠানো হয়।"
    }
  ];

  return (
    <section id="trust-badges-sec" className="w-full bg-[#0D1D68] py-12 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {badgeDetails.map((b) => (
          <div 
            id={b.id} 
            key={b.id} 
            className="flex flex-col items-center text-center p-6 rounded-xl bg-white border-2 border-amber-400 shadow-xl transition duration-300"
          >
            <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mb-4 shrink-0">
              {b.icon}
            </div>
            <h4 className="text-[#0D1D68] font-sans font-black text-base mb-2 uppercase tracking-tight">
              {b.title}
            </h4>
            <p className="text-slate-700 text-xs font-semibold leading-relaxed max-w-sm">
              {b.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
