import { useState, useEffect } from "react";
import { useSearchParams, useLocation, Link } from "react-router-dom";
import { BUSINESS_CONFIG } from "../config/business";
import { getOrderByNumber } from "../services/api";
import { buildWhatsAppOrderLink, buildWhatsAppShortLink, cleanAddressAndArea } from "../utils/whatsapp";
import { 
  MapPin, 
  Phone, 
  MessageCircle, 
  ShoppingBag, 
  Loader2, 
  PackageCheck,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  HelpCircle
} from "lucide-react";

function NoOrderSpecified() {
  return (
    <div className="bg-neutral-50 min-h-[70vh] flex items-center justify-center py-16 px-4 sm:px-6">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-neutral-200/80 shadow-xs text-center">
        <div className="w-16 h-16 bg-neutral-100 text-neutral-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <HelpCircle className="w-8 h-8 text-neutral-500" />
        </div>
        <h1 className="text-2xl font-black text-neutral-900 tracking-tight mb-2">
          No order specified
        </h1>
        <p className="text-neutral-500 text-sm mb-6">
          No order reference was provided in the URL. Please verify your order confirmation link or browse our menu to place an order with {BUSINESS_CONFIG.name}.
        </p>
        <Link
          to="/menu"
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold rounded-xl text-sm transition shadow-sm"
        >
          <ShoppingBag className="w-4 h-4" /> Browse Menu
        </Link>
      </div>
    </div>
  );
}

