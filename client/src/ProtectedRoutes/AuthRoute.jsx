import React from 'react';
import { Navigate } from 'react-router-dom';

const AuthRoute = ({ children }) => {
  const token = sessionStorage.getItem("token");

  // If token is missing, redirect to home
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Otherwise, allow access to protected route
  return children;
};

export default AuthRoute;
