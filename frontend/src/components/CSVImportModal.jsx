import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext.jsx';
import axios from 'axios';
import Papa from 'papaparse';
import toast from 'react-hot-toast';
import Modal from './ui/Modal.jsx';
import Button from './ui/Button.jsx';
import Card from './ui/Card.jsx';
import Skeleton from './ui/Skeleton.jsx';
import { Upload, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const CSVImportModal = ({ isOpen, onClose, entityName, onImportComplete }) => {
  const { appId, config, t } = useApp();
  const [step, setStep] = useState(1); // 1: Upload, 2: Preview/Map, 3: Result
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [columnMapping, setColumnMapping] = useState({});
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const entity = config?.entities?.find((item) => item.name === entityName);
  const entityFields = entity?.fields || [];

  const resetModal = () => {
    setStep(1);
    setFile(null);
    setParsedData([]);
    setHeaders([]);
    setColumnMapping({});
    setImporting(false);
    setImportResult(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      setError('Please select a CSV file.');
      return;
    }

    setFile(selectedFile);
    setError('');

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError('Error parsing CSV file: ' + results.errors[0].message);
          return;
        }

        const data = results.data;
        const csvHeaders = results.meta.fields || [];

        setParsedData(data);
        setHeaders(csvHeaders);

        // Auto-map columns based on field names
        const mapping = {};
        csvHeaders.forEach((header) => {
          const matchingField = entityFields.find((field) =>
            field.name.toLowerCase() === header.toLowerCase() ||
            field.label.toLowerCase() === header.toLowerCase()
          );
          if (matchingField) {
            mapping[header] = matchingField.name;
          }
        });
        setColumnMapping(mapping);
      },
      error: (error) => {
        setError('Error reading file: ' + error.message);
      }
    });
  };

  const handleMappingChange = (csvHeader, entityField) => {
    setColumnMapping(prev => ({
      ...prev,
      [csvHeader]: entityField
    }));
  };

  const handleImport = async () => {
    setImporting(true);
    setError('');

    try {
      const records = parsedData.map((row) => {
        const recordData = {};
        Object.entries(columnMapping).forEach(([csvHeader, entityField]) => {
          if (entityField && row[csvHeader] !== undefined) {
            recordData[entityField] = row[csvHeader];
          }
        });
        return { data: recordData };
      });

      const res = await axios.post(`/api/apps/${appId}/records/${entityName}/import`, {
        records
      });

      const imported = res.data.imported || records.length;
      const errors = res.data.errors || [];
      setImportResult({
        success: true,
        imported,
        errors
      });
      setStep(3);
      onImportComplete();
      toast.success(`Successfully imported ${imported} records`);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Import failed';
      setImportResult({
        success: false,
        error: errorMsg
      });
      setStep(3);
      toast.error(errorMsg);
    } finally {
      setImporting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-lg font-semibold tracking-[-0.02em] text-text-primary">Upload CSV File</h3>
        <p className="text-sm text-text-secondary">
          Select a CSV file to import records into {entity?.display_name || entityName}.
        </p>
      </div>

      <div className="relative rounded-3xl border-2 border-dashed border-border bg-surface-raised p-4 text-center sm:p-8">
        <Upload className="mx-auto mb-4 h-10 w-10 text-text-muted sm:h-12 sm:w-12" />
        <div className="space-y-2">
          <p className="text-xs font-medium sm:text-sm text-text-primary">Drop your CSV file here, or click to browse</p>
          <p className="text-xs text-text-secondary">Only CSV files are supported</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      {file && (
        <div className="flex items-center gap-2 rounded-2xl border border-success/20 bg-success-light px-3 py-3">
          <CheckCircle className="h-5 w-5 text-success" />
          <span className="text-sm text-success">{file.name} selected</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-danger/20 bg-danger-light px-3 py-3">
          <XCircle className="h-5 w-5 text-danger" />
          <span className="text-sm text-danger">{error}</span>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-lg font-semibold tracking-[-0.02em] text-text-primary">Map Columns</h3>
        <p className="text-sm text-text-secondary">
          Map your CSV columns to {entity?.display_name || entityName} fields.
        </p>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {headers.map((header) => (
          <div key={header} className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-text-secondary">
                CSV Column: {header}
              </label>
              <select
                value={columnMapping[header] || ''}
                onChange={(e) => handleMappingChange(header, e.target.value)}
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
              >
                <option value="">Don't import</option>
                {entityFields.map((field) => (
                  <option key={field.name} value={field.name}>
                    {field.label} ({field.type})
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      <Card className="border-border/80 p-4">
        <h4 className="mb-2 font-medium text-text-primary">Preview (first 3 rows)</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr>
                {headers.map((header) => (
                  <th key={header} className="px-2 py-2 text-left font-medium text-text-secondary">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {parsedData.slice(0, 3).map((row, i) => (
                <tr key={i}>
                  {headers.map((header) => (
                    <td key={header} className="border-t border-border px-2 py-2 text-text-primary">
                      {row[header] || '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        {importResult?.success ? (
          <div className="space-y-4">
            <CheckCircle className="mx-auto h-16 w-16 text-success" />
            <h3 className="text-xl font-semibold text-success">Import Successful!</h3>
            <p className="text-text-secondary">
              Successfully imported {importResult.imported} records.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <XCircle className="mx-auto h-16 w-16 text-danger" />
            <h3 className="text-xl font-semibold text-danger">Import Failed</h3>
            <p className="text-text-secondary">{importResult?.error}</p>
          </div>
        )}
      </div>

      {importResult?.errors && importResult.errors.length > 0 && (
        <Card className="border-border/80 p-4">
          <h4 className="mb-2 flex items-center font-medium text-text-primary">
            <AlertCircle className="mr-2 h-4 w-4 text-warning" />
            Import Errors
          </h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {importResult.errors.map((error, i) => (
              <div key={i} className="text-sm text-danger">
                Row {error.row}: {error.message}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );

  const getStepContent = () => {
    switch (step) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      default: return renderStep1();
    }
  };

  const canProceed = () => {
    if (step === 1) return file && parsedData.length > 0;
    if (step === 2) return Object.values(columnMapping).some(field => field);
    return true;
  };

  return (
    <Modal open={isOpen} onClose={handleClose} title={`Import ${entity?.display_name || entityName}`}>
      <div className="space-y-6 sm:min-h-[500px]">
        {getStepContent()}
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-border pt-6 sm:flex-row sm:justify-between sm:gap-3">
        <Button
          variant="secondary"
          onClick={step === 1 ? handleClose : () => setStep(step - 1)}
          className="w-full sm:w-auto"
        >
          {step === 1 ? 'Cancel' : 'Back'}
        </Button>

        {step < 3 && (
          <Button
            onClick={step === 2 ? handleImport : () => setStep(step + 1)}
            disabled={!canProceed() || importing}
            loading={importing}
            className="w-full sm:w-auto"
          >
            {step === 2 ? 'Import' : 'Next'}
          </Button>
        )}

        {step === 3 && (
          <Button onClick={handleClose} className="w-full sm:w-auto">
            Done
          </Button>
        )}
      </div>
    </Modal>
  );
};

export default CSVImportModal;