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
      <div className="rounded-[28px] border border-border bg-[linear-gradient(135deg,#FFFFFF_0%,#EEF2FF_100%)] p-6 shadow-card sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-accent">Activity feed</p>
            <h1 className="text-3xl font-semibold tracking-[-0.03em] text-text-primary">Notifications</h1>
            <p className="mt-3 text-sm leading-6 text-text-secondary">All activity for this app in one place.</p>
          </div>
          <Button onClick={markAllRead} variant="secondary">Mark all read</Button>
        </div>
      </div>
      {loading ? (
        <Card className="border-border/80"><div className="py-16 text-center text-text-secondary">{t('loading')}</div></Card>
      ) : notifications.length === 0 ? (
        <Card className="border-border/80"><div className="py-16 text-center text-text-secondary">No notifications yet</div></Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => {
            const Icon = iconMap[notification.type] || Bell;
            return (
              <Card key={notification.id} className={`${notification.read ? 'bg-white' : 'bg-accent-light/60'} border-border/80`}>
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-white p-3 text-accent shadow-sm">
                    <Icon size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold text-text-primary">{notification.message}</p>
                      <span className="rounded-full bg-surface-raised px-2 py-1 text-xs text-text-secondary">{notification.type}</span>
                    </div>
                    <p className="mt-2 text-sm text-text-secondary">{relativeTime(notification.createdAt)}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
};

export default NotificationsPage;
