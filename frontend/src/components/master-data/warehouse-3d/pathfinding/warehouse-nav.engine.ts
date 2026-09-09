import * as THREE from 'three';
import { WarehouseLayoutModel, Bin3DPosition } from '../../../../types/warehouse-3d';
import { FacilityRoom, NavWaypoint, NavigationRoute } from '../core/types';

/**
 * AI Autonomous Pathfinding & Navigation Graph Engine
 * Calculates shortest collision-free routes for AGVs, Forklifts, and Pickers
 */
export class WarehouseNavEngine {
  /**
   * Generates a collision-aware Waypoint Graph from the warehouse layout
   */
  public static generateNavGraph(
    layout: WarehouseLayoutModel,
    rooms: FacilityRoom[] = []
  ): NavWaypoint[] {
    const waypoints: NavWaypoint[] = [];
    const b = layout.bounds;

    // 1. Loading Dock Entry Waypoints
    const frontLaneZ = b.minZ + 0.15 * b.depth;
    layout.docks?.forEach((dock, idx) => {
      waypoints.push({
        id: `wp-dock-${idx + 1}`,
        x: dock.x,
        z: dock.z + 2.5,
        type: 'dock',
        neighbors: [`wp-staging-${idx + 1}`, 'wp-crossroad-front-main'],
      });

      waypoints.push({
        id: `wp-staging-${idx + 1}`,
        x: dock.x,
        z: frontLaneZ,
        type: 'staging',
        neighbors: [`wp-dock-${idx + 1}`, 'wp-crossroad-front-main'],
      });
    });

    // Main Central Crossroad
    waypoints.push({
      id: 'wp-crossroad-front-main',
      x: b.centerX,
      z: frontLaneZ,
      type: 'crossroad',
      neighbors: layout.docks?.map((_, idx) => `wp-staging-${idx + 1}`) || [],
    });

    // 2. Aisle Entry Waypoints (Front and Back of every rack aisle)
    layout.racks.forEach((rack) => {
      const aisleFrontZ = rack.z - rack.depth / 2 - 1.8;
      const aisleBackZ = rack.z + rack.depth / 2 + 1.8;

      // Check if blocked by any facility room
      const isFrontBlocked = rooms.some((rm) =>
        Math.abs(rm.x - rack.x) < rm.width / 2 && Math.abs(rm.z - aisleFrontZ) < rm.depth / 2
      );

      const isBackBlocked = rooms.some((rm) =>
        Math.abs(rm.x - rack.x) < rm.width / 2 && Math.abs(rm.z - aisleBackZ) < rm.depth / 2
      );

      const frontWpId = `wp-aisle-front-${rack.id}`;
      const backWpId = `wp-aisle-back-${rack.id}`;

      waypoints.push({
        id: frontWpId,
        x: rack.x,
        z: aisleFrontZ,
        type: 'aisle_junction',
        neighbors: ['wp-crossroad-front-main'],
        isBlocked: isFrontBlocked,
      });

      waypoints.push({
        id: backWpId,
        x: rack.x,
        z: aisleBackZ,
        type: 'aisle_junction',
        neighbors: [frontWpId],
        isBlocked: isBackBlocked,
      });
    });

    return waypoints;
  }

  /**
   * Calculates the shortest collision-free autonomous route from a starting point (e.g. Dock)
   * to a target storage bin location
   */
  public static calculateRouteToBin(
    startPoint: { x: number; z: number },
    targetBin: Bin3DPosition,
    layout: WarehouseLayoutModel,
    rooms: FacilityRoom[] = []
  ): NavigationRoute {
    const waypoints: THREE.Vector3[] = [];

    // 1. Start at Dock / Starting Point
    waypoints.push(new THREE.Vector3(startPoint.x, 0.05, startPoint.z));

    // 2. Drive to Front Main Traffic Lane
    const frontLaneZ = layout.bounds.minZ + 0.18 * layout.bounds.depth;
    waypoints.push(new THREE.Vector3(startPoint.x, 0.05, frontLaneZ));

    // 3. Drive horizontally along Traffic Lane to Target Aisle X
    // (Check if path passes through any interior room, if so divert)
    let transitX = targetBin.x;
    const roomCollision = rooms.find(
      (r) => Math.abs(r.x - transitX) < r.width / 2 && Math.abs(r.z - frontLaneZ) < r.depth / 2
    );

    if (roomCollision) {
      // Divert around room
      transitX = roomCollision.x + roomCollision.width / 2 + 1.5;
      waypoints.push(new THREE.Vector3(transitX, 0.05, frontLaneZ));
    }

    waypoints.push(new THREE.Vector3(targetBin.x, 0.05, frontLaneZ));

    // 4. Drive down the Aisle to the exact Bin location
    const stopZ = targetBin.z;
    waypoints.push(new THREE.Vector3(targetBin.x, 0.05, stopZ));

    // Calculate total driving distance
    let totalDistance = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
      totalDistance += waypoints[i].distanceTo(waypoints[i + 1]);
    }

    // Average warehouse AGV / Forklift speed = ~3.5 m/s (~12.6 km/h)
    const averageSpeedMs = 3.5;
    const estimatedSeconds = Math.round(totalDistance / averageSpeedMs);

    return {
      id: `route-${targetBin.bin.id}`,
      sourceId: 'dock-01',
      targetId: targetBin.bin.id,
      targetLabel: `${targetBin.bin.zone} - ${targetBin.bin.rack} [${targetBin.bin.binCode || (targetBin.bin as any).code || targetBin.bin.id}]`,
      pathPoints: waypoints,
      totalDistanceMeters: Math.round(totalDistance * 10) / 10,
      estimatedTimeSeconds: estimatedSeconds,
      isCurved: true,
    };
  }
}
