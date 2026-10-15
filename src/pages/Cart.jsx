import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { BUSINESS_CONFIG } from "../config/business";
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  ArrowLeft, 
  Truck, 
  ShieldCheck
} from "lucide-react";

export default function Cart() {
  const { 
    cart, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    cartSubtotal, 
    deliveryFee, 
    grandTotal, 
    freeDeliveryThreshold,
    amountNeededForFreeDelivery 
  } = useCart();

  const navigate = useNavigate();

  const deliveryProgress = Math.min(
    100,
    Math.round((cartSubtotal / freeDeliveryThreshold) * 100)
  );

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 bg-neutral-50 text-center">
        <div className="w-24 h-24 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mb-6 shadow-inner">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-extrabold text-neutral-900 mb-2">Your Cart is Empty</h2>
        <p className="text-neutral-500 max-w-sm mb-8 text-sm">
          Looks like you haven't added any burgers or loaded fries to your cart yet.
        </p>
        <Link
          to="/menu"
          className="inline-flex items-center gap-2.5 px-8 py-4 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black rounded-2xl shadow-lg shadow-amber-500/25 transition active:scale-95"
        >
          <span>Explore Delicious Menu</span>
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50 min-h-screen py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-200 gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Your Order Cart</h1>
            <p className="text-xs text-neutral-500 mt-1">
              Review your items and proceed to instant checkout for {BUSINESS_CONFIG.city}
            </p>
          </div>
          <button
            onClick={clearCart}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg w-fit cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear Cart
          </button>
        </div>

        {/* Free Delivery Bar */}
        <div className="bg-white rounded-2xl p-4 border border-neutral-200/80 shadow-xs mb-8">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="flex items-center gap-1.5 text-neutral-800">
              <Truck className="w-4 h-4 text-amber-500" />
              {amountNeededForFreeDelivery === 0 ? (
                <span className="text-emerald-600">🎉 Congratulations! You have unlocked FREE Delivery!</span>
              ) : (
                <span>
                  Add <strong className="text-amber-600">Rs. {amountNeededForFreeDelivery.toLocaleString()}</strong> more to get <strong>FREE Delivery</strong>
                </span>
              )}
            </span>
            <span className="text-neutral-400">{deliveryProgress}%</span>
          </div>
          <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${deliveryProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs divide-y divide-neutral-100 overflow-hidden">
              {cart.map((item) => (
                <div key={item.product.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-center">
                  {/* Thumbnail */}
                  <Link
                    to={`/menu/${item.product.id}`}
                    className="w-24 h-24 rounded-2xl bg-neutral-100 overflow-hidden flex-shrink-0"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                      width="96"
                      height="96"
                      loading="lazy"
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex-1 text-center sm:text-left">
                    <Link
                      to={`/menu/${item.product.id}`}
                      className="font-bold text-base text-neutral-900 hover:text-amber-600 transition"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1">{item.product.description}</p>
                    <div className="text-sm font-semibold text-neutral-700 mt-2">
                      Rs. {item.product.price.toLocaleString()} each
                    </div>
                  </div>

                  {/* Controls & Subtotal */}
                  <div className="flex items-center gap-4">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-neutral-200 rounded-xl bg-neutral-50 p-0.5">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-600 hover:bg-neutral-200 transition cursor-pointer"
                        aria-label="Decrease"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-neutral-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-600 hover:bg-neutral-200 transition cursor-pointer"
                        aria-label="Increase"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="w-24 text-right">
                      <span className="font-black text-base text-neutral-900 block">
                        Rs. {(item.product.price * item.quantity).toLocaleString()}
                      </span>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-neutral-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2">
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 text-sm font-bold text-neutral-700 hover:text-amber-600 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Continue Ordering More Food</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Order Summary Card */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs space-y-6">
              <h2 className="text-xl font-black text-neutral-900 pb-4 border-b border-neutral-100">
                Order Summary
              </h2>

              {/* Breakdown */}
              <div className="space-y-3 text-sm pt-2">
                <div className="flex justify-between text-neutral-600">
                  <span>Cart Subtotal</span>
                  <span className="font-semibold text-neutral-900">
                    Rs. {cartSubtotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-neutral-600">
                  <span>Standard Delivery Fee</span>
                  <span className="font-semibold">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-600 font-bold uppercase">FREE</span>
                    ) : (
                      `Rs. ${deliveryFee}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-base font-black text-neutral-900 pt-3 border-t border-neutral-200">
                  <span>Estimated Total</span>
                  <span className="text-xl text-amber-600">
                    Rs. {grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Checkout Action Button */}
              <button
                onClick={() => navigate("/checkout")}
                className="w-full flex items-center justify-center gap-2 py-4 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black rounded-2xl shadow-lg shadow-amber-500/25 transition active:scale-98 text-base cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-neutral-400 pt-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Payment Accepted: Cash on Delivery (COD)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}