import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { WarehouseLayoutModel, ViewMode3D } from '../../../../types/warehouse-3d';
import { SceneContext } from './types';

export interface SceneManagerOptions {
  container: HTMLDivElement;
  layout: WarehouseLayoutModel;
  viewMode: ViewMode3D;
  theme: 'dark' | 'light';
}

/**
 * Manages Three.js Scene, Cameras, Soft Lighting, and Floor Plane
 */
export class SceneManager {
  public static initialize(options: SceneManagerOptions): {
    context: SceneContext;
    controls: OrbitControls;
  } {
    const { container, layout, viewMode, theme } = options;
    const isDark = theme === 'dark';
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const aspect = width / height;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isDark ? 0x070b12 : 0xf8fafc);

    // 2. Cameras
    const b = layout.bounds;
    const pCamera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    pCamera.position.set(b.centerX + 18, 14, b.centerZ + 22);

    const orthoFrustum = Math.max(b.width, b.depth) * 0.65;
    const oCamera = new THREE.OrthographicCamera(
      -orthoFrustum * aspect,
      orthoFrustum * aspect,
      orthoFrustum,
      -orthoFrustum,
      0.1,
      1000
    );
    oCamera.position.set(b.centerX, 36, b.centerZ);
    oCamera.lookAt(b.centerX, 0, b.centerZ);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. OrbitControls
    const activeCamera = viewMode === '2d' ? oCamera : pCamera;
    const controls = new OrbitControls(activeCamera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    if (viewMode === '2d') {
      controls.target.set(b.centerX, 0, b.centerZ);
      controls.maxPolarAngle = 0;
      controls.minPolarAngle = 0;
      controls.enableRotate = false;
    } else {
      controls.target.set(b.centerX, 2.2, b.centerZ);
      controls.maxPolarAngle = Math.PI / 2.1;
      controls.minPolarAngle = 0;
      controls.minDistance = 4;
      controls.maxDistance = 90;
      controls.enableRotate = true;
    }

    // 5. Soft, Eye-Friendly Matte Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 0.85 : 0.95);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.55);
    dirLight.position.set(20, 35, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.25);
    fillLight.position.set(-20, 20, -20);
    scene.add(fillLight);

    // 6. Floor Grid & Ground Plane
    const floorSize = Math.max(b.width, b.depth) + 20;
    const floorGeo = new THREE.PlaneGeometry(floorSize, floorSize);
    const floorMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x070b12 : 0xf1f5f9,
      roughness: 0.95,
      metalness: 0.05,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    const gridHelper = new THREE.GridHelper(
      floorSize,
      Math.round(floorSize / 2),
      isDark ? 0x1e293b : 0xcbd5e1,
      isDark ? 0x0f172a : 0xe2e8f0
    );
    gridHelper.position.set(b.centerX, 0.005, b.centerZ);
    scene.add(gridHelper);

    const context: SceneContext = {
      scene,
      renderer,
      perspectiveCamera: pCamera,
      orthographicCamera: oCamera,
      ambientLight,
      dirLight,
      fillLight,
      floorMesh,
    };

    return { context, controls };
  }
}
