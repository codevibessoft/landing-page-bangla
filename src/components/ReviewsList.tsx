import { useState, FormEvent } from "react";
import { BANGLA_REVIEWS } from "../data";
import { CustomerReview } from "../types";
import { Star, ShieldCheck, ThumbsUp, Send, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function ReviewsList() {
  const [reviews, setReviews] = useState<CustomerReview[]>(BANGLA_REVIEWS);
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [helpfulClicked, setHelpfulClicked] = useState<Record<string, boolean>>({});

  // Add review form state
  const [newAuthor, setNewAuthor] = useState("");
  const [newLoc, setNewLoc] = useState("");
  const [newContent, setNewContent] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);

  const incrementHelpful = (id: string) => {
    if (helpfulClicked[id]) return;
    setHelpfulClicked(prev => ({ ...prev, [id]: true }));
    setReviews(prev => prev.map(r => r.id === id ? { ...r, helpfulCount: r.helpfulCount + 1 } : r));
  };

  const handleSubmitReview = (e: FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newContent.trim()) return;

    const addedReview: CustomerReview = {
      id: `custom-bd-rev-${Date.now()}`,
      author: newAuthor,
      location: newLoc || "বাংলাদেশ",
      rating: 5,
      date: "এই মাত্র",
      content: newContent,
      verified: true,
      avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 500000)}?auto=format&fit=crop&w=150&h=150&q=80`,
      helpfulCount: 0
    };

    setReviews(prev => [addedReview, ...prev]);
    setFormSuccess(true);
    setTimeout(() => {
      setFormSuccess(false);
      setShowWriteForm(false);
      setNewAuthor("");
      setNewLoc("");
      setNewContent("");
    }, 2000);
  };

  // Mock chats inside review cards to mimic screenshot look as seen in the reference image
  const screenshotReviews = [
    {
      id: "ss-1",
      title: "সম্মানিত কাস্টমারের রিভিউ",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
      chatBubble: "Ji jenebo, cintay chilan original pabo kina, dekh mone hoche original ei hobe.",
      replyBubble: "অসংখ্য ধন্যবাদ প্রিয় গ্রাহক! আমাদের ল্যাব টেস্টেদ অরিজিনাল ক্রিল অয়েল ক্যাপসুল ব্যবহারের জন্য।"
    },
    {
      id: "ss-2",
      title: "সম্মানিত কাস্টমারের রিভিউ",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
      chatBubble: "Ji poromao khayece, 7 din hoyeche khicche kichu poriborton paichi - sukkiki suki mane energy vesi acbe, are kichu din khaile aso poriborton pabo asa korchi",
      replyBubble: "আলহামদুলিল্লাহ্‌! নিয়মিত সেবন করুন, অবশ্যই পুরোপুরি কাঙ্ক্ষিত পরিবর্তন পাবেন।"
    },
    {
      id: "ss-3",
      title: "সম্মানিত কাস্টমারের রিভিউ",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
      chatBubble: "Nitiyece, sebon korce... khub e bhalo feedback peyechi kouta ses hole arekta nibo",
      replyBubble: "অনেক ধন্যবাদ ভাইয়া, আপনার জন্য শুভকামনা! যেকোনো প্রয়োজনে পাশে আছি।"
    }
  ];

  return (
    <section id="reviews-section" className="py-16 px-4 bg-slate-50 border-t border-slate-200">
      <div className="max-w-6xl mx-auto">
        
        {/* Labeled Header Box from reference screenshot */}
        <div className="flex justify-center mb-10">
          <div className="bg-[#2D2D2D] text-white px-8 py-3 rounded-xl border border-slate-700 shadow-lg text-center">
            <h2 className="text-xl md:text-3xl font-sans font-black tracking-tight uppercase">
              শত শত কাস্টমারের ভালো রিভিউ
            </h2>
          </div>
        </div>

        {/* Screenshot Style Review Cards in Golden/Yellow Frame exactly like screenshot */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {screenshotReviews.map((ss, idx) => (
            <div 
              key={ss.id}
              className="border-4 border-[#E8B84C] rounded-2xl overflow-hidden bg-[#FAF6E9] shadow-md flex flex-col justify-between"
            >
              {/* Header block with title, check badge */}
              <div className="bg-gradient-to-r from-amber-400 to-yellow-500 px-4 py-2.5 flex items-center justify-between border-b-2 border-amber-500">
                <span className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5 uppercase">
                  ⭐ {ss.title}
                </span>
                <span className="w-5 h-5 rounded-full bg-green-600 border border-white flex items-center justify-center text-white text-[10px] font-bold">✓</span>
              </div>

              {/* Chat room emulation exactly like reference reviews */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                
                {/* User message block */}
                <div className="flex gap-2.5 items-start">
                  <img 
                    src={ss.avatar} 
                    alt="User" 
                    className="w-10 h-10 rounded-full object-cover border border-slate-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="bg-white border border-slate-200 text-slate-800 text-xs font-bold leading-relaxed p-3 rounded-r-xl rounded-bl-xl shadow-xs max-w-[85%]">
                    {ss.chatBubble}
                    <div className="flex gap-0.5 mt-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Seller Reply block */}
                <div className="flex gap-2.5 items-start justify-end">
                  <div className="bg-green-100 border border-green-200 text-green-900 text-xs font-bold leading-relaxed p-3 rounded-l-xl rounded-br-xl shadow-xs max-w-[85%] text-right">
                    {ss.replyBubble}
                    <div className="text-[9px] text-green-700 font-extrabold mt-1.5 uppercase">LovePower Intimacy support</div>
                  </div>
                </div>

              </div>

              {/* Card Footer Interaction Bar */}
              <div className="bg-[#FAF3D9] border-t border-amber-200 px-4 py-2 flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span>💬 চিকিৎসকের পরামর্শ দেখতে পারেন</span>
                <span className="text-green-700 font-black">ACTIVE ✓</span>
              </div>
            </div>
          ))}
        </div>

        {/* Aggregate Quick Facts and Write Option */}
        <div id="reviews-aggregate-card" className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-white border-2 border-slate-200 rounded-xl p-6 md:p-8 shadow-sm mb-10">
          <div className="md:col-span-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200 pb-6 md:pb-0 md:pr-8 text-center">
            <span className="text-5xl md:text-6xl font-serif font-black text-[#0D1D68] leading-none">4.9</span>
            <div className="flex gap-1 my-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star id={`score-star-${s}`} key={s} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-xs text-slate-500 font-extrabold uppercase tracking-wide">১,৪০০+ সফল ডেলিভারি</span>
          </div>

          <div className="md:col-span-5 flex flex-col justify-center space-y-1.5">
            <h4 className="text-xs font-black text-slate-900 uppercase">শতভাগ কাস্টমার রেটিং পরিসংখ্যান</h4>
            {[
              { stars: 5, pct: 96 },
              { stars: 4, pct: 4 },
              { stars: 3, pct: 0 },
              { stars: 2, pct: 0 },
              { stars: 1, pct: 0 }
            ].map((row) => (
              <div key={row.stars} className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-700 font-mono w-14 uppercase">{row.stars} তারা</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${row.pct}%` }} />
                </div>
                <span className="text-xs font-bold text-slate-500 w-8 text-right">{row.pct}%</span>
              </div>
            ))}
          </div>

          <div className="md:col-span-3 flex flex-col items-center justify-center text-center">
            <p className="text-xs font-black text-slate-700 mb-3 uppercase tracking-tight">আপনার রিভিও শেয়ার করুন?</p>
            <button
              id="write-review-btn"
              onClick={() => setShowWriteForm(!showWriteForm)}
              className="px-5 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-black uppercase tracking-widest transition duration-200 cursor-pointer border-none shadow-sm"
            >
              {showWriteForm ? "রিসেট ফর্ম" : "একটি রিভিউ লিখুন"}
            </button>
          </div>
        </div>

        {/* Write reviews collapsible drawer */}
        <AnimatePresence>
          {showWriteForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-8"
            >
              <form onSubmit={handleSubmitReview} className="bg-white border-2 border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                <h4 className="text-[#0D1D68] font-sans font-black text-sm uppercase tracking-tight border-b border-slate-200 pb-3">
                  আপনার পার্সোনাল মতামত লিখুন
                </h4>

                {formSuccess ? (
                  <div className="py-8 text-center text-green-600 bg-green-50 rounded-xl">
                    <p className="font-black text-lg">ধন্যবাদ!</p>
                    <p className="text-xs mt-1 text-slate-650">আপনার রিভিউ এবং রেটিং সফলভাবে জমা হয়েছে।</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-700 mb-1">আপনার নাম *</label>
                        <input
                          type="text"
                          required
                          value={newAuthor}
                          onChange={(e) => setNewAuthor(e.target.value)}
                          placeholder="উদা: কামাল শেখ"
                          className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:border-green-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-700 mb-1">অবস্থান (জেলা/শহর)</label>
                        <input
                          type="text"
                          value={newLoc}
                          onChange={(e) => setNewLoc(e.target.value)}
                          placeholder="উদা: ঢাকা, শাহবাগ"
                          className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:border-green-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 mb-1">আপনার রিভিউ বা মন্তব্য *</label>
                      <textarea
                        rows={3}
                        required
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        placeholder="পণ্যটি সম্পর্কে আপনার বাস্তব অভিজ্ঞতা এখানে লিখুন..."
                        className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:border-green-400 focus:outline-none resize-none"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowWriteForm(false)}
                        className="px-5 py-2.5 border-2 border-slate-200 bg-white rounded-lg text-xs font-bold uppercase text-slate-600 hover:bg-slate-50 cursor-pointer"
                      >
                        বাতিল
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-black uppercase tracking-widest flex items-center gap-1.5 cursor-pointer border-none"
                      >
                        সাবমিট রিভিউ
                      </button>
                    </div>
                  </>
                )}
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Regular review cards - custom styled */}
        <div id="reviews-list-container" className="space-y-4">
          {reviews.map((rev) => (
            <div 
              key={rev.id}
              className="bg-white border-2 border-slate-200 rounded-xl p-5 flex flex-col md:flex-row gap-4"
            >
              <div className="md:w-36 shrink-0 flex md:flex-col items-center md:items-start gap-2.5 md:border-r border-slate-100 pr-3">
                <img src={rev.avatarUrl} alt={rev.author} className="w-10 h-10 rounded-full object-cover border-2 border-[#00A81F]" referrerPolicy="no-referrer" />
                <div>
                  <h5 className="text-xs font-black text-slate-900 leading-tight uppercase">{rev.author}</h5>
                  <p className="text-[10px] text-slate-500 font-bold mt-0.5">{rev.location}</p>
                </div>
              </div>
              
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold">{rev.date}</span>
                  </div>
                  <p className="text-slate-800 text-xs md:text-sm font-semibold mt-2.5 leading-relaxed">
                    "{rev.content}"
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-3">
                  <div className="flex items-center gap-1 bg-green-50 px-2.5 py-1 rounded border border-green-100 text-[10px] text-green-700 font-extrabold uppercase">
                    <ShieldCheck className="w-3.5 h-3.5" /> ভেরিফাইড পারচেজ (ক্রিল অয়েল ৩০ ক্যাপসুল)
                  </div>
                  <button 
                    onClick={() => incrementHelpful(rev.id)}
                    className="text-[10px] uppercase font-black text-[#0D1D68] hover:underline cursor-pointer border-none bg-transparent"
                  >
                    👍 সাহায্য করেছে ({rev.helpfulCount})
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
