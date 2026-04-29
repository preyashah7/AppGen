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
        <h3 className="text-lg font-semibold mb-2">Upload CSV File</h3>
        <p className="text-sm text-textSecondary">
          Select a CSV file to import records into {entity?.display_name || entityName}.
        </p>
      </div>

      <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-8 text-center">
        <Upload className="mx-auto h-10 sm:h-12 w-10 sm:w-12 text-gray-400 mb-4" />
        <div className="space-y-2">
          <p className="text-xs sm:text-sm font-medium">Drop your CSV file here, or click to browse</p>
          <p className="text-xs text-textSecondary">Only CSV files are supported</p>
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
        <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-sm text-green-700">{file.name} selected</span>
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 rounded-lg">
          <XCircle className="h-5 w-5 text-red-600" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Map Columns</h3>
        <p className="text-sm text-textSecondary">
          Map your CSV columns to {entity?.display_name || entityName} fields.
        </p>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {headers.map((header) => (
          <div key={header} className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-textSecondary mb-1">
                CSV Column: {header}
              </label>
              <select
                value={columnMapping[header] || ''}
                onChange={(e) => handleMappingChange(header, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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

      <Card className="p-4">
        <h4 className="font-medium mb-2">Preview (first 3 rows)</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr>
                {headers.map((header) => (
                  <th key={header} className="px-2 py-1 text-left font-medium">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {parsedData.slice(0, 3).map((row, i) => (
                <tr key={i}>
                  {headers.map((header) => (
                    <td key={header} className="px-2 py-1 border-t">
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
            <CheckCircle className="mx-auto h-16 w-16 text-green-600" />
            <h3 className="text-xl font-semibold text-green-700">Import Successful!</h3>
            <p className="text-textSecondary">
              Successfully imported {importResult.imported} records.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <XCircle className="mx-auto h-16 w-16 text-red-600" />
            <h3 className="text-xl font-semibold text-red-700">Import Failed</h3>
            <p className="text-textSecondary">{importResult?.error}</p>
          </div>
        )}
      </div>

      {importResult?.errors && importResult.errors.length > 0 && (
        <Card className="p-4">
          <h4 className="font-medium mb-2 flex items-center">
            <AlertCircle className="h-4 w-4 mr-2 text-amber-600" />
            Import Errors
          </h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {importResult.errors.map((error, i) => (
              <div key={i} className="text-sm text-red-700">
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

      <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2 sm:gap-3 pt-6 border-t">
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