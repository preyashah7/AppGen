import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import { LockKeyhole, Sparkles, ArrowRight } from 'lucide-react';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
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
      const res = await axios.post('/api/auth/login', form);
      login(res.data.token, res.data.user);
      navigate('/apps');
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/google', {
        token: credentialResponse.credential,
      });
      login(res.data.token, res.data.user);
      navigate('/apps');
    } catch (err) {
      setError(err.response?.data?.error || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[linear-gradient(135deg,#FBFCFF_0%,#EEF4FF_100%)] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto grid min-h-[calc(100dvh-48px)] max-w-6xl overflow-hidden rounded-[28px] border border-border bg-white shadow-[0_24px_70px_rgba(15,23,42,0.10)] lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative hidden overflow-hidden bg-[linear-gradient(160deg,rgba(37,99,235,0.98)_0%,rgba(15,23,42,0.96)_100%)] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-white/80">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15">
                <Sparkles size={18} />
              </span>
              AppGen
            </Link>
            <h1 className="mt-10 max-w-md text-4xl font-semibold leading-tight tracking-[-0.03em]">
              Sign in to your app workspace and keep building.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-7 text-white/75">
              Access your apps, dashboard, records, and config tools from one consistent control plane.
            </p>
          </div>

          <div className="grid gap-4 rounded-[24px] border border-white/10 bg-white/8 p-5 backdrop-blur-sm">
            {[
              'Launch app workflows faster',
              'Manage entities with responsive tables',
              'Review notifications and updates in one place',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-white/85">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/12">
                  <LockKeyhole size={15} />
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-10">
          <Card className="w-full max-w-md border-border/80 p-6 shadow-none sm:p-8 lg:p-10">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-light text-accent">
                <LockKeyhole size={20} />
              </div>
              <h2 className="text-3xl font-semibold tracking-[-0.03em] text-text-primary">Welcome back</h2>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Sign in to continue managing your applications.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                autoComplete="current-password"
                required
              />
              {error && <p className="rounded-lg border border-danger/20 bg-danger-light px-3 py-2 text-sm text-danger">{error}</p>}
              <Button type="submit" loading={loading} className="mt-2 w-full inline-flex items-center justify-center gap-2">
                Login
                <ArrowRight size={16} />
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/50"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-text-secondary">or continue with</span>
                </div>
              </div>

              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google sign-in failed')}
                  locale="en"
                  size="large"
                />
              </div>
            </form>

            <p className="mt-6 text-center text-sm text-text-secondary">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-accent hover:text-accent-hover">
                Sign Up
              </Link>
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;