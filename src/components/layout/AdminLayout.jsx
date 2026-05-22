import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Users, LogOut, Crown, Moon, ExternalLink } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const adminNav = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
  { label: 'Products', to: '/admin/products', icon: Package },
  { label: 'Orders', to: '/admin/orders', icon: ShoppingBag },
  { label: 'Users', to: '/admin/users', icon: Users },
];

const AdminLayout = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-navy-950">
      {/* Sidebar */}
      <aside className="w-64 bg-navy-900 dark:bg-navy-950 border-r border-navy-700/50 flex flex-col flex-shrink-0">

        {/* Brand */}
        <div className="p-5 border-b border-navy-700/50">
          <Link to="/admin" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gold-gradient flex items-center justify-center shadow-gold group-hover:shadow-gold-lg transition-shadow duration-300">
              <Moon size={16} className="text-white" strokeWidth={2} />
            </div>
            <div>
              <p className="font-display font-bold text-white text-sm leading-tight">Freshnaps</p>
              <p className="text-[10px] text-gold-400 font-medium tracking-wider uppercase leading-tight">Admin Panel</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-navy-500 dark:text-navy-400 px-3 pt-2 pb-1">Navigation</p>
          {adminNav.map(({ label, to, icon: Icon }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gold-500/15 text-gold-400 border border-gold-500/20'
                    : 'text-gray-400 hover:bg-navy-800 hover:text-gray-200'
                }`}
              >
                <Icon size={17} strokeWidth={isActive ? 2 : 1.8} />
                {label}
                {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gold-400" />}
              </Link>
            );
          })}

          <div className="pt-3 mt-3 border-t border-navy-700/50">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-navy-500 dark:text-navy-400 px-3 pb-1">Store</p>
            <Link
              to="/"
              target="_blank"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-navy-800 hover:text-gray-200 transition-all duration-200"
            >
              <ExternalLink size={17} strokeWidth={1.8} />
              View Storefront
            </Link>
          </div>
        </nav>

        {/* User + logout */}
        <div className="p-3 border-t border-navy-700/50 space-y-2">
          {user && (
            <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-navy-800/50">
              <div className="w-7 h-7 rounded-lg bg-gold-gradient flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">{user.name?.[0]?.toUpperCase()}</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm text-gray-400 hover:bg-red-900/20 hover:text-red-400 rounded-xl transition-all duration-200"
          >
            <LogOut size={17} strokeWidth={1.8} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
