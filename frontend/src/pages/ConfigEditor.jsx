import React, { useEffect, useMemo, useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useApp } from '../context/AppContext.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import Input from '../components/ui/Input.jsx';
import Modal from '../components/ui/Modal.jsx';
import { FileText, CheckCircle, XCircle, RotateCcw, Save, Github, Plus, Wand2 } from 'lucide-react';
import toast from 'react-hot-toast';
import GitHubExportModal from '../components/GitHubExportModal.jsx';

const FIELD_TYPES = ['text', 'textarea', 'select', 'checkbox', 'email', 'number', 'date', 'url', 'phone'];

const createEntityTemplate = (name) => ({
  name,
  display_name: name
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' '),
  icon: 'List',
  fields: [],
  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },
});

const createFieldTemplate = ({ name, label, type }) => {
  const field = {
    name,
    label,
    type,
  };

  if (type === 'select') {
    field.options = [
      { value: 'option_1', label: 'Option 1' },
      { value: 'option_2', label: 'Option 2' },
    ];
  }

  if (type === 'checkbox') {
    field.placeholder = 'Toggle on or off';
  }

  return field;
};

const ConfigEditor = () => {
  const { config, setConfig, t, appId } = useApp();
  const [jsonText, setJsonText] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showGitHubModal, setShowGitHubModal] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const [builderEntity, setBuilderEntity] = useState('');
  const [builderName, setBuilderName] = useState('');
  const [builderLabel, setBuilderLabel] = useState('');
  const [builderType, setBuilderType] = useState('text');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const initialJsonRef = useRef('');

  const parsedConfig = useMemo(() => {
    if (!isValid) return null;
    try {
      return JSON.parse(jsonText);
    } catch {
      return null;
    }
  }, [jsonText, isValid]);

  useEffect(() => {
    const initialJson = JSON.stringify(config || {}, null, 2);
    setJsonText(initialJson);
    initialJsonRef.current = initialJson;
  }, [config]);

  const validateJson = (value) => {
    try {
      JSON.parse(value);
      setIsValid(true);
      return true;
    } catch {
      setIsValid(false);
      return false;
    }
  };

  const handleEditorChange = (value) => {
    setJsonText(value);
    validateJson(value);
    setHasUnsavedChanges(value !== initialJsonRef.current);
    setSaveError(null);
  };

  const updateEditorJson = (nextConfig) => {
    const formatted = JSON.stringify(nextConfig, null, 2);
    setJsonText(formatted);
    setIsValid(true);
    setHasUnsavedChanges(formatted !== initialJsonRef.current);
    setSaveError(null);
  };

  const handleAddEntity = () => {
    if (!parsedConfig) return;
    const nextConfig = {
      ...parsedConfig,
      entities: [...(parsedConfig.entities || []), createEntityTemplate('new_entity')],
      pages: parsedConfig.pages || [],
      dashboard: parsedConfig.dashboard || [],
    };
    updateEditorJson(nextConfig);
    toast.success('Entity template added to config');
  };

  const handleAddField = () => {
    if (!parsedConfig || !builderEntity || !builderName || !builderLabel) return;
    const nextConfig = {
      ...parsedConfig,
      entities: (parsedConfig.entities || []).map((entity) => {
        if (entity.name !== builderEntity) return entity;
        return {
          ...entity,
          fields: [...(entity.fields || []), createFieldTemplate({ name: builderName, label: builderLabel, type: builderType })],
        };
      }),
    };
    updateEditorJson(nextConfig);
    setShowBuilder(false);
    setBuilderEntity('');
    setBuilderName('');
    setBuilderLabel('');
    setBuilderType('text');
    toast.success('Field template added to config');
  };

  const handleFormat = () => {
    if (!isValid) return;
    try {
      const parsed = JSON.parse(jsonText);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonText(formatted);
      setHasUnsavedChanges(formatted !== initialJsonRef.current);
    } catch {
      // Should not happen if isValid
    }
  };

  const handleSave = async () => {
    if (!isValid) return;
    setSaving(true);
    setSaveError(null);
    try {
      const parsed = JSON.parse(jsonText);
      await setConfig(parsed);
      initialJsonRef.current = jsonText;
      setHasUnsavedChanges(false);
      toast.success('Config saved successfully');
    } catch (err) {
      const apiError = err?.response?.data;
      const validationFields = apiError?.fields || apiError?.errors || apiError?.details || [];
      if (apiError?.code === 'VALIDATION_ERROR' && Array.isArray(validationFields)) {
        setSaveError({
          code: apiError.code,
          message: apiError.message || 'Config validation failed',
          fields: validationFields,
        });
        toast.error(apiError.message || 'Failed to save config');
      } else {
        const fallbackMessage = apiError?.message || err?.message || 'Failed to save config';
        setSaveError({
          code: apiError?.code || 'SAVE_FAILED',
          message: fallbackMessage,
          fields: validationFields,
        });
        toast.error(fallbackMessage);
      }
    } finally {
      setSaving(false);
    }
  };

  const getPreviewData = () => {
    if (!isValid) return null;
    try {
      const parsed = JSON.parse(jsonText);
      return {
        entities: parsed.entities?.map(e => `${e.display_name} — ${e.fields?.length || 0} fields`) || [],
        pages: parsed.pages?.map(p => `${p.title} (${p.type})`) || [],
        widgets: parsed.dashboard?.length || 0,
      };
    } catch {
      return null;
    }
  };

  const preview = getPreviewData();

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-border/80">
        <div className="flex flex-col gap-5 p-1 sm:flex-row sm:items-center sm:justify-between sm:p-0">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Config editor</p>
            <div className="mt-2 flex items-center gap-3">
              <FileText size={20} className="text-text-muted" />
              <h1 className="text-xl font-semibold tracking-[-0.02em] text-text-primary">config.json</h1>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <div className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium sm:text-sm ${isValid ? 'bg-success-light text-success' : 'bg-danger-light text-danger'}`}>
              {isValid ? <CheckCircle size={14} /> : <XCircle size={14} />}
              {isValid ? 'Valid JSON' : 'Invalid JSON'}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
              <Button onClick={handleAddEntity} disabled={!parsedConfig} variant="secondary" size="sm" className="w-full sm:w-auto">
                <Plus size={16} className="mr-2" />
                Add Entity
              </Button>
              <Button onClick={() => setShowBuilder(true)} disabled={!parsedConfig || !parsedConfig.entities?.length} variant="secondary" size="sm" className="w-full sm:w-auto">
                <Wand2 size={16} className="mr-2" />
                Add Field
              </Button>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
              <Button onClick={handleFormat} disabled={!isValid} variant="secondary" size="sm" className="w-full sm:w-auto">
                <RotateCcw size={16} className="mr-2" />
                Format
              </Button>
              <Button onClick={handleSave} disabled={!isValid || saving} size="sm" className="w-full sm:w-auto">
                <Save size={16} className="mr-2" />
                Save
              </Button>
              <Button onClick={() => setShowGitHubModal(true)} variant="secondary" size="sm" className="w-full sm:w-auto">
                <Github size={16} className="mr-2" />
                Export to GitHub
              </Button>
            </div>
          </div>
        </div>
        {saveError && (
          <div className="mx-1 mt-4 rounded-2xl border border-danger/20 bg-danger-light p-4 text-sm text-danger sm:mx-0">
            <p className="font-semibold">{saveError.message}</p>
            <p className="mt-1 text-xs text-danger/80">Code: {saveError.code}</p>
            {Array.isArray(saveError.fields) && saveError.fields.length > 0 && (
              <div className="mt-3 space-y-2 text-xs text-danger/90">
                {saveError.fields.map((fieldError) => (
                  <div key={`${fieldError.field}-${fieldError.message}`} className="rounded-lg bg-white/80 px-3 py-2">
                    <span className="font-semibold">{fieldError.field}</span>: {fieldError.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-border/80">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-[-0.02em] text-text-primary">Editor</h2>
            <div className={`inline-flex items-center text-xs font-medium ${hasUnsavedChanges ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-600'} rounded-full px-2 py-0.5`}> 
              {!hasUnsavedChanges && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5" />}
              {hasUnsavedChanges ? 'Unsaved changes' : 'Saved'}
            </div>
          </div>
          <div className="h-[55vh] overflow-hidden rounded-2xl border border-border bg-white lg:h-[620px]">
            <Editor
              height="100%"
              language="json"
              theme="light"
              value={jsonText}
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: false },
                lineNumbers: 'on',
                wordWrap: 'on',
                formatOnPaste: true,
                scrollBeyondLastLine: false,
                fontFamily: 'JetBrains Mono',
                fontSize: 13,
              }}
            />
          </div>
        </Card>

        <Card className="border-border/80">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-[-0.02em] text-text-primary">Preview</h2>
            <span className="rounded-full bg-accent-light px-3 py-1 text-xs font-medium text-accent">Live summary</span>
          </div>
          <div className="space-y-6">
            {preview ? (
              <>
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Entities</h3>
                  <div className="space-y-1">
                    {preview.entities.length > 0 ? (
                      preview.entities.map((entity, i) => (
                        <div key={i} className="py-2.5 border-b border-gray-50 last:border-0 flex items-center justify-between">
                          <span className="text-sm text-gray-700">{entity}</span>
                          <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded">{/* fields count already in text */}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-text-secondary">No entities configured</div>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 mt-5">Pages</h3>
                  <div className="space-y-1">
                    {preview.pages.length > 0 ? (
                      preview.pages.map((page, i) => (
                        <div key={i} className="py-2.5 border-b border-gray-50 last:border-0 flex items-center justify-between">
                          <span className="text-sm text-gray-700">{page}</span>
                          <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded">&nbsp;</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-text-secondary">No pages configured</div>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 mt-5">Dashboard widgets</h3>
                  <div className="py-2.5 border-b border-gray-50 last:border-0 flex items-center justify-between">
                    <span className="text-sm text-gray-700">{preview.widgets} widgets configured</span>
                    <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded">&nbsp;</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-danger/30 bg-danger-light px-4 py-12 text-center text-danger">Invalid JSON</div>
            )}
          </div>
        </Card>
      </div>

      {/* GitHub Export Modal */}
      {showGitHubModal && (
        <GitHubExportModal
          appId={appId}
          config={config}
          onClose={() => setShowGitHubModal(false)}
        />
      )}

      {showBuilder && (
        <Modal
          title="Add Field"
          open={showBuilder}
          onClose={() => setShowBuilder(false)}
          footer={(
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => setShowBuilder(false)} className="w-full sm:w-auto">Cancel</Button>
              <Button onClick={handleAddField} className="w-full sm:w-auto">Insert Field</Button>
            </div>
          )}
        >
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary">Entity</label>
                <select
                  value={builderEntity}
                  onChange={(e) => setBuilderEntity(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                >
                  <option value="">Select entity</option>
                  {(parsedConfig?.entities || []).map((entity) => (
                    <option key={entity.name} value={entity.name}>{entity.display_name || entity.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary">Field type</label>
                <select
                  value={builderType}
                  onChange={(e) => setBuilderType(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                >
                  {FIELD_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
            <Input label="Field name" value={builderName} onChange={(e) => setBuilderName(e.target.value)} placeholder="e.g. price" />
            <Input label="Field label" value={builderLabel} onChange={(e) => setBuilderLabel(e.target.value)} placeholder="e.g. Price" />
            <p className="text-xs text-text-muted">
              This inserts a ready-to-edit field template into the selected entity.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ConfigEditor;
