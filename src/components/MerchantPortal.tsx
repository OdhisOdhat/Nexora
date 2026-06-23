import React, { useState, useEffect } from "react";
import { Store, Plus, Sparkles, Check, Package, DollarSign, Image as ImageIcon, Tag, ArrowRight, Edit2, X, Filter } from "lucide-react";
import { motion } from "motion/react";
import { Product, MERCHANT_LOCATIONS } from "../data/products";

interface MerchantPortalProps {
  userEmail: string;
  onProductAdded: () => void;
}

const CATEGORIES_PRESETS = [
  "Electronics",
  "Sports",
  "Home & Living",
  "Beauty",
  "Lifestyle",
  "Fashion",
  "Digital Art"
];

const PRESET_IMAGES = [
  { url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600", label: "Smart Accessory" },
  { url: "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&q=80&w=600", label: "Premium Footwear" },
  { url: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=600", label: "Active Biometrics" },
  { url: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=600", label: "Quantum Acoustics" },
  { url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600", label: "Cyber Headphones" },
  { url: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=600", label: "Holographic Lens" }
];

const PRESET_LOGOS = [
  { url: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=200", name: "Cyber Radiant" },
  { url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200", name: "Abstract Dream" },
  { url: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&q=80&w=200", name: "Prism Flow" },
  { url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=200", name: "Nebula Hex" }
];

export default function MerchantPortal({ userEmail, onProductAdded }: MerchantPortalProps) {
  const [merchant, setMerchant] = useState<{ email: string; brandName: string; description: string; logoUrl?: string; location?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Registration Form States
  const [regEmail, setRegEmail] = useState(userEmail);
  const [regBrand, setRegBrand] = useState("");
  const [regDesc, setRegDesc] = useState("");
  const [regLogoUrl, setRegLogoUrl] = useState("");
  const [regLocation, setRegLocation] = useState("US");
  const [isRegDragging, setIsRegDragging] = useState(false);
  
  // Profile settings states
  const [profileBrand, setProfileBrand] = useState("");
  const [profileDesc, setProfileDesc] = useState("");
  const [profileLocation, setProfileLocation] = useState("US");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  
  // Customizer / Input states
  const [isUpdatingLogo, setIsUpdatingLogo] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [logoUrlInput, setLogoUrlInput] = useState("");
  
  // Add Product Form States
  const [prodName, setProdName] = useState("");
  const [prodCategory, setProdCategory] = useState("Electronics");
  const [prodPrice, setProdPrice] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodImage, setProdImage] = useState(PRESET_IMAGES[2].url); // Prefer high-tech image by default
  const [prodTag, setProdTag] = useState("Merchant Spec");
  const [prodIsDigital, setProdIsDigital] = useState(false);
  const [prodIsPremium, setProdIsPremium] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Auto detect digital format if Digital Art selected
  useEffect(() => {
    if (prodCategory === "Digital Art") {
      setProdIsDigital(true);
      setProdTag("Art Canvas");
    }
  }, [prodCategory]);

  const [merchantProducts, setMerchantProducts] = useState<Product[]>([]);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState<string>("");
  const [editCategoryValue, setEditCategoryValue] = useState<string>("Electronics");
  const [editPriceValue, setEditPriceValue] = useState<string>("");
  const [editDescValue, setEditDescValue] = useState<string>("");
  const [editIsDigitalValue, setEditIsDigitalValue] = useState<boolean>(false);
  const [editIsPremiumValue, setEditIsPremiumValue] = useState<boolean>(false);
  const [editTagValue, setEditTagValue] = useState<string>("Merchant Spec");
  const [isUpdatingProduct, setIsUpdatingProduct] = useState(false);
  const [merchantCategoryFilter, setMerchantCategoryFilter] = useState<string>("All");

  // Dynamic digital/tag adjustment during product editing when editCategoryValue changes
  useEffect(() => {
    if (editingProductId) {
      if (editCategoryValue === "Digital Art") {
        setEditIsDigitalValue(true);
        setEditTagValue("Art Canvas");
      }
    }
  }, [editCategoryValue, editingProductId]);

  const startEditing = (p: Product) => {
    setEditingProductId(p.id);
    setEditNameValue(p.name);
    setEditCategoryValue(p.category || "Electronics");
    setEditPriceValue(p.price.toString());
    setEditDescValue(p.description || "");
    setEditIsDigitalValue(!!p.isDigital);
    const isPremium = !!p.isDigital && (
      p.tag?.toLowerCase().includes("premium") || 
      p.tag?.toLowerCase().includes("rare") || 
      p.tag?.toLowerCase().includes("art")
    );
    setEditIsPremiumValue(isPremium);
    setEditTagValue(p.tag || "Merchant Spec");
  };

  const handleUpdateProduct = async (productId: string) => {
    if (!editNameValue || !editPriceValue || isNaN(parseFloat(editPriceValue))) return;
    setIsUpdatingProduct(true);
    
    // Auto premium logic for edit
    const finalTag = editIsPremiumValue ? "Premium Art" : (editIsDigitalValue ? "Digital Asset" : editTagValue);

    try {
      const res = await fetch("/api/merchant/product/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: productId,
          email: userEmail,
          name: editNameValue,
          category: editCategoryValue,
          price: parseFloat(editPriceValue),
          description: editDescValue,
          isDigital: editIsDigitalValue,
          tag: finalTag
        })
      });

      if (res.ok) {
        setSuccessMsg("Product details updated successfully!");
        setEditingProductId(null);
        // Clear edit state
        setEditNameValue("");
        setEditCategoryValue("Electronics");
        setEditPriceValue("");
        setEditDescValue("");
        setEditIsDigitalValue(false);
        setEditIsPremiumValue(false);
        setEditTagValue("Merchant Spec");
        
        // Trigger parent state update
        onProductAdded();
        
        // Refresh products list
        const prodRes = await fetch("/api/products");
        if (prodRes.ok) {
          const allProds: Product[] = await prodRes.json();
          const filtered = allProds.filter(p => p.merchantEmail === userEmail);
          setMerchantProducts(filtered);
        }
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch (err) {
      console.error("Failed to update product details:", err);
    } finally {
      setIsUpdatingProduct(false);
    }
  };

  // Fetch current merchant info and filtered products
  const fetchMerchantAndProducts = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch merchant profile
      const res = await fetch(`/api/merchant?email=${encodeURIComponent(userEmail)}`);
      if (res.ok) {
        const data = await res.json();
        setMerchant(data);
        if (data) {
          if (data.logoUrl) {
            setLogoUrlInput(data.logoUrl);
          }
          setProfileBrand(data.brandName || "");
          setProfileDesc(data.description || "");
          setProfileLocation(data.location || "US");
        }
      }

      // 2. Fetch products to filter merchant specific items
      const prodRes = await fetch("/api/products");
      if (prodRes.ok) {
        const allProds: Product[] = await prodRes.json();
        const filtered = allProds.filter(p => p.merchantEmail === userEmail);
        setMerchantProducts(filtered);
      }
    } catch (err) {
      console.error("Failed to load merchant settings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchantAndProducts();
  }, [userEmail]);

  // Handle direct API logo update
  const handleUpdateLogo = async (url: string) => {
    setIsUpdatingLogo(true);
    try {
      const res = await fetch("/api/merchant/update-logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          logoUrl: url
        })
      });

      if (res.ok) {
        setSuccessMsg("Brand identity mark updated successfully!");
        setLogoUrlInput(url);
        // Instant state refresh
        setMerchant((prev) => prev ? { ...prev, logoUrl: url } : null);
        setTimeout(() => setSuccessMsg(""), 4000);
      } else {
        const errData = await res.json();
        console.error("Failed to update logo:", errData.error);
      }
    } catch (err) {
      console.error("Failed to update logo:", err);
    } finally {
      setIsUpdatingLogo(false);
    }
  };

  // Drag & drop handlers for dashboard customizer
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (file: File, callback: (base64: string) => void) => {
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        callback(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0], handleUpdateLogo);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0], handleUpdateLogo);
    }
  };

  // Drag & drop handlers for merchant sign-up screen
  const handleRegDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsRegDragging(true);
  };

  const handleRegDragLeave = () => {
    setIsRegDragging(false);
  };

  const handleRegDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsRegDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0], (base64) => setRegLogoUrl(base64));
    }
  };

  const handleRegFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0], (base64) => setRegLogoUrl(base64));
    }
  };

  // Handle Register Merchant Save
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regBrand.trim()) return;

    try {
      const res = await fetch("/api/merchant/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: regEmail,
          brandName: regBrand,
          description: regDesc,
          logoUrl: regLogoUrl,
          location: regLocation
        })
      });

      if (res.ok) {
        setMerchant({
          email: regEmail,
          brandName: regBrand,
          description: regDesc,
          logoUrl: regLogoUrl,
          location: regLocation
        });
        setSuccessMsg("Merchant registration successful!");
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch (err) {
      console.error("Failed to save merchant registration", err);
    }
  };

  // Handle Update Merchant Profile Settings
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileBrand.trim() || !merchant) return;

    setIsUpdatingProfile(true);
    try {
      const res = await fetch("/api/merchant/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          brandName: profileBrand,
          description: profileDesc,
          logoUrl: merchant.logoUrl,
          location: profileLocation
        })
      });

      if (res.ok) {
        setMerchant({
          ...merchant,
          brandName: profileBrand,
          description: profileDesc,
          location: profileLocation
        });
        setSuccessMsg("Merchant brand profile updated successfully!");
        onProductAdded(); // Trigger parent catalog update to convert product prices dynamically
        setTimeout(() => setSuccessMsg(""), 4500);
      }
    } catch (err) {
      console.error("Failed to update merchant profile settings", err);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle Add custom product / ware
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodPrice || !merchant) return;

    setIsAddingProduct(true);
    // Custom premium handling for digital products
    const finalTag = prodIsPremium ? "Premium Art" : (prodIsDigital ? "Digital Asset" : prodTag);
    try {
      const res = await fetch("/api/merchant/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: prodName,
          category: prodCategory,
          price: parseFloat(prodPrice),
          description: prodDesc || (prodIsDigital ? "Exclusive High-Fidelity premium digital art collectible. Authenticated artist signature & secure cloud node download." : "High-tech premium product offered by our customized merchant brand."),
          image: prodImage,
          merchantBrand: merchant.brandName,
          merchantEmail: merchant.email,
          isDigital: prodIsDigital,
          tag: finalTag
        })
      });

      if (res.ok) {
        setSuccessMsg(`Successfully listed "${prodName}" in the Nexora central index!`);
        setProdName("");
        setProdPrice("");
        setProdDesc("");
        setProdTag("Merchant Spec");
        setProdIsDigital(false);
        setProdIsPremium(false);
        
        // Refresh products and trigger callback
        onProductAdded();
        
        // Short timeout refresh
        setTimeout(async () => {
          setSuccessMsg("");
          const freshRes = await fetch("/api/products");
          if (freshRes.ok) {
            const allProds: Product[] = await freshRes.json();
            const filtered = allProds.filter(p => p.merchantEmail === userEmail);
            setMerchantProducts(filtered);
          }
        }, 1500);
      }
    } catch (err) {
      console.error("Failed to list product:", err);
    } finally {
      setIsAddingProduct(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 rounded-full border-t-2 border-purple-400 border-solid animate-spin" />
        <span className="text-sm font-mono text-gray-400 mt-4">Calibrating Nexus Channel...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-gray-100">
      
      {/* Title & Banner */}
      <div className="relative mb-10 p-8 rounded-3xl bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-900 border border-white/[0.04] overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-tr from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/10">
              <Store className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-purple-400 font-bold block mb-1">
                Nexora Merchant Nexus
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                Decentralized Showcase
              </h1>
            </div>
          </div>
          <div className="text-right font-mono text-[11px] text-gray-400 max-w-sm">
            Configure your customized brand, list unique wares within seconds, and query performance telemetry instantly.
          </div>
        </div>
      </div>

      {successMsg && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-2xl flex items-center gap-3 text-sm"
        >
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span>{successMsg}</span>
        </motion.div>
      )}

      {/* Main Grid View */}
      {!merchant ? (
        /* Sign-up Screen */
        <div className="max-w-xl mx-auto">
          <div className="bg-slate-900/60 backdrop-blur-md border border-white/[0.04] p-8 rounded-3xl relative">
            <h2 className="text-xl font-extrabold text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" /> Start Selling on Nexora
            </h2>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              Unlock millions of holographic cyber shoppers. Register your personalized merchant identity and design space-grade brand storefronts.
            </p>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-1.5" htmlFor="merchant-email-input">
                  Merchant Anchor Email
                </label>
                <input
                  id="merchant-email-input"
                  type="email"
                  disabled
                  value={regEmail}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-white/[0.06] text-gray-400 font-mono text-sm group-hover:border-purple-500"
                />
                <span className="text-[10px] text-gray-500 mt-1 block">Tethered permanently to your active AI Studio sandbox node.</span>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-1.5" htmlFor="merchant-brand-name-input">
                  Customized Brand Name
                </label>
                <input
                  id="merchant-brand-name-input"
                  type="text"
                  required
                  placeholder="e.g., Apex Cypher, Zenith Labs, Lumina"
                  value={regBrand}
                  onChange={(e) => setRegBrand(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-white/[0.08] focus:border-purple-500 text-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-1.5" htmlFor="merchant-description-text">
                  Brand Elevator Description
                </label>
                <textarea
                  id="merchant-description-text"
                  rows={3}
                  placeholder="What makes your customized wares signature?"
                  value={regDesc}
                  onChange={(e) => setRegDesc(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-white/[0.08] focus:border-purple-500 text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-1.5" htmlFor="merchant-location-select">
                  Merchant Node Base Location & Currency
                </label>
                <select
                  id="merchant-location-select"
                  value={regLocation}
                  onChange={(e) => setRegLocation(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-white/[0.08] focus:border-purple-500 text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all duration-200"
                >
                  {Object.entries(MERCHANT_LOCATIONS).map(([code, details]) => (
                    <option key={code} value={code} className="bg-slate-900 text-white">
                      {details.flag} {details.name} ({details.code} - {details.symbol})
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-gray-500 mt-1 block">Your storefront's primary currency node is determined by this location.</span>
              </div>

              {/* Set Initial Brand Logo */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest">
                  Initial Brand Logo (Optional)
                </label>
                
                <div 
                  className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all ${isRegDragging ? 'border-purple-500 bg-purple-500/5' : 'border-white/[0.06] hover:border-white/[0.1] bg-slate-950/40'}`}
                  onDragOver={handleRegDragOver}
                  onDragLeave={handleRegDragLeave}
                  onDrop={handleRegDrop}
                >
                  <input
                    type="file"
                    id="reg-logo-file-input"
                    className="hidden"
                    accept="image/*"
                    onChange={handleRegFileSelect}
                  />
                  <label htmlFor="reg-logo-file-input" className="cursor-pointer block">
                    {regLogoUrl ? (
                      <div className="flex items-center justify-center gap-3">
                        <img src={regLogoUrl} alt="Preview" className="w-12 h-12 rounded-xl object-cover border border-purple-500/30" />
                        <div className="text-left">
                          <span className="text-xs font-semibold text-white block">Ready to upload</span>
                          <span className="text-[10px] text-purple-400 hover:underline">Change file</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="w-5 h-5 text-gray-500 mx-auto mb-1.5" />
                        <span className="text-xs text-gray-300 block">Drag & Drop Logo Image, or <span className="text-purple-400">browse</span></span>
                      </>
                    )}
                  </label>
                </div>

                {/* Preset brandmark selection list */}
                <div>
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block mb-2">Or select a Premium Cyber Stamp</span>
                  <div className="grid grid-cols-4 gap-2">
                    {PRESET_LOGOS.map((lg) => (
                      <button
                        key={lg.url}
                        id={`reg-preset-logo-${lg.name.replace(/\s+/g, '-').toLowerCase()}`}
                        type="button"
                        onClick={() => setRegLogoUrl(lg.url)}
                        className={`relative aspect-square rounded-xl overflow-hidden border transition-all ${regLogoUrl === lg.url ? "border-purple-500 scale-95" : "border-white/[0.04] hover:border-white/[0.1]"}`}
                      >
                        <img src={lg.url} alt={lg.name} className="w-full h-full object-cover" />
                        {regLogoUrl === lg.url && (
                          <div className="absolute inset-0 bg-purple-600/30 flex items-center justify-center">
                            <Check className="w-3 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                id="merchant-signup-action"
                type="submit"
                className="w-full mt-4 py-3.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold font-mono uppercase tracking-widest rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-600/10 active:scale-[0.98]"
              >
                Assemble Storefront Identity <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Merchant Suite Dashboard */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Form to Add Ware / Product */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900/40 border border-white/[0.05] p-6 rounded-3xl">
              <div className="flex items-center gap-3.5 mb-4">
                {merchant.logoUrl ? (
                  <div className="w-12 h-12 rounded-xl border border-white/[0.08] overflow-hidden bg-slate-950 flex-shrink-0 flex items-center justify-center shadow-md">
                    <img src={merchant.logoUrl} alt={merchant.brandName} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-tr from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center shadow-inner flex-shrink-0">
                    <Store className="w-6 h-6 text-purple-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-sm tracking-wide uppercase font-mono truncate">{merchant.brandName}</h3>
                  <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-gray-400 font-mono truncate max-w-[130px]" title={merchant.email}>{merchant.email}</span>
                    <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 font-mono text-[8px] font-bold shrink-0 flex items-center gap-0.5">
                      {MERCHANT_LOCATIONS[merchant.location || "US"]?.flag} {MERCHANT_LOCATIONS[merchant.location || "US"]?.code}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-400 italic bg-white/[0.02] p-3 rounded-xl border border-white/[0.02]">
                "{merchant.description || "Decentralized Nexora partner shop listing standard bespoke products."}"
              </p>
            </div>

            {/* Brand Storefront Settings */}
            <div className="bg-slate-900/60 backdrop-blur-md border border-white/[0.04] p-6 rounded-3xl space-y-4">
              <h3 className="font-sans font-bold text-sm text-white flex items-center gap-2">
                <Store className="w-4 h-4 text-purple-400" /> Storefront Node & Currency
              </h3>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1" htmlFor="profile-brand-input">
                    Brand Name
                  </label>
                  <input
                    id="profile-brand-input"
                    type="text"
                    required
                    value={profileBrand}
                    onChange={(e) => setProfileBrand(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-white/[0.08] focus:border-purple-500 text-white text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1" htmlFor="profile-desc-textarea">
                    Storefront Description
                  </label>
                  <textarea
                    id="profile-desc-textarea"
                    rows={2}
                    value={profileDesc}
                    onChange={(e) => setProfileDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-white/[0.08] focus:border-purple-500 text-white text-xs focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1" htmlFor="profile-location-select">
                    Storefront Location Node
                  </label>
                  <select
                    id="profile-location-select"
                    value={profileLocation}
                    onChange={(e) => setProfileLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-white/[0.08] focus:border-purple-500 text-white text-xs focus:outline-none"
                  >
                    {Object.entries(MERCHANT_LOCATIONS).map(([code, details]) => (
                      <option key={code} value={code} className="bg-slate-900 text-white">
                        {details.flag} {details.name} ({details.code})
                      </option>
                    ))}
                  </select>
                  <span className="text-[9px] text-gray-500 mt-1 block">Updating shifts listed items' native currency to match this location!</span>
                </div>

                <button
                  id="profile-update-btn"
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold font-mono uppercase tracking-wider rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isUpdatingProfile ? "Syncing Profile..." : <><Check className="w-3.5 h-3.5" /> Save Store Settings</>}
                </button>
              </form>
            </div>

            {/* Brand Logo Customizer */}
            <div className="bg-slate-900/60 backdrop-blur-md border border-white/[0.04] p-6 rounded-3xl space-y-4">
              <h3 className="font-sans font-bold text-sm text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-purple-400" /> Brand Logo Customizer
              </h3>

              {/* Upload area - Drag & Drop / Click */}
              <div
                className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all ${
                  isDragging 
                    ? "border-purple-500 bg-purple-500/5 scale-[0.99]" 
                    : "border-white/[0.06] hover:border-white/[0.12] bg-slate-950/20"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="brand-logo-file-input"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileSelect}
                />
                <label htmlFor="brand-logo-file-input" className="cursor-pointer block">
                  <div className="w-9 h-9 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-2.5">
                    <ImageIcon className="w-4.5 h-4.5 text-purple-400" />
                  </div>
                  <span className="text-xs font-bold text-white block">Upload Own Brand Logo</span>
                  <span className="text-[10px] text-gray-400 mt-1 block leading-normal">
                    Drag/drop file here, or <span className="text-purple-400 hover:underline">click to browse</span>
                  </span>
                  <span className="text-[9px] text-gray-500 block mt-1">supports PNG, JPG, WEBP, files</span>
                </label>
              </div>

              {/* Fallback presets & custom URL */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Or Select Preset Identity Mark</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_LOGOS.map((lg) => (
                    <button
                      key={lg.url}
                      id={`preset-logo-${lg.name.replace(/\s+/g, '-').toLowerCase()}`}
                      type="button"
                      onClick={() => handleUpdateLogo(lg.url)}
                      className={`relative aspect-square rounded-xl overflow-hidden border transition-all ${merchant.logoUrl === lg.url ? "border-purple-500 scale-95" : "border-white/[0.04] hover:border-white/[0.1]"}`}
                      title={lg.name}
                    >
                      <img src={lg.url} alt={lg.name} className="w-full h-full object-cover" />
                      {merchant.logoUrl === lg.url && (
                        <div className="absolute inset-0 bg-purple-600/30 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-white/[0.04]">
                  <label className="block text-[9px] font-mono text-gray-400 uppercase tracking-wider mb-1" htmlFor="brand-logo-url-input">
                    Or Enter Image URL Link
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      id="brand-logo-url-input"
                      type="text"
                      placeholder="https://example.com/logo.png"
                      value={logoUrlInput}
                      onChange={(e) => setLogoUrlInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-white/[0.08] focus:border-purple-500 text-white text-[10px] font-mono focus:outline-none"
                    />
                    <button
                      id="save-logo-url-btn"
                      type="button"
                      onClick={() => handleUpdateLogo(logoUrlInput)}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-md border border-white/[0.04] p-6 rounded-3xl">
              <h3 className="font-bold text-base text-white mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4 text-purple-400" /> List a New Ware
              </h3>

              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1" htmlFor="product-name-input">
                    Product Title
                  </label>
                  <input
                    id="product-name-input"
                    type="text"
                    required
                    placeholder="e.g. Apex Hyperloop Lens"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950/80 border border-white/[0.08] focus:border-purple-500 text-white text-xs focus:outline-none transition-all duration-150"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1" htmlFor="product-category-picker">
                      Category
                    </label>
                    <select
                      id="product-category-picker"
                      value={prodCategory}
                      onChange={(e) => setProdCategory(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg bg-slate-950/85 border border-white/[0.08] text-white text-xs focus:outline-none transition-all duration-150"
                    >
                      {CATEGORIES_PRESETS.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1" htmlFor="product-price-input">
                      Price (USD)
                    </label>
                    <input
                      id="product-price-input"
                      type="number"
                      step="0.01"
                      required
                      placeholder="99.99"
                      value={prodPrice}
                      onChange={(e) => setProdPrice(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950/80 border border-white/[0.08] focus:border-purple-500 text-white text-xs focus:outline-none transition-all duration-150"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1" htmlFor="product-desc-input">
                    Product Description
                  </label>
                  <textarea
                    id="product-desc-input"
                    rows={2}
                    placeholder="Describe specific functions..."
                    value={prodDesc}
                    onChange={(e) => setProdDesc(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-950/80 border border-white/[0.08] focus:border-purple-500 text-white text-xs focus:outline-none transition-all duration-150"
                  />
                </div>

                {/* Digital / Premium Settings */}
                <div className="p-3.5 bg-slate-950/60 rounded-xl border border-white/[0.04] space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-gray-200">Digital Product format</span>
                      <span className="text-[10px] text-gray-500 font-mono">Instant delivery via client secure terminal</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={prodIsDigital}
                        onChange={(e) => setProdIsDigital(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  {prodIsDigital && (
                    <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.04]">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-purple-300 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                          Mark as Premium Art
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono">Apply rare premium metadata styling</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={prodIsPremium}
                          onChange={(e) => setProdIsPremium(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-yellow-500"></div>
                      </label>
                    </div>
                  )}
                </div>

                {/* Preset Image Chooser */}
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-2">
                    Visual Render Mock (Pick Preset)
                  </label>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {PRESET_IMAGES.map((img) => (
                      <button
                        key={img.url}
                        id={`merchant-preset-image-${img.label.replace(/\s+/g, '-').toLowerCase()}`}
                        type="button"
                        onClick={() => setProdImage(img.url)}
                        className={`relative aspect-square rounded-lg overflow-hidden border transition-all ${prodImage === img.url ? "border-purple-500 scale-95" : "border-white/[0.05] opacity-50 hover:opacity-100"}`}
                      >
                        <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                        {prodImage === img.url && (
                          <div className="absolute inset-0 bg-purple-600/30 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Or enter custom image URL"
                    value={prodImage}
                    onChange={(e) => setProdImage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950/80 border border-white/[0.08] text-white text-[10px] focus:outline-none font-mono"
                  />
                </div>

                <button
                  id="merchant-publish-action"
                  type="submit"
                  disabled={isAddingProduct}
                  className="w-full mt-2 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold font-mono uppercase tracking-wider rounded-lg transition-all duration-200"
                >
                  {isAddingProduct ? "Publishing to Core Stack..." : "Publish Ware to Catalog"}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Active Listings Telemetry & Table */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Quick Stats Telemetry */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-900/40 border border-white/[0.04] p-4 rounded-2xl flex flex-col justify-between">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block">Wares Cataloged</span>
                <span className="text-2xl font-bold text-white mt-1.5">{merchantProducts.length}</span>
              </div>
              <div className="bg-slate-900/40 border border-white/[0.04] p-4 rounded-2xl flex flex-col justify-between">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block">Live Rating</span>
                <span className="text-2xl font-bold text-purple-400 mt-1.5 font-mono">4.5★</span>
              </div>
              <div className="bg-slate-900/40 border border-white/[0.04] p-4 rounded-2xl flex flex-col justify-between">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block">Nexus Security</span>
                <span className="text-2xl font-bold text-emerald-400 mt-1.5 font-mono text-xs uppercase tracking-widest font-extrabold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Active
                </span>
              </div>
            </div>

            {/* List of Merchant's products */}
            <div className="bg-slate-900/60 backdrop-blur-md border border-white/[0.04] p-6 rounded-3xl">
              <h3 className="font-bold text-base text-white mb-4 flex items-center gap-2">
                <Package className="w-4 h-4 text-purple-400" /> Active Merchant Catalog
              </h3>

              {merchantProducts.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-white/[0.05] rounded-2xl bg-white/[0.01]">
                  <Store className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-400 font-medium">No custom wares published yet.</p>
                  <p className="text-xs text-gray-500 mt-1">Use the listing form on the left to display wares in the market index!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Category Filter Tab Selector */}
                  <div className="flex flex-wrap gap-1.5 p-1 bg-slate-950/40 rounded-xl border border-white/[0.03] items-center">
                    <span className="text-[9px] font-mono font-bold text-gray-500 px-2 uppercase tracking-wider flex items-center gap-1 shrink-0">
                      <Filter className="w-3 h-3 text-purple-400" /> Category Filter:
                    </span>
                    {["All", ...CATEGORIES_PRESETS].map((cat) => {
                      const count = cat === "All" 
                        ? merchantProducts.length 
                        : merchantProducts.filter(item => item.category === cat).length;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setMerchantCategoryFilter(cat)}
                          className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg transition-all duration-200 cursor-pointer border flex items-center gap-1 ${
                            merchantCategoryFilter === cat
                              ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-500/10"
                              : "bg-slate-900/60 text-gray-400 border-white/[0.04] hover:bg-slate-800 hover:text-white"
                          }`}
                        >
                          {cat} <span className="text-[8px] opacity-60">({count})</span>
                        </button>
                      );
                    })}
                  </div>

                  {merchantProducts.filter(item => merchantCategoryFilter === "All" || item.category === merchantCategoryFilter).length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-white/[0.05] rounded-xl bg-white/[0.01]">
                      <Filter className="w-7 h-7 text-gray-600 mx-auto mb-2" />
                      <p className="text-xs text-gray-400">No wares published under "{merchantCategoryFilter}".</p>
                      <button
                        type="button"
                        onClick={() => setMerchantCategoryFilter("All")}
                        className="mt-2 text-[10px] text-purple-400 underline font-mono cursor-pointer"
                      >
                        Reset filter to display all listed wares
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                      {merchantProducts
                        .filter(item => merchantCategoryFilter === "All" || item.category === merchantCategoryFilter)
                        .map((p) => (
                          <div 
                            key={p.id}
                            className="p-1 rounded-2xl transition-colors duration-200"
                          >
                            {editingProductId === p.id ? (
                              /* Full Feature Edit Form */
                              <div className="p-4 bg-slate-950/80 rounded-2xl border border-purple-500/30 space-y-4">
                                <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
                                  <h4 className="text-xs font-bold text-purple-300 font-mono flex items-center gap-1.5">
                                    <Edit2 className="w-3.5 h-3.5 animate-pulse text-purple-400" /> Adjusting Ware: <span className="text-white text-xs">{p.name}</span>
                                  </h4>
                                  <button
                                    type="button"
                                    onClick={() => setEditingProductId(null)}
                                    className="p-1 hover:bg-slate-800 rounded text-gray-400 hover:text-white transition-colors cursor-pointer"
                                    title="Cancel Editing"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Product Name */}
                                  <div>
                                    <label className="block text-[9px] font-mono text-gray-400 uppercase tracking-wider mb-1.5">Ware Name</label>
                                    <input
                                      type="text"
                                      value={editNameValue}
                                      onChange={(e) => setEditNameValue(e.target.value)}
                                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-white/[0.08] text-white text-xs focus:outline-none"
                                    />
                                  </div>

                                  {/* Product Price */}
                                  <div>
                                    <label className="block text-[9px] font-mono text-gray-400 uppercase tracking-wider mb-1.5">Unit Price (USD)</label>
                                    <div className="relative">
                                      <span className="absolute left-3 top-1.5 text-gray-500 font-mono text-xs">$</span>
                                      <input
                                        type="number"
                                        step="0.01"
                                        value={editPriceValue}
                                        onChange={(e) => setEditPriceValue(e.target.value)}
                                        className="w-full pl-7 pr-3 py-1.5 rounded-lg bg-slate-900 border border-white/[0.08] text-white text-xs font-mono focus:outline-none"
                                      />
                                    </div>
                                  </div>

                                  {/* Product Category */}
                                  <div>
                                    <label className="block text-[9px] font-mono text-gray-400 uppercase tracking-wider mb-1.5">Category Class</label>
                                    <select
                                      value={editCategoryValue}
                                      onChange={(e) => setEditCategoryValue(e.target.value)}
                                      className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-white/[0.08] text-white text-xs focus:outline-none"
                                    >
                                      {CATEGORIES_PRESETS.map((cat) => (
                                        <option key={cat} value={cat}>
                                          {cat}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  {/* Category tag */}
                                  <div>
                                    <label className="block text-[9px] font-mono text-gray-400 uppercase tracking-wider mb-1.5">Tag Badge</label>
                                    <input
                                      type="text"
                                      value={editTagValue}
                                      onChange={(e) => setEditTagValue(e.target.value)}
                                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-white/[0.08] text-white text-xs focus:outline-none"
                                      placeholder="Merchant Spec"
                                    />
                                  </div>
                                </div>

                                {/* Description */}
                                <div>
                                  <label className="block text-[9px] font-mono text-gray-400 uppercase tracking-wider mb-1.5">Product Description</label>
                                  <textarea
                                    value={editDescValue}
                                    onChange={(e) => setEditDescValue(e.target.value)}
                                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-white/[0.08] text-white text-xs focus:outline-none h-16 resize-none"
                                    placeholder="Update description details..."
                                  />
                                </div>

                                {/* Digital Attributes */}
                                <div className="p-3 bg-slate-900/60 rounded-xl border border-white/[0.04] space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                      <span className="text-xs font-semibold text-gray-200">Digital Product format</span>
                                      <span className="text-[10px] text-gray-500 font-mono">Instant download format</span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer select-none">
                                      <input
                                        type="checkbox"
                                        checked={editIsDigitalValue}
                                        onChange={(e) => setEditIsDigitalValue(e.target.checked)}
                                        className="sr-only peer"
                                      />
                                      <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                                    </label>
                                  </div>

                                  {editIsDigitalValue && (
                                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
                                      <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-purple-300 flex items-center gap-1">
                                          <Sparkles className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                                          Mark as Premium Art
                                        </span>
                                        <span className="text-[10px] text-gray-500 font-mono">Apply rare premium metadata styling</span>
                                      </div>
                                      <label className="relative inline-flex items-center cursor-pointer select-none">
                                        <input
                                          type="checkbox"
                                          checked={editIsPremiumValue}
                                          onChange={(e) => setEditIsPremiumValue(e.target.checked)}
                                          className="sr-only peer"
                                        />
                                        <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-yellow-500"></div>
                                      </label>
                                    </div>
                                  )}
                                </div>

                                <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.04]">
                                  <button
                                    type="button"
                                    onClick={() => setEditingProductId(null)}
                                    className="px-3.5 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-lg transition-colors cursor-pointer font-semibold"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isUpdatingProduct}
                                    onClick={() => handleUpdateProduct(p.id)}
                                    className="px-4 py-1.5 text-xs bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg transition-colors cursor-pointer font-bold flex items-center gap-1.5"
                                  >
                                    {isUpdatingProduct ? (
                                      "Saving..."
                                    ) : (
                                      <>
                                        <Check className="w-3.5 h-3.5" /> Save Changes
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              /* Read-Only Listing Row */
                              <div className="p-3.5 bg-slate-950/40 hover:bg-slate-950/70 rounded-xl border border-white/[0.03] flex items-center justify-between gap-3 transition-colors duration-200">
                                <div className="flex items-center gap-3.5">
                                  <div className="w-11 h-11 rounded-lg overflow-hidden border border-white/[0.05] bg-slate-900 flex-shrink-0">
                                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-xs text-white leading-snug line-clamp-1">{p.name}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 font-mono text-[9px] font-bold">
                                        {p.category}
                                      </span>
                                      {p.isDigital && (
                                        <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 font-mono text-[8px] font-bold">
                                          Digital
                                        </span>
                                      )}
                                      <span className="text-[10px] text-gray-500 font-mono">ID: {p.id}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2.5 flex-shrink-0">
                                  <div className="text-right">
                                    <span className="text-xs font-mono font-bold text-white block">${p.price.toFixed(2)}</span>
                                    <span className="text-[9px] text-emerald-400/90 font-mono font-semibold block uppercase tracking-wider mt-0.5">Listed</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => startEditing(p)}
                                    className="p-1.5 bg-white/[0.03] hover:bg-purple-500/20 text-gray-400 hover:text-purple-400 rounded-lg border border-white/[0.04] transition-all cursor-pointer"
                                    title="Edit Product Details"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
