import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Users, LogOut, Leaf, Moon, ExternalLink, Receipt } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services';
import toast from 'react-hot-toast';

const adminNav = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
  { label: 'Products', to: '/admin/products', icon: Package },
  { label: 'Orders', to: '/admin/orders', icon: ShoppingBag },
  { label: 'Users', to: '/admin/users', icon: Users },
  { label: 'Invoice', to: '/admin/invoice', icon: Receipt },
];

const AdminLayout = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      // Proceed with local logout even if API call fails
    }
    dispatch(logout());
    toast.success('Signed out successfully!');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-surface-950">
      {/* Sidebar */}
      <aside className="w-64 bg-surface-950 dark:bg-surface-950 border-r border-surface-800/50 flex flex-col flex-shrink-0">

        {/* Brand */}
        <div className="p-5 border-b border-surface-800/50">
          <Link to="/admin" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center shadow-brand group-hover:shadow-brand-lg transition-shadow duration-300">
              <Moon size={16} className="text-white" strokeWidth={2} />
            </div>
            <div>
              <p className="font-display font-bold text-white text-sm leading-tight">Freshnaps</p>
              <p className="text-[10px] text-primary-400 font-medium tracking-wider uppercase leading-tight">Admin Panel</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-surface-600 dark:text-surface-400 px-3 pt-2 pb-1">Navigation</p>
          {adminNav.map(({ label, to, icon: Icon }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-500/15 text-primary-400 border border-primary-500/20'
                    : 'text-gray-400 hover:bg-surface-900 hover:text-gray-200'
                }`}
              >
                <Icon size={17} strokeWidth={isActive ? 2 : 1.8} />
                {label}
                {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400" />}
              </Link>
            );
          })}

          <div className="pt-3 mt-3 border-t border-surface-800/50">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-surface-600 dark:text-surface-400 px-3 pb-1">Store</p>
            <Link
              to="/"
              target="_blank"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-surface-900 hover:text-gray-200 transition-all duration-200"
            >
              <ExternalLink size={17} strokeWidth={1.8} />
              View Storefront
            </Link>
          </div>
        </nav>

        {/* User + logout */}
        <div className="p-3 border-t border-surface-800/50 space-y-2">
          {user && (
            <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-surface-900/50">
              <div className="w-7 h-7 rounded-lg bg-brand-gradient flex items-center justify-center flex-shrink-0">
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
