import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useApp } from '../../context/AppContext.jsx';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';

const getDefaultValue = (field) => {
  if (field.default_value !== undefined) return field.default_value;
  if (field.type === 'checkbox') return false;
  return '';
};

const EntityForm = ({ entityName, initialData, open, onClose, onSuccess }) => {
  const { config, appId, t } = useApp();
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const entity = useMemo(() => config?.entities?.find((item) => item.name === entityName), [config, entityName]);
  const isEdit = Boolean(initialData);

  useEffect(() => {
    if (!entity) return;
    const initial = {};
    entity.fields.forEach((field) => {
      initial[field.name] = initialData?.data?.[field.name] ?? getDefaultValue(field);
    });
    setValues(initial);
    setErrors({});
    setSubmitError('');
  }, [entity, initialData]);

  const validate = () => {
    const newErrors = {};
    entity?.fields.forEach((field) => {
      const value = values[field.name];
      if (field.required && (value === '' || value === null || value === undefined)) {
        newErrors[field.name] = `${field.label} is required.`;
      }
      if (field.type === 'email' && value && !String(value).includes('@')) {
        newErrors[field.name] = 'Enter a valid email.';
      }
      if (field.type === 'number' && value !== '' && Number.isNaN(Number(value))) {
        newErrors[field.name] = 'Enter a valid number.';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    setSubmitError('');

    try {
      const payload = { ...values };
      if (isEdit) {
        await axios.put(`/api/apps/${appId}/records/${entityName}/${initialData.id}`, payload);
        toast.success('Record updated successfully');
      } else {
        await axios.post(`/api/apps/${appId}/records/${entityName}`, payload);
        toast.success('Record created successfully');
      }
      onSuccess();
    } catch (err) {
      const errorMsg = 'Unable to save record';
      setSubmitError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (!entity) return null;

  return (
    <Modal
      title={`${isEdit ? 'Edit' : 'Create'} ${entity.display_name}`}
      open={open}
      onClose={onClose}
      footer={(
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
          <Button onClick={onClose} variant="secondary" className="w-full sm:w-auto">Cancel</Button>
          <Button onClick={handleSubmit} loading={saving} className="w-full sm:w-auto">{isEdit ? 'Save' : 'Create'}</Button>
        </div>
      )}
    >
      <div className="space-y-5 pr-1 sm:pr-2">
        {entity.fields.map((field) => (
          <div key={field.name} className="space-y-2">
            <label className="block text-sm font-medium text-textPrimary">
              {field.label}{field.required && <span className="text-rose-500">*</span>}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                value={values[field.name] ?? ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={field.placeholder || ''}
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                rows={4}
              />
            ) : field.type === 'select' ? (
              <select
                value={values[field.name] ?? ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select {field.label}</option>
                {(field.options || []).map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            ) : field.type === 'checkbox' ? (
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={Boolean(values[field.name])}
                  onChange={(e) => handleChange(field.name, e.target.checked)}
                  className="h-4 w-4 rounded border border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-textSecondary">{field.placeholder || ''}</span>
              </label>
            ) : (
              <input
                type={['number', 'email', 'date', 'url', 'phone'].includes(field.type) ? field.type : 'text'}
                value={values[field.name] ?? ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={field.placeholder || ''}
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            )}
            {errors[field.name] && <p className="text-sm text-rose-600">{errors[field.name]}</p>}
          </div>
        ))}
        {submitError && <p className="text-sm text-rose-600">{submitError}</p>}
      </div>
    </Modal>
  );
};

export default EntityForm;
