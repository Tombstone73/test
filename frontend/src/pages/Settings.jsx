import React, { useState, useEffect } from 'react';
import { settingsAPI } from '../services/api';
import { Save, Loader2, Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.getSettings();
      setSettings(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load settings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      await settingsAPI.updateSettings(settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to save settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateFolderPath = (key, value) => {
    setSettings({
      ...settings,
      folder_paths: {
        ...settings.folder_paths,
        [key]: value,
      },
    });
  };

  const updateSetting = (key, value) => {
    setSettings({
      ...settings,
      [key]: value,
    });
  };

  const addMaterialRule = () => {
    const materialName = prompt('Enter material name (e.g., "vinyl decal"):');
    if (materialName) {
      setSettings({
        ...settings,
        material_rules: {
          ...settings.material_rules,
          [materialName]: {
            min_dpi: 150,
            requires_cut_path: false,
          },
        },
      });
    }
  };

  const removeMaterialRule = (materialName) => {
    const { [materialName]: removed, ...rest } = settings.material_rules;
    setSettings({
      ...settings,
      material_rules: rest,
    });
  };

  const updateMaterialRule = (materialName, key, value) => {
    setSettings({
      ...settings,
      material_rules: {
        ...settings.material_rules,
        [materialName]: {
          ...settings.material_rules[materialName],
          [key]: value,
        },
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Configure preflight system settings</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Save className="w-5 h-5 mr-2" />
          )}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
          <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
          <p className="text-green-800">Settings saved successfully!</p>
        </div>
      )}

      {/* Folder Paths */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Folder Paths</h2>
        <div className="space-y-4">
          <InputField
            label="Downloads Folder"
            value={settings.folder_paths.downloads}
            onChange={(e) => updateFolderPath('downloads', e.target.value)}
            placeholder="/downloads"
          />
          <InputField
            label="Print Ready Folder"
            value={settings.folder_paths.print_ready}
            onChange={(e) => updateFolderPath('print_ready', e.target.value)}
            placeholder="/print-ready"
          />
          <InputField
            label="Needs Revision Folder"
            value={settings.folder_paths.needs_revision}
            onChange={(e) => updateFolderPath('needs_revision', e.target.value)}
            placeholder="/needs-revision"
          />
          <InputField
            label="Acrobat Watched Folder"
            value={settings.folder_paths.acrobat_watched}
            onChange={(e) => updateFolderPath('acrobat_watched', e.target.value)}
            placeholder="/acrobat-watched"
          />
        </div>
      </div>

      {/* Preflight Thresholds */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Preflight Thresholds</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Dimension Tolerance (inches)"
            type="number"
            step="0.01"
            value={settings.dimension_tolerance}
            onChange={(e) => updateSetting('dimension_tolerance', parseFloat(e.target.value))}
          />
          <InputField
            label="Bleed Threshold (inches)"
            type="number"
            step="0.01"
            value={settings.bleed_threshold}
            onChange={(e) => updateSetting('bleed_threshold', parseFloat(e.target.value))}
          />
          <InputField
            label="Min DPI Warning"
            type="number"
            value={settings.min_dpi_warning}
            onChange={(e) => updateSetting('min_dpi_warning', parseInt(e.target.value))}
          />
          <InputField
            label="Min DPI Error"
            type="number"
            value={settings.min_dpi_error}
            onChange={(e) => updateSetting('min_dpi_error', parseInt(e.target.value))}
          />
        </div>
      </div>

      {/* Material Rules */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Material-Specific Rules</h2>
          <button
            onClick={addMaterialRule}
            className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Material
          </button>
        </div>

        <div className="space-y-4">
          {Object.entries(settings.material_rules || {}).map(([materialName, rule]) => (
            <div key={materialName} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">{materialName}</h3>
                <button
                  onClick={() => removeMaterialRule(materialName)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Min DPI"
                  type="number"
                  value={rule.min_dpi}
                  onChange={(e) =>
                    updateMaterialRule(materialName, 'min_dpi', parseInt(e.target.value))
                  }
                />
                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rule.requires_cut_path}
                      onChange={(e) =>
                        updateMaterialRule(materialName, 'requires_cut_path', e.target.checked)
                      }
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Requires Cut Path</span>
                  </label>
                </div>
              </div>
            </div>
          ))}

          {Object.keys(settings.material_rules || {}).length === 0 && (
            <p className="text-gray-500 text-center py-4">
              No material rules defined. Click "Add Material" to create one.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const InputField = ({ label, value, onChange, type = 'text', placeholder, step }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      step={step}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>
);

export default Settings;
