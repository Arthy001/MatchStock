import * as THREE from 'three';
import { CurvedPathway3D } from '../core/types';

/**
 * Builds 3D Curved Pathways, Forklift Turning Radii, and Curved Conveyors
 */
export class CurvePathBuilder {
  /**
   * Builds a complete group of curved pathways (Lanes, Conveyors, AGV tracks)
   */
  public static buildCurvedPathways(pathways: CurvedPathway3D[], isDark: boolean = true): THREE.Group {
    const rootGroup = new THREE.Group();
    rootGroup.name = 'curved-pathways-root';

    pathways.forEach((pathway) => {
      if (!pathway.points || pathway.points.length < 2) return;

      const curve = new THREE.CatmullRomCurve3(pathway.points, false, 'centripetal', 0.5);

      if (pathway.type === 'conveyor') {
        const conveyorGroup = this.buildCurvedConveyor(curve, pathway, isDark);
        rootGroup.add(conveyorGroup);
      } else {
        // Forklift lane, AGV track, or safety road
        const laneGroup = this.buildCurvedFloorLane(curve, pathway, isDark);
        rootGroup.add(laneGroup);
      }
    });

    return rootGroup;
  }

  /**
   * Builds a smooth floor lane ribbon with safety markings
   */
  private static buildCurvedFloorLane(
    curve: THREE.CatmullRomCurve3,
    pathway: CurvedPathway3D,
    isDark: boolean
  ): THREE.Group {
    const laneGroup = new THREE.Group();
    laneGroup.name = `lane-${pathway.id}`;

    const pointsCount = 48;
    const sampledPoints = curve.getPoints(pointsCount);

    // 1. Center Guide Line (Yellow or Cyan)
    const lineGeo = new THREE.BufferGeometry().setFromPoints(sampledPoints);
    const lineMat = new THREE.LineBasicMaterial({
      color: pathway.color || (pathway.type === 'agv_track' ? 0x06b6d4 : 0xf59e0b),
      linewidth: 3,
      transparent: true,
      opacity: 0.85,
    });
    const centerLine = new THREE.Line(lineGeo, lineMat);
    centerLine.position.y = 0.025; // Slightly above floor
    laneGroup.add(centerLine);

    // 2. Road surface ribbon / Turning Radius Zone
    const roadWidth = pathway.width || 2.4;
    const ribbonGeo = this.createRibbonGeometry(sampledPoints, roadWidth);
    const roadMat = new THREE.MeshBasicMaterial({
      color: pathway.type === 'agv_track' ? 0x0891b2 : 0xf59e0b,
      transparent: true,
      opacity: isDark ? 0.14 : 0.22,
      side: THREE.DoubleSide,
    });
    const roadMesh = new THREE.Mesh(ribbonGeo, roadMat);
    roadMesh.position.y = 0.015;
    laneGroup.add(roadMesh);

    // 3. Directional Flow Arrows at intervals along the curve
    for (let i = 8; i < sampledPoints.length - 4; i += 12) {
      const pt = sampledPoints[i];
      const nextPt = sampledPoints[i + 1];
      const dir = new THREE.Vector3().subVectors(nextPt, pt).normalize();
      const angle = Math.atan2(dir.x, dir.z);

      const arrowGeo = new THREE.ConeGeometry(0.22, 0.5, 3);
      const arrowMat = new THREE.MeshBasicMaterial({
        color: pathway.color || 0xfacc15,
        transparent: true,
        opacity: 0.75,
      });
      const arrowMesh = new THREE.Mesh(arrowGeo, arrowMat);
      arrowMesh.position.set(pt.x, 0.026, pt.z);
      arrowMesh.rotation.x = Math.PI / 2;
      arrowMesh.rotation.z = -angle;
      laneGroup.add(arrowMesh);
    }

    return laneGroup;
  }

