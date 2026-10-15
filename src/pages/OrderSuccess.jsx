import { useState, useEffect } from "react";
import { useLocation, useSearchParams, Link, Navigate } from "react-router-dom";
import { BUSINESS_CONFIG } from "../config/business";
import { getOrderByNumber } from "../services/api";
import { buildWhatsAppOrderLink } from "../utils/whatsapp";
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  MessageCircle, 
  ShoppingBag,
  Loader2,
  PackageCheck
} from "lucide-react";

export default function OrderSuccess() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const orderIdFromState = location.state?.orderId || location.state?.order?.orderId;
  const orderIdFromQuery = searchParams.get("order");
  const targetOrderId = orderIdFromState || orderIdFromQuery;

  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);

  useEffect(() => {
    let isMounted = true;
    if (targetOrderId && (!order || order.orderId !== targetOrderId)) {
      getOrderByNumber(targetOrderId).then((found) => {
        if (isMounted) {
          setOrder(found);
          setLoading(false);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [targetOrderId, order]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-3" />
        <p className="text-sm font-bold text-neutral-600">Retrieving order details...</p>
      </div>
    );
  }

  if (!order) {
    return <Navigate to="/" replace />;
  }

  const { orderId, items, customer, total, deliveryFee, subtotal, status } = order;

  const waLink = buildWhatsAppOrderLink({
    orderNumber: orderId,
    customerName: customer.fullName,
    phone: customer.phone,
    address: customer.address,
    area: customer.area,
    city: customer.city,
    items,
    total,
    deliveryFee,
    instructions: customer.instructions,
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
        return { label: "Order Received & Confirmed", color: "bg-emerald-100 text-emerald-800" };
    }
  };

  const statusInfo = getStatusBadge(status);

  return (
    <div className="bg-neutral-50 min-h-screen py-12 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Celebration Header */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200/80 shadow-xs text-center mb-8">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
            <span className="bg-neutral-900 text-amber-400 text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider">
              Order #{orderId}
            </span>
            <span className={`text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 mt-2 mb-2 tracking-tight">
            Thank You, {customer.fullName}!
          </h1>
          <p className="text-neutral-500 text-sm max-w-md mx-auto">
            Your meal is now being freshly prepared in our {BUSINESS_CONFIG.city} kitchen. Our rider will reach your address with your hot food!
          </p>

          {/* Delivery ETA Alert */}
          <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-center gap-3 text-amber-900 font-bold text-sm">
            <Clock className="w-5 h-5 text-amber-600" />
            <span>Estimated Delivery Time: {BUSINESS_CONFIG.estimatedDeliveryTime}</span>
          </div>

          {/* Quick Contact & WhatsApp Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm transition shadow-sm"
            >
              <MessageCircle className="w-4 h-4" /> Message on WhatsApp ({BUSINESS_CONFIG.hotlineDisplay})
            </a>

            <Link
              to="/menu"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl font-bold text-sm transition"
            >
              <ShoppingBag className="w-4 h-4" /> Order More Food
            </Link>
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

          {/* Customer info recap */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-neutral-600 pb-4 border-b border-neutral-100">
            <div>
              <span className="font-bold text-neutral-800 block mb-1">Delivering To:</span>
              <p className="flex items-start gap-1.5">
                <MapPin className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>{customer.address}, {customer.area}, {customer.city}</span>
              </p>
            </div>
            <div>
              <span className="font-bold text-neutral-800 block mb-1">Contact Phone:</span>
              <p className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>{customer.phone}</span>
              </p>
              <span className="font-bold text-neutral-800 block mt-2 mb-0.5">Payment Method:</span>
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
