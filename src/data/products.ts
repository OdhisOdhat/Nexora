export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  flag: string;
  rate: number;
}

export const MERCHANT_LOCATIONS: Record<string, CurrencyInfo> = {
  US: { code: "USD", symbol: "$", name: "United States (USD)", flag: "🇺🇸", rate: 1.0 },
  UK: { code: "GBP", symbol: "£", name: "United Kingdom (GBP)", flag: "🇬🇧", rate: 0.79 },
  EU: { code: "EUR", symbol: "€", name: "European Union (EUR)", flag: "🇪🇺", rate: 0.92 },
  JP: { code: "JPY", symbol: "¥", name: "Japan (JPY)", flag: "🇯🇵", rate: 155.0 },
  KE: { code: "KES", symbol: "KSh", name: "Kenya (KES)", flag: "🇰🇪", rate: 130.0 },
  CA: { code: "CAD", symbol: "C$", name: "Canada (CAD)", flag: "🇨🇦", rate: 1.37 },
  AU: { code: "AUD", symbol: "A$", name: "Australia (AUD)", flag: "🇦🇺", rate: 1.50 }
};

export interface Product {
  id: string;
  name: string;
  category: string;
  subCategory?: string;
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
  merchantLocation?: string;
  isDigital?: boolean;
  subCategoryType?: string;
}

export const CATEGORY_SUBCATEGORIES: Record<string, string[]> = {
  "Electronics": ["Wearables", "Audio", "Smart Home", "Accessories"],
  "Sports": ["Footwear", "Apparel", "Gear", "Fitness"],
  "Home & Living": ["Lighting", "Furniture", "Appliances", "Kitchen"],
  "Beauty": ["Fragrance", "Skincare", "Cosmetics", "Personal Care"],
  "Lifestyle": ["Travel", "Wellness", "Daily Essentials", "Gifts"],
  "Fashion": ["Men", "Women", "Children", "Babies"],
  "Digital Art": ["Murals", "Holograms", "Concept Art", "Generative"],
  "Vehicles": ["Electric Cars", "Combustion Cars", "Motorcycles", "Bicycles", "Hoverpods", "E-Bikes & Scooters", "Drones"]
};

export const FASHION_SUBCATEGORY_TYPES: Record<string, string[]> = {
  "Men": ["Clothing", "Footwear", "Accessories", "Outerwear"],
  "Women": ["Dresses", "Tops", "Handbags", "Footwear", "Accessories"],
  "Children": ["Clothing", "Footwear", "Toys", "Accessories"],
  "Babies": ["Onesies", "Rompers", "Sleepwear", "Accessories"]
};

