import SEO from "../components/SEO";
import { BUSINESS_CONFIG } from "../config/business";
import { FileText } from "lucide-react";

export default function TermsRefund() {
  return (
    <div className="bg-neutral-50 min-h-screen py-12 sm:py-16">
      <SEO title="Terms & Refund Policy" description={`Terms of service and refund policies for ${BUSINESS_CONFIG.name}.`} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200/80 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-neutral-100">
            <FileText className="w-8 h-8 text-amber-500" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-neutral-900">Terms & Refund Policy</h1>
              <p className="text-xs text-neutral-500">Effective for all orders across {BUSINESS_CONFIG.city}</p>
            </div>
          </div>

          <section className="space-y-3 text-sm text-neutral-700 leading-relaxed">
            <h3 className="font-bold text-base text-neutral-900">1. Ordering & Acceptance</h3>
            <p>
              By placing an order on our website, you agree to receive food prepared to order and pay the full total in Cash on Delivery (COD) upon receiving your meal from our rider.
            </p>
          </section>

          <section className="space-y-3 text-sm text-neutral-700 leading-relaxed">
            <h3 className="font-bold text-base text-neutral-900">2. Delivery Time & Conditions</h3>
            <p>
              Standard delivery takes approximately {BUSINESS_CONFIG.estimatedDeliveryTime}. Weather, traffic conditions, or kitchen rush hours in {BUSINESS_CONFIG.city} may occasionally extend delivery times. We use thermal bags to maintain hot food temperature.
            </p>
          </section>

          <section className="space-y-3 text-sm text-neutral-700 leading-relaxed">
            <h3 className="font-bold text-base text-neutral-900">3. Refund & Replacement Policy</h3>
            <p>
              Your satisfaction is our primary priority:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li><strong>Incorrect or Missing Items:</strong> If any item in your order is missing or incorrect, please alert our hotline at {BUSINESS_CONFIG.hotlineDisplay} or WhatsApp within 1 hour. We will immediately dispatch the missing item or issue a full refund for that item.</li>
              <li><strong>Food Quality Issues:</strong> If you are genuinely dissatisfied with the quality or temperature of your food, our kitchen supervisor will review and offer an immediate replacement meal free of charge.</li>
              <li><strong>Order Cancellation:</strong> Because food is freshly cooked immediately upon receipt, order cancellations must be made within 5 minutes of placing your order by calling our hotline.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
