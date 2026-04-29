import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import Card from '../ui/Card.jsx';
import Skeleton from '../ui/Skeleton.jsx';
import DynamicIcon from '../../utils/iconMap.js';
import { BarChart2 } from 'lucide-react';

const palette = ['#6366F1', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6'];

const formatRecentDate = (value) => {
  const date = new Date(value);
  const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
  return `${Math.floor(diffSeconds / 86400)}d ago`;
};

const Dashboard = () => {
  const { config, appId, t } = useApp();
  const widgets = config?.dashboard || [];
  const [recordsByEntity, setRecordsByEntity] = useState({});
  const [loading, setLoading] = useState(true);

  const entityNames = useMemo(() => [...new Set(widgets.map((widget) => widget.entity).filter(Boolean))], [widgets]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const results = {};
        await Promise.all(entityNames.map(async (entity) => {
          try {
            const res = await axios.get(`/api/apps/${appId}/records/${entity}`);
            results[entity] = res.data.records || [];
          } catch (err) {
            results[entity] = [];
          }
        }));
        setRecordsByEntity(results);
      } finally {
        setLoading(false);
      }
    };
    if (entityNames.length) {
      fetchAll();
    } else {
      setLoading(false);
    }
  }, [appId, entityNames]);

  const widgetClass = (span) => {
    if (span === 2) return 'md:col-span-2';
    return 'md:col-span-1';
  };

  if (loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-4">
        {widgets.map((widget, index) => (
          <Card key={index} className={`${widgetClass(widget.span)} min-h-[320px] border-border/80`}>
            <div className="space-y-4">
              <Skeleton width="60%" height="1.5rem" />
              <Skeleton width="40%" height="2rem" />
              <Skeleton width="100%" height="200px" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!widgets.length) {
    return (
      <Card className="border-border/80">
        <div className="space-y-3 py-16 text-center">
          <h2 className="text-xl font-semibold tracking-[-0.02em] text-text-primary">No dashboard widgets configured.</h2>
          <p className="text-text-secondary">Edit your config to add widgets.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-0.5">Overview of {config?.settings?.app_name}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {widgets.map((widget, index) => {
          const data = recordsByEntity[widget.entity] || [];

          if (widget.type === 'stat') {
            const count = data.length;
            const colors = [
              { bg: 'bg-indigo-50', color: '#4F46E5' },
              { bg: 'bg-emerald-50', color: '#059669' },
              { bg: 'bg-amber-50', color: '#D97706' },
              { bg: 'bg-rose-50', color: '#E11D48' },
            ];
            const slot = colors[index % 4];
            return (
              <Card key={index} className={`${widgetClass(widget.span)} overflow-hidden border-border/80 bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]`}>
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm font-medium text-gray-500">{widget.title}</p>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${slot.bg}`}>
                    <DynamicIcon name={widget.icon} size={18} color={slot.color} />
                  </div>
                </div>

                <p className="text-3xl font-bold text-gray-900 tracking-tight">{count}</p>
                <p className="text-xs text-gray-400 mt-1">Total records</p>
              </Card>
            );
          }

          if (widget.type === 'chart') {
            const grouped = {};
            data.forEach((record) => {
              const key = record.data?.[widget.group_by] ?? 'Unknown';
              grouped[key] = (grouped[key] || 0) + 1;
            });
            const chartData = Object.entries(grouped).map(([name, value]) => ({ name, value }));

            return (
              <Card key={index} className={`${widgetClass(widget.span)} min-h-[320px] border-border/80 bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]`}>
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">{widget.title}</h3>
                </div>

                {chartData.length ? (
                  <ResponsiveContainer width="100%" height={260}>
                    {widget.chartType === 'pie' ? (
                      <PieChart>
                        <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={90} fill="#8884d8">
                          {chartData.map((item, idx) => (
                            <Cell key={item.name} fill={palette[idx % palette.length]} />
                          ))}
                        </Pie>
                        <Legend />
                      </PieChart>
                    ) : (
                      <BarChart data={chartData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill={palette[0]} />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-60 items-center justify-center rounded-2xl border border-dashed border-border bg-surface-raised text-text-secondary">No data yet</div>
                )}
              </Card>
            );
          }

          if (widget.type === 'recent') {
            const sorted = [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            const items = sorted.slice(0, widget.limit || 5);
            return (
              <Card key={index} className={`${widgetClass(widget.span)} min-h-[320px] border-border/80 bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]`}>
                <h3 className="text-sm font-semibold text-gray-700 mb-4">{widget.title}</h3>

                {items.length ? (
                  <div className="space-y-1">
                    {items.map((record) => (
                      <div key={record.id} className="py-2.5 border-b border-gray-50 last:border-0 flex items-center justify-between">
                        <p className="text-sm text-gray-700 truncate max-w-[200px]">{record.data?.[Object.keys(record.data || {})[0]] || 'Untitled'}</p>
                        <p className="text-xs text-gray-400 flex-shrink-0 ml-2">{formatRecentDate(record.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mb-3">
                      <BarChart2 size={18} className="text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-400">No records yet</p>
                    <p className="text-xs text-gray-300 mt-1">Add records to see recent activity</p>
                  </div>
                )}
              </Card>
            );
          }

          return (
            <Card key={index} className={`${widgetClass(widget.span)} border-border/80`}>
              <div className="text-text-secondary">Unknown widget type.</div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
