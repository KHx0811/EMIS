import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken'); // Assuming the token is stored in localStorage

  if (!token) {
    return <Navigate to="/login/admin" />;
  }

  return children;
};

export default ProtectedRoute;