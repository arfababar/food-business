import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { BUSINESS_CONFIG, isRestaurantOpen } from "../config/business";
import { ShoppingBag, Menu as MenuIcon, X, Phone, UtensilsCrossed } from "lucide-react";

export default function Navbar() {
  const { totalItems, cartSubtotal } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const openNow = isRestaurantOpen();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Menu", path: "/menu" },
    { name: "Deals", path: "/menu?category=deals" },
    { name: "About Us", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path.startsWith("/menu") && location.pathname === "/menu") {
      if (path.includes("deals") && location.search.includes("deals")) return true;
      if (!path.includes("deals") && !location.search.includes("deals")) return true;
    }
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 shadow-xs">
      {/* Top Announcement Bar */}
      <div className="bg-neutral-900 text-neutral-200 text-xs py-1.5 px-4 hidden sm:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="bg-amber-500 text-neutral-900 text-[10px] font-bold px-1.5 py-0.5 rounded">FREE DELIVERY</span>
            <span>Free delivery on orders over Rs. {BUSINESS_CONFIG.freeDeliveryThreshold.toLocaleString()} in {BUSINESS_CONFIG.city}!</span>
          </div>
          <div className="flex items-center space-x-4">
            <a href={`tel:${BUSINESS_CONFIG.hotlineTel}`} className="flex items-center gap-1 hover:text-amber-400 transition">
              <Phone className="w-3 h-3 text-amber-500" />
              <span>Order Hotline: {BUSINESS_CONFIG.hotlineDisplay}</span>
            </a>
            <span>•</span>
            <span className={openNow ? "text-emerald-400 font-medium" : "text-amber-400 font-medium"}>
              {openNow ? "● Kitchen is OPEN" : "○ Currently CLOSED"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900 block leading-tight">
                BABA <span className="text-amber-600">HAFEEZ</span>
              </span>
              <span className="text-[11px] font-bold tracking-widest uppercase text-neutral-500 block">
                {BUSINESS_CONFIG.tagline} • {BUSINESS_CONFIG.city}
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive(link.path)
                    ? "bg-amber-50 text-amber-700 font-bold"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Cart & Action Buttons */}
          <div className="flex items-center space-x-3">
            <Link
              to="/cart"
              className="relative flex items-center gap-2.5 bg-neutral-900 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md active:scale-95"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-500 text-neutral-900 text-xs font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">
                {cartSubtotal > 0 ? `Rs. ${cartSubtotal.toLocaleString()}` : "Cart"}
              </span>
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl text-neutral-700 hover:bg-neutral-100 focus:outline-hidden"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-neutral-200 px-4 pt-2 pb-6 space-y-2 shadow-xl">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-3 rounded-xl text-base font-semibold ${
                isActive(link.path)
                  ? "bg-amber-500 text-white font-bold"
                  : "text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-neutral-100 flex flex-col gap-2">
            <a
              href={`tel:${BUSINESS_CONFIG.hotlineTel}`}
              className="flex items-center justify-center gap-2 py-3 bg-neutral-100 rounded-xl text-neutral-800 text-sm font-semibold"
            >
              <Phone className="w-4 h-4 text-amber-600" /> Call {BUSINESS_CONFIG.hotlineDisplay}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}