export const PRODUCTS: Product[] = [
  {
    id: "watch-pro",
    name: "Nexora Smart Watch Pro",
    category: "Electronics",
    subCategory: "Wearables",
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
    subCategory: "Footwear",
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
    subCategory: "Lighting",
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
    subCategory: "Fragrance",
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
    subCategory: "Audio",
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
    subCategory: "Men",
    subCategoryType: "Accessories",
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
    subCategory: "Smart Home",
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
    subCategory: "Women",
    subCategoryType: "Accessories",
    price: 59.99,
    rating: 4.4,
    ratingCount: 76,
    description: "Classic stylish eyewear formulated with lightweight, high-resilience aluminum temples and durable UV polarization coatings.",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=800",
    isTrending: true
  },
  {
    id: "fashion-child-hoodie",
    name: "Kids Adaptive Smart Hoodie",
    category: "Fashion",
    subCategory: "Children",
    subCategoryType: "Clothing",
    price: 69.99,
    rating: 4.7,
    ratingCount: 32,
    description: "Thermal-regulating hoodie with adjustable fiber tensioning, water-resistant outer layers, and safety tracking micro-nodes.",
    image: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&q=80&w=800",
    tag: "New"
  },
  {
    id: "fashion-baby-romper",
    name: "Eco-Weave Intelligent Romper",
    category: "Fashion",
    subCategory: "Babies",
    subCategoryType: "Rompers",
    price: 39.99,
    rating: 4.9,
    ratingCount: 15,
    description: "Ultra-soft premium hypoallergenic organic bamboo fibers with dynamic bio-temperature indicators and quick-change magnetic clasps.",
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800",
    tag: "Staff Pick"
  },
  {
    id: "gear-bottle",
    name: "Hydro Bottle",
    category: "Sports",
    subCategory: "Gear",
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
    subCategory: "Fitness",
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
    subCategory: "Accessories",
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
    subCategory: "Kitchen",
    price: 189.99,
    rating: 4.6,
    ratingCount: 30,
    description: "Futuristic multi-layered ceramic thermal cookware set optimized for advanced high-efficiency induction and smart stove elements.",
    image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "art-cyber-mural",
    name: "Neo-Genesis Cyber Mural",
    category: "Digital Art",
    subCategory: "Murals",
    price: 450.00,
    rating: 4.9,
    ratingCount: 24,
    description: "A high-fidelity ultra-HD interactive digital mural displaying procedural atmospheric glow, neural node connections, and live state reactive canvas updates.",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800",
    tag: "Premium Art",
    isFeatured: true,
    isDigital: true
  },
  {
    id: "art-quantum-structure",
    name: "Exo-Spire Holographic Render",
    category: "Digital Art",
    subCategory: "Holograms",
    price: 250.00,
    rating: 4.8,
    ratingCount: 18,
    description: "Scarce authenticated digital render showcasing holographic quantum-architectural geometry. Includes ultra-high resolution digital file formats and exclusive cryptographic certificate of authenticity.",
    image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=800",
    tag: "Rare Premium",
    isTrending: true,
    isDigital: true
  },
  {
    id: "vehicle-apex-scooter",
    name: "Apex Cyber E-Scooter",
    category: "Vehicles",
    subCategory: "E-Bikes & Scooters",
    price: 1299.99,
    rating: 4.8,
    ratingCount: 37,
    description: "Sleek aircraft-grade carbon fiber scooter featuring dual 1200W electric hubs, electromagnetic regenerative brakes, and a smart dashboard with HUD support.",
    image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800",
    tag: "Trending"
  },
  {
    id: "vehicle-nebula-drone",
    name: "Nebula Ultra-Range Drone",
    category: "Vehicles",
    subCategory: "Drones",
    price: 899.99,
    rating: 4.7,
    ratingCount: 54,
    description: "Ultra-stabilized tri-rotor aerial system supporting cinematic 8K streams, intelligent AI collision barriers, and safe automated return-to-base maneuvers.",
    image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=800",
    tag: "Staff Pick"
  },
  {
    id: "vehicle-hyper-one",
    name: "Hyper-One Electric Concept Bike",
    category: "Vehicles",
    subCategory: "Motorcycles",
    price: 24500.00,
    rating: 4.9,
    ratingCount: 12,
    description: "A gorgeous limited-edition electric motorcycle offering liquid-cooled torque vectoring, holographic instrumentation panel, and premium fast-charging technology.",
    image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=800",
    tag: "Rare Premium",
    isFeatured: true
  },
  {
    id: "vehicle-v8-pursuit",
    name: "Intercept V8 Classic Coupe",
    category: "Vehicles",
    subCategory: "Combustion Cars",
    price: 85000.00,
    rating: 4.9,
    ratingCount: 24,
    description: "A precision-tuned, high-performance coupe powered by a naturally aspirated 5.0L V8 engine. Classic raw power meets modern suspension and mechanical feedback.",
    image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=800",
    tag: "Exclusive",
    isTrending: true
  },
  {
    id: "vehicle-carbon-trail",
    name: "Aero-Flow Carbon Gravel Bike",
    category: "Vehicles",
    subCategory: "Bicycles",
    price: 3499.00,
    rating: 4.8,
    ratingCount: 19,
    description: "Ultra-lightweight high-modulus carbon fiber gravel bicycle. Featuring professional-grade 12-speed manual gear shifters, hydraulic disc brakes, and tubeless all-terrain tires.",
    image: "https://images.unsplash.com/photo-1502744688674-c619d1586c9e?auto=format&fit=crop&q=80&w=800",
    tag: "Staff Pick"
  }
];
