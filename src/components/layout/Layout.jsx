import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import SEOHead, { organizationSchema, websiteSchema } from '../common/SEOHead';

const Layout = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-surface-950">
      {/* Global structured data — appears on every page */}
      <SEOHead jsonLd={[organizationSchema, websiteSchema]} />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
