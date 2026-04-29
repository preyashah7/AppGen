import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import { Layers, Database, Settings, Users, FileText, BarChart, Globe, Zap, Trash2 } from 'lucide-react';

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
    return <div className="min-h-screen flex items-center justify-center text-textSecondary">Loading...</div>;
  }

  if (!isAuthenticated) return null;

  return (
    <div className="container mx-auto px-4 py-6 pb-28 sm:py-8 sm:pb-24">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Apps</h1>
          <p className="text-sm text-textSecondary">Manage your created apps and add new ones instantly.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button onClick={() => navigate('/apps/new')} variant="secondary">New App</Button>
          <div className="flex items-center gap-3">
            <span className="text-textSecondary">{user.name}</span>
            <Button onClick={logout}>Logout</Button>
          </div>
        </div>
      </div>
      {apps.length === 0 ? (
        <div className="text-center py-16">
          <Layers size={64} className="mx-auto text-textSecondary mb-4" />
          <h2 className="text-2xl font-bold mb-4">No apps yet</h2>
          <Link to="/apps/new">
            <Button>Create your first app</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
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
              <Card key={app.id} className="relative">
                <button
                  onClick={() => deleteApp(app.id)}
                  className="absolute top-4 right-4 text-textSecondary hover:text-red-500"
                >
                  <Trash2 size={20} />
                </button>
                <div className="flex items-center mb-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center mr-4"
                    style={{ backgroundColor: app.color }}
                  >
                    <IconComponent size={24} color="white" />
                  </div>
                  <div>
                    <h3 className="font-bold">{app.name}</h3>
                    <p className="text-textSecondary text-sm">{app.description || 'No description'}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <p className="text-sm text-textSecondary">Entities {entityCount}</p>
                  <Button onClick={() => navigate(`/apps/${app.id}/dashboard`)} variant="secondary">
                    Open
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      <Link to="/apps/new" className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8">
        <Button className="flex h-14 w-14 items-center justify-center rounded-full text-xl sm:h-16 sm:w-16">+</Button>
      </Link>
    </div>
  );
};

export default MyApps;