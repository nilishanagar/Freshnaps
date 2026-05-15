import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { authService } from '../services';
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { Eye, EyeOff } from 'lucide-react';

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector(s => s.auth);
  const [showPw, setShowPw] = React.useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    dispatch(loginStart());
    try {
      const res = await authService.register({ name: data.name, email: data.email, password: data.password, phone: data.phone });
      dispatch(loginSuccess(res.data));
      toast.success(`Welcome to Freshnaps, ${res.data.user.name}!`);
      navigate('/');
    } catch (err) {
      const msg = err.message || 'Registration failed';
      dispatch(loginFailure(msg));
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-navy-950 px-4 py-16">
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="card p-8">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center">
                <span className="text-white font-display font-bold">F</span>
              </div>
              <span className="font-display font-bold text-2xl text-navy-900 dark:text-white">
                Fresh<span className="text-gold-500">naps</span>
              </span>
            </Link>
            <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Create Account</h1>
            <p className="text-gray-500 text-sm mt-1">Join the Freshnaps family</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5 block">Full Name</label>
              <input {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 chars' } })} placeholder="Your full name" className="input" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5 block">Email Address</label>
              <input {...register('email', { required: 'Email required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })} type="email" placeholder="your@email.com" className="input" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5 block">Phone (Optional)</label>
              <input {...register('phone')} placeholder="10-digit mobile" className="input" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5 block">Password</label>
              <div className="relative">
                <input {...register('password', { required: 'Password required', minLength: { value: 6, message: 'Min 6 characters' } })} type={showPw ? 'text' : 'password'} placeholder="Min. 6 characters" className="input pr-10" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5 block">Confirm Password</label>
              <input {...register('confirm', { required: 'Please confirm', validate: v => v === password || 'Passwords do not match' })} type="password" placeholder="Confirm password" className="input" />
              {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm.message}</p>}
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full py-4 mt-2">
              {isLoading ? <LoadingSpinner size="sm" /> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-gold-500 font-semibold hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