  /**
   * Builds an industrial 3D Curved Conveyor Belt with rollers and frame
   */
  private static buildCurvedConveyor(
    curve: THREE.CatmullRomCurve3,
    pathway: CurvedPathway3D,
    isDark: boolean
  ): THREE.Group {
    const conveyorGroup = new THREE.Group();
    conveyorGroup.name = `conveyor-${pathway.id}`;

    const segments = 40;
    const conveyorWidth = pathway.width || 1.1;
    const conveyorHeight = 0.75; // Elevation off the ground

    // Extrude side rails along curve
    const tubeGeo = new THREE.TubeGeometry(curve, segments, 0.04, 8, false);
    const railMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x334155 : 0x64748b,
      metalness: 0.8,
      roughness: 0.3,
    });

    const leftRail = new THREE.Mesh(tubeGeo, railMat);
    leftRail.position.set(-conveyorWidth / 2, conveyorHeight, 0);
    conveyorGroup.add(leftRail);

    const rightRail = new THREE.Mesh(tubeGeo, railMat);
    rightRail.position.set(conveyorWidth / 2, conveyorHeight, 0);
    conveyorGroup.add(rightRail);

    // Rollers along the curve
    const rollerPoints = curve.getPoints(24);
    const rollerMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.9,
      roughness: 0.2,
    });
    const rollerGeo = new THREE.CylinderGeometry(0.03, 0.03, conveyorWidth - 0.08, 12);

    for (let i = 0; i < rollerPoints.length - 1; i++) {
      const p = rollerPoints[i];
      const pNext = rollerPoints[i + 1];
      const dir = new THREE.Vector3().subVectors(pNext, p).normalize();
      const angle = Math.atan2(dir.x, dir.z);

      const roller = new THREE.Mesh(rollerGeo, rollerMat);
      roller.position.set(p.x, conveyorHeight, p.z);
      roller.rotation.y = angle;
      roller.rotation.z = Math.PI / 2;
      conveyorGroup.add(roller);

      // Support legs every 6 rollers
      if (i % 6 === 0) {
        const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5, roughness: 0.5 });
        const legGeo = new THREE.BoxGeometry(0.06, conveyorHeight, 0.06);

        const leftLeg = new THREE.Mesh(legGeo, legMat);
        leftLeg.position.set(p.x - conveyorWidth / 2, conveyorHeight / 2, p.z);
        conveyorGroup.add(leftLeg);

        const rightLeg = new THREE.Mesh(legGeo, legMat);
        rightLeg.position.set(p.x + conveyorWidth / 2, conveyorHeight / 2, p.z);
        conveyorGroup.add(rightLeg);
      }
    }

    return conveyorGroup;
  }

  /**
   * Helper to create a flat quad ribbon following 3D points
   */
  private static createRibbonGeometry(points: THREE.Vector3[], width: number): THREE.BufferGeometry {
    const halfW = width / 2;
    const vertices: number[] = [];
    const indices: number[] = [];

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      let dir: THREE.Vector3;

      if (i < points.length - 1) {
        dir = new THREE.Vector3().subVectors(points[i + 1], p).normalize();
      } else {
        dir = new THREE.Vector3().subVectors(p, points[i - 1]).normalize();
      }

      // Perpendicular vector on XZ plane
      const normal = new THREE.Vector3(-dir.z, 0, dir.x).normalize();

      // Left vertex
      vertices.push(p.x + normal.x * halfW, p.y, p.z + normal.z * halfW);
      // Right vertex
      vertices.push(p.x - normal.x * halfW, p.y, p.z - normal.z * halfW);

      if (i < points.length - 1) {
        const base = i * 2;
        indices.push(base, base + 1, base + 2);
        indices.push(base + 1, base + 3, base + 2);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }

  /**
   * Generates a glowing animated navigation route for AI Autonomous Pathfinding
   */
  public static buildNavigationRouteMesh(routePoints: THREE.Vector3[]): THREE.Group {
    const routeGroup = new THREE.Group();
    routeGroup.name = 'ai-autonomous-route';

    if (routePoints.length < 2) return routeGroup;

    const curve = new THREE.CatmullRomCurve3(routePoints, false, 'centripetal', 0.5);
    const finePoints = curve.getPoints(60);

    // Glowing core line
    const lineGeo = new THREE.BufferGeometry().setFromPoints(finePoints);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x10b981, // Emerald Green route
      linewidth: 4,
    });
    const line = new THREE.Line(lineGeo, lineMat);
    line.position.y = 0.08;
    routeGroup.add(line);

    // Route waypoint beacons
    routePoints.forEach((pt, idx) => {
      const isStart = idx === 0;
      const isEnd = idx === routePoints.length - 1;

      const beaconGeo = new THREE.CylinderGeometry(
        isStart || isEnd ? 0.35 : 0.18,
        isStart || isEnd ? 0.35 : 0.18,
        0.04,
        16
      );
      const beaconMat = new THREE.MeshBasicMaterial({
        color: isStart ? 0x06b6d4 : isEnd ? 0x10b981 : 0xfbbf24,
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.set(pt.x, 0.06, pt.z);
      routeGroup.add(beacon);
    });

    return routeGroup;
  }
}
