import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { Plus, Minus, Star, Clock, Flame } from "lucide-react";

export default function ProductCard({ product }) {
  const { cart, addToCart, updateQuantity } = useCart();

  const cartItem = cart.find((item) => item.product.id === product.id);
  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-neutral-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group hover:-translate-y-1">
      {/* Product Image Area */}
      <div className="relative aspect-4/3 bg-neutral-100 overflow-hidden">
        <Link to={`/menu/${product.id}`} className="block w-full h-full">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {product.badge && (
            <span className="bg-amber-500 text-neutral-900 text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
              {product.badge}
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Preparation Time */}
        {product.prepTime && (
          <div className="absolute bottom-3 left-3 bg-neutral-900/80 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{product.prepTime}</span>
          </div>
        )}
      </div>

      {/* Product Details Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating and Meta */}
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
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

          {/* Title */}
          <Link
            to={`/menu/${product.id}`}
            className="font-bold text-lg text-neutral-900 group-hover:text-amber-600 transition-colors line-clamp-1 block mb-1.5"
          >
            {product.name}
          </Link>

          {/* Short description */}
          <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed mb-4">
            {product.description}
          </p>
        </div>

        {/* Pricing and Action */}
        <div className="pt-3 border-t border-neutral-100 flex items-center justify-between mt-auto">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-neutral-900">
                Rs. {product.price.toLocaleString()}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-neutral-400 line-through">
                  Rs. {product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* Quick Cart Action Button */}
          {cartItem ? (
            <div className="flex items-center bg-amber-500 rounded-xl p-1 text-neutral-900 font-bold shadow-sm">
              <button
                onClick={() => updateQuantity(product.id, -1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-amber-600 transition active:scale-95"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4 text-white" />
              </button>
              <span className="px-3 text-sm text-neutral-950 font-black">
                {cartItem.quantity}
              </span>
              <button
                onClick={() => updateQuantity(product.id, 1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-amber-600 transition active:scale-95"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4 text-white" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addToCart(product, 1)}
              className="flex items-center gap-1.5 bg-neutral-900 hover:bg-amber-600 text-white px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}