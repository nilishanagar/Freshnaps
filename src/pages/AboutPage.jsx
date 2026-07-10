import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Award, Leaf, Heart, ArrowRight } from 'lucide-react';

const AboutPage = () => (
  <div className="min-h-screen bg-white dark:bg-surface-950">
    {/* Hero */}
    <section className="relative bg-dark-gradient py-24 px-4 text-center text-white overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <img src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1400" alt="" className="w-full h-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-surface-950/70" />
      <div className="relative z-10">
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="font-display text-5xl md:text-6xl font-bold mb-4">
          Our <span className="text-primary-400">Story</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-gray-300 text-lg max-w-2xl mx-auto">
          Born in Rajasthan's textile heritage, Freshnaps brings the finest bedding tradition to modern homes across India.
        </motion.p>
      </div>
    </section>

    {/* Story */}
    <section className="py-20 container-custom">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <span className="text-primary-500 font-medium text-sm uppercase tracking-widest">Since 2020</span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 dark:text-white mt-2 mb-5">Crafting Sleep <span className="text-transparent bg-clip-text bg-brand-gradient">Excellence</span></h2>
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
            Freshnaps was founded with a single belief: every person deserves a luxurious, restful sleep — regardless of their budget. Our journey began in the textile heartland of Sawai Madhopur, Rajasthan, where generations of artisanal fabric craftsmanship meet modern comfort science.
          </p>
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
            Today, we curate and craft premium bedding solutions — from orthopedic mattresses to 500 thread count Egyptian cotton sheets — delivering them directly to customers across India, cutting out the middleman and passing savings to you.
          </p>
          <Link to="/shop" className="btn-primary">Shop Now <ArrowRight size={16} /></Link>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <img src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=700" alt="Freshnaps story" className="rounded-3xl shadow-2xl w-full" />
        </motion.div>
      </div>
    </section>

    {/* Values */}
    <section className="py-16 bg-surface-200 dark:bg-surface-900/50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 dark:text-white">Our <span className="text-transparent bg-clip-text bg-brand-gradient">Values</span></h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Award, title: 'Quality First', desc: 'We source only from certified suppliers. Every thread, every stitch is inspected for excellence.' },
            { icon: Leaf, title: 'Sustainable', desc: 'Eco-friendly packaging, sustainable cotton sourcing, and a commitment to reduce our carbon footprint.' },
            { icon: Heart, title: 'Customer Love', desc: 'Our 30-day return policy, responsive support, and loyalty program show how much we value our customers.' },
          ].map(({ icon: Icon, title, desc }, i) => (
            <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="card p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-brand-gradient flex items-center justify-center mx-auto mb-5">
                <Icon size={24} className="text-white" />
              </div>
              <h3 className="font-semibold text-xl text-gray-900 dark:text-white mb-3">{title}</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Stats */}
    <section className="py-16 bg-surface-950 dark:bg-surface-950 text-white">
      <div className="container-custom grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {[
          { num: '50K+', label: 'Happy Customers' },
          { num: '200+', label: 'Products' },
          { num: '4.8★', label: 'Average Rating' },
          { num: '5 Years', label: 'Of Excellence' },
        ].map(({ num, label }) => (
          <div key={label}>
            <p className="font-display text-4xl font-bold text-primary-400 mb-1">{num}</p>
            <p className="text-gray-400 text-sm">{label}</p>
          </div>
        ))}
      </div>
    </section>
  </div>
);

export default AboutPage;
