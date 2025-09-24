import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

const ProtectedRoute = ({ children, requiredPermission }) => {
  const { currentUser, loading, hasPermission } = useUser();

  // Wait until user state is ready
  if (loading) return <div>Loading...</div>;

  // Redirect if not logged in
  if (!currentUser) return <Navigate to="/" replace />;

  // Redirect if missing permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
