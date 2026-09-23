import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = () => {
  const { isAdmin } = useAuth();
  return isAdmin ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

export default AdminRoute;
