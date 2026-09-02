import { WarehouseBin } from './index';

export type ViewMode3D = '3d' | '2d' | 'cards';

export type FilterMode3D = 'all' | 'available' | 'full' | 'maintenance';

export interface Bin3DPosition {
  bin: WarehouseBin;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  color: string;
  emissive: string;
  utilizationPercent: number;
  level: number;
}

export interface Rack3DGroup {
  id: string;
  zone: string;
  rack: string;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  bins: Bin3DPosition[];
}

export interface WarehouseLayoutModel {
  warehouseId: string;
  warehouseName: string;
  racks: Rack3DGroup[];
  totalBins: number;
  availableBins: number;
  fullBins: number;
  maintenanceBins: number;
  bounds: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
    width: number;
    depth: number;
  };
}
