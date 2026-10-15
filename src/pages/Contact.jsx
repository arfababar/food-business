import { useState } from "react";
import { BUSINESS_CONFIG } from "../config/business";
import { Phone, Mail, MapPin, Clock, MessageCircle, Send, CheckCircle2, HelpCircle } from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    subject: "Order Inquiry",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.contact || !formData.message) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", contact: "", subject: "Order Inquiry", message: "" });
    }, 4000);
  };

  const faqs = [
    {
      q: "What areas do you deliver to in Gujranwala?",
      a: `We currently deliver across all major localities in Gujranwala including ${BUSINESS_CONFIG.deliveryAreas.map(a => a.name).slice(0, 6).join(", ")}, and surrounding areas.`,
    },
    {
      q: "What is the average delivery time?",
      a: `Our riders deliver within ${BUSINESS_CONFIG.estimatedDeliveryTime} on average depending on your location. We use thermal insulated food bags so your food arrives hot and crispy.`,
    },
    {
      q: "Is there a minimum order amount?",
      a: `There is no minimum order requirement! Orders of Rs. ${BUSINESS_CONFIG.freeDeliveryThreshold.toLocaleString()} or above automatically qualify for 100% FREE delivery.`,
    },
    {
      q: "What payment methods are supported?",
      a: "Currently, we accept Cash on Delivery (COD). You pay the rider in cash when your food is delivered.",
    },
  ];

  return (
    <div className="bg-neutral-50 min-h-screen py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-amber-600 font-extrabold text-xs uppercase tracking-widest block mb-1">
            Get in Touch
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight">
            Contact & Kitchen Location
          </h1>
          <p className="text-neutral-500 text-sm mt-2">
            Have questions about an order or feedback? Contact us or drop by our kitchen in {BUSINESS_CONFIG.city}!
          </p>
        </div>

        {/* 3 Quick Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          <a
            href={`tel:${BUSINESS_CONFIG.hotlineTel}`}
            className="p-6 bg-white rounded-3xl border border-neutral-200/80 shadow-xs hover:border-amber-500 transition group"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-neutral-900 mb-1">Order Phone Hotline</h3>
            <p className="text-xs text-neutral-500 mb-2">Speak directly with our front desk:</p>
            <span className="font-extrabold text-sm text-neutral-900">{BUSINESS_CONFIG.hotlineDisplay}</span>
          </a>

          <a
            href={`https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=Hi%20Baba%20Hafeez,%20inquiring%20about%20an%20order`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-6 bg-white rounded-3xl border border-neutral-200/80 shadow-xs hover:border-emerald-500 transition group"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-neutral-900 mb-1">WhatsApp Live Support</h3>
            <p className="text-xs text-neutral-500 mb-2">Quick response for orders & inquiries:</p>
            <span className="font-extrabold text-sm text-emerald-600">Chat with us on WhatsApp →</span>
          </a>

          <div className="p-6 bg-white rounded-3xl border border-neutral-200/80 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-neutral-900 mb-1">Kitchen Hours</h3>
            <p className="text-xs text-neutral-500 mb-2">Serving hot meals all week long:</p>
            <span className="font-bold text-xs text-neutral-900 block">{BUSINESS_CONFIG.hoursDisplay.weekdays}</span>
            <span className="font-bold text-xs text-neutral-900 block">{BUSINESS_CONFIG.hoursDisplay.weekend}</span>
          </div>
        </div>

        {/* Contact Form & Location */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-20">
          {/* Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 border border-neutral-200/80 shadow-xs">
            <h2 className="text-2xl font-black text-neutral-900 mb-2">Send Us a Direct Message</h2>
            <p className="text-xs text-neutral-500 mb-6">
              Fill out the form below and we will respond as soon as possible.
            </p>

            {submitted ? (
              <div className="p-8 bg-emerald-50 rounded-2xl text-center border border-emerald-200 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-lg font-black text-emerald-900">Message Received!</h3>
                <p className="text-xs text-emerald-700">
                  Thank you for reaching out. A team member from {BUSINESS_CONFIG.name} will get back to you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tariq Mehmood"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-hidden focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">Phone or Email *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 0300-0000000"
                      value={formData.contact}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-hidden focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">Subject</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-hidden focus:border-amber-500 bg-white"
                  >
                    <option value="Order Inquiry">Order Inquiry</option>
                    <option value="Food Quality Feedback">Food Quality Feedback</option>
                    <option value="Delivery Inquiry">Delivery Area Inquiry</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">Your Message *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us what's on your mind..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-neutral-900 hover:bg-amber-600 text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Send className="w-4 h-4" /> Send Message
                </button>
              </form>
            )}
          </div>

          {/* Location & Map */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-8 sm:p-10 border border-neutral-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-black text-neutral-900 mb-2">Our Kitchen & Takeaway</h2>
              <p className="text-xs text-neutral-500 mb-6">
                Pick up hot takeaways or order delivery anywhere in {BUSINESS_CONFIG.city}.
              </p>

              <div className="space-y-4 text-sm text-neutral-700 mb-6">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-neutral-900">{BUSINESS_CONFIG.name} Express Kitchen</strong>
                    <span>{BUSINESS_CONFIG.address}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <span>{BUSINESS_CONFIG.email}</span>
                </div>
              </div>
            </div>

            {/* Visual map preview mockup */}
            <div className="rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 h-52 relative flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&auto=format&fit=crop&q=80"
                alt="Map view placeholder"
                className="w-full h-full object-cover filter brightness-90"
                width="400"
                height="208"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-neutral-900/40 flex items-center justify-center">
                <a
                  href={BUSINESS_CONFIG.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-white text-neutral-900 rounded-xl text-xs font-bold shadow-lg hover:bg-amber-500 hover:text-white transition flex items-center gap-1.5"
                >
                  <MapPin className="w-4 h-4 text-rose-500" /> Open in Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200/80 shadow-xs">
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle className="w-6 h-6 text-amber-500" />
            <h2 className="text-2xl font-black text-neutral-900">Frequently Asked Questions</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, i) => (
              <div key={i} className="p-5 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-1.5">
                <h4 className="font-bold text-sm text-neutral-900">{faq.q}</h4>
                <p className="text-xs text-neutral-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
