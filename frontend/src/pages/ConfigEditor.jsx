import React, { useEffect, useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useApp } from '../context/AppContext.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import { FileText, CheckCircle, XCircle, RotateCcw, Save, Github } from 'lucide-react';
import toast from 'react-hot-toast';
import GitHubExportModal from '../components/GitHubExportModal.jsx';

const ConfigEditor = () => {
  const { config, setConfig, t, appId } = useApp();
  const [jsonText, setJsonText] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showGitHubModal, setShowGitHubModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const initialJsonRef = useRef('');

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
    try {
      const parsed = JSON.parse(jsonText);
      await setConfig(parsed);
      initialJsonRef.current = jsonText;
      setHasUnsavedChanges(false);
      toast.success('Config saved successfully');
    } catch (err) {
      toast.error('Failed to save config');
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
      {/* Toolbar */}
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <FileText size={20} className="text-textSecondary" />
            <span className="font-medium">config.json</span>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <div className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs sm:text-sm ${isValid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {isValid ? <CheckCircle size={14} /> : <XCircle size={14} />}
              {isValid ? 'Valid JSON' : 'Invalid JSON'}
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
      </Card>

      {/* Editor and Preview */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Editor */}
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Editor</h2>
          <div className="h-[55vh] overflow-hidden rounded-lg border lg:h-[600px]">
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

        {/* Preview */}
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Preview</h2>
          <div className="space-y-6">
            {preview ? (
              <>
                <div>
                  <h3 className="mb-2 font-medium text-textSecondary">Entities</h3>
                  <div className="space-y-1">
                    {preview.entities.length > 0 ? (
                      preview.entities.map((entity, i) => (
                        <div key={i} className="text-sm">{entity}</div>
                      ))
                    ) : (
                      <div className="text-sm text-textSecondary">No entities configured</div>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 font-medium text-textSecondary">Pages</h3>
                  <div className="space-y-1">
                    {preview.pages.length > 0 ? (
                      preview.pages.map((page, i) => (
                        <div key={i} className="text-sm">{page}</div>
                      ))
                    ) : (
                      <div className="text-sm text-textSecondary">No pages configured</div>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 font-medium text-textSecondary">Dashboard widgets</h3>
                  <div className="text-sm">{preview.widgets} widgets configured</div>
                </div>
              </>
            ) : (
              <div className="text-center text-red-500">Invalid JSON</div>
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
    </div>
  );
};

export default ConfigEditor;
