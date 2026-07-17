import React, { useEffect } from 'react';
import { Shield, Eye, Lock, RefreshCw, FileText } from 'lucide-react';
import SEOHead from '../components/common/SEOHead';

const PrivacyPolicyPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-surface-950 py-12 md:py-16">
      <SEOHead
        title="Privacy Policy"
        description="Freshnaps Privacy Policy — Learn how we collect, use, and protect your personal information when you shop at freshnapsmattress.com."
        path="/privacy-policy"
      />
      <div className="container-custom max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-950/20 flex items-center justify-center mx-auto mb-4 border border-primary-100 dark:border-primary-900/30">
            <Shield className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white font-display mb-3">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Last Updated: July 14, 2026
          </p>
        </div>

        {/* Content */}
        <div className="prose dark:prose-invert prose-sm max-w-none text-gray-600 dark:text-gray-300 space-y-8 leading-relaxed">
          <section className="bg-gray-50 dark:bg-surface-900 rounded-2xl p-6 md:p-8 border border-gray-100 dark:border-surface-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
              <Eye size={18} className="text-primary-600 dark:text-primary-400" />
              1. Introduction & Scope
            </h2>
            <p>
              Welcome to <strong>FreshNaps</strong> ("we," "our," "us"). We value your trust and are committed to protecting your personal information. This Privacy Policy details how we collect, use, store, and share your data when you visit our website <strong>freshnapsmattress.com</strong>, purchase our customized mattresses, accessories, and other home furnishing products, or interact with our customer support teams.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-surface-800 pb-2">
              2. Information We Collect
            </h2>
            <p>
              To provide a seamless shopping and custom manufacturing experience, we collect information you provide directly to us:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Identity & Contact Details:</strong> Name, shipping address, billing address, phone number, and email address.
              </li>
              <li>
                <strong>Custom Sizing Specifications:</strong> To manufacture customized mattresses, we collect and store exact dimensions supplied by you (length, width, thickness, and bed frame type).
              </li>
              <li>
                <strong>Transaction Details:</strong> Items purchased, payment confirmation IDs, order history, and interactions with our customer support team.
              </li>
              <li>
                <strong>Technical & Usage Data:</strong> IP address, device type, browser settings, operating system, and browsing behavior on our platform via cookies.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-surface-800 pb-2">
              3. How We Use Your Information
            </h2>
            <p>
              We use the collected information for purposes necessary to fulfill our commitments to you:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Manufacturing & Customization:</strong> Using your custom mattress specifications to design, cut, and construct your bedding product in our manufacturing unit.
              </li>
              <li>
                <strong>Order Processing & Fulfillment:</strong> Processing secure transactions, coordinating dispatch, and printing shipping labels.
              </li>
              <li>
                <strong>Delivery & Logistics Coordination:</strong> Sharing contact details and shipping addresses with third-party logistics networks (e.g., Delivery partners) to deliver heavy bulky items to your doorstep.
              </li>
              <li>
                <strong>Customer Support:</strong> Troubleshooting orders, coordinating refunds or exchanges under our mattress trial policies, and addressing contact inquiries.
              </li>
              <li>
                <strong>Improvement & Analytics:</strong> Developing new mattress technologies, materials, and analyzing website navigation patterns to improve user interface experience.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-surface-800 pb-2">
              4. Data Sharing & Security
            </h2>
            <p>
              We do not sell or lease your personal data. We only share information with trusted third-party partners required to run our business services:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Logistics Providers:</strong> Bulk shipping networks required for mattress transit.
              </li>
              <li>
                <strong>Payment Gateways:</strong> Secure, PCI-DSS compliant online payment processors (e.g., Stripe, UPI gateways). We do not store raw card credentials or PIN numbers.
              </li>
              <li>
                <strong>Cloud & Database Hosting:</strong> Secure cloud storage solutions to host user registration databases and mattress order details.
              </li>
            </ul>
            <div className="flex items-start gap-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-4 mt-3">
              <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-800 dark:text-emerald-300 mb-0">
                <strong>Data Encryption:</strong> All transfers of personal identity details and payment links are encrypted using industry-standard SSL (Secure Sockets Layer) technologies. Access to custom order files inside our warehouse database is restricted.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-surface-800 pb-2">
              5. 30-Night Trial & Return Records
            </h2>
            <p>
              To process claims under our 30-Night Mattress Trial, we require photographic or video evidence of the product condition to ensure it is clean and undamaged. These verification media assets are stored securely alongside your order history to prevent fraudulent claims and authorize pickups.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-surface-800 pb-2">
              6. Cookies Policy
            </h2>
            <p>
              We use browser cookies and local storage tokens to remember your shopping cart items, keep you logged in to your account, and optimize loading times. You can disable cookies in your web browser preferences, though doing so might cause items in your cart to clear or prevent checkout.
            </p>
          </section>

          <section className="space-y-4 bg-gray-50 dark:bg-surface-900 rounded-2xl p-6 md:p-8 border border-gray-100 dark:border-surface-800">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
              7. Contact Us
            </h3>
            <p className="text-sm mb-4">
              If you have any questions about this Privacy Policy, your saved data, or wish to request data deletion, contact us:
            </p>
            <div className="text-xs space-y-2 text-gray-500 dark:text-gray-400">
              <p><strong>Brand:</strong> FreshNaps Sleep Solutions</p>
              <p><strong>Address:</strong> Royal Marwadi, Near Roop Laxmi Furniture, Mandi Road, Sawai Madhopur, Rajasthan, 322001</p>
              <p><strong>Email:</strong> <a href="mailto:freshnapsmattress@gmail.com" className="text-primary-600 dark:text-primary-400 hover:underline">freshnapsmattress@gmail.com</a></p>
              <p><strong>Phone:</strong> +91 9057204097</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
