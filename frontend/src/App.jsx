import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import MobileNav from './components/MobileNav';
import ScrollProgressBar from './components/ScrollProgressBar';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import Kanban from './pages/Kanban';
import Tasks from './pages/Tasks';
import Users from './pages/Users';
import Projects from './pages/Projects';
import AdminActivity from './pages/AdminActivity';
import { useAuth } from './context/AuthContext';

const App = () => {
  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AuthenticatedLayout />}>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/kanban" element={<Kanban />} />
            <Route path="/tasks" element={<Tasks />} />

            <Route element={<AdminRoute />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/activity" element={<AdminActivity />} />
              <Route path="/admin/users" element={<Users />} />
              <Route path="/admin/projects" element={<Projects />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

// Animated Outlet - smooth instant page transitions without exit traps
const AnimatedOutlet = () => {
  const location = useLocation();

  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0.95 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      className="w-full"
    >
      <Outlet />
    </motion.div>
  );
};

const AuthenticatedLayout = () => (
  <div className="app-shell flex min-h-screen bg-[#09090b]">
    <ScrollProgressBar />
    <Sidebar />
    <main className="app-main min-w-0 flex-1 flex flex-col">
      <Navbar />
      <div className="page-content flex-1 w-full min-w-0 p-4 pb-24 sm:p-6 sm:pb-24 lg:pb-6">
        <ErrorBoundary>
          <AnimatedOutlet />
        </ErrorBoundary>
      </div>
      <footer className="py-4 mt-auto text-center text-xs font-medium tracking-wide text-slate-500 opacity-80 hover:opacity-100 transition-opacity">
        ⚡️Developed By Subham Mohanty⚡️
      </footer>
    </main>
    <MobileNav />
  </div>
);

const HomeRedirect = () => {
  const { isAdmin } = useAuth();
  return <Navigate to={isAdmin ? '/admin/dashboard' : '/dashboard'} replace />;
};

export default App;
