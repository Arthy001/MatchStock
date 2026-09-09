import * as THREE from 'three';
import { WarehouseBin } from '../../../../types';
import { Rack3DGroup, WarehouseLayoutModel } from '../../../../types/warehouse-3d';

/**
 * Facility and Interior Room Definition
 * (e.g. Restrooms, Manager Office, Security/Control Room, Utility Room)
 */
export interface FacilityRoom {
  id: string;
  name: string;
  label: string;
  type: 'restroom' | 'office' | 'control_room' | 'utility' | 'staircase';
  x: number;          // Center X (meters)
  z: number;          // Center Z (meters)
  width: number;      // Width along X (meters)
  depth: number;      // Depth along Z (meters)
  height?: number;    // Wall height (meters, default 3.0m)
  wallColor?: number; // Three.js color hex
  floorColor?: number;
  doorSide?: 'front' | 'back' | 'left' | 'right';
  doorWidth?: number; // Door opening width (meters, default 1.2m)
}

/**
 * 3D Curved Pathway / Conveyor / AGV Lane
 */
export interface CurvedPathway3D {
  id: string;
  name: string;
  type: 'forklift_lane' | 'conveyor' | 'agv_track' | 'safety_aisle';
  points: THREE.Vector3[];
  width: number;
  color?: number;
  dashSize?: number;
  gapSize?: number;
  hasRollers?: boolean; // For conveyor belt visualization
}

/**
 * Waypoint Node for AI Autonomous Pathfinding
 */
export interface NavWaypoint {
  id: string;
  x: number;
  z: number;
  type: 'dock' | 'staging' | 'aisle_junction' | 'rack_stop' | 'crossroad';
  neighbors: string[]; // Connected waypoint IDs
  isBlocked?: boolean;
}

/**
 * Calculated AI Autonomous Navigation Route
 */
export interface NavigationRoute {
  id: string;
  sourceId: string;
  targetId: string;
  targetLabel: string;
  pathPoints: THREE.Vector3[];
  totalDistanceMeters: number;
  estimatedTimeSeconds: number;
  isCurved: boolean;
}

/**
 * Three.js Scene Environment Context
 */
export interface SceneContext {
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  perspectiveCamera: THREE.PerspectiveCamera;
  orthographicCamera: THREE.OrthographicCamera;
  ambientLight: THREE.AmbientLight;
  dirLight: THREE.DirectionalLight;
  fillLight: THREE.DirectionalLight;
  floorMesh: THREE.Mesh;
}
