import { Mesh, Vector3, FloatArray } from '@babylonjs/core';
import { saveAs } from 'file-saver';

export interface STLExportOptions {
  resolution: 'low' | 'medium' | 'high';
  includeDisplacement: boolean;
  binary: boolean;
}

export class STLExporter {
  private static getResolutionMultiplier(resolution: 'low' | 'medium' | 'high'): number {
    switch (resolution) {
      case 'low':
        return 1;
      case 'medium':
        return 2;
      case 'high':
        return 4;
      default:
        return 1;
    }
  }

  public static async exportMeshToSTL(
    mesh: Mesh,
    filename: string,
    options: STLExportOptions = {
      resolution: 'medium',
      includeDisplacement: true,
      binary: true,
    }
  ): Promise<void> {
    try {
      const vertices = mesh.getVerticesData('position');
      const indices = mesh.getIndices();
      const normals = mesh.getVerticesData('normal');

      if (!vertices) {
        throw new Error('Mesh does not have required vertex data');
      }

      const stlContent = this.generateSTLContent(
        vertices,
        indices,
        normals,
        options
      );

      const blob = new Blob([stlContent], {
        type: options.binary ? 'application/octet-stream' : 'text/plain',
      });

      saveAs(blob, `${filename}.stl`);
    } catch (error) {
      console.error('Error exporting STL:', error);
      throw error;
    }
  }

  private static generateSTLContent(
    vertices: FloatArray,
    indices: number[] | null,
    normals: FloatArray | null,
    options: STLExportOptions
  ): ArrayBuffer | string {
    if (options.binary) {
      return this.generateBinarySTL(vertices, indices, normals);
    } else {
      return this.generateASCIISTL(vertices, indices, normals);
    }
  }

  private static generateBinarySTL(
    vertices: Float32Array,
    indices: number[] | null,
    normals: Float32Array | null
  ): ArrayBuffer {
    const vertexCount = vertices.length / 3;
    const triangleCount = indices ? indices.length / 3 : vertexCount / 3;

    // STL binary header (80 bytes) + triangle count (4 bytes) + triangles
    const bufferSize = 80 + 4 + triangleCount * 50;
    const buffer = new ArrayBuffer(bufferSize);
    const view = new DataView(buffer);

    // Write header (80 bytes of zeros)
    for (let i = 0; i < 80; i++) {
      view.setUint8(i, 0);
    }

    // Write triangle count
    view.setUint32(80, triangleCount, true);

    let offset = 84;

    // Write triangles
    for (let i = 0; i < triangleCount; i++) {
      const v1 = i * 3;
      const v2 = v1 + 1;
      const v3 = v1 + 2;

      // Calculate face normal if not provided
      let nx = 0, ny = 0, nz = 0;
      if (normals) {
        nx = normals[v1 * 3];
        ny = normals[v1 * 3 + 1];
        nz = normals[v1 * 3 + 2];
      } else {
        // Calculate normal from vertices
        const p1 = new Vector3(vertices[v1 * 3], vertices[v1 * 3 + 1], vertices[v1 * 3 + 2]);
        const p2 = new Vector3(vertices[v2 * 3], vertices[v2 * 3 + 1], vertices[v2 * 3 + 2]);
        const p3 = new Vector3(vertices[v3 * 3], vertices[v3 * 3 + 1], vertices[v3 * 3 + 2]);
        
        const edge1 = p2.subtract(p1);
        const edge2 = p3.subtract(p1);
        const normal = Vector3.Cross(edge1, edge2).normalize();
        
        nx = normal.x;
        ny = normal.y;
        nz = normal.z;
      }

      // Write normal
      view.setFloat32(offset, nx, true);
      view.setFloat32(offset + 4, ny, true);
      view.setFloat32(offset + 8, nz, true);

      // Write vertices
      view.setFloat32(offset + 12, vertices[v1 * 3], true);
      view.setFloat32(offset + 16, vertices[v1 * 3 + 1], true);
      view.setFloat32(offset + 20, vertices[v1 * 3 + 2], true);

      view.setFloat32(offset + 24, vertices[v2 * 3], true);
      view.setFloat32(offset + 28, vertices[v2 * 3 + 1], true);
      view.setFloat32(offset + 32, vertices[v2 * 3 + 2], true);

      view.setFloat32(offset + 36, vertices[v3 * 3], true);
      view.setFloat32(offset + 40, vertices[v3 * 3 + 1], true);
      view.setFloat32(offset + 44, vertices[v3 * 3 + 2], true);

      // Write attribute byte count (0 for most STL files)
      view.setUint16(offset + 48, 0, true);

      offset += 50;
    }

    return buffer;
  }

  private static generateASCIISTL(
    vertices: Float32Array,
    indices: number[] | null,
    normals: Float32Array | null
  ): string {
    const vertexCount = vertices.length / 3;
    const triangleCount = indices ? indices.length / 3 : vertexCount / 3;

    let stlContent = 'solid dice\n';

    // Write triangles
    for (let i = 0; i < triangleCount; i++) {
      const v1 = i * 3;
      const v2 = v1 + 1;
      const v3 = v1 + 2;

      // Calculate face normal if not provided
      let nx = 0, ny = 0, nz = 0;
      if (normals) {
        nx = normals[v1 * 3];
        ny = normals[v1 * 3 + 1];
        nz = normals[v1 * 3 + 2];
      } else {
        // Calculate normal from vertices
        const p1 = new Vector3(vertices[v1 * 3], vertices[v1 * 3 + 1], vertices[v1 * 3 + 2]);
        const p2 = new Vector3(vertices[v2 * 3], vertices[v2 * 3 + 1], vertices[v2 * 3 + 2]);
        const p3 = new Vector3(vertices[v3 * 3], vertices[v3 * 3 + 1], vertices[v3 * 3 + 2]);
        
        const edge1 = p2.subtract(p1);
        const edge2 = p3.subtract(p1);
        const normal = Vector3.Cross(edge1, edge2).normalize();
        
        nx = normal.x;
        ny = normal.y;
        nz = normal.z;
      }

      stlContent += `  facet normal ${nx.toFixed(6)} ${ny.toFixed(6)} ${nz.toFixed(6)}\n`;
      stlContent += '    outer loop\n';
      stlContent += `      vertex ${vertices[v1 * 3].toFixed(6)} ${vertices[v1 * 3 + 1].toFixed(6)} ${vertices[v1 * 3 + 2].toFixed(6)}\n`;
      stlContent += `      vertex ${vertices[v2 * 3].toFixed(6)} ${vertices[v2 * 3 + 1].toFixed(6)} ${vertices[v2 * 3 + 2].toFixed(6)}\n`;
      stlContent += `      vertex ${vertices[v3 * 3].toFixed(6)} ${vertices[v3 * 3 + 1].toFixed(6)} ${vertices[v3 * 3 + 2].toFixed(6)}\n`;
      stlContent += '    endloop\n';
      stlContent += '  endfacet\n';
    }

    stlContent += 'endsolid dice\n';
    return stlContent;
  }

  public static estimateFileSize(mesh: Mesh, options: STLExportOptions): string {
    const vertices = mesh.getVerticesData('position');
    const indices = mesh.getIndices();
    
    if (!vertices) return 'Unknown';
    
    const vertexCount = vertices.length / 3;
    const triangleCount = indices ? indices.length / 3 : vertexCount / 3;
    
    // Rough estimation: binary STL ≈ 50 bytes per triangle + 84 bytes header
    const estimatedBytes = triangleCount * 50 + 84;
    
    return this.formatFileSize(estimatedBytes);
  }

  private static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
} 