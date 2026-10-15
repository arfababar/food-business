import SEO from "../components/SEO";
import { BUSINESS_CONFIG } from "../config/business";
import { ShieldCheck } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="bg-neutral-50 min-h-screen py-12 sm:py-16">
      <SEO title="Privacy Policy" description={`Privacy Policy for ${BUSINESS_CONFIG.name} customer ordering.`} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200/80 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-neutral-100">
            <ShieldCheck className="w-8 h-8 text-amber-500" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-neutral-900">Privacy Policy</h1>
              <p className="text-xs text-neutral-500">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <section className="space-y-3 text-sm text-neutral-700 leading-relaxed">
            <h3 className="font-bold text-base text-neutral-900">1. Information We Collect</h3>
            <p>
              When you place an order on {BUSINESS_CONFIG.name}, we collect personal details necessary to fulfill your delivery, including your name, contact phone/WhatsApp number, and delivery street address in {BUSINESS_CONFIG.city}.
            </p>
          </section>

          <section className="space-y-3 text-sm text-neutral-700 leading-relaxed">
            <h3 className="font-bold text-base text-neutral-900">2. How We Use Your Information</h3>
            <p>
              Your contact details are solely used to:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
              <li>Confirm and prepare your food order at our kitchen.</li>
              <li>Provide dispatch and delivery instructions to our rider.</li>
              <li>Send WhatsApp delivery updates and order receipts.</li>
            </ul>
          </section>

          <section className="space-y-3 text-sm text-neutral-700 leading-relaxed">
            <h3 className="font-bold text-base text-neutral-900">3. Data Protection</h3>
            <p>
              We do not sell, rent, or share customer contact details with third-party advertisers. All customer records are stored securely.
            </p>
          </section>

          <section className="space-y-3 text-sm text-neutral-700 leading-relaxed">
            <h3 className="font-bold text-base text-neutral-900">4. Contact Us</h3>
            <p>
              If you have any questions regarding your data, contact our hotline at {BUSINESS_CONFIG.hotlineDisplay} or via email at {BUSINESS_CONFIG.email}.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
