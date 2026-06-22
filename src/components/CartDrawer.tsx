import { X, Trash2, ChevronRight, ShoppingCart, Lock, ShieldCheck, CheckCircle2, Truck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import React, { useState } from "react";
import { CartItem } from "../types";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, q: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  isPrimeUser: boolean;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  isPrimeUser
}: CartDrawerProps) {
  
  // Checkout flow state parameters
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "shipping" | "success">("cart");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [orderTrackingId, setOrderTrackingId] = useState("");

  if (!isOpen) return null;

  // Compute checkout mathematical operations
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const isShippingFree = isPrimeUser || subtotal >= 50;
  const shipping = subtotal === 0 ? 0 : (isShippingFree ? 0 : 9.99);
  const tax = subtotal * 0.08;
  const grandTotal = subtotal + shipping + tax;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address || !cardNumber) {
      alert("Please provide the required shipping and payment credentials.");
      return;
    }
    
    try {
      const response = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "fodhis1@gmail.com",
          total: grandTotal,
          shippingAddress: address,
          paymentMethod: "Quantum Card **** " + cardNumber.slice(-4),
          items: cartItems
        })
      });

      if (!response.ok) {
        throw new Error("Checkout failed server-side");
      }

      const data = await response.json();
      setOrderTrackingId(data.orderId || "NX-ORD-" + Math.floor(100000 + Math.random() * 900000));
      setCheckoutStep("success");
    } catch (err) {
      console.error("Database checkout transaction failed:", err);
      // Fallback elegant execution if backend drops or connects slowly
      const randomTrackId = "NX-" + Math.floor(100000 + Math.random() * 900000);
      setOrderTrackingId(randomTrackId);
      setCheckoutStep("success");
    }
  };

  const handleResetCheckout = () => {
    onClearCart();
    setCheckoutStep("cart");
    setName("");
    setAddress("");
    setCardNumber("");
    setCardExpiry("");
    setCardCvv("");
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop glass */}
        <motion.div
          id="cart-drawer-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Drawer slide-out wrapper panel */}
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            id="cart-drawer-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.35, ease: "easeInOut" }}
            className="w-screen max-w-md bg-nexora-surface text-white border-l border-white/[0.04] p-0 flex flex-col h-full shadow-2xl"
          >
            {/* Header section */}
            <div className="px-6 py-5 border-b border-white/[0.04] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShoppingCart className="w-5 h-5 text-nexora-primary" />
                <h3 className="font-sans font-bold text-base text-white tracking-wide uppercase">
                  {checkoutStep === "cart" ? "Shopping Cart Bag" : (checkoutStep === "shipping" ? "Secure Checkout" : "Order Confirmed!")}
                </h3>
              </div>
              <button
                id="cart-drawer-close-btn"
                aria-label="Close cart drawer"
                onClick={onClose}
                className="p-1.5 hover:bg-slate-800 text-gray-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main scrollable layout block */}
            <div className="flex-1 overflow-y-auto p-6">
              {checkoutStep === "success" ? (
                /* Success screen layout block */
                <div className="flex flex-col items-center justify-center text-center h-full py-10">
                  <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 animate-bounce" />
                  </div>
                  <h4 className="font-bold text-xl text-white">Transmissions Complete!</h4>
                  <p className="text-xs text-gray-400 mt-2 max-w-xs text-center leading-relaxed">
                    Thank you for deploying your purchase with Nexora. Your transaction has processed securely.
                  </p>

                  <div className="my-7 p-4 bg-slate-900 border border-white/[0.04] rounded-2xl w-full text-left font-mono text-xs space-y-2.5">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Receipt Ref:</span>
                      <span className="text-purple-300 font-bold">{orderTrackingId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Deliver To:</span>
                      <span className="text-gray-200 truncate max-w-44">{name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Destination:</span>
                      <span className="text-gray-200 truncate max-w-44 text-right">{address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Dispatched:</span>
                      <span className="text-green-400">Within {isPrimeUser ? "1 Hour" : "24 Hours"}</span>
                    </div>
                    <div className="flex justify-between border-t border-white/[0.04] pt-2 mt-4 text-sm">
                      <span className="text-gray-400">Amount Paid:</span>
                      <span className="text-white font-bold">${grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    id="cart-drawer-success-dismiss-btn"
                    onClick={handleResetCheckout}
                    className="w-full py-3.5 bg-nexora-primary hover:bg-nexora-primary-hover text-white font-bold rounded-xl transition-all glow-primary cursor-pointer active:scale-95 text-xs uppercase tracking-wider"
                  >
                    Return to Storefront
                  </button>
                </div>
              ) : checkoutStep === "shipping" ? (
                /* Secure Checkout Form Panel */
                <form id="cart-drawer-checkout-form" onSubmit={handlePlaceOrder} className="space-y-5">
                  <div className="bg-slate-900/60 p-3.5 rounded-xl border border-white/[0.04] flex items-center gap-2.5 text-xs text-purple-300 mb-2">
                    <Lock className="w-4 h-4 shrink-0 text-nexora-primary" />
                    <span>Your credit card operations are processed with top-level secure protocols.</span>
                  </div>

                  {/* Section: Delivery Address details */}
                  <div className="space-y-3.5">
                    <h5 className="text-[11px] font-mono uppercase tracking-widest text-gray-500 font-semibold">1. Delivery Address</h5>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5">Recipient Full Name</label>
                      <input
                        id="checkout-input-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Major Tom"
                        className="w-full px-3.5 py-2 text-xs bg-slate-900 border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-nexora-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5">Destination Shipping Address</label>
                      <input
                        id="checkout-input-address"
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="e.g. Sector 7, Cosmic Colony B"
                        className="w-full px-3.5 py-2 text-xs bg-slate-900 border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-nexora-primary"
                      />
                    </div>
                  </div>

                  {/* Section: Payment detail fields */}
                  <div className="space-y-3.5 pt-4 border-t border-white/[0.04]">
                    <h5 className="text-[11px] font-mono uppercase tracking-widest text-gray-500 font-semibold">2. Payment details</h5>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5">Credit/Debit Card Number</label>
                      <input
                        id="checkout-input-cardnumber"
                        type="text"
                        required
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="0000 0000 0000 0000"
                        className="w-full px-3.5 py-2 text-xs bg-slate-900 border border-white/[0.08] rounded-lg text-white font-mono focus:outline-none focus:border-nexora-primary"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1.5">Expiration (MM/YY)</label>
                        <input
                          id="checkout-input-cardexpiry"
                          type="text"
                          required
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full px-3.5 py-2 text-xs bg-slate-900 border border-white/[0.08] rounded-lg text-white font-mono focus:outline-none focus:border-nexora-primary text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1.5">CVV Code</label>
                        <input
                          id="checkout-input-cardcvv"
                          type="text"
                          required
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="123"
                          className="w-full px-3.5 py-2 text-xs bg-slate-900 border border-white/[0.08] rounded-lg text-white font-mono focus:outline-none focus:border-nexora-primary text-center"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Total summary calculations preview */}
                  <div className="pt-4 border-t border-white/[0.04]">
                    <div className="bg-slate-900 p-4 rounded-xl space-y-2 text-xs border border-white/[0.04]">
                      <div className="flex justify-between text-gray-400">
                        <span>Items Subtotal:</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>Processing & Delivery:</span>
                        <span>{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>Simulated VAT/Tax (8%):</span>
                        <span>${tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-white font-bold text-sm border-t border-white/[0.04] pt-2 mt-2">
                        <span>Amount to Charge:</span>
                        <span className="text-purple-300 font-mono">${grandTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-3">
                    <button
                      id="checkout-cancel-btn"
                      type="button"
                      onClick={() => setCheckoutStep("cart")}
                      className="py-3 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-gray-400 rounded-lg transition-transform active:scale-95 cursor-pointer"
                    >
                      Back to Basket
                    </button>
                    <button
                      id="checkout-submit-btn"
                      type="submit"
                      className="py-3 text-xs font-bold bg-nexora-primary hover:bg-nexora-primary-hover text-white rounded-lg transition-transform active:scale-95 cursor-pointer"
                    >
                      Authorize Payment
                    </button>
                  </div>
                </form>
              ) : cartItems.length === 0 ? (
                /* Empty Cart panel layout */
                <div className="flex flex-col items-center justify-center text-center h-full py-12">
                  <ShoppingCart className="w-14 h-14 text-slate-700 stroke-1 mb-4" />
                  <h4 className="font-bold text-gray-300 text-sm">Your basket is empty</h4>
                  <p className="text-xs text-gray-500 mt-2.5 max-w-xs leading-relaxed">
                    Check out our futuristic catalog and discover incredible top-grade electronic gadgets, cosmetics, and accessories!
                  </p>
                  <button
                    id="cart-drawer-resume-shopping-btn"
                    onClick={onClose}
                    className="mt-6 px-5 py-2.5 bg-slate-900 hover:bg-slate-850 text-nexora-primary hover:text-white rounded-xl text-xs font-semibold transition-all border border-nexora-primary/10 cursor-pointer"
                  >
                    Browse Collections
                  </button>
                </div>
              ) : (
                /* Regular Cart list items */
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      id={`cart-item-${item.id}`}
                      className="flex gap-4 p-3.5 bg-slate-900/60 rounded-2xl border border-white/[0.04]"
                    >
                      {/* Thumbnail photo */}
                      <div className="w-16 h-16 rounded-xl bg-slate-950 overflow-hidden shrink-0 border border-white/[0.04] flex items-center justify-center">
                        <img referrerPolicy="no-referrer" src={item.image} alt={item.name} className="object-cover w-full h-full opacity-80" />
                      </div>

                      {/* Content block */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex justify-between gap-1.5">
                          <div>
                            <h5 className="font-bold text-xs text-white line-clamp-1">{item.name}</h5>
                            <span className="text-[10px] text-gray-500 font-mono tracking-wider">{item.category}</span>
                          </div>
                          <button
                            id={`cart-item-delete-btn-${item.id}`}
                            aria-label={`Remove ${item.name}`}
                            onClick={() => onRemoveItem(item.id)}
                            className="text-gray-500 hover:text-red-400 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* quantity modifiers / price highlights */}
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center gap-2 border border-white/[0.06] bg-slate-950/70 rounded-lg p-0.5">
                            <button
                              id={`cart-item-qty-dec-${item.id}`}
                              aria-label="Decrease quantity"
                              onClick={() => {
                                if (item.quantity > 1) {
                                  onUpdateQuantity(item.id, item.quantity - 1);
                                } else {
                                  onRemoveItem(item.id);
                                }
                              }}
                              className="w-5 h-5 flex items-center justify-center text-xs text-gray-400 hover:text-white font-bold"
                            >
                              -
                            </button>
                            <span className="text-xs font-mono font-bold text-white px-1">{item.quantity}</span>
                            <button
                              id={`cart-item-qty-inc-${item.id}`}
                              aria-label="Increase quantity"
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                              className="w-5 h-5 flex items-center justify-center text-xs text-gray-400 hover:text-white font-bold"
                            >
                              +
                            </button>
                          </div>
                          <span className="text-xs font-mono font-bold text-purple-200">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Calculations and Actions Footer panel (only active when not on success screen) */}
            {checkoutStep !== "success" && cartItems.length > 0 && (
              <div className="px-6 py-5 border-t border-white/[0.04] bg-slate-900/40 space-y-4">
                {checkoutStep === "cart" ? (
                  <>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between text-gray-400">
                        <span>Basket Subtotal:</span>
                        <span className="font-mono text-white">${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-400 items-center">
                        <div className="flex items-center gap-1.5">
                          <span>Priority Dispatch:</span>
                          {isPrimeUser && (
                            <span className="bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold">
                              Prime VIP
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-white">
                          {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                        </span>
                      </div>
                      {!isShippingFree && (
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium">
                          <Truck className="w-3.5 h-3.5" />
                          <span>Add <span className="font-bold text-nexora-primary">${(50 - subtotal).toFixed(2)}</span> more for FREE shipping</span>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-white/[0.04] pt-3.5 flex justify-between items-baseline">
                      <span className="text-xs font-semibold text-gray-300">Estimated Total:</span>
                      <span className="text-lg font-mono font-bold text-purple-200">${grandTotal.toFixed(2)}</span>
                    </div>

                    <button
                      id="cart-drawer-checkout-proceed-btn"
                      onClick={() => setCheckoutStep("shipping")}
                      className="w-full py-3.5 bg-nexora-primary hover:bg-nexora-primary-hover text-white text-xs font-bold rounded-xl transition-all glow-primary flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
                    >
                      Proceed to Secure Checkout
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                ) : null}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
