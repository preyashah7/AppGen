import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import taskTemplate from '../templates/taskmanager.json';
import restaurantTemplate from '../templates/restaurant.json';
import blankTemplate from '../templates/blank.json';
import { Layers, Database, Settings, Users, FileText, BarChart, Globe, Zap, Check, LogOut } from 'lucide-react';

const icons = [
  { name: 'Layers', Icon: Layers },
  { name: 'Database', Icon: Database },
  { name: 'Settings', Icon: Settings },
  { name: 'Users', Icon: Users },
  { name: 'FileText', Icon: FileText },
  { name: 'BarChart', Icon: BarChart },
  { name: 'Globe', Icon: Globe },
  { name: 'Zap', Icon: Zap },
];

const colors = ['#4F46E5', '#7C3AED', '#DB2777', '#059669', '#D97706', '#DC2626', '#2563EB', '#0891B2'];

const NewApp = () => {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', description: '', icon: 'Layers', color: '#6366F1' });
  const [selectedTemplate, setSelectedTemplate] = useState('task-manager');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [loading, isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const templates = {
        'task-manager': taskTemplate,
        'restaurant-dashboard': restaurantTemplate,
        'blank': blankTemplate,
      };
      const templateConfig = templates[selectedTemplate] || {};
      const response = await axios.post('/api/apps', {
        ...form,
        config: templateConfig,
      });
      const appId = response.data?.id || response.data?.app?.id;
      if (!appId) {
        throw new Error('Unable to retrieve created app ID');
      }
      navigate(`/apps/${appId}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Unable to create app');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-text-secondary">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      {/* TOP NAVBAR (same as My Apps) */}
      <div className="bg-white border-b border-[#E4E7EC] px-6 h-14 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Layers size={14} color="white" />
          </div>
          <div className="text-[15px] font-semibold text-gray-900">AppGen</div>
        </div>

        <div className="flex items-center">
          <div className="text-[13px] text-gray-500 mr-3">{user?.name}</div>
          <details className="relative">
            <summary className="list-none">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-medium flex items-center justify-center">
                {(user?.name || 'U').split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
            </summary>
            <div className="absolute right-0 mt-2 w-40 rounded-md border border-[#E4E7EC] bg-white shadow-sm py-1">
              <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <LogOut size={14} /> Logout
              </button>
            </div>
          </details>
        </div>
      </div>

      <div className="max-w-[600px] mx-auto px-6 py-8">
        {/* Page header */}
        <div className="mb-8">
          <div className="text-xs font-semibold text-indigo-500 tracking-widest uppercase mb-2">New App</div>
          <h1 className="text-2xl font-bold text-gray-900">What are you building?</h1>
          <p className="text-sm text-gray-400 mt-1">Start from a template or build from scratch</p>
        </div>

        <div className="bg-white border border-[#E4E7EC] rounded-2xl p-6 mb-4">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 block">Choose a template</label>
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              {
                id: 'task-manager',
                title: 'Task Manager',
                description: 'Tasks, contacts, and team work.',
              },
              {
                id: 'restaurant-dashboard',
                title: 'Restaurant',
                description: 'Menu, orders, and reservations.',
              },
              {
                id: 'blank',
                title: 'Blank',
                description: 'Start from scratch.',
              },
            ].map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => setSelectedTemplate(template.id)}
                className={`relative border rounded-xl p-4 cursor-pointer bg-white transition-all duration-150 text-left ${selectedTemplate === template.id ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500 ring-offset-1' : 'border-[#E4E7EC] hover:border-indigo-200 hover:bg-indigo-50/30'}`}
              >
                {selectedTemplate === template.id && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                    <Check size={10} className="text-white" />
                  </div>
                )}
                <div className="w-8 h-8 rounded-lg bg-[#F3F4F6] flex items-center justify-center mb-3">
                  <Layers size={16} className={`${selectedTemplate === template.id ? 'text-indigo-500' : 'text-gray-400'}`} />
                </div>
                <div className={`text-sm font-semibold ${selectedTemplate === template.id ? 'text-indigo-700' : 'text-gray-800'} mb-1`}>{template.title}</div>
                <div className="text-xs text-gray-400 leading-relaxed">{template.description}</div>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="App Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              placeholder="e.g. Restaurant Manager"
              autoFocus
            />

            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 block">Description</label>
              <textarea
                className="w-full rounded-2xl border border-[#E4E7EC] bg-white px-4 py-3 text-text-primary shadow-sm outline-none transition placeholder:text-text-muted focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="What does this app do? (optional)"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 block">App Icon</label>
              <div className="grid grid-cols-8 gap-2">
                {icons.map(({ name, Icon }) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setForm({ ...form, icon: name })}
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-150 group ${form.icon === name ? 'bg-indigo-600 border-indigo-600 scale-110 shadow-md' : 'bg-[#F8F9FB] border-[#E4E7EC] hover:border-indigo-200 hover:bg-indigo-50'}`}
                  >
                    <Icon size={18} className={`${form.icon === name ? 'text-white' : 'text-gray-400 group-hover:text-indigo-400'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 block">App Color</label>
              <div className="flex gap-2 flex-wrap">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setForm({ ...form, color })}
                    className={`w-8 h-8 rounded-full transition-transform duration-150 ${form.color === color ? 'scale-110 ring-2 ring-offset-2' : ''}`}
                    style={{ backgroundColor: color, boxShadow: form.color === color ? `0 0 0 3px ${color}33` : 'none' }}
                  />
                ))}
              </div>
            </div>

            {error && <p className="rounded-lg border border-danger/20 bg-danger-light px-3 py-2 text-sm text-danger">{error}</p>}

            <Button type="submit" loading={submitting} className="w-full py-3">
              {submitting ? 'Creating...' : 'Create App →'}
            </Button>

            <p className="text-center text-sm text-gray-400 mt-4">
              Changed your mind? <a href="/apps" className="text-indigo-500 hover:text-indigo-700 font-medium">Go back</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewApp;
