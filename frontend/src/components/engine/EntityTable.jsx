import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useApp } from '../../context/AppContext.jsx';
import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';
import Skeleton from '../ui/Skeleton.jsx';
import EntityForm from './EntityForm.jsx';
import CSVImportModal from '../CSVImportModal.jsx';
import { Plus, FilePlus, Download, MoreHorizontal } from 'lucide-react';

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
  return 'bg-surface-raised text-text-secondary';
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
  const [actionsOpen, setActionsOpen] = useState(false);
  const actionsRef = useRef(null);

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

  // Close small-screen actions menu on outside click
  useEffect(() => {
    const onDocClick = (e) => {
      if (!actionsRef.current) return;
      if (!actionsRef.current.contains(e.target)) {
        setActionsOpen(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

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
      <Card className="border-border/80">
        <div className="space-y-3 py-16 text-center">
          <h2 className="text-xl font-semibold tracking-[-0.02em] text-text-primary">Entity '{entityName}' not found in config</h2>
          <p className="text-text-secondary">Check your app configuration or return to the dashboard.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <Card className="bg-white rounded-xl border border-[#E4E7EC] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
        {/* TOOLBAR */}
        <div className="px-5 py-4 border-b border-[#E4E7EC]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-semibold text-gray-900">{pageTitle}</h2>
              <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{filteredRecords.length} records</span>
            </div>

            <div className="hidden sm:flex items-center gap-2 flex-shrink-0 relative z-10">
              {createAllowed && (
                <Button onClick={openCreate} variant="primary" className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium">
                  <Plus size={14} />
                  Create
                </Button>
              )}
              <Button onClick={downloadCSV} variant="secondary" className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium">
                <Download size={13} />
                Export
              </Button>
              <Button onClick={() => setImportModalOpen(true)} variant="secondary" className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium">
                <FilePlus size={13} />
                Import
              </Button>
            </div>

            {/* Small screen overflow menu */}
            <div className="sm:hidden relative" ref={actionsRef}>
              <button
                onClick={() => setActionsOpen((s) => !s)}
                aria-label="Actions"
                className="w-9 h-9 inline-flex items-center justify-center rounded-md border border-[#E4E7EC] bg-white text-gray-600 hover:bg-gray-50"
              >
                <MoreHorizontal size={16} />
              </button>

              {actionsOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-md shadow-lg border border-[#E4E7EC] z-20">
                  <div className="flex flex-col p-2">
                    {createAllowed && (
                      <button
                        onClick={() => { openCreate(); setActionsOpen(false); }}
                        className="text-sm text-left px-3 py-2 rounded hover:bg-gray-50"
                      >
                        Create
                      </button>
                    )}
                    <button
                      onClick={() => { downloadCSV(); setActionsOpen(false); }}
                      className="text-sm text-left px-3 py-2 rounded hover:bg-gray-50"
                    >
                      Export
                    </button>
                    <button
                      onClick={() => { setImportModalOpen(true); setActionsOpen(false); }}
                      className="text-sm text-left px-3 py-2 rounded hover:bg-gray-50"
                    >
                      Import
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 h-8 text-sm border border-[#E4E7EC] rounded-lg bg-[#F8F9FB] text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all duration-150"
              />
            </div>

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
                  className="h-8 px-3 pr-7 text-sm border border-[#E4E7EC] rounded-lg bg-white text-gray-600 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-150 min-w-[120px]"
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

            {Object.values(filterValues).some(Boolean) && (
              <button onClick={() => setFilterValues({})} className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors duration-150">
                {Object.values(filterValues).filter(Boolean).length} filters
              </button>
            )}
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="space-y-4 p-6">
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
              <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 text-2xl">📭</div>
              <h2 className="text-xl font-semibold text-gray-700">No {entity.display_name} yet</h2>
              {createAllowed && <Button onClick={openCreate}>Create your first one</Button>}
            </div>
          ) : (
            <div className="-mx-6 sm:mx-0">
              <div className="inline-block min-w-full px-6 sm:px-0">
                <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
                  <thead>
                    <tr className="bg-[#F8F9FB] border-b border-[#E4E7EC]">
                      {columns.map((column) => (
                        <th key={column} className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-[0.06em] whitespace-nowrap">{fieldLabel(column)}</th>
                      ))}
                      <th className="px-4 py-2.5 w-16" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6]">
                    {filteredRecords.map((record) => (
                      <tr key={record.id} className="group hover:bg-[#F8F9FB] transition-colors duration-100">
                        {columns.map((column) => {
                          const fieldDef = entityFields.find((field) => field.name === column);
                          const value = record.data?.[column];
                          const display = fieldDef?.type === 'select' ? (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${badgeColor(value)}`}>{value}</span>
                          ) : (
                            <span className="text-sm text-gray-700 truncate max-w-[220px]">{formatValue(value, fieldDef?.type)}</span>
                          );
                          return <td key={column} className="px-4 py-3 text-sm text-gray-700 max-w-[220px]">{display}</td>;
                        })}

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 justify-end">
                            <button className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:bg-indigo-50 hover:text-indigo-500 transition-all duration-150" onClick={() => openEdit(record)}>
                              <Plus size={13} />
                            </button>
                            <button className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-400 transition-all duration-150" onClick={() => handleDelete(record.id)}>
                              <FilePlus size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
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
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
};

export default EntityTable;
