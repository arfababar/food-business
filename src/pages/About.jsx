import { Link } from "react-router-dom";
import { BUSINESS_CONFIG } from "../config/business";
import { ShieldCheck, Heart, Award, Users, UtensilsCrossed, ArrowRight } from "lucide-react";

export default function About() {
  return (
    <div className="bg-neutral-50 min-h-screen py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-amber-600 font-extrabold text-xs uppercase tracking-widest block mb-2">
            The Story Behind The Crunch
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
            Meet {BUSINESS_CONFIG.name}: Crafting Fast Food With Passion
          </h1>
          <p className="text-neutral-600 text-base sm:text-lg mt-4 leading-relaxed">
            What started as a dedicated passion to serve the crunchiest, juiciest burgers in {BUSINESS_CONFIG.city} has grown into a favorite spot for food enthusiasts across the city.
          </p>
        </div>

        {/* Story Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="relative rounded-3xl overflow-hidden aspect-4/3 shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1000&auto=format&fit=crop&q=80"
              alt="Kitchen preparing freshly cooked burgers"
              className="w-full h-full object-cover"
              width="600"
              height="450"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-transparent to-transparent flex items-end p-8">
              <p className="text-white font-bold text-lg">Freshly fried and assembled to order every single time.</p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900">
              Never Frozen, Always Golden & Crispy
            </h2>
            <p className="text-neutral-600 leading-relaxed text-sm sm:text-base">
              At <strong>{BUSINESS_CONFIG.name}</strong>, we believe great fast food begins with honest ingredients. We source our poultry fresh every morning, marinate it in our secret spice blend, and fry it in small batches to achieve that distinct, irresistible crunch.
            </p>
            <p className="text-neutral-600 leading-relaxed text-sm sm:text-base">
              From our freshly toasted buns to our house-made sauces and garlic mayo, every single burger is crafted with high dedication to flavor and kitchen cleanliness.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 bg-white rounded-2xl border border-neutral-200">
                <span className="text-3xl font-black text-amber-600 block">Fresh</span>
                <span className="text-xs text-neutral-500 font-semibold">Quality Ingredients</span>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-neutral-200">
                <span className="text-3xl font-black text-amber-600 block">{BUSINESS_CONFIG.estimatedDeliveryTime}</span>
                <span className="text-xs text-neutral-500 font-semibold">Average Delivery in {BUSINESS_CONFIG.city}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Core Pillars */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200/80 shadow-xs mb-20">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h3 className="text-2xl sm:text-3xl font-black text-neutral-900">Our Four Commitments</h3>
            <p className="text-xs text-neutral-500 mt-1">Standards that define every meal we serve</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-base text-neutral-900">Fresh Meat Sourcing</h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Daily procurement of fresh poultry and prime beef from verified local suppliers.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Award className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-base text-neutral-900">Kitchen Cleanliness</h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Our kitchen operates with strict sanitation routines and food safety standards.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Heart className="w-7 h-7 text-rose-500" />
              </div>
              <h4 className="font-bold text-base text-neutral-900">Authentic Recipes</h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Signature marinades and seasoning crafted to give you the ultimate flavorful crunch.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Users className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-base text-neutral-900">Fair Value</h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Generous portions and premium quality fast food priced fairly for everyone in {BUSINESS_CONFIG.city}.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-neutral-900 rounded-3xl p-8 sm:p-12 text-center text-white">
          <UtensilsCrossed className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-black mb-3">Ready to Taste the Difference?</h2>
          <p className="text-neutral-400 text-sm max-w-md mx-auto mb-6">
            Browse our menu now and experience hot, golden crunch delivered straight to your door in {BUSINESS_CONFIG.city}.
          </p>
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black rounded-2xl shadow-md transition"
          >
            <span>Order from {BUSINESS_CONFIG.name}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
