import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, ShieldCheck, User, Mail, Phone, Calendar, Filter, UserCog } from 'lucide-react';
import { adminService } from '../../services';
import { useSelector } from 'react-redux';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const { user: currentUser } = useSelector(s => s.auth);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await adminService.getUsers();
        setUsers(res.data.users);
      } catch (err) {
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, currentRole) => {
    const user = users.find(u => u._id === userId);
    if (currentUser?._id === userId || (user && user.email === currentUser?.email)) {
      toast.error('You cannot change your own role');
      return;
    }

    const normalizedRole = (currentRole || '').trim().toLowerCase();
    const newRole = normalizedRole === 'admin' ? 'customer' : 'admin';
    const confirmMsg = `Are you sure you want to ${normalizedRole === 'admin' ? 'demote this admin to customer' : 'promote this customer to admin'}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await adminService.updateUserRole(userId, { role: newRole });
      if (res.data.success) {
        toast.success(`User role updated to ${newRole}`);
        setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || (u.role || '').trim().toLowerCase() === roleFilter;
    return matchesSearch && matchesRole;
  });

  const adminCount = users.filter(u => (u.role || '').trim().toLowerCase() === 'admin').length;
  const customerCount = users.filter(u => (u.role || '').trim().toLowerCase() !== 'admin').length;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Users & Admins</h1>
        <p className="text-gray-500 text-sm mt-1">Manage all registered users on your platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Users', value: users.length, icon: Users, color: 'bg-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Admins', value: adminCount, icon: ShieldCheck, color: 'bg-primary-500', bg: 'bg-primary-50 dark:bg-primary-900/20' },
          { label: 'Customers', value: customerCount, icon: User, color: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`${bg} rounded-2xl p-5 border border-gray-100 dark:border-surface-800`}>
            <div className="flex items-center gap-4">
              <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center text-white shadow-sm`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                <p className="text-xs text-gray-500 font-medium">{label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-1 bg-gray-100 dark:bg-surface-900 rounded-xl p-1">
          {['all', 'admin', 'customer'].map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                roleFilter === role
                  ? 'bg-white dark:bg-surface-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {role === 'all' ? 'All' : role}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-surface-900 rounded-2xl border border-gray-100 dark:border-surface-800">
          <Users size={48} className="mx-auto text-gray-300 dark:text-surface-700 mb-4" />
          <p className="text-gray-500 font-medium">No users found matching your filters.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-gray-100 dark:border-surface-800 overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 dark:bg-surface-950 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-surface-800">
            <div className="col-span-3">User</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-2">Phone</div>
            <div className="col-span-2">Joined</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-gray-100 dark:divide-surface-800">
            {filteredUsers.map((u, i) => (
              <motion.div
                key={u._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-surface-950/50 transition-colors items-center"
              >
                {/* User info */}
                <div className="col-span-3 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${
                    (u.role || '').trim().toLowerCase() === 'admin' ? 'bg-brand-gradient shadow-brand' : 'bg-gray-400 dark:bg-surface-700'
                  }`}>
                    {u.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{u.name}</p>
                    <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                      <Mail size={10} /> {u.email}
                    </p>
                  </div>
                </div>

                {/* Role */}
                <div className="col-span-2 flex items-center">
                  {(() => {
                    const isAdmin = (u.role || '').trim().toLowerCase() === 'admin';
                    return (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${
                        isAdmin
                          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                          : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      }`}>
                        {isAdmin ? <ShieldCheck size={12} /> : <User size={12} />}
                        {isAdmin ? 'admin' : 'customer'}
                      </span>
                    );
                  })()}
                </div>

                {/* Phone */}
                <div className="col-span-2 flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                  <Phone size={12} />
                  {u.phone || '—'}
                </div>

                {/* Joined */}
                <div className="col-span-2 flex items-center gap-1.5 text-sm text-gray-500">
                  <Calendar size={12} />
                  {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>

                {/* Status */}
                <div className="col-span-1">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    u.isActive !== false
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      : 'bg-red-100 dark:bg-red-900/20 text-red-600'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${u.isActive !== false ? 'bg-green-500' : 'bg-red-500'}`} />
                    {u.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-2 flex justify-end">
                  {(() => {
                    const isAdmin = (u.role || '').trim().toLowerCase() === 'admin';
                    const isSelf = u._id === currentUser?._id || u.email === currentUser?.email;
                    if (isSelf) {
                      return <span className="text-xs text-gray-400 dark:text-gray-500 italic pr-2">Current Admin</span>;
                    }
                    return (
                      <button
                        onClick={() => handleRoleChange(u._id, u.role)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          isAdmin
                            ? 'border-red-200 text-red-600 bg-red-50 hover:bg-red-100 dark:border-red-900/30 dark:text-red-400 dark:bg-red-900/10'
                            : 'border-primary-200 text-primary-600 bg-primary-50 hover:bg-primary-100 dark:border-primary-900/30 dark:text-primary-400 dark:bg-primary-900/10'
                        }`}
                      >
                        <UserCog size={13} />
                        {isAdmin ? 'Demote User' : 'Make Admin'}
                      </button>
                    );
                  })()}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-gray-50 dark:bg-surface-950 border-t border-gray-100 dark:border-surface-800 text-xs text-gray-500">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
