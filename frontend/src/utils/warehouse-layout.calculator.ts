import { WarehouseBin } from '../types';
import { Bin3DPosition, Rack3DGroup, WarehouseLayoutModel, LoadingDockModel } from '../types/warehouse-3d';

/**
 * Calculates 3D geometric layout for warehouse racks and bins
 */
export function calculateWarehouseLayout(
  bins: WarehouseBin[],
  fallbackWarehouseName: string = 'Main Hub'
): WarehouseLayoutModel {
  // If no bins exist OR if it's only the placeholder warehouse entry (e.g. WH-01 without actual bins)
  const isPlaceholderOnly =
    bins.length === 0 ||
    (bins.length === 1 && (bins[0].id === bins[0].warehouseId || bins[0].binCode?.startsWith('WH-') || !bins[0].binCode?.includes('-0')));

  const effectiveBins: WarehouseBin[] = !isPlaceholderOnly
    ? bins
    : generateDefaultWarehouseBins(bins[0]?.warehouseName || fallbackWarehouseName);

  // Group bins by Zone and Rack
  const groups: Record<string, WarehouseBin[]> = {};
  effectiveBins.forEach((bin) => {
    const zone = bin.zone || (bin.binCode ? bin.binCode.split('-')[0] : 'Zone A');
    const rack = bin.rack || (bin.binCode ? bin.binCode.split('-')[1] || '01' : '01');
    const key = `${zone}__${rack}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(bin);
  });

  const zones = Array.from(new Set(effectiveBins.map((b) => b.zone || (b.binCode ? b.binCode.split('-')[0] : 'Zone A')))).sort();

  const RACK_WIDTH = 6;
  const RACK_DEPTH = 2.2;
  const RACK_HEIGHT = 4.5;
  const AISLE_SPACING_Z = 5;
  const ZONE_SPACING_X = 14;

  const racks: Rack3DGroup[] = [];
  let availableCount = 0;
  let fullCount = 0;
  let maintenanceCount = 0;

  zones.forEach((zone, zoneIdx) => {
    const zoneStartX = (zoneIdx - (zones.length - 1) / 2) * ZONE_SPACING_X;
    
    // Filter racks in this zone
    const zoneKeys = Object.keys(groups).filter((k) => k.startsWith(`${zone}__`)).sort();
    
    zoneKeys.forEach((key, rackIdx) => {
      const rackName = key.split('__')[1];
      const rackBins = groups[key];
      const rackCenterZ = (rackIdx - (zoneKeys.length - 1) / 2) * (RACK_DEPTH + AISLE_SPACING_Z);
      const rackCenterX = zoneStartX;

      const binPositions: Bin3DPosition[] = [];

      // Sort bins inside rack by shelf level (e.g. Level 1, Level 2, Level 3)
      rackBins.forEach((bin, binIdx) => {
        const capacity = Number(bin.capacityKg || 500);
        const current = Number(bin.currentItemsCount || 0);
        const utilPercent = Math.min(100, Math.round((current / (capacity / 2 || 1)) * 100));

        const isInactive = bin.isActive === false || bin.status === 'maintenance';
        const isFull = !isInactive && (bin.status === 'full' || utilPercent >= 90);

        if (isInactive) maintenanceCount++;
        else if (isFull) fullCount++;
        else availableCount++;

        // Color coding
        let color = '#10B981'; // Emerald (Available)
        let emissive = '#064E3B';
        if (isInactive) {
          color = '#64748B'; // Slate (Maintenance/Inactive)
          emissive = '#1E293B';
        } else if (isFull) {
          color = '#EF4444'; // Rose Red (Full)
          emissive = '#7F1D1D';
        } else if (utilPercent >= 50) {
          color = '#F59E0B'; // Amber (Moderate)
          emissive = '#78350F';
        }

        // Shelf levels 1 to 3
        const shelfLevel = parseShelfLevel(bin.shelf || (bin.binCode ? bin.binCode.split('-')[2] : '1'), binIdx);
        const slotsPerShelf = 2;
        const slotIdx = binIdx % slotsPerShelf;

        const binWidth = 2.4;
        const binHeight = 1.0;
        const binDepth = 1.8;

        const offsetX = (slotIdx - (slotsPerShelf - 1) / 2) * (binWidth + 0.3);
        const offsetY = 0.5 + shelfLevel * 1.3;
        const offsetZ = 0;

        binPositions.push({
          bin,
          x: rackCenterX + offsetX,
          y: offsetY,
          z: rackCenterZ + offsetZ,
          width: binWidth,
          height: binHeight,
          depth: binDepth,
          color,
          emissive,
          utilizationPercent: utilPercent,
          level: shelfLevel + 1,
        });
      });

      racks.push({
        id: key,
        zone,
        rack: rackName,
        x: rackCenterX,
        y: RACK_HEIGHT / 2,
        z: rackCenterZ,
        width: RACK_WIDTH,
        height: RACK_HEIGHT,
        depth: RACK_DEPTH,
        bins: binPositions,
      });
    });
  });

  // Calculate bounding box
  let minX = 0, maxX = 0, minZ = 0, maxZ = 0;
  racks.forEach((r) => {
    minX = Math.min(minX, r.x - r.width / 2);
    maxX = Math.max(maxX, r.x + r.width / 2);
    minZ = Math.min(minZ, r.z - r.depth / 2);
    maxZ = Math.max(maxZ, r.z + r.depth / 2);
  });

  const paddingX = 6;
  const paddingZFront = 8; // Extra front space for loading docks & forklift staging
  const paddingZBack = 5;

  const boundMinX = minX - paddingX;
  const boundMaxX = maxX + paddingX;
  const boundMinZ = minZ - paddingZFront; // Front wall where docks are located
  const boundMaxZ = maxZ + paddingZBack;  // Back wall
  const totalW = boundMaxX - boundMinX;
  const totalD = boundMaxZ - boundMinZ;
  const centerX = (boundMinX + boundMaxX) / 2;
  const centerZ = (boundMinZ + boundMaxZ) / 2;

  // Generate 2 Loading Docks on the front wall
  const dockWidth = 4.0;
  const dockHeight = 3.5;
  const docks: LoadingDockModel[] = [
    {
      id: 'dock-01',
      label: 'DOCK 01 (INBOUND)',
      type: 'inbound',
      x: boundMinX + totalW * 0.32,
      z: boundMinZ,
      width: dockWidth,
      height: dockHeight,
    },
    {
      id: 'dock-02',
      label: 'DOCK 02 (OUTBOUND)',
      type: 'outbound',
      x: boundMinX + totalW * 0.68,
      z: boundMinZ,
      width: dockWidth,
      height: dockHeight,
    },
  ];

  return {
    warehouseId: effectiveBins[0]?.warehouseId || 'wh-main',
    warehouseName: effectiveBins[0]?.warehouseName || fallbackWarehouseName,
    racks,
    docks,
    totalBins: effectiveBins.length,
    availableBins: availableCount,
    fullBins: fullCount,
    maintenanceBins: maintenanceCount,
    bounds: {
      minX: boundMinX,
      maxX: boundMaxX,
      minZ: boundMinZ,
      maxZ: boundMaxZ,
      width: totalW,
      depth: totalD,
      centerX,
      centerZ,
    },
  };

}

function parseShelfLevel(shelfStr: string, fallbackIdx: number): number {
  if (/(\d+)/.test(shelfStr)) {
    const num = parseInt(RegExp.$1, 10);
    return Math.max(0, Math.min(2, num - 1));
  }
  return Math.floor(fallbackIdx / 2) % 3;
}

/**
 * Fallback generator for realistic default bins if a warehouse has no bins configured yet
 */
export function generateDefaultWarehouseBins(warehouseName: string): WarehouseBin[] {
  const defaultBins: WarehouseBin[] = [];
  const zones = ['Zone A', 'Zone B', 'Zone C'];
  const racks = ['01', '02', '03'];
  const shelves = ['Level 1', 'Level 2', 'Level 3'];

  zones.forEach((zone) => {
    racks.forEach((rack) => {
      shelves.forEach((shelf, sIdx) => {
        for (let slot = 1; slot <= 2; slot++) {
          const zoneLetter = zone.split(' ')[1];
          const binCode = `${zoneLetter}-${rack}-0${sIdx * 2 + slot}`;
          const currentItems = (rack === '01' && sIdx === 0) ? 240 : (rack === '02' ? 80 : 0);
          const isFull = currentItems > 200;

          defaultBins.push({
            id: `bin-gen-${binCode}`,
            warehouseId: 'wh-main',
            warehouseName,
            binCode,
            zone,
            rack: `Rack ${rack}`,
            shelf,
            capacityKg: 500,
            currentItemsCount: currentItems,
            status: isFull ? 'full' : 'available',
            isActive: true,
          });
        }
      });
    });
  });

  return defaultBins;
}

import { BlueprintAnalysisResult } from '../services/gemini.service';

export interface ZoneCustomConfig {
  zoneName?: string;
  shelvesCount?: number;
  slotsPerShelf?: number;
  capacityKg?: number;
  heightMeters?: number;
}

export interface BlueprintLayoutOverrides {
  shelvesCount?: number;
  slotsPerShelf?: number;
  capacityKg?: number;
  heightMeters?: number;
  zones?: Record<string, ZoneCustomConfig>;
}

/**
 * Creates 1:1 exact 3D warehouse layout based on AI Blueprint Vision analysis
 */
export function createLayoutFromBlueprintResult(
  result: BlueprintAnalysisResult,
  baseBounds: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
    width: number;
    depth: number;
    centerX: number;
    centerZ: number;
  },
  overrides?: BlueprintLayoutOverrides
): WarehouseLayoutModel {
  const bWidth = Math.max(result.estimatedBuildingWidthMeters || 42, baseBounds?.width || 42);
  const bDepth = Math.max(result.estimatedBuildingDepthMeters || 32, baseBounds?.depth || 32);
  const b = {
    minX: -bWidth / 2,
    maxX: bWidth / 2,
    minZ: -bDepth / 2,
    maxZ: bDepth / 2,
    width: bWidth,
    depth: bDepth,
    centerX: 0,
    centerZ: 0,
  };
  const racks3D: Rack3DGroup[] = [];
  let totalBins = 0;
  let availableBins = 0;

  const configuredZoneKeys = overrides?.zones ? Object.keys(overrides.zones) : [];

  result.racks.forEach((rack, rackIdx) => {
    // Robust case-insensitive zone matching for custom overrides
    let targetZoneKey = rack.zone;
    if (configuredZoneKeys.length > 0) {
      const directMatch = configuredZoneKeys.find(
        (k) => k.toLowerCase().trim() === rack.zone.toLowerCase().trim()
      );
      if (directMatch) {
        targetZoneKey = directMatch;
      } else {
        // Fallback: proportional distribution among configured zones
        const zoneIdx = Math.min(
          configuredZoneKeys.length - 1,
          Math.floor((rackIdx / result.racks.length) * configuredZoneKeys.length)
        );
        targetZoneKey = configuredZoneKeys[zoneIdx];
      }
    }

    const zoneCfg = overrides?.zones?.[targetZoneKey];
    const finalZoneName = zoneCfg?.zoneName || targetZoneKey;
    const shelvesCount = zoneCfg?.shelvesCount || overrides?.shelvesCount || rack.shelvesCount || 3;
    const slotsPerShelf = zoneCfg?.slotsPerShelf || overrides?.slotsPerShelf || rack.slotsPerShelf || 4;
    const capacityKg = zoneCfg?.capacityKg || overrides?.capacityKg || 500;

    const isRotated = rack.rotationDegrees === 90;
    let rackDepth = 0;
    let rackWidth = 0;
    let worldX = 0;
    let worldZ = 0;

    // Standard Industrial Pallet Bay Length (~3.36 meters per standard 2-pallet bay)
    const BAY_STANDARD_LENGTH = 3.36;

    if (isRotated) {
      // Dynamic Physical Sizing: If AI detected a compact box depth, use it directly!
      rackDepth = rack.depthMeters && rack.depthMeters < 12
        ? Math.max(2.8, Math.round(rack.depthMeters * 10) / 10)
        : Math.round(slotsPerShelf * BAY_STANDARD_LENGTH * 10) / 10;
      rackWidth = rack.widthMeters ? Math.max(1.05, Math.min(2.5, Math.round(rack.widthMeters * 10) / 10)) : 1.05;

      worldX = Math.round((b.minX + (rack.x / 100) * b.width) * 100) / 100;
      // Position rack at its actual drawn Z coordinate if available
      if (rack.z !== undefined && rack.z !== null) {
        worldZ = Math.round((b.minZ + (rack.z / 100) * b.depth) * 100) / 100;
      } else {
        const frontAnchorZ = b.minZ + 0.27 * b.depth;
        worldZ = Math.round((frontAnchorZ + rackDepth / 2) * 100) / 100;
      }
    } else {
      // Horizontal rack running East-West
      rackWidth = Math.round(slotsPerShelf * BAY_STANDARD_LENGTH * 10) / 10;
      rackDepth = rack.depthMeters || 1.2;

      worldX = Math.round((b.minX + (rack.x / 100) * b.width) * 100) / 100;
      worldZ = Math.round((b.minZ + (rack.z / 100) * b.depth) * 100) / 100;
    }
    const rackHeight = zoneCfg?.heightMeters || overrides?.heightMeters || rack.heightMeters || (shelvesCount * 1.35 + 0.5);

    const binPositions: Bin3DPosition[] = [];

    for (let s = 0; s < shelvesCount; s++) {
      for (let slot = 0; slot < slotsPerShelf; slot++) {
        const shelfCode = String.fromCharCode(65 + s);
        const slotCode = String(slot + 1).padStart(2, '0');
        const binCode = `${finalZoneName.replace(/\s+/g, '')}-${rack.rackName}-${shelfCode}-${slotCode}`;

        // In 1 bin/bay: the box spans ~85-88% of the bay length (e.g. ~2.85m in a 3.36m bay), leaving realistic 20cm clearance on each side!
        const baySpan = isRotated ? (rackDepth / slotsPerShelf) : (rackWidth / slotsPerShelf);
        const binSpanLength = Math.max(1.10, Math.round((baySpan - 0.40) * 100) / 100);
        const binCrossWidth = 1.05; // Standard pallet depth across rack beam
        const binW = isRotated ? binCrossWidth : binSpanLength;
        const binD = isRotated ? binSpanLength : binCrossWidth;
        const binH = 0.95;

        let offsetX = 0;
        let offsetZ = 0;
        if (isRotated) {
          offsetZ = (slot - (slotsPerShelf - 1) / 2) * (rackDepth / slotsPerShelf);
        } else {
          offsetX = (slot - (slotsPerShelf - 1) / 2) * (rackWidth / slotsPerShelf);
        }

        // Industrial shelf physics: bin bottom sits on shelf beam
        const shelfBeamThickness = 0.06;
        const shelfBeamTopY = (0.45 + s * 1.35) + (shelfBeamThickness / 2);
        const binCenterY = shelfBeamTopY + (binH / 2);

        binPositions.push({
          bin: {
            id: `ai-${binCode.toLowerCase()}`,
            tenantId: 'tenant-demo',
            warehouseId: 'wh-blueprint',
            zone: finalZoneName,
            rack: rack.rackName,
            shelf: shelfCode,
            binNumber: binCode,
            type: 'standard',
            capacityKg,
            status: 'available',
            isActive: true,
          } as any,
          x: worldX + offsetX,
          y: binCenterY,
          z: worldZ + offsetZ,
          width: binW,
          height: binH,
          depth: binD,
          color: '#10b981',
          emissive: '#000000',
          utilizationPercent: 0,
          level: s + 1,
        });

        totalBins++;
        availableBins++;
      }
    }

    racks3D.push({
      id: `ai-rack-${targetZoneKey}-${rack.rackName}`,
      zone: finalZoneName,
      rack: rack.rackName,
      x: worldX,
      y: rackHeight / 2,
      z: worldZ,
      originalX: worldX,
      originalZ: worldZ,
      width: rackWidth,
      height: rackHeight,
      depth: rackDepth,
      bins: binPositions,
    });
  });

  // Calculate doors / loading docks aligned with blueprint
  const docks: LoadingDockModel[] =
    result.doors && result.doors.length > 0
      ? result.doors.map((d, dIdx) => ({
          id: `ai-dock-${dIdx + 1}`,
          label: d.label || `DOCK ${String(dIdx + 1).padStart(2, '0')}`,
          type: d.type || (dIdx === 0 ? 'inbound' : 'outbound'),
          x: b.minX + (d.x / 100) * b.width,
          z: b.minZ,
          width: d.widthMeters || 4.2,
          height: 3.6,
        }))
      : [
          { id: 'dock-01', label: 'DOCK 01 (INBOUND)', type: 'inbound', x: b.centerX - b.width * 0.16, z: b.minZ, width: 4.2, height: 3.6 },
          { id: 'dock-02', label: 'DOCK 02 (OUTBOUND)', type: 'outbound', x: b.centerX + b.width * 0.16, z: b.minZ, width: 4.2, height: 3.6 },
        ];

  const rooms = (result.rooms || []).map((r, idx) => ({
    id: r.id || `room-${idx}`,
    name: r.name,
    label: r.label,
    type: r.type,
    x: Math.round((b.minX + (r.x / 100) * b.width) * 100) / 100,
    z: Math.round((b.minZ + (r.z / 100) * b.depth) * 100) / 100,
    width: Math.max(3.0, Math.round(((r.widthPercent || 16) / 100) * b.width * 100) / 100),
    depth: Math.max(3.0, Math.round(((r.depthPercent || 16) / 100) * b.depth * 100) / 100),
    height: 3.0,
  }));

  return {
    warehouseId: 'wh-blueprint',
    warehouseName: result.warehouseName || 'คลังสินค้าตามแปลน AI',
    racks: racks3D,
    docks,
    rooms,
    totalBins,
    availableBins,
    fullBins: 0,
    maintenanceBins: 0,
    bounds: b,
  };
}

/**
 * Ensures blueprint layouts retain individual per-zone rack depths and track initial coordinates
 */
export function ensureBlueprintRackScale(layout: WarehouseLayoutModel): WarehouseLayoutModel {
  if (layout.warehouseId !== 'wh-blueprint' || !layout.racks || layout.racks.length === 0) {
    return layout;
  }

  // Ensure every rack has originalX and originalZ recorded for position reset support
  const updatedRacks = layout.racks.map((r) => ({
    ...r,
    originalX: r.originalX !== undefined ? r.originalX : r.x,
    originalZ: r.originalZ !== undefined ? r.originalZ : r.z,
  }));

  return {
    ...layout,
    racks: updatedRacks,
  };
}

