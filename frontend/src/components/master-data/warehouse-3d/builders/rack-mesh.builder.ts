import * as THREE from 'three';
import { Bin3DPosition, Rack3DGroup } from '../../../../types/warehouse-3d';

export interface BuildRacksResult {
  rackGroups: Record<string, THREE.Group>;
  rootGroup: THREE.Group;
  binMeshes: { mesh: THREE.Mesh; binPos: Bin3DPosition }[];
}

export interface BuildRacksOptions {
  racks: Rack3DGroup[];
  filterMode: 'all' | 'available' | 'full' | 'maintenance';
  selectedZone: string;
  selectedRack: string;
  isXRayMode: boolean;
  theme: 'dark' | 'light';
}

/**
 * Builds Industrial Pallet Rack Structures & Storage Bins
 * Optimized for Pure GPU Transformation (60 FPS Game-Style Moving)
 */
export class RackMeshBuilder {
  public static buildRacks(options: BuildRacksOptions): BuildRacksResult {
    const { racks, filterMode, selectedZone, selectedRack, isXRayMode, theme } = options;
    const isDark = theme === 'dark';

    const rootGroup = new THREE.Group();
    rootGroup.name = 'all-racks-root';

    const rackGroups: Record<string, THREE.Group> = {};
    const binMeshes: { mesh: THREE.Mesh; binPos: Bin3DPosition }[] = [];

    // Shared Materials for High Performance & Zero Stutter
    const steelMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x1e293b : 0x334155,
      roughness: 0.7,
      metalness: 0.3,
    });

    const shelfMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x0f172a : 0x475569,
      roughness: 0.85,
      metalness: 0.15,
    });

    racks.forEach((rack) => {
      // Zone filter check
      if (selectedZone !== 'all') {
        const zoneMatch = rack.zone.toLowerCase().replace(/\s+/g, '') === selectedZone.toLowerCase().replace(/\s+/g, '');
        if (!zoneMatch) return;
      }

      // Single rack focus check
      if (selectedRack !== 'all' && rack.rack !== selectedRack) {
        return;
      }

      const rackGroup = new THREE.Group();
      rackGroup.name = `rack-structure-${rack.id}`;
      rackGroup.userData = { rackId: rack.id, rack };

      // Upright Posts & Structural Bracing
      const postRadius = 0.045;
      const postGeo = new THREE.CylinderGeometry(postRadius, postRadius, rack.height);
      const halfW = rack.width / 2;
      const halfD = rack.depth / 2;
      const halfH = rack.height / 2;

      const maxShelves = Math.max(1, ...rack.bins.map((b) => b.level || 1));
      const baysCount = Math.max(1, Math.round(rack.bins.length / maxShelves) || 4);

      for (let bay = 0; bay <= baysCount; bay++) {
        const pz = -halfD + (bay / baysCount) * rack.depth;

        // Left Column
        const leftPost = new THREE.Mesh(postGeo, steelMat);
        leftPost.position.set(-halfW, halfH, pz);
        leftPost.castShadow = true;
        rackGroup.add(leftPost);

        // Right Column
        const rightPost = new THREE.Mesh(postGeo, steelMat);
        rightPost.position.set(halfW, halfH, pz);
        rightPost.castShadow = true;
        rackGroup.add(rightPost);

        // Top tie brace
        const tieGeo = new THREE.BoxGeometry(rack.width, 0.04, 0.04);
        const topTie = new THREE.Mesh(tieGeo, steelMat);
        topTie.position.set(0, rack.height, pz);
        rackGroup.add(topTie);
      }

      // Horizontal Shelf Beams
      for (let lvl = 0; lvl < maxShelves; lvl++) {
        const shelfGeo = new THREE.BoxGeometry(rack.width, 0.06, rack.depth);
        const shelf = new THREE.Mesh(shelfGeo, shelfMat);
        shelf.position.set(0, 0.45 + lvl * 1.35, 0);
        shelf.receiveShadow = true;
        rackGroup.add(shelf);
      }

      // Set Rack Group Position
      rackGroup.position.set(rack.x, 0, rack.z);
      rackGroups[rack.id] = rackGroup;
      rootGroup.add(rackGroup);

      // Create Bins for this rack (attached into rackGroup for 60 FPS GPU Translation)
      rack.bins.forEach((binPos) => {
        const isInactive = binPos.bin.isActive === false || binPos.bin.status === 'maintenance';
        const isFull = !isInactive && (binPos.bin.status === 'full' || binPos.utilizationPercent >= 90);
        const isAvail = !isInactive && !isFull;

        if (filterMode === 'available' && !isAvail) return;
        if (filterMode === 'full' && !isFull) return;
        if (filterMode === 'maintenance' && !isInactive) return;

        const isXRayTranslucent = isXRayMode && isAvail;
        const boxGeo = new THREE.BoxGeometry(binPos.width, binPos.height, binPos.depth);

        // Soft Matte Non-Reflective Material (Eye-Friendly, Zero Glare)
        const boxMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(binPos.color),
          emissive: new THREE.Color(0x000000), // No neon glow!
          emissiveIntensity: 0,
          roughness: 0.85,                     // Matte industrial texture
          metalness: 0.05,                     // No harsh specular glare
          transparent: isXRayTranslucent,
          opacity: isXRayTranslucent ? 0.22 : 1.0,
        });

        const boxMesh = new THREE.Mesh(boxGeo, boxMat);
        // Local coordinates relative to rack center
        boxMesh.position.set(binPos.x - rack.x, binPos.y, binPos.z - rack.z);
        boxMesh.castShadow = true;
        boxMesh.receiveShadow = true;

        (boxMesh as any).userData = { bin: binPos.bin, binPos, rackId: rack.id };

        rackGroup.add(boxMesh);
        binMeshes.push({ mesh: boxMesh, binPos });
      });
    });

    return {
      rackGroups,
      rootGroup,
      binMeshes,
    };
  }
}
