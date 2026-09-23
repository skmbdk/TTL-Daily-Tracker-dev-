import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Skeleton, { DashboardSkeletonLoader } from '../components/SkeletonLoader';

const ProtectedRoute = () => {
  const { loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] p-6">
        <div className="mx-auto max-w-7xl">
          <Skeleton className="mb-8 h-16 w-64 rounded-lg" />
          <DashboardSkeletonLoader />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
