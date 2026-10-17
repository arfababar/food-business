import { Link } from "react-router-dom";
import { BUSINESS_CONFIG, isRestaurantOpen } from "../config/business";
import { Phone, Clock, MapPin, MessageCircle, Utensils, Truck } from "lucide-react";

export default function Footer() {
  const openNow = isRestaurantOpen();

  return (
    <footer className="bg-neutral-900 text-neutral-300 mt-auto border-t border-neutral-800">
      {/* Top Value Banner */}
      <div className="border-b border-neutral-800 bg-neutral-950/60 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
              <Utensils className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold">Fresh Meat & Ingredients</h4>
              <p className="text-xs text-neutral-400">Quality fresh poultry & prime beef prepared daily</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold">Fast {BUSINESS_CONFIG.estimatedDeliveryTime} Delivery</h4>
              <p className="text-xs text-neutral-400">Delivered hot & crispy across {BUSINESS_CONFIG.city}</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold">WhatsApp Direct Order</h4>
              <p className="text-xs text-neutral-400">Instant confirmation & rider updates</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Column */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-black tracking-tight text-white">
              {(() => {
                const parts = BUSINESS_CONFIG.name.split(" ");
                if (parts.length <= 1) return <span className="text-amber-500">{BUSINESS_CONFIG.name}</span>;
                return (
                  <>
                    {parts.slice(0, -1).join(" ")}{" "}
                    <span className="text-amber-500">{parts[parts.length - 1]}</span>
                  </>
                );
              })()}
            </span>
          </div>
          <p className="text-sm text-neutral-400 leading-relaxed">
            {BUSINESS_CONFIG.description}
          </p>
          <div className="pt-2">
            <a
              href={`https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encodeURIComponent(`Hi ${BUSINESS_CONFIG.name}, I want to order!`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition"
            >
              <MessageCircle className="w-4 h-4" /> Order on WhatsApp
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-base">Quick Links</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/" className="hover:text-amber-400 transition">Home</Link></li>
            <li><Link to="/menu" className="hover:text-amber-400 transition">Our Menu</Link></li>
            <li><Link to="/menu?category=deals" className="hover:text-amber-400 transition">Value Deals</Link></li>
            <li><Link to="/about" className="hover:text-amber-400 transition">About {BUSINESS_CONFIG.name}</Link></li>
            <li><Link to="/contact" className="hover:text-amber-400 transition">Contact & Location</Link></li>
            <li><Link to="/cart" className="hover:text-amber-400 transition">Shopping Cart</Link></li>
          </ul>
        </div>

        {/* Working Hours */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-base">Opening Hours</h4>
          <ul className="space-y-2 text-sm text-neutral-400">
            <li className="flex justify-between pb-1 border-b border-neutral-800">
              <span>Monday - Thursday</span>
              <span className="text-white font-medium">12:00 PM - 1:00 AM</span>
            </li>
            <li className="flex justify-between pb-1 border-b border-neutral-800">
              <span>Friday</span>
              <span className="text-white font-medium">2:00 PM - 2:00 AM</span>
            </li>
            <li className="flex justify-between pb-1 border-b border-neutral-800">
              <span>Saturday - Sunday</span>
              <span className="text-white font-medium">12:00 PM - 2:00 AM</span>
            </li>
            <li className="pt-2 text-xs flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${openNow ? "bg-emerald-400 animate-pulse" : "bg-neutral-500"}`}></span>
              <span className={openNow ? "text-emerald-400" : "text-neutral-400"}>
                {openNow ? "Kitchen is currently OPEN" : "Kitchen is currently CLOSED"}
              </span>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-base">Contact & Kitchen</h4>
          <ul className="space-y-3 text-sm text-neutral-400">
            <li className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <span>{BUSINESS_CONFIG.address}</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <a href={`tel:${BUSINESS_CONFIG.hotlineTel}`} className="hover:text-white transition">
                {BUSINESS_CONFIG.hotlineDisplay}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <span>Average Delivery Time: {BUSINESS_CONFIG.estimatedDeliveryTime}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-800 py-6 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} {BUSINESS_CONFIG.name}. All Rights Reserved.</p>
          <p className="text-amber-500 font-semibold tracking-wide">Demo project. Not a real restaurant.</p>
          <div className="flex gap-4">
            <Link to="/privacy-policy" className="hover:text-amber-400 transition">Privacy Policy</Link>
            <span>•</span>
            <Link to="/terms-refund" className="hover:text-amber-400 transition">Terms & Refund</Link>
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-neutral-400 font-semibold">Payment Accepted: Cash on Delivery (COD)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
