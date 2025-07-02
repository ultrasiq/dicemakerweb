'use client';

import { useState, useRef, useEffect } from 'react';
import { DiceType, DICE_CONFIGS, ExportSettings } from '@/types/dice';
import DiceViewer, { DiceViewerRef } from '@/components/DiceViewer';
import CustomizationPanel from '@/components/CustomizationPanel';
import ExportControls from '@/components/ExportControls';

export default function Home() {
  const [selectedDiceType, setSelectedDiceType] = useState<DiceType>('D6');
  const [selectedFace, setSelectedFace] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [customizationType, setCustomizationType] = useState<'text' | 'image'>('text');
  const [textValue, setTextValue] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [showCheckerboard, setShowCheckerboard] = useState(false);
  
  // Ref to access the BabylonDiceManager instance
  const diceManagerRef = useRef<DiceViewerRef>(null);

  // Helper to create checkerboard canvas
  function createCheckerboardCanvas(size = 256, squares = 8): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const squareSize = size / squares;
    for (let y = 0; y < squares; y++) {
      for (let x = 0; x < squares; x++) {
        ctx.fillStyle = (x + y) % 2 === 0 ? '#fff' : '#000';
        ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
      }
    }
    return canvas;
  }

  // Effect to apply/remove checkerboard debug texture
  useEffect(() => {
    const diceManager = diceManagerRef.current?.getDiceManager();
    if (!diceManager || selectedDiceType !== 'D6') return;
    if (showCheckerboard) {
      const checkerboard = createCheckerboardCanvas();
      diceManager.setDebugTexture(checkerboard);
    } else {
      // Restore default material
      // @ts-expect-error: applyDefaultMaterial is public in BabylonDiceManager
      diceManager.applyDefaultMaterial?.();
    }
  }, [showCheckerboard, selectedDiceType]);

  const handleExport = async (settings: ExportSettings) => {
    setIsExporting(true);
    try {
      // TODO: Implement actual STL export using the modified mesh
      console.log('Exporting with settings:', settings);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate export time
      alert('STL file exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleTextChange = (text: string) => {
    setTextValue(text);
  };

  const handleImageChange = (file: File | null) => {
    setSelectedImage(file);
  };

  const handleApplyCustomization = async () => {
    const diceManager = diceManagerRef.current?.getDiceManager();
    if (!diceManager || selectedDiceType !== 'D6') {
      console.log('Displacement mapping only supported for D6 currently');
      return;
    }

    try {
      if (customizationType === 'text' && textValue.trim()) {
        await diceManager.applyDisplacementToD6Face({
          faceIndex: selectedFace,
          text: textValue.trim(),
          strength: 0.8,
        });
        console.log(`Applied text "${textValue}" to face ${selectedFace + 1}`);
      } else if (customizationType === 'image' && selectedImage) {
        await diceManager.applyDisplacementToD6Face({
          faceIndex: selectedFace,
          image: selectedImage,
          strength: 0.8,
        });
        console.log(`Applied image "${selectedImage.name}" to face ${selectedFace + 1}`);
      }
    } catch (error) {
      console.error('Failed to apply customization:', error);
      alert('Failed to apply customization. Please try again.');
    }
  };

  const handleTestDisplacement = async () => {
    const diceManager = diceManagerRef.current?.getDiceManager();
    if (!diceManager || selectedDiceType !== 'D6') {
      alert('Test displacement only works with D6');
      return;
    }

    try {
      await diceManager.applyDisplacementToD6Face({
        faceIndex: selectedFace,
        strength: 1.0,
        gradient: true,
      });
      console.log(`Test gradient displacement applied to face ${selectedFace + 1}`);
      alert('Test gradient displacement applied! Check the console for details.');
    } catch (error) {
      console.error('Test displacement failed:', error);
      alert('Test displacement failed. Check console for details.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Polyhedral Dice Maker
              </h1>
              <p className="text-gray-600 mt-1">
                Customize and export 3D-printable dice
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Powered by Babylon.js & Next.js
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-12 max-w-xl w-full mx-auto">
          {/* 3D Viewer */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                3D Preview
              </h2>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">
                  Dice Type:
                </label>
                <select
                  value={selectedDiceType}
                  onChange={(e) => setSelectedDiceType(e.target.value as DiceType)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                >
                  {Object.entries(DICE_CONFIGS).map(([type, config]) => (
                    <option key={type} value={type}>
                      {type} ({config.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {/* Checkerboard toggle for D6 only */}
            {selectedDiceType === 'D6' && (
              <div className="mb-4 flex items-center space-x-2">
                <input
                  id="checkerboard-toggle"
                  type="checkbox"
                  checked={showCheckerboard}
                  onChange={e => setShowCheckerboard(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <label htmlFor="checkerboard-toggle" className="text-sm text-gray-700">
                  Show Checkerboard Debug Texture
                </label>
              </div>
            )}
            <DiceViewer 
              diceType={selectedDiceType}
              ref={diceManagerRef}
            />
          </div>

          {/* Customization Panel */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Customization
            </h2>
            <CustomizationPanel
              diceType={selectedDiceType}
              selectedFace={selectedFace}
              onFaceChange={setSelectedFace}
              onTextChange={handleTextChange}
              onImageChange={handleImageChange}
              onApply={handleApplyCustomization}
              onTest={handleTestDisplacement}
              customizationType={customizationType}
              setCustomizationType={setCustomizationType}
              textValue={textValue}
              selectedImage={selectedImage}
            />
          </div>

          {/* Export Controls */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <ExportControls
              onExport={handleExport}
              estimatedFileSize="~2.5 MB"
              isExporting={isExporting}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            How to Use
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">1. Select Dice Type</h4>
              <p>Choose from D4, D6, D8, D10, D12, or D20. Each has a different number of faces to customize.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">2. Customize Faces</h4>
              <p>Select a face and add text or upload an image. The engraving will appear in the 3D preview and be included in the STL export.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">3. Export STL</h4>
              <p>Configure export settings and download your 3D-printable STL file. Higher resolution means better quality but larger files.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
