'use client';

import { useState } from 'react';
import { ExportSettings } from '@/types/dice';

interface ExportControlsProps {
  onExport: (settings: ExportSettings) => void;
  estimatedFileSize?: string;
  isExporting?: boolean;
  className?: string;
}

export default function ExportControls({
  onExport,
  estimatedFileSize,
  isExporting = false,
  className = '',
}: ExportControlsProps) {
  const [settings, setSettings] = useState<ExportSettings>({
    resolution: 'medium',
    includeDisplacement: true,
    fileFormat: 'stl',
  });

  const handleExport = () => {
    onExport(settings);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Export Settings</h3>
      </div>

      {/* Resolution Setting */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Resolution
        </label>
        <select
          value={settings.resolution}
          onChange={(e) => setSettings({ ...settings, resolution: e.target.value as 'low' | 'medium' | 'high' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
        >
          <option value="low">Low (Fast, smaller file)</option>
          <option value="medium">Medium (Balanced)</option>
          <option value="high">High (Slow, larger file)</option>
        </select>
      </div>

      {/* File Format */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          File Format
        </label>
        <select
          value={settings.fileFormat}
          onChange={(e) => setSettings({ ...settings, fileFormat: e.target.value as 'stl' | 'obj' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
        >
          <option value="stl">STL (3D Printing)</option>
          <option value="obj">OBJ (General 3D)</option>
        </select>
      </div>

      {/* Include Displacement */}
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.includeDisplacement}
            onChange={(e) => setSettings({ ...settings, includeDisplacement: e.target.checked })}
            className="mr-2"
          />
          <span className="text-sm text-gray-700">Include displacement maps</span>
        </label>
      </div>

      {/* File Size Estimation */}
      {estimatedFileSize && (
        <div className="p-3 bg-blue-50 rounded-md">
          <div className="text-sm text-blue-800">
            <strong>Estimated file size:</strong> {estimatedFileSize}
          </div>
        </div>
      )}

      {/* Export Button */}
      <div>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
            isExporting
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {isExporting ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating STL...
            </div>
          ) : (
            'Export STL File'
          )}
        </button>
      </div>

      {/* Export Info */}
      <div className="text-xs text-gray-500 space-y-1">
        <div>• STL files are optimized for 3D printing</div>
        <div>• Higher resolution = better quality but larger files</div>
        <div>• Displacement maps add surface detail</div>
      </div>
    </div>
  );
} 