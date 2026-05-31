import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    toast.success('Message sent! We\'ll reply within 24 hours.');
    setForm({ name: '', email: '', subject: '', message: '' });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-surface-950">
      {/* Hero */}
      <section className="bg-surface-200 dark:bg-surface-900/50 py-16 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="text-primary-500 font-medium text-sm uppercase tracking-widest">Get in Touch</span>
          <h1 className="section-title mt-2">Contact Us</h1>
          <p className="section-subtitle">We'd love to hear from you. Our team is here to help!</p>
        </motion.div>
      </section>

      <section className="container-custom py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact info */}
          <div>
            <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-6">Let's <span className="text-transparent bg-clip-text bg-brand-gradient">Talk</span></h2>
            <div className="space-y-5">
              {[
                { icon: Phone, title: 'Phone', lines: ['+91 98765 43210', 'Mon–Sat 9AM–7PM'], href: 'tel:+919876543210' },
                { icon: Mail, title: 'Email', lines: ['hello@freshnaps.com', 'support@freshnaps.com'], href: 'mailto:hello@freshnaps.com' },
                { icon: MapPin, title: 'Visit Us', lines: ['Textile Market, Jodhpur', 'Rajasthan 342001'] },
                { icon: Clock, title: 'Business Hours', lines: ['Mon–Sat: 9AM – 7PM', 'Sunday: 10AM – 5PM'] },
              ].map(({ icon: Icon, title, lines, href }) => (
                <div key={title} className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-gradient flex items-center justify-center flex-shrink-0">
                    <Icon size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{title}</p>
                    {lines.map(l => href ? (
                      <a key={l} href={href} className="block text-gray-500 hover:text-primary-500 text-sm">{l}</a>
                    ) : (
                      <p key={l} className="text-gray-500 text-sm">{l}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="card p-8">
              <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-6">Send a <span className="text-transparent bg-clip-text bg-brand-gradient">Message</span></h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5 block">Name</label>
                    <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Your name" className="input" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5 block">Email</label>
                    <input required type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="your@email.com" className="input" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5 block">Subject</label>
                  <input required value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="How can we help?" className="input" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5 block">Message</label>
                  <textarea required rows={5} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="Tell us more..." className="input resize-none" />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-4">
                  <Send size={16} /> {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
