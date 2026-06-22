export type Section = 
  | "home"
  | "categories"
  | "collections"
  | "deals"
  | "new-arrivals"
  | "top-brands"
  | "profile"
  | "orders"
  | "wishlist"
  | "addresses"
  | "payment"
  | "settings"
  | "merchant-portal"
  | "admin-panel";

export interface CartItem {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}
