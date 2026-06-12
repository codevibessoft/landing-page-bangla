export interface ProductBundle {
  id: string;
  name: string;
  subtitle: string;
  originalPrice: number;
  salePrice: number;
  discountPercentage: number;
  badge?: string;
  tagline: string;
  features: string[];
  imageUrl: string;
}

export interface CustomerReview {
  id: string;
  author: string;
  location: string;
  rating: number;
  date: string;
  content: string;
  verified: boolean;
  avatarUrl: string;
  helpfulCount: number;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export const KRILL_PRODUCT: ProductBundle = {
  id: "krill-oil-30",
  name: "Antarctic Kirll Oil Capsules_30 Pcs Capsul",
  subtitle: "30টি ক্যাপসুল 30 দিনের কোর্স",
  originalPrice: 1600,
  salePrice: 800,
  discountPercentage: 50,
  badge: "৫০% ছাড়",
  tagline: "হারানো যৌবন ফিরে আসবেই শতভাগ প্রাকৃতিক উপায়ে!",
  features: [
    "সম্পূর্ণ প্রাকৃতিক ও রসায়নমুক্ত ফর্মুলা",
    "শরীর ও যৌন শক্তি বৃদ্ধিতে শতভাগ কার্যকর",
    "সহজে ব্যবহারযোগ্য, দৈনন্দিন জীবনের সাথে মানিয়ে নেওয়া যায়",
    "সতেজতা ও সুস্থতায় এক অনন্য প্রাপ্তি"
  ],
  imageUrl: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80"
};

export const BANGLA_REVIEWS: CustomerReview[] = [
  {
    id: "rev-bd-1",
    author: "Zayed Talukder",
    location: "মিরপুর, ঢাকা",
    rating: 5,
    date: "১ দিন আগে",
    content: "Ji jenebo, cintay chilan original pabo kina, dekh mone hoche original ei hobe. ১ সপ্তাহ ব্যবহার করে বুঝতে পারলাম জিনিসটা আসলেই কোয়ালিটিসম্পন্ন। খুবই কার্যকরী।",
    verified: true,
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
    helpfulCount: 42
  },
  {
    id: "rev-bd-2",
    author: "Abir Hasan",
    location: "উত্তরা, ঢাকা",
    rating: 5,
    date: "৩ দিন আগে",
    content: "Ji poromao khayece, 7 din hoyeche khicche kichu poriborton paichi - sukkiki suki mane energy vesi acbe, are kichu din khaile aso poriborton pabo asa korchi. ধন্যবাদ অরিজিনাল প্রোডাক্ট দেওয়ার জন্য।",
    verified: true,
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
    helpfulCount: 29
  },
  {
    id: "rev-bd-3",
    author: "Mahbubur Rahman",
    location: "কুমিল্লা",
    rating: 5,
    date: "৫ দিন আগে",
    content: "Nitiyece, sebon korce... ২ দিন ব্যবহারের পর থেকে শরীরে ব্যাপক স্ট্যামিনা পাচ্ছি। কোনো ক্লান্তি লাগে না আর। এটি আসলেই চমৎকার একটি প্রোডাক্ট। ডেলিভারি খুবই ফাস্ট ছিল।",
    verified: true,
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
    helpfulCount: 17
  }
];

export const BANGLA_FAQ_ITEMS: FAQItem[] = [
  {
    id: "faq-bd-1",
    question: "এই ক্যাপসুলটি সেবনের নিয়ম কী?",
    answer: "প্রতিদিন খাবারের সাথে (বিশেষ করে চর্বিযুক্ত বা ভারী খাবারের পর) ১টি করে ক্যাপসুল পানি দিয়ে গিলে সেবন করুন। নিয়ম মেনে নিয়মিত সেবন করলে সেরা ফলাফল পাওয়া যায়।"
  },
  {
    id: "faq-bd-2",
    question: "ডেলিভারি চার্জ কত এবং কিভাবে পাবো?",
    answer: "ঢাকার ভেতরে ডেলিভারি চার্জ ৫০৳ এবং ঢাকার বাইরে সারাদেশের জন্য ১০০৳। অর্ডার করার ১-৩ কার্যদিবসের মধ্যে ক্যাশ অন ডেলিভারিতে পণ্য আপনার হাতে পেয়ে যাবেন।"
  },
  {
    id: "faq-bd-3",
    question: "আপনাদের প্রোডাক্ট কি অরিজিনাল?",
    answer: "হ্যাঁ, এটি শতভাগ আমদানীকৃত আসল এন্টার্কটিক ক্রিল অয়েল ক্যাপসুল। পণ্য হাতে পেয়ে ভালো করে চেক করে তারপরই ডেলিভারি ম্যানকে পেমেন্ট করতে পারবেন।"
  }
];

export const REALTIME_BD_NAMES = [
  "মো: আশরাফুল ইসলাম", "কামরুল হাসান", "আরিফুল রহমান", "মো: সোহেল রানা", "হাসান মাহমুদ", "নাজমুল হুদা", "সাকিব আল হাসান", "আব্দুর রহিম", "মো: বেল্লাল", "সাইফুল ইসলাম"
];

export const REALTIME_BD_LOCATIONS = [
  "ঢাকা সিটি", "চট্টগ্রাম", "সিলেট", "খুলনা", "রাজশাহী", "বরিশাল", "রংপুর", "গাজীপুর", "নারায়ণগঞ্জ", "বগুড়া", "কুমিল্লা", "ফেনী"
];

export const DEFAULT_LANDING_IMAGES = {
  heroTopImage: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80",
  centerProductImage: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80",
  benefitsImage: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=600&q=80",
  offerImage1: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=400&q=80",
  offerImage2: "https://images.unsplash.com/photo-1501901654877-50cfd686308a?auto=format&fit=crop&w=400&q=80",
  offerImage3: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=400&q=80",
  productImage: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80"
};

export const MOCK_COD_ORDERS = [
  {
    orderId: "1831",
    name: "Ahassnul. Karim",
    phone: "01712311831",
    address: "বাসা ১০, মিরপুর, ঢাকা",
    shippingCost: 0,
    total: 900,
    product: "Antarctic Krill Oil Capsules",
    timestamp: "2026-06-11T10:25:13-07:00",
    status: "Cancelled"
  },
  {
    orderId: "1830",
    name: "Md Alamin",
    phone: "01815911830",
    address: "গ্রীন ভিলেজ কলোনি, হালিশহর, চট্টগ্রাম",
    shippingCost: 0,
    total: 900,
    product: "Antarctic Krill Oil Capsules",
    timestamp: "2026-06-11T10:25:13-07:00",
    status: "Confirmed"
  },
  {
    orderId: "1828",
    name: "আব্দুল্লাহ",
    phone: "01911211828",
    address: "হাউস ৪০২, আম্বরখানা, সিলেট",
    shippingCost: 0,
    total: 900,
    product: "Antarctic Krill Oil Capsules",
    timestamp: "2026-06-11T08:25:13-07:00",
    status: "Cancelled"
  },
  {
    orderId: "1826",
    name: "Redwan",
    phone: "01511211826",
    address: "কলেজ রোড, সোনাডাঙ্গা, খুলনা",
    shippingCost: 0,
    total: 900,
    product: "Antarctic Krill Oil Capsules",
    timestamp: "2026-06-11T06:25:13-07:00",
    status: "Confirmed"
  },
  {
    orderId: "1825",
    name: "ইলিয়াশ",
    phone: "01688511825",
    address: "সেক্টর ৩, ৩ নং রোড, উত্তরা, ঢাকা",
    shippingCost: 0,
    total: 900,
    product: "Antarctic Krill Oil Capsules",
    timestamp: "2026-06-11T04:25:13-07:00",
    status: "Confirmed"
  },
  {
    orderId: "1823",
    name: "Hadisurrahman",
    phone: "01722311823",
    address: "নতুন বাজার, রাজশাহী",
    shippingCost: 0,
    total: 900,
    product: "Antarctic Krill Oil Capsules",
    timestamp: "2026-06-11T01:25:13-07:00",
    status: "Confirmed"
  },
  {
    orderId: "1822",
    name: "Badal",
    phone: "01855911822",
    address: "চকবাজার, কুমিল্লা",
    shippingCost: 0,
    total: 900,
    product: "Antarctic Krill Oil Capsules",
    timestamp: "2026-06-11T00:25:13-07:00",
    status: "Confirmed"
  },
  {
    orderId: "1821",
    name: "Shamin",
    phone: "01944511821",
    address: "ফেনী সদর, ফেনী",
    shippingCost: 0,
    total: 900,
    product: "Antarctic Krill Oil Capsules",
    timestamp: "2026-06-11T00:25:13-07:00",
    status: "Confirmed"
  },
  {
    orderId: "1820",
    name: "রিদয়",
    phone: "01522311820",
    address: "মৌলভীবাজার সদর, সিলেট",
    shippingCost: 0,
    total: 900,
    product: "Antarctic Krill Oil Capsules",
    timestamp: "2026-06-11T00:25:13-07:00",
    status: "Confirmed"
  },
  {
    orderId: "1819",
    name: "আনিছুর রহমান",
    phone: "01611211819",
    address: "চাষাড়া, নারায়ণগঞ্জ",
    shippingCost: 0,
    total: 900,
    product: "Antarctic Krill Oil Capsules",
    timestamp: "2026-06-11T00:25:13-07:00",
    status: "Confirmed"
  }
];
