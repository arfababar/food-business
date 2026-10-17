import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { BUSINESS_CONFIG, isRestaurantOpen } from "../config/business";
import { checkoutSchema } from "../lib/validation";
import { createOrder } from "../services/api";
import { 
  ArrowLeft, 
  CheckCircle, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  User, 
  FileText, 
  Banknote,
  AlertTriangle,
  Clock,
  Loader2,
  RefreshCw
} from "lucide-react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

export default function Checkout() {
  const { cart, cartSubtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const openNow = isRestaurantOpen();
  const isProd = import.meta.env.PROD;
  const isDev = import.meta.env.DEV;

  const [dbStatus, setDbStatus] = useState({
    checked: false,
    reachable: isSupabaseConfigured && Boolean(supabase),
  });

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000);

    async function checkReachability() {
      if (!isSupabaseConfigured || !supabase) {
        if (isMounted) setDbStatus({ checked: true, reachable: false });
        return;
      }
      try {
        const { error } = await supabase
          .from("products")
          .select("id")
          .abortSignal(controller.signal)
          .limit(1);

        clearTimeout(timeoutId);
        if (isMounted) {
          setDbStatus({ checked: true, reachable: !error });
        }
      } catch {
        clearTimeout(timeoutId);
        if (isMounted) {
          setDbStatus({ checked: true, reachable: false });
        }
      }
    }

    checkReachability();
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  const isDbOperational = dbStatus.reachable;

  const [selectedArea, setSelectedArea] = useState(BUSINESS_CONFIG.deliveryAreas[0].name);

  // Dynamic area fee calculation
  const areaConfig = BUSINESS_CONFIG.deliveryAreas.find((a) => a.name === selectedArea);
  const baseDeliveryFee = areaConfig ? areaConfig.fee : BUSINESS_CONFIG.standardDeliveryFee;
  const isFreeDelivery = cartSubtotal >= BUSINESS_CONFIG.freeDeliveryThreshold;
  const effectiveDeliveryFee = isFreeDelivery ? 0 : baseDeliveryFee;
  const grandTotal = cartSubtotal + effectiveDeliveryFee;

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    area: BUSINESS_CONFIG.deliveryAreas[0].name,
    city: BUSINESS_CONFIG.city,
    instructions: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold mb-2">No items to checkout</h2>
        <p className="text-neutral-500 mb-6">Your cart is currently empty.</p>
        <Link to="/menu" className="px-6 py-3 bg-amber-500 text-neutral-950 font-bold rounded-xl">
          Return to Menu
        </Link>
      </div>
    );
  }

  const handleAreaChange = (areaName) => {
    setSelectedArea(areaName);
    setFormData((prev) => ({ ...prev, area: areaName }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    // Validate using Zod schema
    const result = checkoutSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];
        if (fieldName && !fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    if (isProd && !isDbOperational) {
      setSubmitError("Online ordering is currently unavailable. Live database connection is required.");
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. Submit order to database (prices verified server-side)
      const order = await createOrder({
        customer: {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          area: formData.area.trim(),
          city: formData.city.trim(),
        },
        cartItems: cart,
        notes: formData.instructions.trim(),
      });

      // 2. Clear cart and navigate to OrderSuccess with full order state
      clearCart();
      navigate(`/order-success?order=${encodeURIComponent(order.orderId)}`, {
        state: {
          orderDetails: {
            orderId: order.orderId,
            customer: {
              fullName: order.customer.fullName,
              phone: order.customer.phone,
              address: order.customer.address,
              area: order.customer.area,
              city: order.customer.city || BUSINESS_CONFIG.city,
              instructions: order.customer.instructions || "",
            },
            items: order.items,
            total: order.total,
            deliveryFee: order.deliveryFee,
            subtotal: order.subtotal,
          },
        },
      });
    } catch (err) {
      console.error("Order submission failure:", err);
      setSubmitError(
        err.message || "Could not place your order. Please check your connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-neutral-50 min-h-screen py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/cart"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-neutral-600 hover:text-amber-600 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </Link>

        {/* Production database disconnected error */}
        {isProd && !isDbOperational && (
          <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-rose-50 border border-rose-300 flex items-start gap-3 text-rose-900 text-sm shadow-xs">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Online Checkout Currently Unavailable</strong>
              <p className="text-xs text-rose-700 mt-1">
                Our order database is currently unreachable. Online checkout is temporarily suspended.
                Please call us directly at{" "}
                <a href={`tel:${BUSINESS_CONFIG.hotlineTel}`} className="underline font-bold">
                  {BUSINESS_CONFIG.hotlineDisplay}
                </a>{" "}
                or message us on WhatsApp to place your order.
              </p>
            </div>
          </div>
        )}

        {/* Dev-only offline demo mode banner */}
        {isDev && !isDbOperational && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-amber-900 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>OFFLINE DEMO MODE (DEV ONLY):</strong> Database connection is offline. Orders will be simulated locally.
            </span>
          </div>
        )}

        {/* Closed kitchen warning */}
        {!openNow && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center gap-3 text-amber-900 text-sm">
            <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <strong className="block">Notice: Kitchen is currently closed</strong>
              <span>
                Our opening hours are {BUSINESS_CONFIG.hoursDisplay.weekdays}. You can still place your order now, and our team will prepare and dispatch it once the kitchen opens.
              </span>
            </div>
          </div>
        )}

        {/* Submit Error alert */}
        {submitError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between text-rose-800 text-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <span>{submitError}</span>
            </div>
            <button
              onClick={() => setSubmitError("")}
              className="text-xs font-bold underline hover:text-rose-950"
            >
              Dismiss
            </button>
          </div>
        )}

        <h1 className="text-3xl font-black text-neutral-900 tracking-tight mb-2">
          Delivery & Checkout ({BUSINESS_CONFIG.city})
        </h1>
        <p className="text-sm text-neutral-500 mb-8">
          Please provide your delivery details. Payment is Cash on Delivery only.
        </p>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Customer Details Form */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs space-y-6">
              <h2 className="text-xl font-black text-neutral-900 pb-3 border-b border-neutral-100 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-500" />
                <span>1. Delivery Information</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1.5">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Tariq Mehmood"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className={`w-full pl-10 pr-3 py-3 rounded-xl border text-sm font-medium focus:outline-hidden ${
                        errors.fullName ? "border-rose-400 bg-rose-50/50" : "border-neutral-200 focus:border-amber-500"
                      }`}
                    />
                  </div>
                  {errors.fullName && <p className="text-[11px] text-rose-500 mt-1">{errors.fullName}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1.5">
                    Phone / WhatsApp Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      placeholder="e.g. 0300-1234567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`w-full pl-10 pr-3 py-3 rounded-xl border text-sm font-medium focus:outline-hidden ${
                        errors.phone ? "border-rose-400 bg-rose-50/50" : "border-neutral-200 focus:border-amber-500"
                      }`}
                    />
                  </div>
                  {errors.phone && <p className="text-[11px] text-rose-500 mt-1">{errors.phone}</p>}
                </div>
              </div>

              {/* Street Address */}
              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1.5">
                  Complete Street Address (House/Shop #, Street, Block) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. House 14, Street 3, Block B"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-medium focus:outline-hidden ${
                    errors.address ? "border-rose-400 bg-rose-50/50" : "border-neutral-200 focus:border-amber-500"
                  }`}
                />
                {errors.address && <p className="text-[11px] text-rose-500 mt-1">{errors.address}</p>}
              </div>

              {/* Area & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1.5">
                    Delivery Area in {BUSINESS_CONFIG.city} *
                  </label>
                  <select
                    value={formData.area}
                    onChange={(e) => handleAreaChange(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm font-medium focus:outline-hidden focus:border-amber-500 bg-white cursor-pointer"
                  >
                    {BUSINESS_CONFIG.deliveryAreas.map((area) => (
                      <option key={area.name} value={area.name}>
                        {area.name} (Delivery: Rs. {area.fee})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    disabled
                    value={BUSINESS_CONFIG.city}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm font-medium bg-neutral-100 text-neutral-600 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Instructions */}
              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1.5">
                  Special Cooking or Delivery Instructions (Optional)
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                  <textarea
                    rows={2}
                    maxLength={200}
                    placeholder="e.g. Extra sauce, no pickles, ring doorbell twice"
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    className="w-full pl-10 pr-3 py-3 rounded-xl border border-neutral-200 text-sm font-medium focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div className="flex justify-between text-[11px] text-neutral-400 mt-1">
                  <span>Max 200 characters</span>
                  <span>{formData.instructions.length}/200</span>
                </div>
                {errors.instructions && <p className="text-[11px] text-rose-500 mt-1">{errors.instructions}</p>}
              </div>
            </div>

            {/* Payment Method Selector - COD ONLY */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs space-y-4">
              <h2 className="text-xl font-black text-neutral-900 pb-3 border-b border-neutral-100 flex items-center gap-2">
                <Banknote className="w-5 h-5 text-amber-500" />
                <span>2. Payment Method</span>
              </h2>

              <div className="p-4 rounded-2xl border-2 border-amber-500 bg-amber-50/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center font-bold">
                    <Banknote className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-neutral-900">Cash on Delivery (COD)</h4>
                    <p className="text-xs text-neutral-600">Pay cash directly to the rider upon receiving your hot meal</p>
                  </div>
                </div>
                <span className="w-4 h-4 rounded-full bg-amber-500 border-2 border-white shadow-xs"></span>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Confirm */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs space-y-6">
              <h3 className="text-lg font-black text-neutral-900 pb-3 border-b border-neutral-100">
                Your Order ({cart.reduce((s, i) => s + i.quantity, 0)} items)
              </h3>

              {/* Items List */}
              <div className="max-h-60 overflow-y-auto divide-y divide-neutral-100 pr-1">
                {cart.map((item) => (
                  <div key={item.product.id} className="py-3 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-10 h-10 rounded-lg object-cover"
                        width="40"
                        height="40"
                        loading="lazy"
                      />
                      <div>
                        <p className="font-bold text-neutral-900 text-xs sm:text-sm">{item.product.name}</p>
                        <p className="text-[11px] text-neutral-400">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-neutral-800 text-xs sm:text-sm">
                      Rs. {(item.product.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Financial Calculation */}
              <div className="space-y-2.5 text-xs sm:text-sm pt-4 border-t border-neutral-100">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-neutral-900">Rs. {cartSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Delivery ({selectedArea})</span>
                  <span className="font-semibold">
                    {effectiveDeliveryFee === 0 ? (
                      <span className="text-emerald-600 font-bold">FREE</span>
                    ) : (
                      `Rs. ${effectiveDeliveryFee}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-neutral-900 pt-3 border-t border-neutral-200">
                  <span>Total Amount (COD)</span>
                  <span className="text-xl text-amber-600">Rs. {grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Submit Button with Spinner & Double-Submit Protection */}
              <button
                type="submit"
                disabled={isSubmitting || (isProd && !isDbOperational)}
                className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black rounded-2xl shadow-lg shadow-amber-500/25 transition active:scale-98 text-base flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Verifying & Placing Order...</span>
                  </>
                ) : isProd && !isDbOperational ? (
                  <span>Checkout Blocked (Database Offline)</span>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Confirm & Place Order (COD)</span>
                  </>
                )}
              </button>

              {/* WhatsApp Confirmation Reminder */}
              <p className="text-center text-xs font-semibold text-neutral-500">
                After placing your order you'll send it to us on WhatsApp to confirm.
              </p>

              {submitError && (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 text-xs font-bold text-amber-700 bg-amber-50 rounded-xl hover:bg-amber-100 flex items-center justify-center gap-1.5 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Order Placement</span>
                </button>
              )}

              <div className="flex items-center justify-center gap-2 text-xs text-neutral-400">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Delivery across {BUSINESS_CONFIG.city} in {BUSINESS_CONFIG.estimatedDeliveryTime}</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
