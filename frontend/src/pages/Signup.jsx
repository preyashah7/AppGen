import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import { UserRoundPlus, Sparkles, ArrowRight } from 'lucide-react';

const Signup = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/apps');
    }
  }, [authLoading, isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/signup', form);
      login(res.data.token, res.data.user);
      navigate('/apps');
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[linear-gradient(135deg,#FBFCFF_0%,#EEF4FF_100%)] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto grid min-h-[calc(100dvh-48px)] max-w-6xl overflow-hidden rounded-[28px] border border-border bg-white shadow-[0_24px_70px_rgba(15,23,42,0.10)] lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative hidden overflow-hidden bg-[linear-gradient(160deg,rgba(17,24,39,0.98)_0%,rgba(37,99,235,0.96)_100%)] p-10 text-white lg:flex lg:flex-col lg:justify-between lg:order-2">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-white/80">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15">
                <Sparkles size={18} />
              </span>
              AppGen
            </Link>
            <h1 className="mt-10 max-w-md text-4xl font-semibold leading-tight tracking-[-0.03em]">
              Create your workspace and start shaping apps in minutes.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-7 text-white/75">
              A clean setup gets you from account creation to building dashboards, forms, and config-driven experiences quickly.
            </p>
          </div>

          <div className="grid gap-4 rounded-[24px] border border-white/10 bg-white/8 p-5 backdrop-blur-sm">
            {[
              'Fast onboarding for new teams',
              'Clear data management workflows',
              'Responsive UI across every screen size',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-white/85">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/12">
                  <UserRoundPlus size={15} />
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-10 lg:order-1">
          <Card className="w-full max-w-md border-border/80 p-6 shadow-none sm:p-8 lg:p-10">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-light text-accent">
                <UserRoundPlus size={20} />
              </div>
              <h2 className="text-3xl font-semibold tracking-[-0.03em] text-text-primary">Create your account</h2>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Set up your AppGen workspace and get started.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <Input
                label="Password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              {error && <p className="rounded-lg border border-danger/20 bg-danger-light px-3 py-2 text-sm text-danger">{error}</p>}
              <Button type="submit" loading={loading} className="mt-2 w-full inline-flex items-center justify-center gap-2">
                Sign Up
                <ArrowRight size={16} />
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-text-secondary">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-accent hover:text-accent-hover">
                Login
              </Link>
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Signup;