import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const AppContext = createContext(null);

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const { appId } = useParams();
  const navigate = useNavigate();
  const [config, setConfigState] = useState({});
  const [isLoadingConfig, setLoadingConfig] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState('');

  const t = (key) => {
    return config?.localization?.[currentLanguage]?.[key] ?? key;
  };

  const fetchNotifications = async () => {
    if (!appId) return;
    try {
      const res = await axios.get(`/api/apps/${appId}/notifications`);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      setUnreadCount(0);
    }
  };

  const loadConfig = async () => {
    if (!appId) {
      setConfigState({});
      setLoadingConfig(false);
      return;
    }

    setLoadingConfig(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`/api/apps/${appId}/config`, { headers });
      const fetchedConfig = res.data.config || {};
      setConfigState(fetchedConfig);
      setCurrentLanguage(fetchedConfig?.settings?.default_language || 'en');
      await fetchNotifications();
    } catch (err) {
      setConfigState({});
      setError('Unable to load app configuration.');
      navigate('/apps');
    } finally {
      setLoadingConfig(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, [appId]);

  const setConfig = async (newConfig) => {
    if (!appId) return;
    try {
      const res = await axios.put(`/api/apps/${appId}/config`, { config: newConfig });
      setConfigState(newConfig);
      await fetchNotifications();
      return res.data;
    } catch (err) {
      throw new Error('Unable to save configuration.');
    }
  };

  return (
    <AppContext.Provider
      value={{
        appId,
        config,
        isLoadingConfig,
        setConfig,
        currentLanguage,
        setLanguage: setCurrentLanguage,
        t,
        unreadCount,
        refreshNotifications: fetchNotifications,
        error,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