function OrderDetails({ orderNumber }) {
  const location = useLocation();
  const [status, setStatus] = useState("loading"); // "loading" | "found" | "not_found" | "error"
  const [order, setOrder] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const handleRetry = () => {
    setStatus("loading");
    setErrorMessage("");
    setRetryCount((c) => c + 1);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [status]);

  useEffect(() => {
    let isMounted = true;

    // 10-second timeout guard to guarantee it never spins forever
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        setStatus("error");
        setErrorMessage("Request timed out while retrieving your order. Please check your connection and retry.");
      }
    }, 10000);

    // Database lookup (independent of localStorage or router state)
    getOrderByNumber(orderNumber)
      .then((res) => {
        if (!isMounted) return;
        clearTimeout(timeoutId);

        if (res.error) {
          setStatus("error");
          setErrorMessage(res.error);
        } else if (!res.data) {
          setStatus("not_found");
        } else {
          setOrder(res.data);
          setStatus("found");
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        clearTimeout(timeoutId);
        setStatus("error");
        setErrorMessage(err.message || "Failed to load order details. Please check your connection.");
      });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [orderNumber, retryCount]);

  // Loading state (with 10-second timeout)
  if (status === "loading") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-3" />
        <h2 className="text-base font-bold text-neutral-800">Retrieving order details...</h2>
        <p className="text-xs text-neutral-500 mt-1">
          Fetching details for order reference {orderNumber}...
        </p>
      </div>
    );
  }

  // Not Found state
  if (status === "not_found") {
    return (
      <div className="bg-neutral-50 min-h-[70vh] flex items-center justify-center py-16 px-4 sm:px-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-neutral-200/80 shadow-xs text-center">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight mb-2">
            We couldn't find that order
          </h1>
          <p className="text-neutral-500 text-sm mb-6">
            We could not find an order matching <strong className="text-neutral-800 font-bold">#{orderNumber}</strong>. Please confirm the order number or reach out to us.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/menu"
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold rounded-xl text-xs transition"
            >
              <ShoppingBag className="w-4 h-4" /> Browse Menu
            </Link>
            <a
              href={`tel:${BUSINESS_CONFIG.hotlineTel}`}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold rounded-xl text-xs transition"
            >
              <Phone className="w-4 h-4" /> Call Hotline
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Error state with Retry button
  if (status === "error" || !order) {
    return (
      <div className="bg-neutral-50 min-h-[70vh] flex items-center justify-center py-16 px-4 sm:px-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-rose-200 shadow-xs text-center">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <AlertTriangle className="w-8 h-8 text-rose-600" />
          </div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight mb-2">
            Unable to Load Order
          </h1>
          <p className="text-neutral-600 text-sm mb-6">
            {errorMessage || "An unexpected error occurred while communicating with the database."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleRetry}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold rounded-xl text-xs transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
            <Link
              to="/menu"
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold rounded-xl text-xs transition"
            >
              <ShoppingBag className="w-4 h-4" /> Browse Menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Found state: render full order receipt
  const routerStateOrder = location.state?.orderDetails;

  const { orderId, items, customer, total, deliveryFee, subtotal, status: orderStatus } = order;
  const firstName = routerStateOrder?.customer?.fullName || customer?.firstName || customer?.fullName || "Valued Customer";

  // Build WhatsApp link:
  // If we have router state right after ordering, send the full order details.
  // On refresh or direct link without router state, build the short message.
  const waLink = (routerStateOrder && routerStateOrder.orderId === orderId)
    ? buildWhatsAppOrderLink({
        orderNumber: orderId,
        customerName: routerStateOrder.customer?.fullName || firstName,
        phone: routerStateOrder.customer?.phone || customer?.phone || "",
        address: routerStateOrder.customer?.address || customer?.address || "",
        area: routerStateOrder.customer?.area || customer?.area || "",
        city: routerStateOrder.customer?.city || customer?.city || BUSINESS_CONFIG.city,
        items: routerStateOrder.items || items,
        total: routerStateOrder.total || total,
        deliveryFee: routerStateOrder.deliveryFee ?? deliveryFee,
        instructions: routerStateOrder.customer?.instructions || "",
      })
    : buildWhatsAppShortLink({
        orderNumber: orderId,
        items: items || [],
        total: total || 0,
      });

  const getStatusBadge = (st) => {
    switch (st) {
      case "preparing":
        return { label: "Kitchen Preparing", color: "bg-amber-100 text-amber-800" };
      case "out_for_delivery":
        return { label: "Out for Delivery", color: "bg-blue-100 text-blue-800" };
      case "delivered":
        return { label: "Delivered", color: "bg-emerald-100 text-emerald-800" };
      default:
        return { label: "Waiting for WhatsApp confirmation", color: "bg-amber-100 text-amber-900 border border-amber-300" };
    }
  };

  const statusInfo = getStatusBadge(orderStatus);

  // Filter location parts so "undefined" is never rendered and area is not repeated
  const rawAddress = routerStateOrder?.customer?.address || customer?.address || "";
  const rawArea = routerStateOrder?.customer?.area || customer?.area || "";
  const displayCity = (routerStateOrder?.customer?.city || customer?.city || "").trim();

  const { streetAddress: cleanStreetAddress, area: displayArea } = cleanAddressAndArea(rawAddress, rawArea);
  const locationParts = [cleanStreetAddress, displayArea, displayCity].filter(Boolean);

  return (
    <div className="bg-neutral-50 min-h-screen py-4 sm:py-12">
      <div className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Top Prominent Notice & Primary WhatsApp Action Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-neutral-200/80 shadow-xs text-center mb-6">
          {/* Order Reference & Waiting Status Badge */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
            <span className="bg-neutral-900 text-amber-400 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
              Order #{orderId}
            </span>
            <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>

          {/* Prominent Required Confirmation Notice */}
          <div className="p-3.5 sm:p-4 bg-amber-50 rounded-2xl border-2 border-amber-400/80 mb-4 max-w-lg mx-auto">
            <h1 className="text-base sm:text-lg font-black text-amber-950 flex items-center justify-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <span>Almost done!</span>
            </h1>
            <p className="text-xs sm:text-sm font-bold text-amber-900 mt-1 leading-snug">
              Your order is not confirmed until you send it on WhatsApp.
            </p>
          </div>

          {/* Prominent Green WhatsApp Confirmation Button (Visible above the fold on 375px) */}
          <div className="max-w-md mx-auto">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 sm:py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-sm sm:text-base shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 transition transform active:scale-[0.99]"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>Send order on WhatsApp</span>
            </a>
            <p className="text-[11px] sm:text-xs text-neutral-500 mt-2 leading-relaxed">
              Tap above to send your order details to {BUSINESS_CONFIG.name} on WhatsApp.
            </p>

            {/* Secondary Actions: Call Us Hotline and Menu link */}
            <div className="flex flex-row items-center justify-center gap-2 sm:gap-3 mt-4">
              <a
                href={`tel:${BUSINESS_CONFIG.hotlineTel}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl font-bold text-xs transition"
              >
                <Phone className="w-3.5 h-3.5 text-neutral-600" /> Call us
              </a>

              <Link
                to="/menu"
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl font-bold text-xs transition"
              >
                <ShoppingBag className="w-3.5 h-3.5" /> Menu
              </Link>
            </div>

            <p className="text-[11px] text-neutral-400 mt-3 font-medium">
              Demo project: WhatsApp and phone numbers are placeholders.
            </p>
          </div>
        </div>

        {/* Order Receipt Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <h2 className="text-xl font-black text-neutral-900 flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-amber-500" />
              <span>Order Receipt</span>
            </h2>
            <span className="text-xs text-neutral-400">Cash on Delivery</span>
          </div>

          {/* Customer info recap: hides phone/address when missing; never shows "undefined" */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-neutral-600 pb-4 border-b border-neutral-100">
            {locationParts.length > 0 && (
              <div>
                <span className="font-bold text-neutral-800 block mb-1">Delivering To:</span>
                <p className="flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>{locationParts.join(", ")}</span>
                </p>
              </div>
            )}

            <div>
              {customer?.phone && (
                <div className="mb-2">
                  <span className="font-bold text-neutral-800 block mb-1">Contact Phone:</span>
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>{customer.phone}</span>
                  </p>
                </div>
              )}
              <span className="font-bold text-neutral-800 block mb-0.5">Payment Method:</span>
              <p className="uppercase text-amber-700 font-bold">Cash on Delivery (COD)</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="divide-y divide-neutral-100">
            {items.map((item, idx) => (
              <div key={idx} className="py-3 flex justify-between items-center text-sm">
                <div>
                  <span className="font-bold text-neutral-900">{item.quantity}x </span>
                  <span className="text-neutral-700">{item.product.name}</span>
                </div>
                <span className="font-bold text-neutral-900">
                  Rs. {(item.product.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-2 text-sm pt-4 border-t border-neutral-100">
            <div className="flex justify-between text-neutral-600">
              <span>Subtotal</span>
              <span>Rs. {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Delivery Fee</span>
              <span>{deliveryFee === 0 ? "FREE" : `Rs. ${deliveryFee}`}</span>
            </div>
            <div className="flex justify-between text-base font-black text-neutral-900 pt-2 border-t border-neutral-200">
              <span>Grand Total</span>
              <span className="text-amber-600 text-lg">Rs. {total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const orderNumber = (searchParams.get("order") || "").trim();

  if (!orderNumber) {
    return <NoOrderSpecified />;
  }

  return <OrderDetails orderNumber={orderNumber} />;
}
