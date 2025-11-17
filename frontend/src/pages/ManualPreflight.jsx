import React, { useState } from 'react';
import { preflightAPI } from '../services/api';
import { Upload, FileCheck, Loader2, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

const ManualPreflight = () => {
  const [file, setFile] = useState(null);
  const [expectedWidth, setExpectedWidth] = useState('');
  const [expectedHeight, setExpectedHeight] = useState('');
  const [productType, setProductType] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please select a valid PDF file');
      setFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const formData = new FormData();
      formData.append('file', file);

      if (expectedWidth) formData.append('expected_width', expectedWidth);
      if (expectedHeight) formData.append('expected_height', expectedHeight);
      if (productType) formData.append('product_type', productType);

      const response = await preflightAPI.manualPreflight(formData);
      setResult(response.data);
    } catch (err) {
      setError('Preflight check failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setExpectedWidth('');
    setExpectedHeight('');
    setProductType('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manual Preflight Check</h1>
        <p className="text-gray-600 mt-2">Upload a PDF for immediate preflight analysis</p>
      </div>

      {/* Upload Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PDF File
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                {file ? (
                  <div>
                    <p className="text-gray-900 font-medium">{file.name}</p>
                    <p className="text-gray-500 text-sm mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-700">Click to upload or drag and drop</p>
                    <p className="text-gray-500 text-sm mt-1">PDF files only</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Expected Dimensions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expected Dimensions (optional)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  step="0.01"
                  value={expectedWidth}
                  onChange={(e) => setExpectedWidth(e.target.value)}
                  placeholder="Width (inches)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <input
                  type="number"
                  step="0.01"
                  value={expectedHeight}
                  onChange={(e) => setExpectedHeight(e.target.value)}
                  placeholder="Height (inches)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Product Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Type (optional)
            </label>
            <input
              type="text"
              value={productType}
              onChange={(e) => setProductType(e.target.value)}
              placeholder="e.g., Banner, Vinyl Decal, Yard Sign"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading || !file}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Running Preflight...
                </>
              ) : (
                <>
                  <FileCheck className="w-5 h-5 mr-2" />
                  Run Preflight Check
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Preflight Results</h2>
            <StatusIcon status={result.overall_status} />
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="Order ID" value={result.order_id} />
              <InfoRow label="Customer" value={result.customer_name} />
              <InfoRow label="Overall Status" value={result.overall_status} />
            </div>

            {result.results && result.results.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium text-gray-900 mb-4">File Details</h3>
                {result.results.map((fileResult, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-gray-900">{fileResult.file_name}</span>
                      <StatusBadge status={fileResult.status} />
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {fileResult.pdf_width && (
                        <InfoRow
                          label="Dimensions"
                          value={`${fileResult.pdf_width}" × ${fileResult.pdf_height}"`}
                        />
                      )}
                      {fileResult.avg_dpi && (
                        <InfoRow label="Average DPI" value={fileResult.avg_dpi} />
                      )}
                      <InfoRow
                        label="Dimension Match"
                        value={fileResult.dimension_match ? 'Yes' : 'No'}
                      />
                      <InfoRow
                        label="100% Magenta"
                        value={fileResult.has_magenta ? 'Yes' : 'No'}
                      />
                    </div>

                    {fileResult.errors && fileResult.errors.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-red-800 mb-2">Errors:</p>
                        <ul className="list-disc list-inside text-sm text-red-700">
                          {fileResult.errors.map((err, i) => (
                            <li key={i}>{err}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {fileResult.warnings && fileResult.warnings.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-yellow-800 mb-2">Warnings:</p>
                        <ul className="list-disc list-inside text-sm text-yellow-700">
                          {fileResult.warnings.map((warn, i) => (
                            <li key={i}>{warn}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const StatusIcon = ({ status }) => {
  const icons = {
    PASS: <CheckCircle className="w-8 h-8 text-green-600" />,
    WARNING: <AlertTriangle className="w-8 h-8 text-yellow-600" />,
    FAIL: <AlertCircle className="w-8 h-8 text-red-600" />,
  };
  return icons[status] || null;
};

const StatusBadge = ({ status }) => {
  const statusColors = {
    PASS: 'bg-green-100 text-green-800',
    WARNING: 'bg-yellow-100 text-yellow-800',
    FAIL: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
      {status}
    </span>
  );
};

const InfoRow = ({ label, value }) => (
  <div>
    <span className="text-gray-600">{label}:</span>
    <span className="ml-2 font-medium text-gray-900">{value}</span>
  </div>
);

export default ManualPreflight;
