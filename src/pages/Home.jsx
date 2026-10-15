import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CATEGORIES } from "../data/products";
import { getProducts } from "../services/api";
import { BUSINESS_CONFIG } from "../config/business";
import ProductCard from "../components/ProductCard";
import { 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Flame, 
  MessageCircle, 
  Truck,
  Award
} from "lucide-react";

export default function Home() {
  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    let isMounted = true;
    getProducts().then(({ data }) => {
      if (isMounted) setAllProducts(data);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const featuredProducts = allProducts.filter((p) => p.isFeatured).slice(0, 4);
  const hotDeals = allProducts.filter((p) => p.category === "deals");

  return (
    <div className="bg-neutral-50 flex-1">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-neutral-900 text-white py-16 sm:py-24 lg:py-28">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-10 w-72 h-72 bg-rose-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{BUSINESS_CONFIG.city}'s Premium Fast Food</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-none">
                Bite Into The <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500">
                  Crispiest & Juiciest
                </span><br />
                Burgers In Town.
              </h1>

              <p className="text-neutral-300 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Handcrafted crispy zingers, gourmet smashed beef patties, and loaded cheesy fries seasoned with our authentic secret spice blend.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/menu"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-neutral-950 font-black rounded-2xl shadow-lg shadow-amber-500/25 transition-all hover:scale-102 active:scale-98"
                >
                  <span>Order Now</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <Link
                  to="/menu?category=deals"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 bg-white/10 hover:bg-white/15 text-white font-bold rounded-2xl border border-white/15 backdrop-blur-md transition-all"
                >
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>View Value Deals</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-8 border-t border-neutral-800 grid grid-cols-3 gap-4 text-center sm:text-left">
                <div>
                  <div className="text-2xl font-black text-amber-400">30-45 Min</div>
                  <div className="text-xs text-neutral-400">Average Delivery</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-amber-400">Fresh</div>
                  <div className="text-xs text-neutral-400">Cooked to Order</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-amber-400">Cash on Delivery</div>
                  <div className="text-xs text-neutral-400">Pay at Your Doorstep</div>
                </div>
              </div>
            </div>

            {/* Right Hero Image Column */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden border-2 border-amber-500/30 shadow-2xl shadow-amber-500/10 group">
                <img
                  src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900&auto=format&fit=crop&q=80"
                  alt="Delicious Zinger Burger"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  width="450"
                  height="450"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent"></div>
                
                {/* Floating Discount Tag */}
                <div className="absolute top-4 right-4 bg-amber-500 text-neutral-950 font-black text-xs px-3.5 py-1.5 rounded-full shadow-lg">
                  HOT SELLER
                </div>

                {/* Floating Bottom Card */}
                <div className="absolute bottom-4 left-4 right-4 bg-neutral-900/90 backdrop-blur-md p-4 rounded-2xl border border-neutral-700 text-left">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Chef's Favorite</p>
                      <h4 className="text-base font-bold text-white">Double Crunch Tower Zinger</h4>
                    </div>
                    <span className="text-lg font-black text-amber-400">Rs. 650</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Navigation Pills */}
      <section className="py-10 border-b border-neutral-200/60 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-neutral-900">Explore by Category</h3>
            <Link to="/menu" className="text-xs font-bold text-amber-600 hover:text-amber-700">
              See All Items →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={cat.id === "all" ? "/menu" : `/menu?category=${cat.id}`}
                className="p-4 rounded-2xl bg-neutral-50 hover:bg-amber-500 hover:text-white border border-neutral-200/80 transition-all duration-200 flex flex-col items-center justify-center text-center group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-white group-hover:bg-amber-400/30 flex items-center justify-center text-amber-600 group-hover:text-neutral-900 mb-2 transition shadow-xs">
                  <Flame className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold text-neutral-800 group-hover:text-white">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Items Showcase */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-amber-600 font-extrabold text-xs uppercase tracking-widest block mb-1">
                Handpicked Favorites
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight">
                Our Most Popular Bites
              </h2>
            </div>
            <Link
              to="/menu"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-600 hover:text-amber-700 transition"
            >
              <span>Explore Full Menu</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Hot Value Deals Banner */}
      <section className="py-16 bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 text-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-block bg-neutral-950 text-amber-400 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider mb-2">
              Save Big Today
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Exclusive Value Combos & Deals
            </h2>
            <p className="text-amber-100 text-sm mt-2">
              Loaded with crunch, drinks, and fries at unbeatable discounted prices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {hotDeals.map((deal) => (
              <div
                key={deal.id}
                className="bg-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-center shadow-xl border border-amber-200/50"
              >
                <div className="w-full sm:w-48 h-48 rounded-2xl overflow-hidden flex-shrink-0 bg-neutral-100">
                  <img
                    src={deal.image}
                    alt={deal.name}
                    className="w-full h-full object-cover"
                    width="192"
                    height="192"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between text-left">
                  <div>
                    <span className="bg-rose-100 text-rose-700 text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase">
                      {deal.badge || "SAVE BIG"}
                    </span>
                    <h3 className="text-xl font-black text-neutral-900 mt-2 mb-1.5">{deal.name}</h3>
                    <p className="text-xs text-neutral-600 leading-relaxed mb-4">{deal.description}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                    <div>
                      <span className="text-2xl font-black text-neutral-900">Rs. {deal.price}</span>
                      {deal.originalPrice && (
                        <span className="text-xs text-neutral-400 line-through ml-2">Rs. {deal.originalPrice}</span>
                      )}
                    </div>
                    <Link
                      to={`/menu/${deal.id}`}
                      className="px-4 py-2.5 bg-neutral-900 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition shadow-sm"
                    >
                      View Deal
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Baba Hafeez */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="text-amber-600 font-extrabold text-xs uppercase tracking-widest block mb-1">
              Quality You Can Taste
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight">
              Why Food Lovers Choose Us
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-2xl bg-neutral-50 border border-neutral-100">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-base text-neutral-900 mb-1.5">Fresh Poultry & Meat</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Only the freshest chicken and prime beef delivered daily from local verified suppliers.
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-neutral-50 border border-neutral-100">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4">
                <Award className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-base text-neutral-900 mb-1.5">Secret Recipe Spice</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Our crispy batter and marinade are perfected over years for an unbeatable savory crunch.
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-neutral-50 border border-neutral-100">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4">
                <Truck className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-base text-neutral-900 mb-1.5">Insulated Hot Delivery</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Thermal insulated packaging guarantees your burger and fries arrive piping hot and crunchy.
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-neutral-50 border border-neutral-100">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4">
                <MessageCircle className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-base text-neutral-900 mb-1.5">Direct WhatsApp Support</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Need extra sauce or custom cooking instructions? Our customer team responds quickly on WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Quick Order Callout Banner */}
      <section className="py-12 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-neutral-800 to-neutral-900 p-8 sm:p-12 rounded-3xl border border-neutral-700 flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
            <div>
              <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider block mb-1">
                Prefer Ordering via WhatsApp?
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                Message Us Directly on WhatsApp for Instant Booking
              </h3>
              <p className="text-neutral-400 text-sm mt-1 max-w-xl">
                Our kitchen will take your order, confirm rider dispatch, and send updates straight to your chat.
              </p>
            </div>
            <a
              href={`https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=Hi%20Baba%20Hafeez,%20I%20want%20to%20place%20an%20order!`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black rounded-2xl text-base transition-all shadow-lg shadow-emerald-500/25 active:scale-95 flex-shrink-0"
            >
              <MessageCircle className="w-5 h-5 fill-neutral-950" />
              <span>Order via WhatsApp ({BUSINESS_CONFIG.hotlineDisplay})</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}