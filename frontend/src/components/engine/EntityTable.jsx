import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useApp } from '../../context/AppContext.jsx';
import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';
import Skeleton from '../ui/Skeleton.jsx';
import EntityForm from './EntityForm.jsx';
import CSVImportModal from '../CSVImportModal.jsx';
import { Plus, FilePlus, Download } from 'lucide-react';

const formatValue = (value, type) => {
  if (value === undefined || value === null || value === '') return '—';
  if (type === 'checkbox') return value ? '✓' : '✗';
  if (type === 'date') return new Date(value).toLocaleDateString();
  if (type === 'email') return value;
  if (type === 'url') return value;
  return String(value);
};

const badgeColor = (value) => {
  if (['done', 'active', 'served', 'completed'].includes(value)) return 'bg-emerald-100 text-emerald-700';
  if (['pending', 'in_progress', 'review'].includes(value)) return 'bg-sky-100 text-sky-700';
  if (['cancelled', 'inactive', 'critical', 'urgent'].includes(value)) return 'bg-rose-100 text-rose-700';
  return 'bg-gray-100 text-textSecondary';
};

const EntityTable = () => {
  const { appId, config, t } = useApp();
  const { entityName } = useParams();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterValues, setFilterValues] = useState({});
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [error, setError] = useState('');
  const [isImportModalOpen, setImportModalOpen] = useState(false);

  const pageConfig = config?.pages?.find((page) => page.entity === entityName);
  const entity = config?.entities?.find((item) => item.name === entityName);

  const entityFields = entity?.fields || [];
  const columns = pageConfig?.columns || [];
  const filters = pageConfig?.filters || [];
  const createAllowed = entity?.permissions?.create;

  useEffect(() => {
    if (!entityName) return;
    const fetchRecords = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`/api/apps/${appId}/records/${entityName}`);
        setRecords(res.data.records || []);
      } catch (err) {
        setError('Unable to load records.');
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, [appId, entityName]);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const data = record.data || {};
      const searchLower = search.trim().toLowerCase();
      const matchesSearch = searchLower
        ? Object.values(data).some((value) => typeof value === 'string' && value.toLowerCase().includes(searchLower))
        : true;
      const matchesFilters = Object.entries(filterValues).every(([field, value]) => {
        if (!value) return true;
        return String(data[field] ?? '').toLowerCase() === String(value).toLowerCase();
      });
      return matchesSearch && matchesFilters;
    });
  }, [records, search, filterValues]);

  const pageTitle = pageConfig?.title || entity?.display_name || entityName;

  const fieldLabel = (fieldName) => entityFields.find((field) => field.name === fieldName)?.label || fieldName;

  const openCreate = () => {
    setEditingRecord(null);
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditingRecord(record);
    setModalOpen(true);
  };

  const refreshRecords = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/apps/${appId}/records/${entityName}`);
      setRecords(res.data.records || []);
    } catch (err) {
      setError('Unable to refresh records.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (recordId) => {
    if (!confirm('Delete this record?')) return;
    try {
      await axios.delete(`/api/apps/${appId}/records/${entityName}/${recordId}`);
      toast.success('Record deleted successfully');
      refreshRecords();
    } catch (err) {
      const errorMsg = 'Unable to delete record';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const downloadCSV = () => {
    const header = columns.map((column) => fieldLabel(column));
    const rows = filteredRecords.map((record) =>
      columns.map((column) => {
        const value = record.data?.[column];
        return typeof value === 'object' ? JSON.stringify(value) : value;
      })
    );

    const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell ?? '')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${entityName}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!entity || !pageConfig) {
    return (
      <Card>
        <div className="space-y-3 text-center py-16">
          <h2 className="text-xl font-semibold">Entity '{entityName}' not found in config</h2>
          <p className="text-textSecondary">Check your app configuration or return to the dashboard.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{pageTitle}</h1>
            <p className="text-sm text-textSecondary">{filteredRecords.length} records</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('search')}
              className="w-full rounded-2xl border border-border bg-white px-4 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 sm:min-w-[200px]"
            />
            {filters.map((field) => {
              const fieldDef = entityFields.find((item) => item.name === field);
              const options = fieldDef?.options
                ? fieldDef.options
                : Array.from(new Set(records.map((record) => record.data?.[field] ?? ''))).filter(Boolean);
              return (
                <select
                  key={field}
                  value={filterValues[field] || ''}
                  onChange={(e) => setFilterValues({ ...filterValues, [field]: e.target.value })}
                  className="w-full rounded-2xl border border-border bg-white px-4 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 sm:min-w-[150px]"
                >
                  <option value="">All {fieldLabel(field)}</option>
                  {options.map((option, idx) => {
                    const optionValue = typeof option === 'object' && option !== null ? option.value : option;
                    const optionLabel = typeof option === 'object' && option !== null ? option.label : option;
                    const displayValue = optionLabel ?? optionValue;
                    return (
                      <option key={`${field}-${idx}-${String(displayValue)}`} value={optionValue ?? displayValue}>
                        {displayValue}
                      </option>
                    );
                  })}
                </select>
              );
            })}
            {createAllowed && (
              <Button onClick={openCreate} variant="primary" className="w-full sm:w-auto">
                <Plus size={16} className="mr-2" /> Create
              </Button>
            )}
            <Button onClick={downloadCSV} variant="secondary" className="w-full sm:w-auto">
              <Download size={16} className="mr-2" /> Export
            </Button>
            <Button onClick={() => setImportModalOpen(true)} variant="secondary" className="w-full sm:w-auto">
              <FilePlus size={16} className="mr-2" /> Import CSV
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex space-x-4">
                {columns.map((column) => (
                  <Skeleton key={column} width="100%" height="2rem" className="flex-1" />
                ))}
                <Skeleton width="80px" height="2rem" />
              </div>
            ))}
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="space-y-4 py-16 text-center">
            <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-2xl">📭</div>
            <h2 className="text-xl font-semibold">No {entity.display_name} yet</h2>
            {createAllowed && (
              <Button onClick={openCreate}>Create your first one</Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 sm:mx-0">
            <div className="inline-block min-w-full px-6 sm:px-0">
            <table className="min-w-full divide-y divide-border text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column) => (
                    <th key={column} className="px-4 py-3 font-medium text-textSecondary">{fieldLabel(column)}</th>
                  ))}
                  <th className="px-4 py-3 font-medium text-textSecondary">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    {columns.map((column) => {
                      const fieldDef = entityFields.find((field) => field.name === column);
                      const value = record.data?.[column];
                      const display = fieldDef?.type === 'select' ? (
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${badgeColor(value)}`}>{value}</span>
                      ) : (
                        formatValue(value, fieldDef?.type)
                      );
                      return <td key={column} className="px-4 py-3 align-top">{display}</td>;
                    })}
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
                        <button className="w-full rounded-2xl border border-border px-2 py-2 text-xs sm:w-auto sm:px-3 sm:text-sm hover:bg-gray-50" onClick={() => openEdit(record)}>Edit</button>
                        <button className="w-full rounded-2xl border border-border px-2 py-2 text-xs text-rose-600 sm:w-auto sm:px-3 sm:text-sm hover:bg-rose-50" onClick={() => handleDelete(record.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </Card>

      <EntityForm
        entityName={entityName}
        initialData={editingRecord}
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false);
          refreshRecords();
        }}
      />
      <CSVImportModal
        isOpen={isImportModalOpen}
        onClose={() => setImportModalOpen(false)}
        entityName={entityName}
        onImportComplete={refreshRecords}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default EntityTable;
