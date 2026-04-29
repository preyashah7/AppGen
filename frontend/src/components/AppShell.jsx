import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import { Layers, LayoutDashboard, List, Settings, Bell, ArrowLeft, ChevronLeft, Menu } from 'lucide-react';

const iconMap = {
  Layers,
  List,
  Settings,
  Bell,
  LayoutDashboard,
};

const AppShell = () => {
  const { user, logout } = useAuth();
  const { config, isLoadingConfig, currentLanguage, setLanguage, t, unreadCount, error } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const { appId } = useParams();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');

    const handleChange = (event) => {
      setIsMobile(event.matches);
      setMobileSidebarOpen(false);
      setMenuOpen(false);
    };

    handleChange(mediaQuery);
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  useEffect(() => {
    if (isMobile) {
      setMobileSidebarOpen(false);
      setMenuOpen(false);
    }
  }, [location.pathname, isMobile]);

  const settings = config?.settings || {};
  const entities = config?.entities || [];

  const pageTitle = () => {
    if (location.pathname.includes('/dashboard')) return t('dashboard');
    if (location.pathname.includes('/config')) return t('config_editor');
    if (location.pathname.includes('/notifications')) return t('notifications');
    const entityMatch = location.pathname.match(/entity\/([^\/]+)/);
    if (entityMatch) {
      const entityName = entityMatch[1];
      const entity = entities.find((item) => item.name === entityName);
      return entity?.display_name || entityName;
    }
    return settings.app_name || 'App';
  };

  if (isLoadingConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-textSecondary">
        {t('loading')}
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-textSecondary">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-textPrimary">
      <div className="sticky top-0 z-50 flex min-h-14 flex-wrap items-center justify-between gap-3 border-b border-border bg-white/95 px-3 py-3 shadow-sm backdrop-blur sm:h-14 sm:flex-nowrap sm:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            className="text-textSecondary hover:text-primary"
            onClick={() => (isMobile ? setMobileSidebarOpen((open) => !open) : setSidebarOpen((open) => !open))}
          >
            <Menu size={20} />
          </button>
          <h2 className="truncate text-base font-semibold sm:text-lg">{pageTitle()}</h2>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {Object.keys(config?.localization || {}).length > 1 && (
            <select
              value={currentLanguage}
              onChange={(e) => setLanguage(e.target.value)}
              className="max-w-[6.5rem] rounded-lg border border-border bg-white px-2 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:max-w-none sm:px-3"
            >
              {Object.keys(config.localization).map((lang) => (
                <option key={lang} value={lang}>{lang.toUpperCase()}</option>
              ))}
            </select>
          )}
          <button
            className="relative rounded-lg bg-white border border-border px-3 py-2 hover:border-primary"
            onClick={() => navigate(`/apps/${appId}/notifications`)}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary text-[10px] text-white">
                {unreadCount}
              </span>
            )}
          </button>
          <div className="relative">
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {user.name?.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-border bg-white p-2 shadow-lg">
                <button
                  className="w-full rounded-xl px-3 py-2 text-left text-sm text-textPrimary hover:bg-gray-50"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate('/apps');
                  }}
                >
                  Back to Apps
                </button>
                <button
                  className="w-full rounded-xl px-3 py-2 text-left text-sm text-textPrimary hover:bg-gray-50"
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {isMobile && isMobileSidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
      <div className="flex min-h-[calc(100dvh-3.5rem)]">
        <aside
          className={`border-r border-border bg-white transition-transform duration-300 ${isMobile ? `fixed inset-y-14 left-0 z-40 flex h-[calc(100dvh-3.5rem)] w-72 max-w-[85vw] flex-col overflow-hidden shadow-2xl ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}` : `fixed inset-y-14 left-0 z-40 flex h-[calc(100dvh-3.5rem)] w-72 flex-col overflow-hidden shadow-xl ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}`}
        >
          <div className="flex h-20 items-center gap-3 border-b border-border px-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white">
              {iconMap[settings.icon] ? React.createElement(iconMap[settings.icon]) : <Layers size={20} />}
            </div>
            {(!isMobile || isMobileSidebarOpen) && (
              <div>
                <div className="text-sm font-semibold">{settings.app_name || 'App'}</div>
                <div className="text-xs text-textSecondary">{settings.theme || 'Platform'}</div>
              </div>
            )}
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto p-2">
            <NavLink
              to={`/apps/${appId}/dashboard`}
              className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-3 py-2 text-sm ${isActive ? 'bg-primary/10 text-primary' : 'text-textSecondary hover:bg-gray-50'}`}
            >
              <LayoutDashboard size={18} />
              {(!isMobile || isMobileSidebarOpen) && t('dashboard')}
            </NavLink>
            {entities.map((entity) => {
              const IconComponent = iconMap[entity.icon] || List;
              return (
                <NavLink
                  key={entity.name}
                  to={`/apps/${appId}/entity/${entity.name}`}
                  className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-3 py-2 text-sm ${isActive ? 'bg-primary/10 text-primary' : 'text-textSecondary hover:bg-gray-50'}`}
                >
                  <IconComponent size={18} />
                  {(!isMobile || isMobileSidebarOpen) && entity.display_name}
                </NavLink>
              );
            })}
            <div className="border-t border-border pt-3" />
            <NavLink
              to={`/apps/${appId}/config`}
              className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-3 py-2 text-sm ${isActive ? 'bg-primary/10 text-primary' : 'text-textSecondary hover:bg-gray-50'}`}
            >
              <Settings size={18} />
              {(!isMobile || isMobileSidebarOpen) && t('config_editor')}
            </NavLink>
            <NavLink
              to={`/apps/${appId}/notifications`}
              className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-3 py-2 text-sm ${isActive ? 'bg-primary/10 text-primary' : 'text-textSecondary hover:bg-gray-50'}`}
            >
              <Bell size={18} />
              {(!isMobile || isMobileSidebarOpen) && t('notifications')}
              {unreadCount > 0 && !isMobile && isSidebarOpen && (
                <span className="ml-auto inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary text-[10px] text-white">
                  {unreadCount}
                </span>
              )}
            </NavLink>
          </nav>
          {(!isMobile || isMobileSidebarOpen) && (
            <div className="mt-auto p-4">
              <button
                className="flex w-full items-center gap-2 rounded-2xl border border-border bg-white px-3 py-2 text-sm text-textPrimary hover:bg-gray-50"
                onClick={() => navigate('/apps')}
              >
                <ArrowLeft size={16} />
                Back to My Apps
              </button>
            </div>
          )}
        </aside>
        <main className={`min-w-0 flex-1 p-4 transition-all duration-300 sm:p-6 ${!isMobile && isSidebarOpen ? 'md:ml-72' : 'md:ml-0'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppShell;
