import { WarehouseBin } from '../types';
import { Bin3DPosition, Rack3DGroup, WarehouseLayoutModel } from '../types/warehouse-3d';

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

  const padding = 6;
  return {
    warehouseId: effectiveBins[0]?.warehouseId || 'wh-main',
    warehouseName: effectiveBins[0]?.warehouseName || fallbackWarehouseName,
    racks,
    totalBins: effectiveBins.length,
    availableBins: availableCount,
    fullBins: fullCount,
    maintenanceBins: maintenanceCount,
    bounds: {
      minX: minX - padding,
      maxX: maxX + padding,
      minZ: minZ - padding,
      maxZ: maxZ + padding,
      width: Math.max(30, (maxX - minX) + padding * 2),
      depth: Math.max(30, (maxZ - minZ) + padding * 2),
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
