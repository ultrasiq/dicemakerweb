import {
  Engine,
  Scene,
  Vector3,
  HemisphericLight,
  ArcRotateCamera,
  MeshBuilder,
  StandardMaterial,
  Texture,
  Color3,
  Mesh,
  Nullable,
  DirectionalLight,
} from '@babylonjs/core';
import { DiceType } from '@/types/dice';

export class BabylonDiceManager {
  private scene: Scene;
  private engine: Engine;
  private diceMesh: Nullable<Mesh> = null;
  private selectedFace: number = -1;
  private d6FaceVertexIndices: number[][] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.engine = new Engine(canvas, true);
    this.scene = new Scene(this.engine);
    this.scene.clearColor.set(0, 0, 0, 0); // Transparent background
    this.setupScene();
  }

  private setupScene(): void {
    // Create camera
    const camera = new ArcRotateCamera(
      'camera',
      0,
      Math.PI / 3,
      10,
      Vector3.Zero(),
      this.scene
    );
    camera.attachControl(true);
    camera.lowerRadiusLimit = 3;
    camera.upperRadiusLimit = 20;

    // Create enhanced lighting for better displacement visibility
    // Main directional light from top-right
    const mainLight = new DirectionalLight(
      'mainLight',
      new Vector3(1, 1, 1),
      this.scene
    );
    mainLight.intensity = 0.8;

    // Secondary directional light from bottom-left for fill
    const fillLight = new DirectionalLight(
      'fillLight',
      new Vector3(-1, -0.5, -1),
      this.scene
    );
    fillLight.intensity = 0.4;

    // Ambient light for overall illumination
    const ambientLight = new HemisphericLight(
      'ambient',
      new Vector3(0, 1, 0),
      this.scene
    );
    ambientLight.intensity = 0.6;
  }

  public createDice(diceType: DiceType): void {
    // Remove existing dice
    if (this.diceMesh) {
      this.diceMesh.dispose();
    }

    // Create dice based on type
    switch (diceType) {
      case 'D6':
        this.diceMesh = this.createD6();
        break;
      case 'D4':
        this.diceMesh = this.createD4();
        break;
      case 'D8':
        this.diceMesh = this.createD8();
        break;
      case 'D10':
        this.diceMesh = this.createD10();
        break;
      case 'D12':
        this.diceMesh = this.createD12();
        break;
      case 'D20':
        this.diceMesh = this.createD20();
        break;
      default:
        this.diceMesh = this.createD6();
    }

    this.applyDefaultMaterial();
  }

  private createD6(): Mesh {
    // Parameters
    const grid = 16;
    const size = 2;
    const half = size / 2;
    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    // For mapping face index to vertex indices
    this.d6FaceVertexIndices = [];

    // Face definitions: [normal, up, right]
    const faces = [
      // Front (+z)
      { normal: [0, 0, 1], up: [0, 1, 0], right: [1, 0, 0] },
      // Back (-z)
      { normal: [0, 0, -1], up: [0, 1, 0], right: [-1, 0, 0] },
      // Top (+y)
      { normal: [0, 1, 0], up: [0, 0, -1], right: [1, 0, 0] },
      // Bottom (-y)
      { normal: [0, -1, 0], up: [0, 0, 1], right: [1, 0, 0] },
      // Right (+x)
      { normal: [1, 0, 0], up: [0, 1, 0], right: [0, 0, -1] },
      // Left (-x)
      { normal: [-1, 0, 0], up: [0, 1, 0], right: [0, 0, 1] },
    ];

    for (let f = 0; f < 6; f++) {
      const { normal, up, right } = faces[f];
      const faceVertexIndices: number[] = [];
      for (let iy = 0; iy <= grid; iy++) {
        for (let ix = 0; ix <= grid; ix++) {
          // Local face coordinates [-half, half]
          const u = ix / grid;
          const v = iy / grid;
          const x = (-half + u * size);
          const y = (-half + v * size);
          // Position in 3D
          const px = normal[0] * half + right[0] * x + up[0] * y;
          const py = normal[1] * half + right[1] * x + up[1] * y;
          const pz = normal[2] * half + right[2] * x + up[2] * y;
          positions.push(px, py, pz);
          normals.push(...normal);
          uvs.push(u, v);
          faceVertexIndices.push(positions.length / 3 - 1);
        }
      }
      this.d6FaceVertexIndices.push(faceVertexIndices);
    }

    // Indices
    const vertsPerFace = (grid + 1) * (grid + 1);
    for (let f = 0; f < 6; f++) {
      const base = f * vertsPerFace;
      for (let iy = 0; iy < grid; iy++) {
        for (let ix = 0; ix < grid; ix++) {
          const i0 = base + iy * (grid + 1) + ix;
          const i1 = base + iy * (grid + 1) + (ix + 1);
          const i2 = base + (iy + 1) * (grid + 1) + (ix + 1);
          const i3 = base + (iy + 1) * (grid + 1) + ix;
          // Two triangles per quad
          indices.push(i0, i1, i2);
          indices.push(i0, i2, i3);
        }
      }
    }

    const mesh = new Mesh('dice', this.scene);
    mesh.setVerticesData('position', positions);
    mesh.setVerticesData('normal', normals);
    mesh.setVerticesData('uv', uvs);
    mesh.setIndices(indices);
    mesh.convertToFlatShadedMesh();
    return mesh;
  }

  private createD4(): Mesh {
    // Create a tetrahedron for D4
    const tetrahedron = MeshBuilder.CreatePolyhedron(
      'dice',
      { type: 0, size: 1.5 }, // Type 0 is tetrahedron
      this.scene
    );
    return tetrahedron;
  }

  private createD8(): Mesh {
    // Create an octahedron for D8
    const octahedron = MeshBuilder.CreatePolyhedron(
      'dice',
      { type: 1, size: 1.5 }, // Type 1 is octahedron
      this.scene
    );
    return octahedron;
  }

  private createD10(): Mesh {
    // Create a decahedron for D10
    const decahedron = MeshBuilder.CreatePolyhedron(
      'dice',
      { type: 2, size: 1.5 }, // Type 2 is decahedron
      this.scene
    );
    return decahedron;
  }

  private createD12(): Mesh {
    // Create a dodecahedron for D12
    const dodecahedron = MeshBuilder.CreatePolyhedron(
      'dice',
      { type: 3, size: 1.5 }, // Type 3 is dodecahedron
      this.scene
    );
    return dodecahedron;
  }

  private createD20(): Mesh {
    // Create an icosahedron for D20
    const icosahedron = MeshBuilder.CreatePolyhedron(
      'dice',
      { type: 4, size: 1.5 }, // Type 4 is icosahedron
      this.scene
    );
    return icosahedron;
  }

  private applyDefaultMaterial(): void {
    if (!this.diceMesh) return;

    const material = new StandardMaterial('diceMaterial', this.scene);
    material.diffuseColor = new Color3(0.3, 0.5, 0.9); // Slightly lighter blue
    material.specularColor = new Color3(0.3, 0.3, 0.3); // More specular for displacement visibility
    material.ambientColor = new Color3(0.2, 0.2, 0.2); // More ambient light
    material.useParallax = true; // Enable parallax mapping for better displacement visibility
    material.backFaceCulling = false;
    this.diceMesh.material = material;
  }

  public applyBumpMap(
    faceIndex: number,
    bumpTexture: string
  ): void {
    if (!this.diceMesh) return;

    const material = this.diceMesh.material as StandardMaterial;
    if (!material) return;

    // Create bump texture for surface detail
    const bumpMap = new Texture(bumpTexture, this.scene);
    material.bumpTexture = bumpMap;
    material.invertNormalMapX = true;
    material.invertNormalMapY = true;
  }

  public getScene(): Scene {
    return this.scene;
  }

  public getEngine(): Engine {
    return this.engine;
  }

  public render(): void {
    this.scene.render();
  }

  public resize(): void {
    this.engine.resize();
  }

  public dispose(): void {
    this.scene.dispose();
    this.engine.dispose();
  }

  public getDiceMesh(): Nullable<Mesh> {
    return this.diceMesh;
  }

  public setSelectedFace(faceIndex: number): void {
    this.selectedFace = faceIndex;
    // Highlight selected face (implement visual feedback)
  }

  public getSelectedFace(): number {
    return this.selectedFace;
  }

  /**
   * Apply displacement mapping to a D6 face for engraving effect.
   * This modifies the actual geometry for both preview and STL export.
   */
  public async applyDisplacementToD6Face({
    faceIndex,
    text,
    image,
    strength = 0.3,
    gradient = false,
  }: {
    faceIndex: number; // 0-5 for D6 faces
    text?: string;
    image?: File | string;
    strength?: number;
    gradient?: boolean;
  }): Promise<void> {
    if (!this.diceMesh || this.diceMesh.name !== 'dice') return;

    // Import the displacement generator
    const { generateDisplacementMap } = await import('./displacement-generator');
    
    // Generate displacement map from text, image, or gradient
    const { pixels } = await generateDisplacementMap({
      text,
      image,
      width: 256,
      height: 256,
      gradient,
    });

    // Get face indices for D6 (cube has 6 faces, each with 4 vertices)
    const faceIndices = this.getD6FaceIndices(faceIndex);
    if (!faceIndices) {
      console.error(`Invalid face index for D6: ${faceIndex}`);
      return;
    }

    // Apply displacement to the face geometry
    await this.applyDisplacementToFace({
      mesh: this.diceMesh,
      faceIndices,
      displacementPixels: pixels,
      mapWidth: 256,
      mapHeight: 256,
      strength,
    });
  }

  /**
   * Get the vertex indices for a specific D6 face.
   * D6 faces are ordered: front, back, top, bottom, right, left
   */
  private getD6FaceIndices(faceIndex: number): number[] | null {
    if (faceIndex < 0 || faceIndex > 5) return null;
    return this.d6FaceVertexIndices[faceIndex] || null;
  }

  /**
   * Applies a displacement map to a mesh face, modifying its geometry for engraving.
   *
   * @param mesh The Babylon.js mesh to modify
   * @param faceIndices The indices of the face's vertices (array of 3 or more indices)
   * @param displacementPixels Grayscale pixel data (Uint8ClampedArray) from the displacement map
   * @param mapWidth Width of the displacement map
   * @param mapHeight Height of the displacement map
   * @param strength How deep the engraving should be (positive number, in mesh units)
   */
  public async applyDisplacementToFace({
    mesh,
    faceIndices,
    displacementPixels,
    mapWidth,
    mapHeight,
    strength = 0.5,
  }: {
    mesh: Mesh;
    faceIndices: number[];
    displacementPixels: Uint8ClampedArray;
    mapWidth: number;
    mapHeight: number;
    strength?: number;
  }): Promise<void> {
    console.log('Applying displacement to face:', { faceIndices, strength });
    
    const positions = mesh.getVerticesData('position')!;
    const uvs = mesh.getVerticesData('uv')!;

    let totalDisplacement = 0;
    let modifiedVertices = 0;

    // For each vertex in the face
    for (const idx of faceIndices) {
      // Use the UV coordinates of the vertex
      const u = uvs[idx * 2];
      const v = uvs[idx * 2 + 1];
      // Sample the displacement map
      const x = Math.max(0, Math.min(mapWidth - 1, Math.round(u * (mapWidth - 1))));
      const y = Math.max(0, Math.min(mapHeight - 1, Math.round(v * (mapHeight - 1))));
      const pixelIdx = (y * mapWidth + x) * 4;
      const gray = displacementPixels[pixelIdx]; // 0-255
      // Displacement: black=deep, white=shallow
      const disp = (1 - gray / 255) * strength;

      // Get the normal for this vertex (flat faces: use face normal)
      // For a grid, the normal is already set per vertex, but we can recalc if needed
      // We'll use the current normal
      // (If you want to use the face normal, you can recalc it for the face)
      // For now, use the normal as stored
      const nx = mesh.getVerticesData('normal')![idx * 3];
      const ny = mesh.getVerticesData('normal')![idx * 3 + 1];
      const nz = mesh.getVerticesData('normal')![idx * 3 + 2];

      positions[idx * 3] += nx * disp;
      positions[idx * 3 + 1] += ny * disp;
      positions[idx * 3 + 2] += nz * disp;

      totalDisplacement += disp;
      modifiedVertices++;
    }

    console.log(`Modified ${modifiedVertices} vertices with average displacement: ${(totalDisplacement / modifiedVertices).toFixed(3)}`);

    mesh.setVerticesData('position', positions);
    mesh.refreshBoundingInfo();
    mesh.computeWorldMatrix(true);
    mesh.refreshBoundingInfo();
    mesh.updateFacetData();
    mesh.convertToFlatShadedMesh();
    
    console.log('Displacement applied successfully');
  }

  /**
   * Assigns a debug texture (checkerboard or gradient) to the D6 mesh for UV debugging.
   * @param textureSource - Canvas, image URL, or data URL to use as the texture
   */
  public setDebugTexture(textureSource: HTMLCanvasElement | string): void {
    if (!this.diceMesh) return;
    const material = new StandardMaterial('debugTextureMaterial', this.scene);
    if (typeof textureSource === 'string') {
      material.diffuseTexture = new Texture(textureSource, this.scene);
    } else {
      material.diffuseTexture = new Texture(textureSource.toDataURL(), this.scene);
    }
    material.specularColor = new Color3(0.1, 0.1, 0.1);
    material.ambientColor = new Color3(0.2, 0.2, 0.2);
    material.backFaceCulling = false;
    this.diceMesh.material = material;
  }
}

export function createDisplacementTexture(
  text: string,
  width: number = 512,
  height: number = 512
): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Clear canvas
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  // Draw text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);

  return canvas.toDataURL();
} 