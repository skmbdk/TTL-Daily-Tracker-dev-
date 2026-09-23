import DashboardView from './DashboardView';
import { dashboardService } from '../services/dashboardService';

const AdminDashboard = () => {
  return <DashboardView title="All work across teams" loader={dashboardService.admin} isAdmin />;
};

export default AdminDashboard;
