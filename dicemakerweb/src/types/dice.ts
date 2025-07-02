export type DiceType = 'D4' | 'D6' | 'D8' | 'D10' | 'D12' | 'D20';

export interface DiceFace {
  id: string;
  index: number;
  text?: string;
  imageUrl?: string;
  isCustomized: boolean;
}

export interface DiceData {
  type: DiceType;
  faces: DiceFace[];
  material: string;
  engravingDepth: number;
}

export interface CustomizationData {
  text?: string;
  imageFile?: File;
  imageUrl?: string;
  font?: string;
  fontSize?: number;
}

export interface ExportSettings {
  resolution: 'low' | 'medium' | 'high';
  includeDisplacement: boolean;
  fileFormat: 'stl' | 'obj';
}

export interface DiceGeometry {
  vertices: number[];
  indices: number[];
  normals: number[];
  uvs: number[];
}

export const DICE_CONFIGS: Record<DiceType, { faces: number; name: string }> = {
  D4: { faces: 4, name: 'Tetrahedron' },
  D6: { faces: 6, name: 'Cube' },
  D8: { faces: 8, name: 'Octahedron' },
  D10: { faces: 10, name: 'Decahedron' },
  D12: { faces: 12, name: 'Dodecahedron' },
  D20: { faces: 20, name: 'Icosahedron' },
};

export const FONT_OPTIONS = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Courier New',
  'Georgia',
  'Verdana',
  'Impact',
  'Comic Sans MS',
] as const;

export type FontOption = typeof FONT_OPTIONS[number]; 