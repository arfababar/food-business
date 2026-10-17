import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { Plus, Minus, Star, Clock, Flame } from "lucide-react";

export default function ProductCard({ product }) {
  const { cart, addToCart, updateQuantity } = useCart();
  const navigate = useNavigate();

  const cartItem = cart.find((item) => item.product.id === product.id);
  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleRowClick = () => {
    navigate(`/menu/${product.id}`);
  };

  return (
    <div
      onClick={handleRowClick}
      className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-neutral-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-row sm:flex-col group hover:-translate-y-1 cursor-pointer h-[116px] sm:h-auto min-h-[110px] max-h-[120px] sm:max-h-none"
    >
      {/* Product Image Area */}
      <div className="relative w-28 h-full sm:w-full sm:h-auto sm:aspect-4/3 bg-neutral-100 overflow-hidden flex-shrink-0">
        <img
          src={product.image || "/images/placeholder.svg"}
          alt={product.name}
          width="400"
          height="300"
          className="w-full h-full object-cover object-center group-hover:scale-105 sm:group-hover:scale-108 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/images/placeholder.svg";
          }}
        />

        {/* Badges */}
        <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 flex flex-col gap-1 items-start">
          {product.badge && (
            <span className="bg-amber-500 text-neutral-900 text-[9px] sm:text-[11px] font-black uppercase tracking-wider px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-full shadow-xs">
              {product.badge}
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-rose-500 text-white text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md sm:rounded-full shadow-xs">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Preparation Time - Hidden on mobile row to preserve space */}
        {product.prepTime && (
          <div className="hidden sm:flex absolute bottom-3 left-3 bg-neutral-900/80 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-full items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{product.prepTime}</span>
          </div>
        )}
      </div>

      {/* Product Details Content */}
      <div className="p-2.5 sm:p-5 flex-1 flex flex-col justify-between min-w-0">
        <div>
          {/* Rating and Meta (Desktop & Tablet) */}
          <div className="hidden sm:flex items-center justify-between text-xs text-neutral-500 mb-2">
            <div className="flex items-center gap-1 text-amber-600 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating || "4.8"}</span>
              <span className="text-neutral-400 font-normal">({product.reviews || "50+"})</span>
            </div>
            {product.spicyLevel && product.spicyLevel !== "None" && (
              <span className="flex items-center gap-1 text-orange-600 text-xs font-medium">
                <Flame className="w-3.5 h-3.5" />
                {product.spicyLevel}
              </span>
            )}
          </div>

          {/* Title - Max 2 lines truncated on mobile, 1 line on desktop */}
          <h3 className="font-bold text-sm sm:text-lg text-neutral-900 group-hover:text-amber-600 transition-colors line-clamp-2 sm:line-clamp-1 block mb-0.5 sm:mb-1.5 leading-snug">
            {product.name}
          </h3>

          {/* Short description - One line truncated on mobile, 2 lines on desktop */}
          <p className="text-[11px] sm:text-xs text-neutral-500 line-clamp-1 sm:line-clamp-2 leading-relaxed mb-1 sm:mb-4">
            {product.description}
          </p>
        </div>

        {/* Pricing and Action Row */}
        <div className="pt-1.5 sm:pt-3 sm:border-t sm:border-neutral-100 flex items-center justify-between mt-auto">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm sm:text-xl font-extrabold text-neutral-900 whitespace-nowrap">
                Rs. {product.price.toLocaleString()}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-[10px] sm:text-xs text-neutral-400 line-through whitespace-nowrap">
                  Rs. {product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* Quick Cart Action Button (stopPropagation prevents card row navigation) */}
          <div onClick={(e) => e.stopPropagation()}>
            {cartItem ? (
              <div className="flex items-center bg-amber-500 rounded-lg sm:rounded-xl p-0.5 sm:p-1 text-neutral-900 font-bold shadow-xs h-11 min-h-[44px]">
                <button
                  type="button"
                  onClick={() => updateQuantity(product.id, -1)}
                  className="w-8 sm:w-8 h-full flex items-center justify-center hover:bg-amber-600 rounded-md sm:rounded-lg transition active:scale-95 cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5 text-white" />
                </button>
                <span className="px-2 sm:px-3 text-xs sm:text-sm text-neutral-950 font-black">
                  {cartItem.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => updateQuantity(product.id, 1)}
                  className="w-8 sm:w-8 h-full flex items-center justify-center hover:bg-amber-600 rounded-md sm:rounded-lg transition active:scale-95 cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => addToCart(product, 1)}
                className="flex items-center justify-center gap-1 bg-neutral-900 hover:bg-amber-600 text-white px-3.5 sm:px-3.5 h-11 min-h-[44px] rounded-xl font-bold text-xs transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Add</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}