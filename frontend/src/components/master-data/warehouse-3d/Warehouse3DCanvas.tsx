import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { WarehouseBin, ThemeMode } from '../../../types';
import { ViewMode3D, FilterMode3D, Bin3DPosition } from '../../../types/warehouse-3d';
import { calculateWarehouseLayout } from '../../../utils/warehouse-layout.calculator';
import { WarehouseControlsHUD } from './WarehouseControlsHUD';
import { BinDetailDrawer } from './BinDetailDrawer';
import { CheckCircle2, X } from 'lucide-react';

interface Warehouse3DCanvasProps {
  theme: ThemeMode;
  binsList: WarehouseBin[];
  onOpenEditBin: (bin: WarehouseBin, isViewOnly?: boolean) => void;
  onDeleteBin: (bin: WarehouseBin) => void;
  viewMode: ViewMode3D;
  onViewModeChange: (mode: ViewMode3D) => void;
  onRelocateStock?: (sourceBinId: string, targetBinId: string, qty: number) => Promise<void>;
}

export const Warehouse3DCanvas: React.FC<Warehouse3DCanvasProps> = ({
  theme,
  binsList,
  onOpenEditBin,
  onDeleteBin,
  viewMode,
  onViewModeChange,
  onRelocateStock,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // States
  const [filterMode, setFilterMode] = useState<FilterMode3D>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBin, setSelectedBin] = useState<WarehouseBin | null>(null);
  const [hoveredBin, setHoveredBin] = useState<{ binPos: Bin3DPosition; mouseX: number; mouseY: number } | null>(null);

  // Move / Swap Mode States
  const [isMoveMode, setIsMoveMode] = useState(false);
  const [sourceMoveBin, setSourceMoveBin] = useState<WarehouseBin | null>(null);
  const [moveToast, setMoveToast] = useState<string | null>(null);

  // Layout calculation
  const layout = useMemo(() => {
    return calculateWarehouseLayout(binsList);
  }, [binsList]);

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const perspectiveCameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const orthographicCameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshesRef = useRef<{ mesh: THREE.Mesh; binPos: Bin3DPosition }[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  // Setup Three.js Scene
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = Math.max(560, containerRef.current.clientHeight);

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(theme === 'dark' ? 0x090d16 : 0xf8fafc);
    sceneRef.current = scene;

    // 2. Cameras
    const aspect = width / height;
    const pCamera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    // Position camera closer at eye-level centered on the rack
    pCamera.position.set(13, 9, 15);
    perspectiveCameraRef.current = pCamera;

    const orthoFrustum = 12;
    const oCamera = new THREE.OrthographicCamera(
      -orthoFrustum * aspect,
      orthoFrustum * aspect,
      orthoFrustum,
      -orthoFrustum,
      0.1,
      1000
    );
    oCamera.position.set(0, 30, 0);
    oCamera.lookAt(0, 0, 0);
    orthographicCameraRef.current = oCamera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. OrbitControls
    const activeCamera = viewMode === '2d' ? oCamera : pCamera;
    const controls = new OrbitControls(activeCamera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    // Eye level target
    controls.target.set(0, 2.2, 0);
    controls.maxPolarAngle = viewMode === '2d' ? 0 : Math.PI / 2.1;
    controls.minDistance = 4;
    controls.maxDistance = 60;
    controlsRef.current = controls;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, theme === 'dark' ? 0.75 : 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.95);
    dirLight.position.set(20, 35, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.45);
    fillLight.position.set(-20, 20, -20);
    scene.add(fillLight);

    // 6. Floor Grid & Warehouse Floor
    const floorSize = Math.max(layout.bounds.width, layout.bounds.depth) + 6;
    const floorGeo = new THREE.PlaneGeometry(floorSize, floorSize);
    const floorMat = new THREE.MeshStandardMaterial({
      color: theme === 'dark' ? 0x0f172a : 0xe2e8f0,
      roughness: 0.85,
      metalness: 0.1,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.05;
    floor.receiveShadow = true;
    scene.add(floor);

    const gridHelper = new THREE.GridHelper(
      floorSize,
      Math.round(floorSize / 2),
      theme === 'dark' ? 0x334155 : 0x94a3b8,
      theme === 'dark' ? 0x1e293b : 0xcbd5e1
    );
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // 7. Render Animation Loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      controls.update();

      // Pulsing effect for search pinpoint matches or selected move source
      const time = Date.now() * 0.005;
      meshesRef.current.forEach(({ mesh, binPos }) => {
        const isSearchMatched = searchQuery.trim() && binPos.bin.binCode?.toLowerCase().includes(searchQuery.toLowerCase());
        const isMoveSource = sourceMoveBin && binPos.bin.id === sourceMoveBin.id;

        if (isMoveSource) {
          const s = 1 + Math.sin(time * 2) * 0.1;
          mesh.scale.set(s, s, s);
          (mesh.material as THREE.MeshStandardMaterial).emissive.set(0x38bdf8); // Cyan pulse
        } else if (isSearchMatched) {
          const s = 1 + Math.sin(time) * 0.08;
          mesh.scale.set(s, s, s);
        } else {
          mesh.scale.set(1, 1, 1);
          (mesh.material as THREE.MeshStandardMaterial).emissive.set(new THREE.Color(binPos.emissive));
        }
      });

      const cam = viewMode === '2d' ? oCamera : pCamera;
      renderer.render(scene, cam);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = Math.max(560, containerRef.current.clientHeight);
      const asp = w / h;

      pCamera.aspect = asp;
      pCamera.updateProjectionMatrix();

      oCamera.left = -orthoFrustum * asp;
      oCamera.right = orthoFrustum * asp;
      oCamera.top = orthoFrustum;
      oCamera.bottom = -orthoFrustum;
      oCamera.updateProjectionMatrix();

      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      controls.dispose();
      renderer.dispose();
    };
  }, [theme]);

  // Build Racks & Bins Meshes into Scene
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clear old racks and bins
    meshesRef.current.forEach(({ mesh }) => {
      scene.remove(mesh);
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    });
    meshesRef.current = [];

    // Remove rack structure lines
    const toRemove: THREE.Object3D[] = [];
    scene.traverse((obj) => {
      if (obj.name === 'rack-structure' || obj.name === 'zone-label') toRemove.push(obj);
    });
    toRemove.forEach((obj) => scene.remove(obj));

    // Steel material for rack posts
    const steelMat = new THREE.MeshStandardMaterial({
      color: theme === 'dark' ? 0x475569 : 0x64748b,
      metalness: 0.85,
      roughness: 0.3,
    });

    const shelfMat = new THREE.MeshStandardMaterial({
      color: theme === 'dark' ? 0x334155 : 0x94a3b8,
      metalness: 0.7,
      roughness: 0.4,
    });

    layout.racks.forEach((rack) => {
      const rackGroup = new THREE.Group();
      rackGroup.name = 'rack-structure';

      // 4 Vertical Steel Columns
      const postRadius = 0.08;
      const postGeo = new THREE.CylinderGeometry(postRadius, postRadius, rack.height);
      const halfW = rack.width / 2;
      const halfD = rack.depth / 2;
      const halfH = rack.height / 2;

      const postPositions = [
        [-halfW, halfH, -halfD],
        [halfW, halfH, -halfD],
        [-halfW, halfH, halfD],
        [halfW, halfH, halfD],
      ];

      postPositions.forEach(([px, py, pz]) => {
        const post = new THREE.Mesh(postGeo, steelMat);
        post.position.set(px, py, pz);
        post.castShadow = true;
        rackGroup.add(post);
      });

      // 3 Horizontal Shelves
      for (let lvl = 0; lvl < 3; lvl++) {
        const shelfGeo = new THREE.BoxGeometry(rack.width, 0.06, rack.depth);
        const shelf = new THREE.Mesh(shelfGeo, shelfMat);
        shelf.position.set(0, 0.45 + lvl * 1.3, 0);
        shelf.receiveShadow = true;
        rackGroup.add(shelf);
      }

      rackGroup.position.set(rack.x, 0, rack.z);
      scene.add(rackGroup);

      // Create Bins for this rack
      rack.bins.forEach((binPos) => {
        // Filter check
        const isInactive = binPos.bin.isActive === false || binPos.bin.status === 'maintenance';
        const isFull = !isInactive && (binPos.bin.status === 'full' || binPos.utilizationPercent >= 90);
        const isAvail = !isInactive && !isFull;

        if (filterMode === 'available' && !isAvail) return;
        if (filterMode === 'full' && !isFull) return;
        if (filterMode === 'maintenance' && !isInactive) return;

        const boxGeo = new THREE.BoxGeometry(binPos.width, binPos.height, binPos.depth);
        const boxMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(binPos.color),
          emissive: new THREE.Color(binPos.emissive),
          emissiveIntensity: 0.35,
          roughness: 0.3,
          metalness: 0.2,
        });

        const boxMesh = new THREE.Mesh(boxGeo, boxMat);
        boxMesh.position.set(binPos.x, binPos.y, binPos.z);
        boxMesh.castShadow = true;
        boxMesh.receiveShadow = true;

        (boxMesh as any).userData = { bin: binPos.bin, binPos };

        scene.add(boxMesh);
        meshesRef.current.push({ mesh: boxMesh, binPos });
      });
    });
  }, [layout, filterMode, theme]);

  // Handle View Mode Switching (3D Perspective vs 2D Orthographic)
  useEffect(() => {
    if (!controlsRef.current || !perspectiveCameraRef.current || !orthographicCameraRef.current) return;

    const controls = controlsRef.current;
    if (viewMode === '2d') {
      controls.object = orthographicCameraRef.current;
      controls.maxPolarAngle = 0; // Lock to top-down
      controls.enableRotate = false; // Pure 2D pan/zoom
      orthographicCameraRef.current.position.set(0, 30, 0);
      orthographicCameraRef.current.lookAt(0, 0, 0);
      controls.target.set(0, 0, 0);
    } else if (viewMode === '3d') {
      controls.object = perspectiveCameraRef.current;
      controls.maxPolarAngle = Math.PI / 2.1;
      controls.enableRotate = true; // 360 rotation
      perspectiveCameraRef.current.position.set(13, 9, 15);
      controls.target.set(0, 2.2, 0);
    }
    controls.update();
  }, [viewMode]);

  // Pointer Interaction (Raycasting Hover & Click)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const activeCamera = viewMode === '2d' ? orthographicCameraRef.current : perspectiveCameraRef.current;
      if (!activeCamera) return;

      raycaster.setFromCamera(mouse, activeCamera);
      const intersects = raycaster.intersectObjects(meshesRef.current.map((m) => m.mesh));

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const data = (hit as any).userData;
        if (data?.binPos) {
          container.style.cursor = 'pointer';
          setHoveredBin({
            binPos: data.binPos,
            mouseX: e.clientX,
            mouseY: e.clientY,
          });
          return;
        }
      }

      container.style.cursor = 'default';
      setHoveredBin(null);
    };

    const handleClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const activeCamera = viewMode === '2d' ? orthographicCameraRef.current : perspectiveCameraRef.current;
      if (!activeCamera) return;

      raycaster.setFromCamera(mouse, activeCamera);
      const intersects = raycaster.intersectObjects(meshesRef.current.map((m) => m.mesh));

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const data = (hit as any).userData;
        if (data?.bin) {
          const clickedBin: WarehouseBin = data.bin;

          // If currently in Move/Swap mode:
          if (isMoveMode) {
            if (!sourceMoveBin) {
              setSourceMoveBin(clickedBin);
            } else {
              if (sourceMoveBin.id === clickedBin.id) {
                setSourceMoveBin(null);
                return;
              }

              // Perform Swap
              const srcCode = sourceMoveBin.binCode || (sourceMoveBin as any).code;
              const tgtCode = clickedBin.binCode || (clickedBin as any).code;

              const srcCount = sourceMoveBin.currentItemsCount || 0;
              const tgtCount = clickedBin.currentItemsCount || 0;

              sourceMoveBin.currentItemsCount = tgtCount;
              clickedBin.currentItemsCount = srcCount;

              setMoveToast(`สลับตำแหน่งเรียบร้อยแล้ว: ${srcCode} ⇄ ${tgtCode}`);
              setSourceMoveBin(null);
              setIsMoveMode(false);
              setTimeout(() => setMoveToast(null), 3500);

              if (onRelocateStock) {
                onRelocateStock(sourceMoveBin.id, clickedBin.id, srcCount).catch(console.error);
              }
            }
          } else {
            setSelectedBin(clickedBin);
          }
        }
      }
    };

    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('click', handleClick);

    return () => {
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('click', handleClick);
    };
  }, [viewMode, isMoveMode, sourceMoveBin]);

  // Reset Camera Function
  const handleResetCamera = () => {
    if (!controlsRef.current) return;
    if (viewMode === '2d' && orthographicCameraRef.current) {
      orthographicCameraRef.current.position.set(0, 30, 0);
      controlsRef.current.target.set(0, 0, 0);
    } else if (perspectiveCameraRef.current) {
      perspectiveCameraRef.current.position.set(13, 9, 15);
      controlsRef.current.target.set(0, 2.2, 0);
    }
    controlsRef.current.update();
  };

  return (
    <div className="relative w-full h-[620px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 select-none shadow-2xl">
      {/* Move Mode Floating Instruction Banner */}
      {isMoveMode && (
        <div className="absolute top-20 inset-x-0 mx-auto w-fit max-w-xl z-30 px-4 py-2.5 rounded-2xl bg-amber-500/90 backdrop-blur-md text-slate-950 font-bold text-xs shadow-2xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 border border-amber-300">
          <span>
            {sourceMoveBin
              ? `📦 กล่องต้นทาง: [${sourceMoveBin.binCode}] ➜ คลิกกล่องเป้าหมายที่ต้องการสลับตำแหน่ง`
              : '⚡ คลิกเลือกกล่องแรกที่ต้องการย้ายหรือสลับตำแหน่ง'}
          </span>
          <button
            onClick={() => {
              setIsMoveMode(false);
              setSourceMoveBin(null);
            }}
            className="p-1 rounded-lg bg-slate-950/20 hover:bg-slate-950/30 text-slate-950 transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Move Success Toast */}
      {moveToast && (
        <div className="absolute top-20 inset-x-0 mx-auto w-fit max-w-md z-30 px-4 py-2.5 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 border border-emerald-400">
          <CheckCircle2 className="w-4 h-4" />
          <span>{moveToast}</span>
        </div>
      )}

      {/* Floating HUD Controls */}
      <WarehouseControlsHUD
        theme={theme}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        filterMode={filterMode}
        onFilterModeChange={setFilterMode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onResetCamera={handleResetCamera}
        isMoveMode={isMoveMode}
        onToggleMoveMode={() => {
          setIsMoveMode(!isMoveMode);
          setSourceMoveBin(null);
        }}
        stats={{
          total: layout.totalBins,
          available: layout.availableBins,
          full: layout.fullBins,
          maintenance: layout.maintenanceBins,
        }}
        warehouseName={layout.warehouseName}
      />

      {/* WebGL 3D Canvas Mount Point */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Hover Tooltip */}
      {hoveredBin && (
        <div
          className="fixed z-30 pointer-events-none px-3 py-2 rounded-xl backdrop-blur-md bg-slate-900/90 border border-slate-700 text-slate-100 shadow-xl text-xs space-y-1 transform -translate-x-1/2 -translate-y-full"
          style={{ left: hoveredBin.mouseX, top: hoveredBin.mouseY - 12 }}
        >
          <div className="font-bold font-mono text-blue-400 text-sm flex items-center justify-between gap-3">
            <span>{hoveredBin.binPos.bin.binCode}</span>
            <span
              className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                hoveredBin.binPos.utilizationPercent >= 90
                  ? 'bg-rose-500/20 text-rose-300'
                  : 'bg-emerald-500/20 text-emerald-300'
              }`}
            >
              {hoveredBin.binPos.utilizationPercent}% เต็ม
            </span>
          </div>
          <div className="text-slate-400 text-[11px]">
            {hoveredBin.binPos.bin.zone} • {hoveredBin.binPos.bin.rack} • {hoveredBin.binPos.bin.shelf}
          </div>
          <div className="text-slate-300 text-[11px] pt-0.5 border-t border-slate-800">
            จัดเก็บ: <b>{hoveredBin.binPos.bin.currentItemsCount || 0} ชิ้น</b> ({hoveredBin.binPos.bin.capacityKg || 500} kg)
          </div>
        </div>
      )}

      {/* Bin Detail Slide-Over Drawer */}
      <BinDetailDrawer
        bin={selectedBin}
        onClose={() => setSelectedBin(null)}
        theme={theme}
        onOpenEditBin={onOpenEditBin}
        onDeleteBin={onDeleteBin}
        allBins={binsList}
        onRelocateStock={onRelocateStock}
      />
    </div>
  );
};
