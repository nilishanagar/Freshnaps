import React, { useEffect } from 'react';
import { FileText, AlertTriangle, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import SEOHead from '../components/common/SEOHead';

const TermsOfServicePage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-surface-950 py-12 md:py-16">
      <SEOHead
        title="Terms of Service"
        description="Freshnaps Terms of Service — Read our terms and conditions for shopping, shipping, returns, and warranty policies."
        path="/terms-of-service"
      />
      <div className="container-custom max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-950/20 flex items-center justify-center mx-auto mb-4 border border-primary-100 dark:border-primary-900/30">
            <FileText className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white font-display mb-3">
            Terms of Service
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Last Updated: July 14, 2026
          </p>
        </div>

        {/* Content */}
        <div className="prose dark:prose-invert prose-sm max-w-none text-gray-600 dark:text-gray-300 space-y-8 leading-relaxed">
          <section className="bg-gray-50 dark:bg-surface-900 rounded-2xl p-6 md:p-8 border border-gray-100 dark:border-surface-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
              <ShieldCheck size={18} className="text-primary-600 dark:text-primary-400" />
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing our website <strong>freshnapsmattress.com</strong> and purchasing FreshNaps products, you agree to be bound by these Terms of Service, all applicable laws and regulations, and agree that you are responsible for compliance. If you do not agree with any of these terms, you are prohibited from using this site.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-surface-800 pb-2">
              2. Sizing Standards & Industry Tolerances
            </h2>
            <p>
              Mattresses, pillows, and soft furnishing items are hand-assembled using flexible foam, memory gel, and quilted fabrics. 
            </p>
            <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-xl p-4 my-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 dark:text-amber-300 mb-0">
                <strong>Dimensional Tolerance Notice:</strong> Consistent with standard bedding industry specifications, a dimensional tolerance of <strong>±1.27 cm (0.5 inches)</strong> in length, width, and thickness is considered normal and acceptable. Such minor deviations do not constitute a manufacturing defect.
              </p>
            </div>
            <p>
              It is the customer's sole responsibility to measure their bed frame correctly before placing standard or custom orders. FreshNaps is not liable for wrong sizes ordered due to user measurement errors.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-surface-800 pb-2">
              3. Custom Size Mattress Orders
            </h2>
            <p>
              We offer bespoke sizes tailored to fit custom frames. The following special conditions apply to all custom-made items:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Pricing & Surcharge:</strong> All custom sizes are subject to a **7% manufacturing and setup surcharge** over standard material costs.
              </li>
              <li>
                <strong>Cancellations:</strong> Once custom dimensions enter our cutting line (usually **24 hours** after order placement), the order becomes non-cancellable and non-refundable.
              </li>
              <li>
                <strong>Exclusions:</strong> Custom size mattresses are **excluded** from our 30-Night sleep trial. They cannot be returned or exchanged unless there is an approved manufacturing defect or transit damage.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-surface-800 pb-2">
              4. Vacuum-Compressed Unboxing Guidelines
            </h2>
            <p>
              FreshNaps uses advanced roll-pack compression technology to compact mattresses for safe, hygienic, and eco-friendly shipping.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>7-Day Opening Rule:</strong> To prevent damage to internal pocket springs and high-density memory foam, compressed mattresses must be unboxed and laid flat within **7 days** of receipt.
              </li>
              <li>
                <strong>Unboxing Precautions:</strong> Do not use sharp knives, razors, or scissors directly against the fabric cover when slicing the inner plastic wrap. Damages caused by sharp objects during opening are not covered under warranty.
              </li>
              <li>
                <strong>Expansion Period:</strong> Allow **24 to 48 hours** for the foam mattress to fully expand to its correct thickness and hardness profile before assessing performance.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-surface-800 pb-2">
              5. Shipping, Heavy Delivery & COD Policy
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Logistics:</strong> Mattresses are heavy, bulky items. Deliveries are made to the ground floor or building gate unless lift access is available and safety permits delivery to higher levels.
              </li>
              <li>
                <strong>COD Conditions:</strong> Cash on Delivery is available for eligible pin codes. Customers must ensure a valid phone number is provided to confirm the dispatch call. We reserve the right to cancel COD orders if delivery coordinates are incomplete or unverifiable.
              </li>
              <li>
                <strong>Custom Sizing Timelines:</strong> Custom sizing mattresses require an extra **3-5 business days** for tailored manufacturing prior to shipping.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-surface-800 pb-2">
              6. Mattress Warranty Claims & Limitations
            </h2>
            <p>
              FreshNaps mattresses come with a structured warranty (ranging from 5 to 10 years as listed on your specific product invoice).
            </p>
            <p><strong>What is Covered:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Visible sagging or indentation of the foam layers greater than 2.5 cm (1 inch) not caused by sagging bed slats.</li>
              <li>Split or cracked foam cores due to manufacturing flaws.</li>
              <li>Broken or popping pocket springs.</li>
            </ul>
            <p><strong>What is NOT Covered:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Stains, burns, tears, or liquid spills. <strong>For hygiene and worker health reasons, any liquid stains instantly void the mattress warranty.</strong> We recommend using a waterproof mattress protector.</li>
              <li>Normal softening of the comfort layer foam over time.</li>
              <li>Damage resulting from using the mattress on an uneven slat foundation or weak frame.</li>
            </ul>
          </section>

          <section className="space-y-4 bg-gray-50 dark:bg-surface-900 rounded-2xl p-6 md:p-8 border border-gray-100 dark:border-surface-800">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
              7. Governing Law
            </h3>
            <p className="text-sm mb-4">
              These terms are governed by and construed in accordance with the laws of India. Any disputes arising out of these terms, product transactions, or delivery disputes shall be subject to the exclusive jurisdiction of the courts located in Sawai Madhopur, Rajasthan.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
