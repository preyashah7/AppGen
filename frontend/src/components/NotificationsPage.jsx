import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import axios from 'axios';
import Card from './ui/Card.jsx';
import Button from './ui/Button.jsx';
import { PlusCircle, Trash2, Settings, Upload, Bell } from 'lucide-react';

const iconMap = {
  record_created: PlusCircle,
  record_deleted: Trash2,
  config_updated: Settings,
  csv_imported: Upload,
};

const relativeTime = (value) => {
  const date = new Date(value);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const NotificationsPage = () => {
  const { appId, t, refreshNotifications } = useApp();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/apps/${appId}/notifications`);
      setNotifications(res.data.notifications || []);
      refreshNotifications();
    } catch (err) {
      setError('Unable to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [appId]);

  const markAllRead = async () => {
    try {
      await axios.put(`/api/apps/${appId}/notifications/read`);
      loadNotifications();
    } catch (err) {
      setError('Unable to mark notifications read.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t('notifications')}</h1>
          <p className="text-sm text-textSecondary">All activity for this app.</p>
        </div>
        <Button onClick={markAllRead} variant="secondary">Mark all read</Button>
      </div>
      {loading ? (
        <Card><div className="py-16 text-center text-textSecondary">{t('loading')}</div></Card>
      ) : notifications.length === 0 ? (
        <Card><div className="py-16 text-center text-textSecondary">No notifications yet</div></Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => {
            const Icon = iconMap[notification.type] || Bell;
            return (
              <Card key={notification.id} className={`${notification.read ? 'bg-white' : 'bg-primary/5'}`}>
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-white p-3 text-primary shadow-sm">
                    <Icon size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold">{notification.message}</p>
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-textSecondary">{notification.type}</span>
                    </div>
                    <p className="mt-2 text-sm text-textSecondary">{relativeTime(notification.createdAt)}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      {error && <p className="text-sm text-rose-600">{error}</p>}
    </div>
  );
};

export default NotificationsPage;
