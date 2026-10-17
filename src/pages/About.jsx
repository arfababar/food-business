import { Link } from "react-router-dom";
import { BUSINESS_CONFIG } from "../config/business";
import { ShoppingBag, MessageCircle, Smartphone, Clock, UtensilsCrossed, ArrowRight } from "lucide-react";

export default function About() {
  return (
    <div className="bg-neutral-50 min-h-screen py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-amber-600 font-extrabold text-xs uppercase tracking-widest block mb-2">
            Online Ordering Demo
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
            About {BUSINESS_CONFIG.name}
          </h1>
          <p className="text-neutral-600 text-base sm:text-lg mt-4 leading-relaxed">
            {BUSINESS_CONFIG.name} is a demonstration fast food ordering website showcasing digital menu browsing, dynamic cart calculations, and WhatsApp order confirmation.
          </p>
        </div>

        {/* Story Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="relative rounded-3xl overflow-hidden aspect-4/3 shadow-xl">
            <img
              src="/images/about-burger.webp"
              alt="Fast food burger display"
              className="w-full h-full object-cover"
              width="600"
              height="450"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/images/placeholder.svg";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-transparent to-transparent flex items-end p-8">
              <p className="text-white font-bold text-lg">Modern storefront designed for smooth online ordering.</p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900">
              Interactive Restaurant Demo
            </h2>
            <p className="text-neutral-600 leading-relaxed text-sm sm:text-base">
              This demo showcases a full-featured digital storefront concept for {BUSINESS_CONFIG.name}. It demonstrates how quick-service food businesses can streamline takeout and delivery through automated workflows.
            </p>
            <p className="text-neutral-600 leading-relaxed text-sm sm:text-base">
              Visitors can explore menu categories, configure item quantities, review delivery estimates for {BUSINESS_CONFIG.city}, and generate formatted order summaries ready for messaging.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 bg-white rounded-2xl border border-neutral-200">
                <span className="text-3xl font-black text-amber-600 block">Fast</span>
                <span className="text-xs text-neutral-500 font-semibold">Online Checkout Flow</span>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-neutral-200">
                <span className="text-3xl font-black text-amber-600 block">{BUSINESS_CONFIG.estimatedDeliveryTime}</span>
                <span className="text-xs text-neutral-500 font-semibold">Estimated Delivery in {BUSINESS_CONFIG.city}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Core Features */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200/80 shadow-xs mb-20">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h3 className="text-2xl sm:text-3xl font-black text-neutral-900">Platform Features</h3>
            <p className="text-xs text-neutral-500 mt-1">Core capabilities built into this ordering experience</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-base text-neutral-900">Digital Menu</h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Categorized catalog with real-time price totals and deal combinations.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Smartphone className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-base text-neutral-900">Mobile-First UI</h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Responsive layouts crafted for easy one-thumb browsing on mobile devices.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <MessageCircle className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-base text-neutral-900">WhatsApp Confirmation</h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Instant generation of pre-formatted WhatsApp messages for order verification.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Clock className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-base text-neutral-900">Cash on Delivery</h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Simple, transparent COD billing calculation with local area delivery rates.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-neutral-900 rounded-3xl p-8 sm:p-12 text-center text-white">
          <UtensilsCrossed className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-black mb-3">Explore the Menu</h2>
          <p className="text-neutral-400 text-sm max-w-md mx-auto mb-6">
            Test the ordering flow by selecting items from our sample menu.
          </p>
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black rounded-2xl shadow-md transition"
          >
            <span>Browse {BUSINESS_CONFIG.name} Menu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
