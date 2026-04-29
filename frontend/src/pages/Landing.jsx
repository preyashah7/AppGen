import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Layers, Database, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const Landing = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#FAFBFF_0%,#F0F4FF_50%,#FAFBFF_100%)] text-text-primary">
      <div className="sticky top-0 z-40 border-b border-border bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-[60px] max-w-[1100px] items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold text-text-primary">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white shadow-sm">
              <Sparkles size={16} />
            </span>
            AppGen
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <>
                <Link to="/apps" className="rounded-lg px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-raised hover:text-text-primary">
                  My Apps
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-text-secondary transition-all duration-150 hover:border-border-strong hover:bg-surface-raised hover:text-text-primary"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-raised hover:text-text-primary">
                  Login
                </Link>
                <Link to="/signup" className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover hover:-translate-y-px transition-all duration-150">
                  Get Started
                  <ArrowRight size={16} />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <main>
        <section className="mx-auto flex min-h-[calc(100vh-60px)] max-w-[1100px] items-center px-4 py-20 sm:px-6">
          <div className="w-full text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-4 py-1.5 text-sm font-medium text-accent shadow-sm">
              <Sparkles size={14} />
              Config-driven app platform
            </div>

            <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-tight tracking-[-0.02em] text-text-primary sm:text-5xl lg:text-6xl">
              Build elegant business apps from{' '}
              <span className="bg-gradient-to-r from-accent to-violet-600 bg-clip-text text-transparent">
                JSON config
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg">
              AppGen helps teams design, launch, and manage data-driven internal tools with a clean, premium interface and no frontend rebuilds.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link to="/signup" className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-base font-medium text-white shadow-sm transition-all duration-150 hover:-translate-y-px hover:bg-accent-hover hover:shadow-lg">
                Get Started Free
                <ArrowRight size={16} />
              </Link>
              <Link to="/login" className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-6 py-3 text-base font-medium text-text-secondary transition-all duration-150 hover:border-border-strong hover:bg-surface-raised hover:text-text-primary">
                Login
              </Link>
            </div>

            <div className="mt-14 flex flex-wrap items-center justify-center gap-3 text-sm text-text-muted">
              <span className="rounded-full border border-border bg-white px-4 py-2 shadow-sm">Dynamic entities</span>
              <span className="rounded-full border border-border bg-white px-4 py-2 shadow-sm">CSV import/export</span>
              <span className="rounded-full border border-border bg-white px-4 py-2 shadow-sm">Dashboard widgets</span>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1100px] px-4 pb-24 sm:px-6">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Layers,
                title: 'Config-first architecture',
                description: 'Define entities, pages, and dashboards in one configuration flow.',
              },
              {
                icon: Database,
                title: 'Operational workflows',
                description: 'Manage records, imports, notifications, and app settings in one place.',
              },
              {
                icon: BarChart3,
                title: 'Premium analytics view',
                description: 'Present business data with polished cards, charts, and recent activity.',
              },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="rounded-2xl border border-border bg-white p-6 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-light text-accent">
                    <Icon size={20} />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-text-primary">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-text-secondary">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Landing;