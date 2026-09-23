import { useEffect, useState } from 'react';
import { Download, FileBarChart2 } from 'lucide-react';
import toast from 'react-hot-toast';
import FilterBar from '../components/FilterBar';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';
import { projectService } from '../services/projectService';
import { reportService } from '../services/reportService';
import { userService } from '../services/userService';

const initialFilters = {
  status: '',
  priority: '',
  project_id: '',
  module: '',
  user_id: '',
  onsite_offshore: '',
  date_from: '',
  date_to: '',
  search: ''
};

const Reports = () => {
  const { isAdmin } = useAuth();
  const [filters, setFilters] = useState(initialFilters);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [projectRows, userRows] = await Promise.all([
          projectService.list(),
          isAdmin ? userService.list() : Promise.resolve([])
        ]);
        setProjects(projectRows);
        setUsers(userRows);
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    };

    loadLookups();
  }, [isAdmin]);

  const exportReport = async () => {
    setLoading(true);
    try {
      const { blob, fileName } = await reportService.exportTasks(cleanFilters(filters));
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Report generated');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white">Reports</h2>
          <p className="mt-1 text-sm text-slate-400">
            Export task workbooks with task detail plus user, project, status, priority, and due-date summaries.
          </p>
        </div>
        <button className="btn-primary" onClick={exportReport} disabled={loading}>
          <Download size={17} />
          {loading ? 'Generating...' : 'Export Excel'}
        </button>
      </div>

      <FilterBar
        filters={filters}
        onChange={setFilters}
        users={users}
        projects={projects}
        showUsers={isAdmin}
        onReset={() => setFilters(initialFilters)}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {['User-wise', 'Project-wise', 'Status-wise', 'Priority-wise', 'Date-wise'].map((label) => (
          <div key={label} className="glass-panel p-4">
            <FileBarChart2 size={22} className="text-cyan-300" />
            <h3 className="mt-3 font-semibold text-white">{label}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">Included as a worksheet in the Excel export.</p>
          </div>
        ))}
      </section>
    </div>
  );
};

const cleanFilters = (filters) => {
  return Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== '' && value !== null && value !== undefined));
};

export default Reports;
