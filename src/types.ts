export interface ProductBundle {
  id: string;
  name: string;
  subtitle: string;
  originalPrice: number;
  salePrice: number;
  discountPercentage: number;
  badge?: string;
  tagline: string;
  isPopular?: boolean;
  features: string[];
  perfumesCount: number;
  braceletsCount: number;
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
  productBought?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface Order {
  orderId: string;
  name: string;
  phone: string;
  address: string;
  shippingCost: number;
  total: number;
  product: string;
  timestamp: string;
  status: "Pending" | "Confirmed" | "Shipped" | "Cancelled";
}

export interface LandingPageImages {
  heroTopImage: string;
  centerProductImage: string;
  benefitsImage: string;
  offerImage1: string;
  offerImage2: string;
  offerImage3: string;
  productImage: string;
}
