import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import Card from '../ui/Card.jsx';
import Skeleton from '../ui/Skeleton.jsx';

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
          <Card key={index} className={`${widgetClass(widget.span)} min-h-[320px]`}>
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
      <Card>
        <div className="space-y-3 text-center py-16">
          <h2 className="text-xl font-semibold">No dashboard widgets configured.</h2>
          <p className="text-textSecondary">Edit your config to add widgets.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {widgets.map((widget, index) => {
        const data = recordsByEntity[widget.entity] || [];
        if (widget.type === 'stat') {
          const count = data.length;
          return (
            <Card key={index} className={`${widgetClass(widget.span)}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-textSecondary">{widget.title}</p>
                  <p className="mt-4 text-3xl font-bold">{count}</p>
                </div>
                <div className="rounded-2xl bg-primary/10 p-3 text-primary">{widget.icon || '📊'}</div>
              </div>
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
            <Card key={index} className={`${widgetClass(widget.span)} min-h-[320px]`}>
              <h3 className="text-base font-semibold mb-4">{widget.title}</h3>
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
                <div className="flex h-60 items-center justify-center text-textSecondary">No data yet</div>
              )}
            </Card>
          );
        }

        if (widget.type === 'recent') {
          const sorted = [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          const items = sorted.slice(0, widget.limit || 5);
          return (
            <Card key={index} className={`${widgetClass(widget.span)} min-h-[320px]`}>
              <h3 className="text-base font-semibold mb-4">{widget.title}</h3>
              {items.length ? (
                <div className="space-y-3">
                  {items.map((record) => (
                    <div key={record.id} className="rounded-3xl border border-border p-4">
                      <p className="font-semibold">{record.data?.[Object.keys(record.data || {})[0]] || 'Untitled'}</p>
                      <p className="text-sm text-textSecondary">{formatRecentDate(record.createdAt)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-60 items-center justify-center text-textSecondary">No records yet</div>
              )}
            </Card>
          );
        }

        return (
          <Card key={index} className={`${widgetClass(widget.span)}`}>
            <div className="text-textSecondary">Unknown widget type.</div>
          </Card>
        );
      })}
    </div>
  );
};

export default Dashboard;
