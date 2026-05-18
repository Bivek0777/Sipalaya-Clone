import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their respective portal if they access wrong portal
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'instructor') return <Navigate to="/instructor-portal" replace />;
    return <Navigate to="/student-portal" replace />;
  }

  return children;
};

export default ProtectedRoute;
