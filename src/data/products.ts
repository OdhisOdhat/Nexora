export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  ratingCount: number;
  description: string;
  image: string;
  tag?: string;
  isFeatured?: boolean;
  isTrending?: boolean;
  merchantBrand?: string;
  merchantEmail?: string;
}

export const PRODUCTS: Product[] = [
  {
    id: "watch-pro",
    name: "Nexora Smart Watch Pro",
    category: "Electronics",
    price: 199.99,
    originalPrice: 249.99,
    rating: 4.8,
    ratingCount: 128,
    description: "A state-of-the-art smartwatch featuring a holographic high-contrast touch display, integrated biometric vital tracking, cellular communication nodes, and premium physical stress analysis.",
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800",
    tag: "Bestseller",
    isFeatured: true
  },
  {
    id: "shoes-vortex",
    name: "Vortex Running Shoes",
    category: "Sports",
    price: 129.99,
    originalPrice: 159.99,
    rating: 4.6,
    ratingCount: 94,
    description: "Futuristic athletic running footwear crafted with a structural carbon gravity-propulsion core, ultra-reactive dual-foam midsole damping, and high-aeration weave smart-shell fabrics.",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800",
    tag: "-20%",
    isFeatured: true
  },
  {
    id: "lamp-luma",
    name: "Luma Desk Lamp",
    category: "Home & Living",
    price: 89.99,
    originalPrice: 119.99,
    rating: 4.7,
    ratingCount: 65,
    description: "Architectural minimal desk fixture equipped with dynamic daylight temperature adaptation, fully integrated wireless charging dock, and sleek proximity swipe dimmers.",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800",
    tag: "New",
    isFeatured: true
  },
  {
    id: "perfume-eternal",
    name: "Eternal Essence Perfume",
    category: "Beauty",
    price: 59.99,
    originalPrice: 89.99,
    rating: 4.5,
    ratingCount: 112,
    description: "An elegant, sensory bouquet of cold oceanic extracts and premium wood resins balanced in a crystalline light-refractive decanter.",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800",
    tag: "Limited",
    isFeatured: true
  },
  {
    id: "audio-earbuds",
    name: "Wireless Earbuds",
    category: "Electronics",
    price: 79.99,
    rating: 4.5,
    ratingCount: 215,
    description: "Hi-Res spatial sound audio pods boasting hybrid active silence cancelation, intelligent touch control zones, and robust thirty-hour rechargeable capacity.",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=800",
    isTrending: true
  },
  {
    id: "gear-backpack",
    name: "Minimal Backpack",
    category: "Fashion",
    price: 49.99,
    rating: 4.6,
    ratingCount: 88,
    description: "Sleek modular waterproof pack presenting double-cushioned shock protection compartment and hidden proximity-detect security locks.",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800",
    isTrending: true
  },
  {
    id: "home-hub",
    name: "Smart Home Hub",
    category: "Home & Living",
    price: 99.99,
    rating: 4.7,
    ratingCount: 140,
    description: "Voice-driven command center connecting and synchronizing lighting elements, audio outputs, local temperature nodes, and smart facial locking protocols.",
    image: "https://images.unsplash.com/photo-1558089687-f282ffcbd1d5?auto=format&fit=crop&q=80&w=800",
    isTrending: true
  },
  {
    id: "gear-sunglasses",
    name: "Aviator Sunglasses",
    category: "Fashion",
    price: 59.99,
    rating: 4.4,
    ratingCount: 76,
    description: "Classic stylish eyewear formulated with lightweight, high-resilience aluminum temples and durable UV polarization coatings.",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=800",
    isTrending: true
  },
  {
    id: "gear-bottle",
    name: "Hydro Bottle",
    category: "Sports",
    price: 34.99,
    rating: 4.6,
    ratingCount: 198,
    description: "Double-walled vacuum thermal mug engineered with active thermal monitoring indicators on its modern touch panel cover.",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=800",
    isTrending: true
  },
  {
    id: "gear-chair",
    name: "Aura Gaming Chair",
    category: "Sports",
    price: 299.99,
    originalPrice: 349.99,
    rating: 4.9,
    ratingCount: 42,
    description: "High-comfort structural racing style chair equipped with custom RGB side illumination arrays, cooling gel pad cores, and solid orthopedic spinal molds.",
    image: "https://images.unsplash.com/photo-1598550476439-6847785fce6e?auto=format&fit=crop&q=80&w=800",
    tag: "Bestseller"
  },
  {
    id: "key-nova",
    name: "Nova Mechanical Keyboard",
    category: "Electronics",
    price: 149.99,
    rating: 4.8,
    ratingCount: 53,
    description: "Custom mechanical deck sporting satisfying rapid optical-linear switches, frosted polycarbonate glow shell, and double-shot futuristic profile keycaps.",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "cook-stellar",
    name: "Stellar Induction Cookware",
    category: "Home & Living",
    price: 189.99,
    rating: 4.6,
    ratingCount: 30,
    description: "Futuristic multi-layered ceramic thermal cookware set optimized for advanced high-efficiency induction and smart stove elements.",
    image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&q=80&w=800"
  }
];
