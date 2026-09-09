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
  originalX?: number;
  originalZ?: number;
  isCustomMoved?: boolean;
}

export interface LoadingDockModel {
  id: string;
  label: string;
  type: 'inbound' | 'outbound' | 'general';
  x: number;
  z: number;
  width: number;
  height: number;
}

export interface FacilityRoomModel {
  id: string;
  name: string;
  label: string;
  type: 'restroom' | 'office' | 'utility';
  x: number;
  z: number;
  width: number;
  depth: number;
  height?: number;
}

export interface WarehouseLayoutModel {
  warehouseId: string;
  warehouseName: string;
  racks: Rack3DGroup[];
  docks?: LoadingDockModel[];
  rooms?: FacilityRoomModel[];
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
    centerX: number;
    centerZ: number;
  };
}

