import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = () => {
  const { user, token } = useSelector(s => s.auth);
  if (!user || !token) return <Navigate to="/login" replace />;
  return <Outlet />;
};

export default ProtectedRoute;
