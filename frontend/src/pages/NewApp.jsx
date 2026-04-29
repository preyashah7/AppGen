import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import taskTemplate from '../templates/taskmanager.json';
import restaurantTemplate from '../templates/restaurant.json';
import blankTemplate from '../templates/blank.json';
import { Layers, Database, Settings, Users, FileText, BarChart, Globe, Zap } from 'lucide-react';

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

const colors = ['#6366F1', '#EC4899', '#14B8A6', '#F59E0B', '#EF4444', '#2563EB'];

const NewApp = () => {
  const { isAuthenticated, loading } = useAuth();
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
    return <div className="min-h-screen flex items-center justify-center text-textSecondary">Loading...</div>;
  }

  return (
    <div className="min-h-dvh bg-background py-6 sm:py-10">
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.2em] text-textSecondary">Create New App</p>
            <h1 className="text-3xl font-bold text-textPrimary sm:text-4xl">New app details</h1>
          </div>
          <button className="text-primary font-medium" onClick={() => navigate('/apps')}>
            Cancel
          </button>
        </div>
        <Card className="mx-auto max-w-2xl p-6 sm:p-8">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {[
                {
                  id: 'task-manager',
                  title: 'Task manager',
                  description: 'Manage tasks, contacts, and team work.',
                },
                {
                  id: 'restaurant-dashboard',
                  title: 'Restaurant ops',
                  description: 'Menu, orders, and reservations in one place.',
                },
                {
                  id: 'blank',
                  title: 'Blank app',
                  description: 'Start from scratch with a flexible config.',
                },
              ].map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`rounded-3xl border p-5 text-left transition ${selectedTemplate === template.id ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-white hover:border-primary'}`}
                >
                  <h2 className="text-lg font-semibold">{template.title}</h2>
                  <p className="mt-2 text-sm text-textSecondary">{template.description}</p>
                </button>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="App Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="My first app"
              />
              <div className="space-y-2">
                <label className="block text-sm font-medium text-textPrimary">Description</label>
                <textarea
                  className="w-full min-h-[120px] rounded-2xl border border-border bg-white px-4 py-3 text-textPrimary shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  rows="4"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Add a short description"
                />
              </div>
              <div className="space-y-4">
                <p className="text-sm font-medium text-textPrimary">Icon</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {icons.map(({ name, Icon }) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setForm({ ...form, icon: name })}
                      className={`flex flex-col items-center justify-center gap-2 rounded-3xl border p-4 text-sm transition ${form.icon === name ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-white text-textSecondary hover:border-primary hover:text-primary'}`}
                    >
                      <Icon size={20} />
                      <span className="text-[11px] uppercase tracking-[0.18em]">{name}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-sm font-medium text-textPrimary">Color</p>
                <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setForm({ ...form, color })}
                      className={`h-12 w-12 rounded-full border-2 transition ${form.color === color ? 'border-primary' : 'border-transparent hover:border-border'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              {error && <p className="text-red-500">{error}</p>}
              <Button type="submit" loading={submitting} className="w-full">
                Create App
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default NewApp;
