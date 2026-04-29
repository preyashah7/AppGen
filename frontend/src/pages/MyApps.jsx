import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import Button from '../components/ui/Button.jsx';
import { Layers, Database, Settings, Users, FileText, BarChart, Globe, Zap, Trash2, ArrowRight, LogOut } from 'lucide-react';

const iconMap = {
  Layers,
  Database,
  Settings,
  Users,
  FileText,
  BarChart,
  Globe,
  Zap,
};

const MyApps = () => {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const [apps, setApps] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isAuthenticated) {
      fetchApps();
    }
  }, [loading, isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const fetchApps = async () => {
    try {
      const res = await axios.get('/api/apps');
      setApps(res.data);
    } catch (error) {
      console.error('Unable to load apps', error);
    }
  };

  const deleteApp = async (appId) => {
    if (confirm('Are you sure you want to delete this app?')) {
      try {
        await axios.delete(`/api/apps/${appId}`);
        toast.success('App deleted successfully');
        fetchApps();
      } catch (err) {
        toast.error('Unable to delete app');
      }
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-text-secondary">Loading...</div>;
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      {/* TOP NAVBAR */}
      <div className="bg-white border-b border-[#E4E7EC] px-6 h-14 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Layers size={14} color="white" />
          </div>
          <div className="text-[15px] font-semibold text-gray-900">AppGen</div>
        </div>

        <div className="flex items-center">
          <button
            onClick={handleLogout}
            className="mr-3 inline-flex items-center gap-1.5 rounded-lg border border-[#E4E7EC] px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            type="button"
          >
            <LogOut size={14} />
            Logout
          </button>
          <div className="text-[13px] text-gray-500 mr-3">{user?.name}</div>
          <details className="relative">
            <summary className="list-none">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-medium flex items-center justify-center">{(user?.name || 'PS').split(' ').map(n=>n[0]).slice(0,2).join('')}</div>
            </summary>
            <div className="absolute right-0 mt-2 w-40 rounded-md border border-[#E4E7EC] bg-white shadow-sm py-1">
              <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <LogOut size={14} /> Logout
              </button>
            </div>
          </details>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page header row */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Apps</h1>
            <p className="text-sm text-gray-400 mt-0.5">{apps.length} apps in your workspace</p>
          </div>
          <Button onClick={() => navigate('/apps/new')} variant="primary" className="px-4 py-2">
            + New App
          </Button>
        </div>
        {apps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
              <Layers size={28} className="text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No apps yet</h3>
            <p className="text-sm text-gray-400 max-w-xs mb-6">Create your first app and start building with config-driven architecture</p>
            <Link to="/apps/new">
              <Button variant="primary">+ Create your first app</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {apps.map(app => {
              const IconComponent = iconMap[app.icon] || Layers;
              let entityCount = 0;
              try {
                const parsed = JSON.parse(app.config || '{}');
                entityCount = parsed.entities?.length || 0;
              } catch {
                entityCount = 0;
              }

              return (
                <div
                  key={app.id}
                  className="bg-white rounded-xl border border-[#E4E7EC] p-5 cursor-pointer group hover:border-indigo-200 hover:shadow-[0_4px_20px_rgba(79,70,229,0.08)] transition-all duration-200 hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: app.color }}>
                        <IconComponent size={18} color="white" />
                      </div>
                      <div>
                        <div className="text-[15px] font-semibold text-gray-900 leading-tight">{app.name}</div>
                        <div className="text-xs text-gray-400 mt-0.5 max-w-[160px] truncate">{app.description || 'No description'}</div>
                      </div>
                    </div>

                    <button onClick={() => deleteApp(app.id)} className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-400 transition-all duration-150">
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="border-t border-[#F3F4F6] mb-4" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 bg-[#F3F4F6] rounded-lg px-2.5 py-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      <span className="text-xs font-medium text-gray-500">{entityCount} entities</span>
                    </div>

                    <button onClick={() => navigate(`/apps/${app.id}/dashboard`)} className="text-sm font-medium text-indigo-600 flex items-center gap-1.5 hover:gap-2.5 transition-all duration-150">
                      Open
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApps;