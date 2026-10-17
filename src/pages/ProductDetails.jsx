import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProducts } from "../services/api";
import { useCart } from "../context/CartContext";
import { BUSINESS_CONFIG } from "../config/business";
import ProductCard from "../components/ProductCard";
import { 
  ArrowLeft, 
  Star, 
  Clock, 
  Flame, 
  ShieldCheck, 
  Sparkles, 
  Plus, 
  Minus, 
  ShoppingBag,
  CheckCircle2,
  Loader2
} from "lucide-react";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getProducts().then(({ data }) => {
      if (isMounted) {
        setAllProducts(data);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const product = allProducts.find((item) => String(item.id) === String(id));

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-3" />
        <p className="text-sm font-bold text-neutral-600">Loading item details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <h2 className="text-3xl font-extrabold text-neutral-900 mb-2">Item Not Found</h2>
        <p className="text-neutral-500 mb-6">Sorry, we couldn't find the menu item you were looking for.</p>
        <Link
          to="/menu"
          className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-xl font-bold hover:bg-amber-600 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Full Menu
        </Link>
      </div>
    );
  }

  const relatedProducts = allProducts
    .filter((item) => item.category === product.category && String(item.id) !== String(product.id))
    .slice(0, 3);

  const existingInCart = cart.find((item) => item.product.id === product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  return (
    <div className="py-8 sm:py-12 bg-neutral-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-neutral-500 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-neutral-700 hover:text-amber-600 font-semibold transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <span>/</span>
          <Link to="/" className="hover:text-amber-600">Home</Link>
          <span>/</span>
          <Link to="/menu" className="hover:text-amber-600">Menu</Link>
          <span>/</span>
          <span className="text-neutral-900 font-medium truncate">{product.name}</span>
        </div>

        {/* Main Product Showcase Card */}
        <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-sm overflow-hidden mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 p-6 sm:p-10 lg:p-12 items-center">
            {/* Left: Product Image */}
            <div className="relative rounded-2xl overflow-hidden aspect-square bg-neutral-100 flex items-center justify-center shadow-inner">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover object-center"
                width="500"
                height="500"
                loading="eager"
              />
              {product.badge && (
                <span className="absolute top-4 left-4 bg-amber-500 text-neutral-900 text-xs font-black uppercase px-3 py-1.5 rounded-full shadow-md">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Right: Product Info & Order Action */}
            <div className="flex flex-col justify-center">
              {/* Category & Rating */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-widest font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                  {product.category}
                </span>
                <div className="flex items-center gap-1.5 text-amber-500 font-bold text-sm">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{product.rating || "4.9"}</span>
                  <span className="text-neutral-400 font-normal">({product.reviews || 80} reviews)</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight mb-4">
                {product.name}
              </h1>

              {/* Price & Discounts */}
              <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-neutral-100">
                <span className="text-3xl sm:text-4xl font-black text-neutral-900">
                  Rs. {product.price.toLocaleString()}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="text-lg text-neutral-400 line-through">
                      Rs. {product.originalPrice.toLocaleString()}
                    </span>
                    <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2.5 py-1 rounded-md">
                      Save Rs. {(product.originalPrice - product.price).toLocaleString()}
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              <p className="text-neutral-600 text-base leading-relaxed mb-8">
                {product.description}
              </p>

              {/* Meta details */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3 p-3.5 bg-neutral-50 rounded-2xl border border-neutral-100">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <div>
                    <span className="text-xs text-neutral-400 block font-medium">Prep Time</span>
                    <span className="text-sm font-bold text-neutral-800">{product.prepTime || "15 mins"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3.5 bg-neutral-50 rounded-2xl border border-neutral-100">
                  <Flame className="w-5 h-5 text-orange-600" />
                  <div>
                    <span className="text-xs text-neutral-400 block font-medium">Spiciness</span>
                    <span className="text-sm font-bold text-neutral-800">{product.spicyLevel || "Regular"}</span>
                  </div>
                </div>
              </div>

              {/* Quantity Selector & Add to Cart */}
              <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  {/* Quantity controls */}
                  <div className="flex items-center justify-between border-2 border-neutral-200 rounded-2xl p-1 bg-white">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-12 h-12 flex items-center justify-center rounded-xl text-neutral-700 hover:bg-neutral-100 transition cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-6 font-black text-lg text-neutral-900">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-12 h-12 flex items-center justify-center rounded-xl text-neutral-700 hover:bg-neutral-100 transition cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Add Button */}
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 flex items-center justify-center gap-3 bg-neutral-900 hover:bg-amber-600 text-white py-4 px-8 rounded-2xl font-bold text-base transition-all shadow-md active:scale-98 cursor-pointer"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span>Add to Cart • Rs. {(product.price * quantity).toLocaleString()}</span>
                  </button>
                </div>

                {existingInCart && (
                  <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5 pt-1">
                    <CheckCircle2 className="w-4 h-4" />
                    You currently have {existingInCart.quantity} of this item in your cart.
                  </p>
                )}
              </div>

              {/* Trust badges */}
              <div className="mt-8 pt-6 border-t border-neutral-100 grid grid-cols-2 gap-3 text-xs text-neutral-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Fresh Meat Guaranteed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Cooked Fresh in {BUSINESS_CONFIG.city}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Items Section */}
        {relatedProducts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-extrabold text-neutral-900">You Might Also Like</h2>
              <Link to="/menu" className="text-sm font-bold text-amber-600 hover:text-amber-700">
                View All Menu →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}