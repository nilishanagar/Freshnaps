import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminRoute = () => {
  const { user } = useSelector(s => s.auth);
  if (!user || (user.role || '').trim().toLowerCase() !== 'admin') return <Navigate to="/admin/login" replace />;
  return <Outlet />;
};

export default AdminRoute;
