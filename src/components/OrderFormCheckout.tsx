import { useState, FormEvent } from "react";
import { KRILL_PRODUCT } from "../data";
import { Lock, ShoppingBag, ShieldCheck, Phone, CheckCircle2, Truck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Order } from "../types";
import { trackInitiateCheckout, trackPurchase } from "../lib/tracker";

interface OrderFormCheckoutProps {
  onNewOrderPlaced?: (order: Order) => void;
  productImage?: string;
}

export default function OrderFormCheckout({ onNewOrderPlaced, productImage }: OrderFormCheckoutProps) {
  // Form fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [shippingCost, setShippingCost] = useState<number>(100); // Default to Saradesh (100৳)
  
  // Checkout processing states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [hasStartedType, setHasStartedType] = useState(false);

  const subtotal = KRILL_PRODUCT.salePrice;
  const total = subtotal + shippingCost;

  const handleFieldInteraction = () => {
    if (!hasStartedType) {
      setHasStartedType(true);
      try {
        trackInitiateCheckout(KRILL_PRODUCT.name, total);
      } catch (err) {
        console.error("InitiateCheckout tracking error:", err);
      }
    }
  };

  const handleCheckoutSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) {
      alert("দয়া করে সব সঠিক তথ্য প্রদান করুন।");
      return;
    }

    setIsSubmitting(true);

    // Simulate submission to server / WooCommerce mock system
    setTimeout(() => {
      const generatedId = "COD-" + Math.floor(100000 + Math.random() * 900000);
      setOrderId(generatedId);
      
      const newOrder: Order = {
        orderId: generatedId,
        name,
        phone,
        address,
        shippingCost,
        total,
        product: KRILL_PRODUCT.name,
        timestamp: new Date().toISOString(),
        status: "Pending"
      };

      // Store checkout log locally
      localStorage.setItem("krill_cod_last_order", JSON.stringify(newOrder));

      // Append to global state database
      if (onNewOrderPlaced) {
        onNewOrderPlaced(newOrder);
      }

      // Fire Meta Pixel and GTM dataLayer Purchase event with customer variables
      try {
        trackPurchase(generatedId, KRILL_PRODUCT.name, total, phone, name);
      } catch (err) {
        console.error("Purchase tracking error:", err);
      }

      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  return (
    <section id="checkout-funnel-section" className="py-12 px-4 bg-[#F5F5F5] min-h-screen flex items-center justify-center">
      <div className="max-w-5xl w-full">
        
        {/* Animated Order success overlay */}
        <AnimatePresence>
          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 border-4 border-[#00A81F] shadow-2xl text-center max-w-2xl mx-auto space-y-6 my-10"
            >
              <div className="w-20 h-20 bg-green-50 rounded-full border-2 border-[#00A81F] flex items-center justify-center text-[#00A81F] mx-auto animate-bounce">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-3xl font-sans font-black text-[#0D1D68]">
                  আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে!
                </h2>
                <p className="text-base text-slate-700 font-semibold">
                  আমাদের কাস্টমার কেয়ার টিম থেকে খুব শীঘ্রই কল করে আপনার অর্ডারটি কনফার্ম করা হবে।
                </p>
              </div>

              {/* Order Reference details */}
              <div className="bg-[#FAF6E9] border-2 border-[#E8B84C] rounded-2xl p-5 text-left space-y-3.5 max-w-md mx-auto">
                <div className="flex justify-between items-center border-b border-amber-200 pb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">অর্ডার আইডি:</span>
                  <span className="font-mono text-base font-black text-rose-600">{orderId}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>গ্রাহকের নাম:</span>
                  <span>{name}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>মোবাইল নাম্বার:</span>
                  <span>{phone}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>ডেলিভারি ঠিকানা:</span>
                  <span className="text-right max-w-[200px] truncate">{address}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-700 border-t border-dashed border-amber-300 pt-2.5">
                  <span className="text-[#0D1D68]">মোট পরিশোধযোগ্য মূল্য:</span>
                  <span className="text-lg font-black text-green-700">{total}.00৳ (ক্যাশ অন ডেলিভারি)</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5 font-bold">
                  <ShieldCheck className="w-4 h-4 text-green-600" /> ১টাকাও অগ্রিম পেমেন্ট করতে হবে না, পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন!
                </p>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="px-6 py-3 bg-[#0D1D68] text-white rounded-xl text-xs font-black uppercase hover:bg-slate-900 transition-colors"
                >
                  আবার নতুন অর্ডার করুন
                </button>
              </div>
            </motion.div>
          ) : (
            /* WooCommerce Checkout Styled form card */
            <div className="bg-white border-2 border-[#E8B84C] rounded-3xl overflow-hidden shadow-2xl">
              
              {/* Card Header Alert in Bold Red */}
              <div className="bg-white border-b-2 border-slate-100 py-6 px-4 md:px-8 text-center bg-gradient-to-r from-red-50 to-amber-50">
                <h2 className="text-xl md:text-2xl font-sans font-black text-red-600 leading-tight">
                  অর্ডার করতে আপনার সঠিক তথ্য দিয়ে নিচের ফর্মটি সম্পূর্ণ পূরণ করুন।
                </h2>
              </div>

              {/* TWO COLUMNS WORKFLOW */}
              <form onSubmit={handleCheckoutSubmit} className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* LEFT COLUMN: User input parameters */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Select Bundle Representation Banner */}
                  <div className="border-2 border-[#00A81F] bg-green-50/30 rounded-2xl p-4 flex gap-4 items-center">
                    <input 
                      type="radio" 
                      id="bundle-select" 
                      name="selected_package" 
                      defaultChecked 
                      className="w-5 h-5 text-green-600 border-slate-300 focus:ring-green-500 shrink-0 cursor-pointer"
                    />
                     <img 
                      src={productImage || KRILL_PRODUCT.imageUrl} 
                      alt="Krill oil bottle pack" 
                      className="w-14 h-14 rounded-xl object-cover border border-green-200 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-slate-900 font-sans font-black text-sm md:text-base leading-snug">
                        🌊 {KRILL_PRODUCT.name}
                      </h4>
                      <p className="text-xs text-green-700 font-sans font-semibold mt-0.5">
                        {KRILL_PRODUCT.subtitle} (৮০০/- টাকা)
                      </p>
                    </div>
                  </div>

                  <div className="border-b border-slate-200 pb-2">
                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5 uppercase font-sans">
                      📝 সঠিক তথ্য দিয়ে ফর্মটি পূরণ করুন:
                    </h3>
                  </div>

                  {/* Name field */}
                  <div className="space-y-1.5 text-xs">
                    <label className="block font-black text-slate-700">আপনার নাম *</label>
                    <input
                      id="customer-fullname"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onFocus={handleFieldInteraction}
                      placeholder="এখানে আপনার সম্পূর্ণ নাম লিখুন"
                      className="w-full text-sm p-3.5 bg-[#F9F9F9] border-2 border-slate-200 rounded-xl focus:border-[#000000] focus:outline-none focus:ring-0 text-slate-800 transition-colors"
                    />
                  </div>

                  {/* Phone field */}
                  <div className="space-y-1.5 text-xs">
                    <label className="block font-black text-slate-700">মোবাইল নাম্বার *</label>
                    <div className="relative">
                      <input
                        id="customer-mobilephone"
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/[^\d+]/g, ""))}
                        onFocus={handleFieldInteraction}
                        placeholder="এখানে আপনার ১১ ডিজিটের মোবাইল নাম্বার দিন"
                        className="w-full text-sm p-3.5 pl-10 bg-[#F9F9F9] border-2 border-slate-200 rounded-xl focus:border-[#000000] focus:outline-none focus:ring-0 text-slate-800 font-sans font-black transition-colors"
                      />
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-4.5" />
                    </div>
                  </div>

                  {/* Address field (Textarea to capture accurate village, thana, district info in Bangladesh COD apps) */}
                  <div className="space-y-1.5 text-xs">
                    <label className="block font-black text-slate-700">সম্পূর্ণ ঠিকানা *</label>
                    <textarea
                      id="customer-address"
                      rows={3}
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      onFocus={handleFieldInteraction}
                      placeholder="এখানে আপনার গ্রাম, থানা, জেলা সহ বিস্তারিত ডেলিভারি ঠিকানা লিখুন"
                      className="w-full text-sm p-3.5 bg-[#F9F9F9] border-2 border-slate-200 rounded-xl focus:border-[#000000] focus:outline-none focus:ring-0 text-slate-800 transition-colors resize-none"
                    />
                  </div>

                  {/* Shipping option choice exactly like screenshot */}
                  <div className="space-y-3.5">
                    <label className="block text-xs font-black text-slate-700">ডেলিভারি এরিয়া নির্বাচন করুন (Shipping) *</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      
                      {/* outside Dhaka (100৳) */}
                      <button
                        type="button"
                        onClick={() => setShippingCost(100)}
                        className={`p-4 rounded-xl border-2 flex items-center justify-between text-left transition duration-200 cursor-pointer ${
                          shippingCost === 100 
                            ? "border-[#00A81F] bg-green-50/20 text-[#00A81F] font-black" 
                            : "border-slate-200 hover:border-slate-300 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 text-xs leading-none">
                          <input 
                            type="radio" 
                            checked={shippingCost === 100}
                            onChange={() => {}}
                            className="w-4 h-4 text-green-600 cursor-pointer"
                          />
                          <span>সারাদেশে (ঢাকার বাইরে)</span>
                        </div>
                        <span className="font-mono text-sm">100.00৳</span>
                      </button>

                      {/* Inside Dhaka (50৳) */}
                      <button
                        type="button"
                        onClick={() => setShippingCost(50)}
                        className={`p-4 rounded-xl border-2 flex items-center justify-between text-left transition duration-200 cursor-pointer ${
                          shippingCost === 50 
                            ? "border-[#00A81F] bg-green-50/20 text-[#00A81F] font-black" 
                            : "border-slate-200 hover:border-slate-300 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 text-xs leading-none">
                          <input 
                            type="radio" 
                            checked={shippingCost === 50}
                            onChange={() => {}}
                            className="w-4 h-4 text-green-600 cursor-pointer"
                          />
                          <span>ঢাকা সিটি (ঢাকার ভেতরে)</span>
                        </div>
                        <span className="font-mono text-sm">50.00৳</span>
                      </button>

                    </div>
                  </div>

                </div>

                {/* RIGHT COLUMN: Order Summary Invoice & COD details */}
                <div className="lg:col-span-5 bg-[#FAF6E9] border-2 border-[#E8B84C] rounded-2xl p-5 md:p-6 space-y-6">
                  
                  <h3 className="font-sans font-black text-lg text-[#0D1D68] border-b border-amber-200 pb-3 uppercase">
                    Your order
                  </h3>

                  {/* Summary Invoice table */}
                  <div className="space-y-4 text-xs font-bold text-slate-700">
                    
                    <div className="flex justify-between items-center text-slate-500 uppercase tracking-tight text-[11px] pb-1.5 border-b border-amber-200">
                      <span>Product</span>
                      <span>Subtotal</span>
                    </div>

                    {/* Product item */}
                    <div className="flex justify-between items-start gap-4">
                      <span className="font-sans font-medium text-slate-800 leading-relaxed leading-snug">
                        🌊 Antarctic Kirll Oil Capsules_30 Pcs Capsul <strong className="text-rose-600 whitespace-nowrap">× 1</strong>
                      </span>
                      <span className="font-mono text-slate-900 font-extrabold">{subtotal}.00৳</span>
                    </div>

                    <div className="border-t-2 border-dashed border-amber-300 my-4" />

                    {/* Subtotal */}
                    <div className="flex justify-between items-center pt-1 text-slate-650">
                      <span>Subtotal:</span>
                      <span className="font-mono text-slate-900 font-extrabold">{subtotal}.00৳</span>
                    </div>

                    {/* Shipping Row */}
                    <div className="flex justify-between items-center text-slate-650">
                      <span>Shipping:</span>
                      <span className="font-mono text-slate-900 font-extrabold">
                        {shippingCost === 100 ? "সারাদেশে:: 100.00৳" : "ঢাকা সিটি:: 50.00৳"}
                      </span>
                    </div>

                    <div className="border-t-2 border-dashed border-amber-300 my-4" />

                    {/* Grand Total */}
                    <div className="flex justify-between items-baseline pt-1">
                      <span className="text-sm font-black text-[#0D1D68]">Total:</span>
                      <span className="font-mono text-xl font-black text-rose-600">{total}.00৳</span>
                    </div>

                  </div>

                  {/* COD Cash on delivery info banner */}
                  <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 space-y-2">
                    <h4 className="text-xs font-black text-slate-800">Cash on delivery</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed bg-white border border-slate-200/80 p-3 rounded-lg font-semibold">
                      Pay with cash upon delivery.
                    </p>
                  </div>

                  {/* Full-width bright red checkout submit button with lock */}
                  <div className="pt-2">
                    <button
                      id="submit-order-button"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 px-6 rounded-xl bg-[#FF1A00] hover:bg-[#E00000] text-white text-base font-black uppercase tracking-wide transition-all shadow-xl hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2.5 cursor-pointer border-none"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>প্রসেসিং হচ্ছে...</span>
                        </>
                      ) : (
                        <>
                          <span>🛒 অর্ডার করুন {total}.00৳</span>
                        </>
                      )}
                    </button>
                    
                    <p className="text-[10px] text-slate-500 font-semibold text-center mt-3 uppercase tracking-wider">
                      🔒 আপনার কোনো পেমেন্ট অগ্রীম দিতে হবে না।
                    </p>
                  </div>

                </div>

              </form>

            </div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
