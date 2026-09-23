import DashboardView from './DashboardView';
import { dashboardService } from '../services/dashboardService';
import { useAuth } from '../context/AuthContext';

const UserDashboard = () => {
  const { isPresenter } = useAuth();
  return (
    <DashboardView
      title={isPresenter ? 'All teams presenter view' : 'My delivery snapshot'}
      loader={dashboardService.user}
      isAdmin={isPresenter}
    />
  );
};

export default UserDashboard;
