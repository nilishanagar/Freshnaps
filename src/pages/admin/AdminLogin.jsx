import React from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';
import { authService } from '../../services';
import { loginSuccess } from '../../store/slices/authSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      const res = await authService.adminLogin(data);
      dispatch(loginSuccess(res.data));
      toast.success('Welcome, Admin!');
      navigate('/admin');
    } catch (err) {
      toast.error(err.message || 'Invalid admin credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950 px-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm">
        <div className="bg-surface-900 rounded-3xl p-8 shadow-2xl border border-surface-800">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-brand-gradient flex items-center justify-center mx-auto mb-4">
              <Leaf size={28} className="text-white" />
            </div>
            <h1 className="font-display text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-gray-400 text-sm mt-1">Freshnaps Administration</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-400 mb-1.5 block">Email</label>
              <input {...register('email', { required: true })} type="email" placeholder="admin@freshnaps.com" className="input bg-surface-800 border-surface-700 text-white placeholder-gray-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-400 mb-1.5 block">Password</label>
              <input {...register('password', { required: true })} type="password" placeholder="••••••••" className="input bg-surface-800 border-surface-700 text-white placeholder-gray-500" />
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3.5 mt-2">
              {isSubmitting ? <LoadingSpinner size="sm" /> : 'Sign In as Admin'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-5">
            Default: admin@freshnaps.com / Admin@123
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
