import React, { useState } from 'react';
import axios from 'axios';
import Modal from './ui/Modal.jsx';
import Button from './ui/Button.jsx';
import Input from './ui/Input.jsx';
import toast from 'react-hot-toast';

const GitHubExportModal = ({ appId, config, onClose }) => {
  const [form, setForm] = useState({
    username: '',
    repo: '',
    token: '',
    filePath: 'config.json',
  });
  const [exporting, setExporting] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setExporting(true);
    setResult(null);

    try {
      const response = await axios.post(`/api/apps/${appId}/export/github`, form);
      setResult({ success: true, url: response.data.url });
      toast.success('Config exported to GitHub successfully');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Export failed';
      setResult({ success: false, error: errorMessage });
      toast.error(errorMessage);
    } finally {
      setExporting(false);
    }
  };

  const handleTokenHelp = () => {
    window.open('https://github.com/settings/tokens', '_blank');
  };

  return (
    <Modal
      title="Export to GitHub"
      open={true}
      onClose={onClose}
      footer={
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
          <Button onClick={onClose} variant="secondary" className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={exporting} disabled={!form.username || !form.repo || !form.token} className="w-full sm:w-auto">
            Export
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <p className="text-sm text-textSecondary">
          Push your app config to a GitHub repository. This will create or update the config.json file in your repo.
        </p>

        {result && (
          <div className={`rounded-lg p-4 ${result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {result.success ? (
              <div>
                <div className="flex items-center gap-2 font-medium">
                  ✓ Exported successfully!
                </div>
                <a
                  href={`https://${result.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-sm underline hover:no-underline"
                >
                  View on GitHub →
                </a>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 font-medium">
                  ✗ Export failed
                </div>
                <div className="mt-1 text-sm">{result.error}</div>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="GitHub Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
            placeholder="your-username"
          />
          <Input
            label="Repository Name"
            value={form.repo}
            onChange={(e) => setForm({ ...form, repo: e.target.value })}
            required
            placeholder="my-app-config"
          />
          <div>
            <label className="block text-sm font-medium text-textPrimary mb-2">
              Personal Access Token
            </label>
            <input
              type="password"
              value={form.token}
              onChange={(e) => setForm({ ...form, token: e.target.value })}
              required
              placeholder="ghp_..."
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="button"
              onClick={handleTokenHelp}
              className="mt-1 text-xs text-primary hover:underline"
            >
              How to get a token ↗
            </button>
          </div>
          <Input
            label="File Path"
            value={form.filePath}
            onChange={(e) => setForm({ ...form, filePath: e.target.value })}
            placeholder="config.json"
          />
        </form>
      </div>
    </Modal>
  );
};

export default GitHubExportModal;