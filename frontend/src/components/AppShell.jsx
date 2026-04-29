import React, { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import { Layers, LayoutDashboard, List, Settings, Bell, ArrowLeft, Menu, ChevronDown, Check, LogOut } from 'lucide-react';

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
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const languageMenuRef = useRef(null);
  const availableLanguages = Object.keys(config?.localization || {});

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

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target)) {
        setLanguageMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const settings = config?.settings || {};
  const entities = config?.entities || [];

  const handleLogout = () => {
    setMenuOpen(false);
    setLanguageMenuOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

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
      <div className="min-h-screen flex items-center justify-center bg-background text-text-secondary">
        {t('loading')}
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-text-secondary">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-textPrimary">
      <div className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-surface px-6 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            className="text-text-secondary hover:text-text-primary p-1"
            onClick={() => (isMobile ? setMobileSidebarOpen((open) => !open) : setSidebarOpen((open) => !open))}
            aria-label="Toggle sidebar"
          >
            <Menu size={20} className="text-text-muted" />
          </button>
          <h2 className="text-base font-semibold text-text-primary">{pageTitle()}</h2>
        </div>

        <div className="flex items-center gap-3">
          {availableLanguages.length > 1 && (
            <div className="relative" ref={languageMenuRef}>
              <button
                type="button"
                onClick={() => setLanguageMenuOpen((open) => !open)}
                className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-surface-raised hover:text-text-primary"
                aria-haspopup="menu"
                aria-expanded={languageMenuOpen}
              >
                <span>{currentLanguage?.toUpperCase() || 'EN'}</span>
                <ChevronDown size={14} />
              </button>
              {languageMenuOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-40 rounded-2xl border border-border bg-surface p-2 shadow-dropdown">
                  {availableLanguages.map((languageCode) => (
                    <button
                      key={languageCode}
                      type="button"
                      onClick={() => {
                        setLanguage(languageCode);
                        setLanguageMenuOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-surface-raised ${currentLanguage === languageCode ? 'text-accent' : 'text-text-secondary hover:text-text-primary'}`}
                    >
                      <span className="uppercase tracking-[0.16em]">{languageCode}</span>
                      {currentLanguage === languageCode && <Check size={14} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <button
            className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-surface hover:bg-surface-raised"
            onClick={() => navigate(`/apps/${appId}/notifications`)}
            aria-label="Notifications"
          >
            <Bell size={16} className="text-text-secondary" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-accent text-white text-[10px] font-medium">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-surface-raised hover:text-text-primary"
            onClick={handleLogout}
            aria-label="Logout"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>

          <div className="relative">
            <button
              className="flex w-9 h-9 items-center justify-center rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-hover transform transition duration-150 hover:scale-105"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="User menu"
            >
              {user?.name?.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'U'}
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-surface shadow-dropdown p-2">
                <div className="py-1">
                  <button
                    className="w-full text-left rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-surface-raised hover:text-text-primary"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate('/apps');
                    }}
                  >
                    Back to Apps
                  </button>
                </div>
                <div className="py-1">
                  <button
                    className="w-full text-left rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-surface-raised hover:text-text-primary"
                    onClick={() => {
                      handleLogout();
                    }}
                  >
                    Logout
                  </button>
                </div>
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
          <div className="px-3 py-4 border-b border-border flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: settings.color || '#6366F1' }}>
              {iconMap[settings.icon] ? React.createElement(iconMap[settings.icon], { size: 18, className: 'text-white' }) : <Layers size={18} className="text-white" />}
            </div>
            {(!isMobile || isMobileSidebarOpen) && (
              <div>
                <div className="text-sm font-semibold text-text-primary">{settings.app_name || 'App'}</div>
                <div className="text-xs text-text-muted mt-0.5">{settings.theme || 'Platform'}</div>
              </div>
            )}
          </div>

          <div className="px-3 pt-4">
            <div className="text-[10px] font-semibold tracking-widest text-text-muted px-3 pb-2 uppercase">Menu</div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-2">
            <NavLink
              to={`/apps/${appId}/dashboard`}
              className={({ isActive }) => `flex h-9 items-center gap-3 px-3 text-sm rounded-lg ${isActive ? 'bg-accent-light text-accent font-medium border-l-2 border-accent' : 'text-text-secondary hover:bg-surface-raised hover:text-text-primary'}`}
            >
              <LayoutDashboard size={16} className={"text-text-muted"} />
              {(!isMobile || isMobileSidebarOpen) && <span className="truncate">{t('dashboard')}</span>}
            </NavLink>
            {entities.map((entity) => {
              const IconComponent = iconMap[entity.icon] || List;
              return (
                <NavLink
                  key={entity.name}
                  to={`/apps/${appId}/entity/${entity.name}`}
                  className={({ isActive }) => `flex h-9 items-center gap-3 px-3 text-sm rounded-lg ${isActive ? 'bg-accent-light text-accent font-medium border-l-2 border-accent' : 'text-text-secondary hover:bg-surface-raised hover:text-text-primary'}`}
                >
                  <IconComponent size={16} className={"text-text-muted"} />
                  {(!isMobile || isMobileSidebarOpen) && <span className="truncate">{entity.display_name}</span>}
                </NavLink>
              );
            })}

            <div className="my-3 border-t border-border" />

            <NavLink
              to={`/apps/${appId}/config`}
              className={({ isActive }) => `flex h-9 items-center gap-3 px-3 text-sm rounded-lg ${isActive ? 'bg-accent-light text-accent font-medium border-l-2 border-accent' : 'text-text-secondary hover:bg-surface-raised hover:text-text-primary'}`}
            >
              <Settings size={16} className={"text-text-muted"} />
              {(!isMobile || isMobileSidebarOpen) && <span className="truncate">{t('config_editor')}</span>}
            </NavLink>

            <NavLink
              to={`/apps/${appId}/notifications`}
              className={({ isActive }) => `flex h-9 items-center gap-3 px-3 text-sm rounded-lg ${isActive ? 'bg-accent-light text-accent font-medium border-l-2 border-accent' : 'text-text-secondary hover:bg-surface-raised hover:text-text-primary'}`}
            >
              <Bell size={16} className={"text-text-muted"} />
              {(!isMobile || isMobileSidebarOpen) && <span className="truncate">{t('notifications')}</span>}
              {unreadCount > 0 && !isMobile && isSidebarOpen && (
                <span className="ml-auto inline-flex h-4 w-4 items-center justify-center rounded-full bg-accent text-white text-[10px] font-medium">
                  {unreadCount}
                </span>
              )}
            </NavLink>
          </nav>
          {(!isMobile || isMobileSidebarOpen) && (
            <div className="mt-auto px-2 py-3 border-t border-border">
              <button
                className="flex w-full items-center gap-2 h-9 rounded-lg px-3 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-raised"
                onClick={() => navigate('/apps')}
              >
                <ArrowLeft size={16} className="text-text-muted" />
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
