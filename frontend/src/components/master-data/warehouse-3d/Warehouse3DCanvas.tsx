import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { WarehouseBin, ThemeMode } from '../../../types';
import { ViewMode3D, FilterMode3D, Bin3DPosition, WarehouseLayoutModel } from '../../../types/warehouse-3d';
import { calculateWarehouseLayout, createLayoutFromBlueprintResult, ensureBlueprintRackScale, ZoneCustomConfig } from '../../../utils/warehouse-layout.calculator';
import { generateStandardCadBlueprint } from '../../../utils/cad-blueprint.generator';
import { WarehouseControlsHUD } from './WarehouseControlsHUD';
import { BinDetailDrawer } from './BinDetailDrawer';
import { CheckCircle2, X, Sparkles, Loader2, AlertCircle, Save, Undo2, Bot, ArrowRight, Sliders, Layers, Package, Edit2, Plus, Trash2, Move, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { parseWarehouseBlueprintWithGemini, BlueprintAnalysisResult } from '../../../services/gemini.service';
import { FacilityRoom, CurvedPathway3D, NavigationRoute } from './core/types';
import { FacilityRoomBuilder } from './builders/facility-room.builder';
import { CurvePathBuilder } from './builders/curve-path.builder';
import { RackMeshBuilder } from './builders/rack-mesh.builder';
import { WarehouseNavEngine } from './pathfinding/warehouse-nav.engine';
import { WarehouseSketchPadModal } from './modals/WarehouseSketchPadModal';

interface Warehouse3DCanvasProps {
  theme: ThemeMode;
  binsList: WarehouseBin[];
  onOpenEditBin: (bin: WarehouseBin, isViewOnly?: boolean) => void;
  onDeleteBin: (bin: WarehouseBin) => void;
  viewMode: ViewMode3D;
  onViewModeChange: (mode: ViewMode3D) => void;
  onRelocateStock?: (sourceBinId: string, targetBinId: string, qty: number) => Promise<void>;
  onUpdateBinsList?: (bins: WarehouseBin[]) => void;
}

// Helper to generate crisp CanvasText textures for 3D Signboards and floor badges
function createTextBadgeTexture(
  title: string,
  subtitle: string,
  bgColor = '#1e293b',
  textColor = '#38bdf8'
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 140;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = bgColor;
    if (ctx.roundRect) {
      ctx.roundRect(6, 6, 500, 128, 18);
    } else {
      ctx.rect(6, 6, 500, 128);
    }
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#3b82f6';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px "Inter", "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, 256, 58);

    ctx.fillStyle = textColor;
    ctx.font = 'bold 22px "Inter", "Segoe UI", sans-serif';
    ctx.fillText(subtitle, 256, 102);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export const Warehouse3DCanvas: React.FC<Warehouse3DCanvasProps> = ({
  theme,
  binsList,
  onOpenEditBin,
  onDeleteBin,
  viewMode,
  onViewModeChange,
  onRelocateStock,
  onUpdateBinsList,
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

  // Step 2: Blueprint Image Overlay States (Persisted in localStorage across browser refreshes)
  const [blueprintImage, setBlueprintImage] = useState<string | null>(() => {
    return localStorage.getItem('matchstock_warehouse_blueprint_image') || null;
  });
  const [blueprintOpacity, setBlueprintOpacity] = useState(() => {
    const raw = localStorage.getItem('matchstock_warehouse_blueprint_opacity');
    return raw ? parseFloat(raw) : 0.55;
  });
  const [blueprintVisible, setBlueprintVisible] = useState(() => {
    const raw = localStorage.getItem('matchstock_warehouse_blueprint_visible');
    return raw !== null ? raw === 'true' : true;
  });
  const blueprintMeshRef = useRef<THREE.Mesh | null>(null);

  // Sync blueprint state updates to localStorage
  const handleUpdateBlueprintVisible = (visible: boolean) => {
    setBlueprintVisible(visible);
    localStorage.setItem('matchstock_warehouse_blueprint_visible', String(visible));
  };

  const handleUpdateBlueprintOpacity = (opacity: number) => {
    setBlueprintOpacity(opacity);
    localStorage.setItem('matchstock_warehouse_blueprint_opacity', String(opacity));
  };

  // AI Auto-Generate Blueprint States (Gemini 3.5 Flash-Lite)
  const [isScanningBlueprint, setIsScanningBlueprint] = useState(false);
  const [aiScanStatus, setAiScanStatus] = useState<string | null>(null);
  const [generatedBins, setGeneratedBins] = useState<WarehouseBin[] | null>(null);
  const [aiLayout, setAiLayout] = useState<WarehouseLayoutModel | null>(null);
  const [savedLayout, setSavedLayout] = useState<WarehouseLayoutModel | null>(() => {
    try {
      const raw = localStorage.getItem('matchstock_custom_warehouse_layout');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const upgraded = ensureBlueprintRackScale(parsed);
      if (upgraded !== parsed) {
        localStorage.setItem('matchstock_custom_warehouse_layout', JSON.stringify(upgraded));
      }
      return upgraded;
    } catch {
      return null;
    }
  });

  // AI Interactive Setup Wizard States
  const [scannedResult, setScannedResult] = useState<BlueprintAnalysisResult | null>(null);
  const [isAiWizardOpen, setIsAiWizardOpen] = useState(false);
  const [wizardMode, setWizardMode] = useState<'global' | 'per_zone'>('global');
  const [wizardShelves, setWizardShelves] = useState<number>(3);
  const [wizardSlotsPerShelf, setWizardSlotsPerShelf] = useState<number>(4);
  const [wizardCapacityKg, setWizardCapacityKg] = useState<number>(500);
  const [zoneConfigs, setZoneConfigs] = useState<Record<string, ZoneCustomConfig>>({});

  // Solution 2: Zone Isolation Filter, Aisle Focus & X-Ray System
  const [selectedZone, setSelectedZone] = useState<string | 'all'>('all');
  const [selectedRack, setSelectedRack] = useState<string | 'all'>('all');
  const [isXRayMode, setIsXRayMode] = useState<boolean>(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveMode, setSaveMode] = useState<'overwrite' | 'merge'>('overwrite');

  // Interactive Rack Move Mode (Reposition racks over CAD blueprint)
  const [isMoveRackMode, setIsMoveRackMode] = useState<boolean>(false);
  const [selectedMoveRackId, setSelectedMoveRackId] = useState<string | null>(null);
  const [moveStepSize, setMoveStepSize] = useState<number>(0.5); // meters

  // Game-Style Click-to-Pick & Click-to-Drop Rack Repositioning
  const [pickedRackId, setPickedRackId] = useState<string | null>(null);
  const [pickedOriginalPos, setPickedOriginalPos] = useState<{ x: number; z: number } | null>(null);
  const pickedRackIdRef = useRef<string | null>(null);
  pickedRackIdRef.current = pickedRackId;
  const pickedOriginalPosRef = useRef<{ x: number; z: number } | null>(null);
  pickedOriginalPosRef.current = pickedOriginalPos;

  // AI Autonomous Navigation Route State
  const [activeNavRoute, setActiveNavRoute] = useState<NavigationRoute | null>(null);

  // Sketch Pad Drawing Modal State
  const [isSketchPadOpen, setIsSketchPadOpen] = useState(false);

  // Saved Sketch Drawing Draft (Persists between sessions & re-opens)
  const [savedSketchDataUrl, setSavedSketchDataUrl] = useState<string | null>(() => {
    return localStorage.getItem('matchstock_warehouse_sketch_pad_draft') || null;
  });

  const handleSelectZone = (zone: string | 'all') => {
    setSelectedZone(zone);
    setSelectedRack('all');
  };

  const handleAddCustomZone = () => {
    const keys = Object.keys(zoneConfigs);
    const nextCode = String.fromCharCode(65 + keys.length);
    const newZoneKey = `Zone ${nextCode}`;
    setZoneConfigs((prev) => ({
      ...prev,
      [newZoneKey]: {
        zoneName: `Zone ${nextCode}`,
        shelvesCount: 3,
        slotsPerShelf: 4,
        capacityKg: 500,
        heightMeters: 4.5,
      },
    }));
  };

  const handleDeleteCustomZone = (keyToDelete: string) => {
    if (Object.keys(zoneConfigs).length <= 1) return;
    setZoneConfigs((prev) => {
      const next = { ...prev };
      delete next[keyToDelete];
      return next;
    });
  };

  const handleConfirmSaveLayout = () => {
    if (!generatedBins || generatedBins.length === 0) return;

    let finalBins: WarehouseBin[] = [];
    if (saveMode === 'overwrite') {
      finalBins = generatedBins;
    } else {
      // Merge mode: preserve existing bins if same binCode
      const existingMap = new Map<string, WarehouseBin>();
      binsList.forEach((b) => existingMap.set(b.binCode, b));
      finalBins = [...binsList];
      generatedBins.forEach((b) => {
        if (!existingMap.has(b.binCode)) {
          finalBins.push(b);
        }
      });
    }

    localStorage.setItem('matchstock_custom_warehouse_bins', JSON.stringify(finalBins));
    if (aiLayout) {
      localStorage.setItem('matchstock_custom_warehouse_layout', JSON.stringify(aiLayout));
      setSavedLayout(aiLayout);
    }

    if (onUpdateBinsList) {
      onUpdateBinsList(finalBins);
    }

    if (blueprintImage) {
      try {
        localStorage.setItem('matchstock_warehouse_blueprint_image', blueprintImage);
      } catch (e) {
        console.warn('Failed to persist blueprint on save:', e);
      }
    }

    setIsSaveModalOpen(false);
    setAiLayout(null);
    setMoveToast(`🎉 บันทึกผังคลังสินค้า ${finalBins.length} Bins ลงระบบถาวรเรียบร้อยแล้ว!`);
    setTimeout(() => setMoveToast(null), 3000);
  };

  const handleRevertLayout = () => {
    setAiLayout(null);
    setGeneratedBins(null);
    setSelectedZone('all');
    setMoveToast('ยกเลิกผังจำลองและกลับไปใช้ผังเดิมเรียบร้อยแล้ว');
    setTimeout(() => setMoveToast(null), 2500);
  };

  const handleUploadBlueprint = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setBlueprintImage(result);
        try {
          localStorage.setItem('matchstock_warehouse_blueprint_image', result);
        } catch (err) {
          console.warn('Failed to cache uploaded blueprint:', err);
        }
        setBlueprintVisible(true);
        setMoveToast('อัปโหลดแปลนสำเร็จ! คุณสามารถกดปุ่ม [✨ AI สแกนสร้างผัง] เพื่อให้ Gemini ถอดผัง 3D อัตโนมัติได้ทันที');
        setTimeout(() => setMoveToast(null), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveBlueprint = () => {
    setBlueprintImage(null);
    setGeneratedBins(null);
    setAiLayout(null);
    setSavedLayout(null);
    localStorage.removeItem('matchstock_custom_warehouse_layout');
    localStorage.removeItem('matchstock_custom_warehouse_bins');
    localStorage.removeItem('matchstock_warehouse_blueprint_image');
    setMoveToast('รีเซ็ตผังกลับสู่ค่าเริ่มต้นเรียบร้อยแล้ว');
    setTimeout(() => setMoveToast(null), 2500);
  };

  // Quick load built-in sample blueprint
  const handleLoadSampleBlueprint = () => {
    setBlueprintImage('/sample-blueprint.jpg');
    localStorage.setItem('matchstock_warehouse_blueprint_image', '/sample-blueprint.jpg');
    setBlueprintVisible(true);
    setMoveToast('โหลดรูปแปลนตัวอย่างเรียบร้อย! คลิกปุ่ม [✨ AI สแกนสร้างผัง] เพื่อให้ Gemini 3.5 Flash-Lite วิเคราะห์ได้ทันที');
    setTimeout(() => setMoveToast(null), 3000);
  };

  // Trigger Gemini AI Blueprint Scanning
  const handleScanBlueprint = async (overrideImage?: string) => {
    const targetImage = overrideImage || blueprintImage;
    if (!targetImage) return;

    try {
      setIsScanningBlueprint(true);
      setAiScanStatus('🤖 กำลังส่งภาพแปลนไปยัง Google Gemini 3.5 Flash-Lite...');

      const result = await parseWarehouseBlueprintWithGemini(targetImage);
      setAiScanStatus(`✨ ถอดโครงสร้างสำเร็จ! ตรวจพบ ${result.racks.length} แถวชั้นวาง และ ${result.doors.length} ประตู`);

      // Initialize Dynamic Zone Configurations automatically from AI-detected zoneSpecs & racks
      const initialZoneConfigs: Record<string, ZoneCustomConfig> = {};
      const uniqueZones = Array.from(new Set(result.racks.map((r) => r.zone)));
      uniqueZones.forEach((z) => {
        const spec = result.zoneSpecs?.[z];
        const racksInZone = result.racks.filter((r) => r.zone === z);
        const detectedShelves = spec?.shelvesCount || racksInZone[0]?.shelvesCount || 3;
        const detectedSlots = spec?.slotsPerShelf || racksInZone[0]?.slotsPerShelf || 4;
        const detectedHeight = spec?.heightMeters || racksInZone[0]?.heightMeters || (detectedShelves * 1.35 + 0.5);
        const detectedCapacity = spec?.capacityKg || 500;

        initialZoneConfigs[z] = {
          zoneName: z,
          shelvesCount: detectedShelves,
          slotsPerShelf: detectedSlots,
          capacityKg: detectedCapacity,
          heightMeters: detectedHeight,
        };
      });
      setZoneConfigs(initialZoneConfigs);
      setWizardMode('per_zone'); // Default to Per-Zone so AI-detected parameters are immediately active

      // Transform rough hand-drawn sketch into an official, clean CAD architectural blueprint!
      try {
        const cadBlueprintDataUrl = generateStandardCadBlueprint(result);
        setBlueprintImage(cadBlueprintDataUrl);
        localStorage.setItem('matchstock_warehouse_blueprint_image', cadBlueprintDataUrl);
        setBlueprintVisible(true);
      } catch (cadErr) {
        console.warn('CAD blueprint generation error:', cadErr);
      }

      setScannedResult(result);
      setIsAiWizardOpen(true);
    } catch (err: any) {
      console.error('Gemini Blueprint Scan Error:', err);
      setMoveToast(`❌ การสแกนล้มเหลว: ${err?.message || 'โปรดตรวจสอบ API Key'}`);
      setTimeout(() => setMoveToast(null), 6000);
    } finally {
      setIsScanningBlueprint(false);
      setAiScanStatus(null);
    }
  };

  // Generate 3D from Hand-drawn Sketch
  const handleGenerateFromSketch = (_blob: Blob, dataUrl: string) => {
    setSavedSketchDataUrl(dataUrl);
    try {
      localStorage.setItem('matchstock_warehouse_sketch_pad_draft', dataUrl);
    } catch (e) {
      console.warn('Failed to cache sketch in localStorage:', e);
    }
    setBlueprintImage(dataUrl);
    setBlueprintVisible(true);
    setMoveToast('🎨 รับภาพวาดผังเรียบร้อย! AI กำลังถอดลายเส้นเพื่อเสกเป็นคลัง 3D...');
    handleScanBlueprint(dataUrl);
  };

  const handleClearSavedSketch = () => {
    setSavedSketchDataUrl(null);
    localStorage.removeItem('matchstock_warehouse_sketch_pad_draft');
  };

  // Confirm AI Setup Wizard & Generate 3D Model
  const handleApplyAiWizard = () => {
    if (!scannedResult) return;

    const baseLayout = calculateWarehouseLayout(binsList);
    const overrides =
      wizardMode === 'per_zone'
        ? { zones: zoneConfigs }
        : {
            shelvesCount: wizardShelves,
            slotsPerShelf: wizardSlotsPerShelf,
            capacityKg: wizardCapacityKg,
            heightMeters: wizardShelves * 1.35 + 0.5,
          };

    const customLayout = ensureBlueprintRackScale(
      createLayoutFromBlueprintResult(scannedResult, baseLayout.bounds, overrides)
    );

    setAiLayout(customLayout);

    const allBins: WarehouseBin[] = [];
    customLayout.racks.forEach((r) => r.bins.forEach((b) => allBins.push(b.bin)));
    setGeneratedBins(allBins);

    setIsAiWizardOpen(false);
    setMoveToast(
      `🎉 AI สร้างผังจำลอง 3D ${customLayout.racks.length} แถว (${customLayout.totalBins} Bins) ตามสเปคที่เลือกเรียบร้อย!`
    );
    setTimeout(() => setMoveToast(null), 6000);
  };

  // Layout calculation (switches directly to AI layout or saved custom layout with 1:1 blueprint coordinates)
  const layout = useMemo(() => {
    if (aiLayout) return aiLayout;
    if (savedLayout) return savedLayout;
    return calculateWarehouseLayout(binsList);
  }, [aiLayout, savedLayout, binsList]);

  // Interior Facility Rooms (Restrooms, Offices, Utility Rooms)
  const sampleFacilityRooms = useMemo<FacilityRoom[]>(() => {
    const b = layout.bounds;
    return [
      {
        id: 'room-toilet',
        name: 'ห้องสุขาชาย-หญิง & ห้องน้ำพนักงาน',
        label: 'ห้องน้ำ (Restroom)',
        type: 'restroom',
        x: b.minX + 4.2,
        z: b.maxZ - 4.2,
        width: 5.5,
        depth: 4.2,
        height: 3.0,
      },
      {
        id: 'room-office',
        name: 'ห้องควบคุมระบบ & หัวหน้าคลัง',
        label: 'ห้องควบคุม (Control Room)',
        type: 'office',
        x: b.minX + 4.2,
        z: b.maxZ - 10.2,
        width: 5.5,
        depth: 4.8,
        height: 3.0,
      },
    ];
  }, [layout.bounds]);

  // 3D Curved Pathways (Forklift Turning Lanes with Safety markings)
  const sampleCurvedPathways = useMemo<CurvedPathway3D[]>(() => {
    const b = layout.bounds;
    const frontLaneZ = b.minZ + 0.18 * b.depth;
    return [
      {
        id: 'curve-main-entrance',
        name: 'เลนเลี้ยวรถ Forklift หน้าคลัง',
        type: 'forklift_lane',
        width: 2.6,
        points: [
          new THREE.Vector3(b.minX + 3.5, 0, b.minZ),
          new THREE.Vector3(b.minX + 5.5, 0, frontLaneZ - 1.2),
          new THREE.Vector3(b.minX + 9.5, 0, frontLaneZ),
          new THREE.Vector3(b.centerX, 0, frontLaneZ),
          new THREE.Vector3(b.maxX - 8.5, 0, frontLaneZ),
          new THREE.Vector3(b.maxX - 4.0, 0, frontLaneZ + 4.5),
        ],
      },
    ];
  }, [layout.bounds]);

  // Available zones for Isolate Zone View
  const availableZones = useMemo(() => {
    return Array.from(new Set(layout.racks.map((r) => r.zone))).sort();
  }, [layout]);

  // Available racks in the selected zone for Aisle Focus
  const availableRacksInZone = useMemo(() => {
    if (selectedZone === 'all') return [];
    return Array.from(new Set(layout.racks.filter((r) => r.zone === selectedZone).map((r) => r.rack))).sort();
  }, [layout, selectedZone]);

  // Selected rack currently being adjusted in Interactive Move Mode
  const selectedMovingRack = useMemo(() => {
    if (!selectedMoveRackId) return null;
    return layout.racks.find((r) => r.id === selectedMoveRackId) || null;
  }, [layout, selectedMoveRackId]);

  // Handler for nudging rack positions in Interactive Move Mode
  const handleUpdateLayoutRacks = (updater: (prevRacks: typeof layout.racks) => typeof layout.racks) => {
    if (aiLayout) {
      setAiLayout((prev) => (prev ? { ...prev, racks: updater(prev.racks) } : null));
    } else if (savedLayout) {
      setSavedLayout((prev) => (prev ? { ...prev, racks: updater(prev.racks) } : null));
    } else {
      const updated = { ...layout, racks: updater(layout.racks) };
      setSavedLayout(updated);
    }
  };

  const handleNudgeRack = (dx: number, dz: number) => {
    if (!selectedMoveRackId) return;
    handleUpdateLayoutRacks((racks) =>
      racks.map((r) => {
        if (r.id !== selectedMoveRackId) return r;
        const newX = Math.round((r.x + dx) * 100) / 100;
        const newZ = Math.round((r.z + dz) * 100) / 100;
        const updatedBins = r.bins.map((b) => ({
          ...b,
          x: Math.round((b.x + dx) * 100) / 100,
          z: Math.round((b.z + dz) * 100) / 100,
        }));
        return {
          ...r,
          x: newX,
          z: newZ,
          isCustomMoved: true,
          bins: updatedBins,
        };
      })
    );
  };

  const handleSaveMovedRack = () => {
    try {
      localStorage.setItem('matchstock_custom_warehouse_layout', JSON.stringify(layout));
      setSavedLayout(layout);
      setMoveToast('💾 บันทึกตำแหน่งแร็คใหม่ลงระบบเรียบร้อยแล้ว!');
      setTimeout(() => setMoveToast(null), 3500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetMovedRack = () => {
    if (!selectedMoveRackId) return;
    handleUpdateLayoutRacks((racks) =>
      racks.map((r) => {
        if (r.id !== selectedMoveRackId) return r;
        const targetX = r.originalX !== undefined ? r.originalX : r.x;
        const targetZ = r.originalZ !== undefined ? r.originalZ : r.z;
        const dx = targetX - r.x;
        const dz = targetZ - r.z;
        const updatedBins = r.bins.map((b) => ({
          ...b,
          x: Math.round((b.x + dx) * 100) / 100,
          z: Math.round((b.z + dz) * 100) / 100,
        }));
        return {
          ...r,
          x: targetX,
          z: targetZ,
          isCustomMoved: false,
          bins: updatedBins,
        };
      })
    );
    setMoveToast('↩️ คืนค่าตำแหน่งแร็คสู่ค่าเริ่มต้นตามแปลนแล้ว!');
    setTimeout(() => setMoveToast(null), 3000);
  };

  // Cancel Picked Rack & Restore to origin position
  const handleCancelPickRack = () => {
    const currentPickedId = pickedRackIdRef.current;
    const origPos = pickedOriginalPosRef.current;
    if (currentPickedId && origPos) {
      const group = rackGroupsRef.current[currentPickedId];
      if (group) {
        group.position.set(origPos.x, 0, origPos.z);
      }
    }
    setPickedRackId(null);
    setPickedOriginalPos(null);
    currentFloatingPosRef.current = null;
    if (controlsRef.current) {
      controlsRef.current.enabled = true;
    }
    setMoveToast('↩️ ยกเลิกการเคลื่อนย้าย แร็คกลับสู่ตำแหน่งเดิมเรียบร้อย');
    setTimeout(() => setMoveToast(null), 2500);
  };

  // Listen for Escape key to cancel pick
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && pickedRackIdRef.current) {
        handleCancelPickRack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const perspectiveCameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const orthographicCameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshesRef = useRef<{ mesh: THREE.Mesh; binPos: Bin3DPosition }[]>([]);
  const rackGroupsRef = useRef<Record<string, THREE.Group>>({});
  const currentFloatingPosRef = useRef<{ x: number; z: number } | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Synchronized refs to avoid stale closures in animation loop
  const viewModeRef = useRef<ViewMode3D>(viewMode);
  viewModeRef.current = viewMode;

  const searchQueryRef = useRef(searchQuery);
  searchQueryRef.current = searchQuery;

  const sourceMoveBinRef = useRef(sourceMoveBin);
  sourceMoveBinRef.current = sourceMoveBin;

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
    const b = layout.bounds;
    const maxDim = Math.max(b.width, b.depth);
    const initDist = maxDim * 0.95;
    const initElevation = Math.max(16, maxDim * 0.48);
    // Dynamic front-elevated perspective centered on warehouse width
    pCamera.position.set(b.centerX, initElevation, b.centerZ + initDist);
    pCamera.lookAt(b.centerX, 2.2, b.centerZ);
    perspectiveCameraRef.current = pCamera;

    const orthoFrustum = Math.max(layout.bounds.width, layout.bounds.depth) * 0.65;
    const oCamera = new THREE.OrthographicCamera(
      -orthoFrustum * aspect,
      orthoFrustum * aspect,
      orthoFrustum,
      -orthoFrustum,
      0.1,
      1000
    );
    oCamera.position.set(layout.bounds.centerX, 36, layout.bounds.centerZ);
    oCamera.lookAt(layout.bounds.centerX, 0, layout.bounds.centerZ);
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
    if (viewMode === '2d') {
      controls.target.set(layout.bounds.centerX, 0, layout.bounds.centerZ);
      controls.maxPolarAngle = 0;
      controls.minPolarAngle = 0;
      controls.enableRotate = false;
    } else {
      controls.target.set(layout.bounds.centerX, 2.2, layout.bounds.centerZ);
      controls.maxPolarAngle = Math.PI / 2.1;
      controls.minPolarAngle = 0;
      controls.minDistance = 4;
      controls.maxDistance = 80;
      controls.enableRotate = true;
    }
    controlsRef.current = controls;

    // 5. Lighting (Soft, eye-friendly matte illumination)
    const ambientLight = new THREE.AmbientLight(0xffffff, theme === 'dark' ? 0.85 : 0.95);
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
    const floorSize = Math.max(layout.bounds.width, layout.bounds.depth) + 16;
    const floorGeo = new THREE.PlaneGeometry(floorSize, floorSize);
    const floorMat = new THREE.MeshStandardMaterial({
      color: theme === 'dark' ? 0x070b12 : 0xf1f5f9,
      roughness: 0.95,
      metalness: 0.05,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(layout.bounds.centerX, -0.06, layout.bounds.centerZ);
    floor.receiveShadow = true;
    scene.add(floor);

    const gridHelper = new THREE.GridHelper(
      floorSize,
      Math.round(floorSize / 2),
      theme === 'dark' ? 0x1e293b : 0x94a3b8,
      theme === 'dark' ? 0x0f172a : 0xe2e8f0
    );
    gridHelper.position.set(layout.bounds.centerX, -0.04, layout.bounds.centerZ);
    scene.add(gridHelper);

    // 7. Render Animation Loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      if (controlsRef.current) {
        controlsRef.current.update();
      }

      // Pulsing effect for search pinpoint matches or selected move source
      const time = Date.now() * 0.005;
      const currentSearch = searchQueryRef.current.trim().toLowerCase();
      const currentMoveBin = sourceMoveBinRef.current;

      meshesRef.current.forEach(({ mesh, binPos }) => {
        const isSearchMatched = Boolean(currentSearch && binPos.bin.binCode?.toLowerCase().includes(currentSearch));
        const isMoveSource = Boolean(currentMoveBin && binPos.bin.id === currentMoveBin.id);

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

      const currentCamera = viewModeRef.current === '2d' ? orthographicCameraRef.current : perspectiveCameraRef.current;
      if (rendererRef.current && sceneRef.current && currentCamera) {
        rendererRef.current.render(sceneRef.current, currentCamera);
      }
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
    rackGroupsRef.current = {};

    // Remove old rack structures, zone labels, warehouse building, facility rooms, and curves
    const toRemove: THREE.Object3D[] = [];
    scene.traverse((obj) => {
      if (
        obj.name === 'rack-structure' ||
        obj.name === 'zone-label' ||
        obj.name === 'warehouse-building' ||
        obj.name === 'all-racks-root' ||
        obj.name === 'facility-rooms-root' ||
        obj.name === 'curved-pathways-root' ||
        obj.name === 'ai-autonomous-route'
      ) {
        toRemove.push(obj);
      }
    });
    toRemove.forEach((obj) => scene.remove(obj));

    // ==========================================
    // BUILD REALISTIC WAREHOUSE BUILDING ENCLOSURE
    // ==========================================
    const b = layout.bounds;
    const buildingGroup = new THREE.Group();
    buildingGroup.name = 'warehouse-building';

    // 1. Polished Concrete Warehouse Floor Slab
    const slabGeo = new THREE.BoxGeometry(b.width, 0.2, b.depth);
    const slabMat = new THREE.MeshStandardMaterial({
      color: theme === 'dark' ? 0x0f172a : 0xe2e8f0,
      roughness: 0.82,
      metalness: 0.12,
    });
    const slabMesh = new THREE.Mesh(slabGeo, slabMat);
    slabMesh.position.set(b.centerX, -0.1, b.centerZ);
    slabMesh.receiveShadow = true;
    buildingGroup.add(slabMesh);

    // 2. Forklift Safety Marshalling Line (Yellow stripe dividing Staging & Racks)
    const laneMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const stagingLineZ = b.minZ + 7.5;
    const stagingLineGeo = new THREE.BoxGeometry(b.width - 2, 0.02, 0.14);
    const stagingLine = new THREE.Mesh(stagingLineGeo, laneMat);
    stagingLine.position.set(b.centerX, 0.01, stagingLineZ);
    buildingGroup.add(stagingLine);

    // Staging Floor Badge Label (Facing upright from camera view)
    const stagingSignGeo = new THREE.PlaneGeometry(6.5, 1.4);
    const stagingTexture = createTextBadgeTexture(
      'STAGING & RECEIVING AREA',
      'FORKLIFT MARSHALLING ZONE',
      '#0f172a',
      '#facc15'
    );
    const stagingMat = new THREE.MeshBasicMaterial({ map: stagingTexture, transparent: true, side: THREE.DoubleSide });
    const stagingSign = new THREE.Mesh(stagingSignGeo, stagingMat);
    stagingSign.rotation.x = -Math.PI / 2;
    stagingSign.rotation.z = Math.PI; // Correct orientation from camera view
    stagingSign.position.set(b.centerX, 0.02, b.minZ + 4.2);
    buildingGroup.add(stagingSign);

    // 3. Architectural Walls
    const wallHeight = 5.2;
    const wallThickness = 0.25;
    const wallMat = new THREE.MeshStandardMaterial({
      color: theme === 'dark' ? 0x1e293b : 0xcbd5e1,
      roughness: 0.75,
      metalness: 0.15,
    });

    // Back Wall (Full)
    const backWallGeo = new THREE.BoxGeometry(b.width, wallHeight, wallThickness);
    const backWall = new THREE.Mesh(backWallGeo, wallMat);
    backWall.position.set(b.centerX, wallHeight / 2, b.maxZ);
    backWall.castShadow = true;
    backWall.receiveShadow = true;
    buildingGroup.add(backWall);

    // Left Wall (Full)
    const leftWallGeo = new THREE.BoxGeometry(wallThickness, wallHeight, b.depth);
    const leftWall = new THREE.Mesh(leftWallGeo, wallMat);
    leftWall.position.set(b.minX, wallHeight / 2, b.centerZ);
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;
    buildingGroup.add(leftWall);

    // Right Wall (Full)
    const rightWallGeo = new THREE.BoxGeometry(wallThickness, wallHeight, b.depth);
    const rightWall = new THREE.Mesh(rightWallGeo, wallMat);
    rightWall.position.set(b.maxX, wallHeight / 2, b.centerZ);
    rightWall.castShadow = true;
    rightWall.receiveShadow = true;
    buildingGroup.add(rightWall);

    // Front Wall with Loading Dock Portals
    const docks = layout.docks || [];
    if (docks.length >= 2) {
      const d1 = docks[0];
      const d2 = docks[1];
      const frontZ = b.minZ;

      // Segment 1: from minX to d1
      const w1Width = d1.x - d1.width / 2 - b.minX;
      if (w1Width > 0) {
        const w1Geo = new THREE.BoxGeometry(w1Width, wallHeight, wallThickness);
        const w1 = new THREE.Mesh(w1Geo, wallMat);
        w1.position.set(b.minX + w1Width / 2, wallHeight / 2, frontZ);
        buildingGroup.add(w1);
      }

      // Segment 2: between d1 and d2
      const w2Width = d2.x - d2.width / 2 - (d1.x + d1.width / 2);
      if (w2Width > 0) {
        const w2Geo = new THREE.BoxGeometry(w2Width, wallHeight, wallThickness);
        const w2 = new THREE.Mesh(w2Geo, wallMat);
        w2.position.set(d1.x + d1.width / 2 + w2Width / 2, wallHeight / 2, frontZ);
        buildingGroup.add(w2);
      }

      // Segment 3: from d2 to maxX
      const w3Width = b.maxX - (d2.x + d2.width / 2);
      if (w3Width > 0) {
        const w3Geo = new THREE.BoxGeometry(w3Width, wallHeight, wallThickness);
        const w3 = new THREE.Mesh(w3Geo, wallMat);
        w3.position.set(d2.x + d2.width / 2 + w3Width / 2, wallHeight / 2, frontZ);
        buildingGroup.add(w3);
      }

      // Lintel wall sections & Roller Shutter doors for each dock
      docks.forEach((dock) => {
        const lintelHeight = wallHeight - dock.height;
        const lintelGeo = new THREE.BoxGeometry(dock.width, lintelHeight, wallThickness);
        const lintel = new THREE.Mesh(lintelGeo, wallMat);
        lintel.position.set(dock.x, dock.height + lintelHeight / 2, frontZ);
        buildingGroup.add(lintel);

        const shutterGroup = new THREE.Group();

        // Heavy steel portal frame (Left & Right posts)
        const frameMat = new THREE.MeshStandardMaterial({
          color: dock.type === 'inbound' ? 0x10b981 : 0xef4444,
          roughness: 0.35,
          metalness: 0.65,
        });
        const framePostGeo = new THREE.BoxGeometry(0.22, dock.height, 0.35);
        const leftPost = new THREE.Mesh(framePostGeo, frameMat);
        leftPost.position.set(dock.x - dock.width / 2 + 0.11, dock.height / 2, frontZ);
        shutterGroup.add(leftPost);

        const rightPost = new THREE.Mesh(framePostGeo, frameMat);
        rightPost.position.set(dock.x + dock.width / 2 - 0.11, dock.height / 2, frontZ);
        shutterGroup.add(rightPost);

        // Corrugated Metallic Door Curtain (semi-open to show vehicle entry)
        const doorCurtainH = dock.height * 0.72;
        const curtainGeo = new THREE.BoxGeometry(dock.width - 0.3, doorCurtainH, 0.08);
        const curtainMat = new THREE.MeshStandardMaterial({
          color: theme === 'dark' ? 0x475569 : 0x94a3b8,
          metalness: 0.8,
          roughness: 0.3,
        });
        const curtainMesh = new THREE.Mesh(curtainGeo, curtainMat);
        curtainMesh.position.set(dock.x, dock.height - doorCurtainH / 2, frontZ);
        shutterGroup.add(curtainMesh);

        // Top Canister Box
        const canisterGeo = new THREE.BoxGeometry(dock.width, 0.45, 0.45);
        const canisterMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.4 });
        const canisterMesh = new THREE.Mesh(canisterGeo, canisterMat);
        canisterMesh.position.set(dock.x, dock.height + 0.22, frontZ);
        shutterGroup.add(canisterMesh);

        // Canopy Signboard Badge - Exterior (Facing outward toward -Z, non-mirrored)
        const signGeo = new THREE.PlaneGeometry(3.6, 1.0);
        const signTextureOut = createTextBadgeTexture(
          dock.label,
          dock.type === 'inbound' ? '▲ GOODS RECEIVING BAY' : '▼ DISPATCH & SHIPPING BAY',
          dock.type === 'inbound' ? '#064e3b' : '#7f1d1d',
          dock.type === 'inbound' ? '#34d399' : '#f87171'
        );
        const signMatOut = new THREE.MeshBasicMaterial({ map: signTextureOut, side: THREE.FrontSide });
        const signMeshOut = new THREE.Mesh(signGeo, signMatOut);
        signMeshOut.position.set(dock.x, dock.height + 0.95, frontZ - 0.16);
        signMeshOut.rotation.y = Math.PI; // Face outwards, correct horizontal direction
        shutterGroup.add(signMeshOut);

        // Canopy Signboard Badge - Interior (Facing inward toward +Z, non-mirrored)
        const signTextureIn = createTextBadgeTexture(
          dock.label,
          dock.type === 'inbound' ? '▲ GOODS RECEIVING BAY' : '▼ DISPATCH & SHIPPING BAY',
          dock.type === 'inbound' ? '#064e3b' : '#7f1d1d',
          dock.type === 'inbound' ? '#34d399' : '#f87171'
        );
        const signMatIn = new THREE.MeshBasicMaterial({ map: signTextureIn, side: THREE.FrontSide });
        const signMeshIn = new THREE.Mesh(signGeo, signMatIn);
        signMeshIn.position.set(dock.x, dock.height + 0.95, frontZ + 0.16);
        signMeshIn.rotation.y = 0; // Face inwards, correct horizontal direction
        shutterGroup.add(signMeshIn);

        // Safety Hatch / Staging Floor Pad
        const dockBayGeo = new THREE.PlaneGeometry(dock.width, 3.2);
        const dockBayMat = new THREE.MeshBasicMaterial({
          color: dock.type === 'inbound' ? 0x059669 : 0xd97706,
          transparent: true,
          opacity: 0.22,
          side: THREE.DoubleSide,
        });
        const dockBayMesh = new THREE.Mesh(dockBayGeo, dockBayMat);
        dockBayMesh.rotation.x = -Math.PI / 2;
        dockBayMesh.position.set(dock.x, 0.01, frontZ + 1.8);
        shutterGroup.add(dockBayMesh);

        buildingGroup.add(shutterGroup);
      });
    }

    scene.add(buildingGroup);

    // 1. Build Racks & Bins using modular RackMeshBuilder (Matte materials, 60 FPS GPU Translation)
    const racksResult = RackMeshBuilder.buildRacks({
      racks: layout.racks,
      filterMode,
      selectedZone,
      selectedRack,
      isXRayMode,
      theme,
    });
    rackGroupsRef.current = racksResult.rackGroups;
    scene.add(racksResult.rootGroup);
    meshesRef.current = racksResult.binMeshes;

    // 2. Build Interior Facility Rooms (Restrooms, Offices, Control Rooms from layout.rooms)
    if (layout.rooms && layout.rooms.length > 0) {
      const roomsGroup = FacilityRoomBuilder.buildRooms(layout.rooms as FacilityRoom[], theme === 'dark');
      scene.add(roomsGroup);
    }

    // 3. Build AI Autonomous Route Visualizer (if user clicked a bin to navigate)
    if (activeNavRoute) {
      const routeGroup = CurvePathBuilder.buildNavigationRouteMesh(activeNavRoute.pathPoints);
      scene.add(routeGroup);
    }
  }, [layout, filterMode, theme, selectedZone, selectedRack, isXRayMode, isMoveRackMode, activeNavRoute]);

  // Step 2: Build & Update Blueprint Mesh on the Floor
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (blueprintMeshRef.current) {
      scene.remove(blueprintMeshRef.current);
      blueprintMeshRef.current.geometry.dispose();
      if (Array.isArray(blueprintMeshRef.current.material)) {
        blueprintMeshRef.current.material.forEach((m) => m.dispose());
      } else {
        blueprintMeshRef.current.material.dispose();
      }
      blueprintMeshRef.current = null;
    }

    if (!blueprintImage) return;

    const b = layout.bounds;
    const loader = new THREE.TextureLoader();
    loader.load(blueprintImage, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      const geo = new THREE.PlaneGeometry(b.width, b.depth);
      const mat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: blueprintVisible ? blueprintOpacity : 0,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.name = 'blueprint-overlay';
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(b.centerX, 0.008, b.centerZ);
      scene.add(mesh);
      blueprintMeshRef.current = mesh;
    });
  }, [blueprintImage, layout]);

  // Dynamic Opacity & Visibility updates for Blueprint Mesh
  useEffect(() => {
    if (blueprintMeshRef.current) {
      const mat = blueprintMeshRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = blueprintVisible ? blueprintOpacity : 0;
      mat.visible = blueprintVisible;
      mat.needsUpdate = true;
    }
  }, [blueprintOpacity, blueprintVisible]);

  // Handle View Mode Switching (3D Perspective vs 2D Orthographic)
  useEffect(() => {
    if (!rendererRef.current || !perspectiveCameraRef.current || !orthographicCameraRef.current) return;

    const b = layout.bounds;
    const isInitialSetup = !controlsRef.current;
    const prevTarget = controlsRef.current ? controlsRef.current.target.clone() : new THREE.Vector3(b.centerX, 2.2, b.centerZ);

    if (controlsRef.current) {
      controlsRef.current.dispose();
    }

    if (viewMode === '2d') {
      const oCamera = orthographicCameraRef.current;
      oCamera.position.set(b.centerX, 36, b.centerZ);
      oCamera.lookAt(b.centerX, 0, b.centerZ);

      const controls = new OrbitControls(oCamera, rendererRef.current.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.target.set(b.centerX, 0, b.centerZ);
      controls.maxPolarAngle = 0; // Lock to top-down
      controls.minPolarAngle = 0;
      controls.enableRotate = false; // Pure 2D pan/zoom
      controls.update();
      controlsRef.current = controls;
    } else if (viewMode === '3d') {
      const pCamera = perspectiveCameraRef.current;
      // Only set default angled position on first initialization; preserve current angle if user already moved!
      if (isInitialSetup || pCamera.position.lengthSq() < 1) {
        pCamera.position.set(b.centerX + 18, 14, b.centerZ + 22);
      }

      const controls = new OrbitControls(pCamera, rendererRef.current.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.target.copy(prevTarget);
      controls.maxPolarAngle = Math.PI / 2.1;
      controls.minPolarAngle = 0;
      controls.minDistance = 4;
      controls.maxDistance = 80;
      controls.enableRotate = true; // 360 rotation
      controls.update();
      controlsRef.current = controls;
    }
  }, [viewMode]);

  // Pointer Interaction (Raycasting Hover & Click)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const floorIntersectionPoint = new THREE.Vector3();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const activeCamera = viewMode === '2d' ? orthographicCameraRef.current : perspectiveCameraRef.current;
      if (!activeCamera) return;

      raycaster.setFromCamera(mouse, activeCamera);

      // GAME-STYLE: If in Move Rack Mode and a rack is currently picked/floating with cursor
      if (isMoveRackMode && pickedRackIdRef.current) {
        container.style.cursor = 'grabbing';
        if (raycaster.ray.intersectPlane(floorPlane, floorIntersectionPoint)) {
          const snap = moveStepSize || 0.5;
          const snappedX = Math.round(floorIntersectionPoint.x / snap) * snap;
          const snappedZ = Math.round(floorIntersectionPoint.z / snap) * snap;

          // Pure GPU Transform without React state update for 60 FPS smooth dragging!
          const group = rackGroupsRef.current[pickedRackIdRef.current];
          if (group) {
            group.position.set(snappedX, 0.2, snappedZ);
          }
          currentFloatingPosRef.current = { x: snappedX, z: snappedZ };
        }
        return;
      }

      const intersects = raycaster.intersectObjects(meshesRef.current.map((m) => m.mesh));

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const data = (hit as any).userData;
        if (data?.binPos) {
          container.style.cursor = isMoveRackMode ? 'grab' : 'pointer';
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

      // GAME-STYLE: If in Move Rack Mode
      if (isMoveRackMode) {
        // ACTION 2: If we are already holding/picking a rack, CLICK ANYWHERE ON FLOOR TO DROP!
        if (pickedRackIdRef.current) {
          const droppedId = pickedRackIdRef.current;
          const finalPos = currentFloatingPosRef.current;
          const group = rackGroupsRef.current[droppedId];
          if (group && finalPos) {
            group.position.set(finalPos.x, 0, finalPos.z);
          }
          if (finalPos) {
            handleUpdateLayoutRacks((racks) =>
              racks.map((r) => {
                if (r.id !== droppedId) return r;
                const dx = finalPos.x - r.x;
                const dz = finalPos.z - r.z;
                return {
                  ...r,
                  x: finalPos.x,
                  z: finalPos.z,
                  isCustomMoved: true,
                  bins: r.bins.map((b) => ({
                    ...b,
                    x: Math.round((b.x + dx) * 100) / 100,
                    z: Math.round((b.z + dz) * 100) / 100,
                  })),
                };
              })
            );
          }
          setPickedRackId(null);
          setPickedOriginalPos(null);
          currentFloatingPosRef.current = null;
          if (controlsRef.current) {
            controlsRef.current.enabled = true; // Re-enable orbit controls
          }
          const droppedRack = layout.racks.find((r) => r.id === droppedId);
          if (droppedRack && finalPos) {
            setMoveToast(`🎯 วางแร็ค ${droppedRack.zone} - ${droppedRack.rack} ที่พิกัด X: ${finalPos.x.toFixed(1)}m, Z: ${finalPos.z.toFixed(1)}m เรียบร้อย!`);
            setTimeout(() => setMoveToast(null), 3500);
          }
          return;
        }

        // ACTION 1: CLICK A RACK TO PICK UP!
        const intersects = raycaster.intersectObjects(meshesRef.current.map((m) => m.mesh));
        if (intersects.length > 0) {
          const hit = intersects[0].object as THREE.Mesh;
          const data = (hit as any).userData;
          if (data?.bin) {
            const clickedBin: WarehouseBin = data.bin;
            const parentRack = layout.racks.find((r) =>
              r.bins.some((b) => b.bin.id === clickedBin.id)
            );
            if (parentRack) {
              setSelectedMoveRackId(parentRack.id);
              setPickedRackId(parentRack.id);
              setPickedOriginalPos({ x: parentRack.x, z: parentRack.z });
              currentFloatingPosRef.current = { x: parentRack.x, z: parentRack.z };
              const group = rackGroupsRef.current[parentRack.id];
              if (group) {
                group.position.set(parentRack.x, 0.2, parentRack.z);
              }
              if (controlsRef.current) {
                controlsRef.current.enabled = false; // Disable orbit controls while rack is in hand!
              }
              setMoveToast(`🕹️ ยกแร็ค ${parentRack.zone} - ${parentRack.rack} ติดเคอร์เซอร์แล้ว! เลื่อนเมาส์แล้วคลิกเพื่อวาง (หรือกด Esc เพื่อยกเลิก)`);
              setTimeout(() => setMoveToast(null), 5000);
              return;
            }
          }
        }
        return;
      }

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
            if (data?.binPos) {
              const startDock = layout.docks?.[0] || { x: layout.bounds.centerX - 6, z: layout.bounds.minZ };
              const route = WarehouseNavEngine.calculateRouteToBin(
                { x: startDock.x, z: startDock.z },
                data.binPos,
                layout,
                sampleFacilityRooms
              );
              setActiveNavRoute(route);
            }
          }
        }
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (pickedRackIdRef.current) {
        e.preventDefault();
        handleCancelPickRack();
      }
    };

    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('click', handleClick);
    container.addEventListener('contextmenu', handleContextMenu);

    return () => {
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('click', handleClick);
      container.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [viewMode, isMoveMode, sourceMoveBin, isMoveRackMode, layout, moveStepSize, pickedRackId]);

  // Reset Camera Function (Dynamic Fit-to-Bounds Centering)
  const handleResetCamera = () => {
    if (!controlsRef.current) return;
    const b = layout.bounds;
    const maxDim = Math.max(b.width, b.depth);
    if (viewMode === '2d' && orthographicCameraRef.current) {
      const orthoHeight = Math.max(38, maxDim * 1.1);
      orthographicCameraRef.current.position.set(b.centerX, orthoHeight, b.centerZ);
      controlsRef.current.target.set(b.centerX, 0, b.centerZ);
    } else if (perspectiveCameraRef.current) {
      const distZ = maxDim * 0.95;
      const elevationY = Math.max(16, maxDim * 0.48);
      perspectiveCameraRef.current.position.set(b.centerX, elevationY, b.centerZ + distZ);
      controlsRef.current.target.set(b.centerX, 2.2, b.centerZ);
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

      {/* Move / Action Toast Notification: Relocated to bottom-right corner with ✕ dismiss so it NEVER blocks top HUD */}
      {moveToast && (
        <div
          onClick={() => setMoveToast(null)}
          className="absolute bottom-6 right-6 z-50 max-w-md px-4 py-3 rounded-2xl bg-slate-900/95 text-white font-semibold text-xs shadow-2xl flex items-center gap-3 border border-emerald-500/50 backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 cursor-pointer hover:bg-slate-800 transition ring-1 ring-emerald-500/30"
          title="คลิกเพื่อปิดการแจ้งเตือนทันที"
        >
          <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="flex-1 leading-snug text-slate-200">{moveToast}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMoveToast(null);
            }}
            className="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Game-Style Floating Banner when Rack is Picked and following Cursor */}
      {pickedRackId && selectedMovingRack && (
        <div className="absolute top-20 inset-x-0 mx-auto w-fit max-w-xl z-40 px-5 py-3 rounded-2xl bg-purple-950/95 backdrop-blur-xl text-white font-bold text-xs shadow-2xl flex items-center gap-3 border border-purple-400 ring-2 ring-purple-500/40 animate-in fade-in slide-in-from-top-4">
          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping shrink-0" />
          <div className="space-y-0.5">
            <div className="text-purple-200 font-extrabold flex items-center gap-2">
              <span>🕹️ กำลังยกแร็ค: {selectedMovingRack.zone} - {selectedMovingRack.rack}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                X: {selectedMovingRack.x.toFixed(1)}m | Z: {selectedMovingRack.z.toFixed(1)}m
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-normal">
              เลื่อนเมาส์ทาบแนวเส้นแปลน CAD แล้ว <b>คลิกบนพื้นเพื่อวาง</b> (หรือกด <b>Esc</b> เพื่อยกเลิก)
            </p>
          </div>
          <button
            onClick={handleCancelPickRack}
            className="ml-2 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] transition cursor-pointer border border-slate-700 shrink-0"
          >
            ยกเลิก (Esc)
          </button>
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
        blueprintImage={blueprintImage}
        onUploadBlueprint={handleUploadBlueprint}
        onRemoveBlueprint={handleRemoveBlueprint}
        blueprintVisible={blueprintVisible}
        onToggleBlueprintVisible={() => handleUpdateBlueprintVisible(!blueprintVisible)}
        blueprintOpacity={blueprintOpacity}
        onBlueprintOpacityChange={handleUpdateBlueprintOpacity}
        isScanningBlueprint={isScanningBlueprint}
        onScanBlueprint={handleScanBlueprint}
        onLoadSampleBlueprint={handleLoadSampleBlueprint}
        onOpenSketchPad={() => setIsSketchPadOpen(true)}
        selectedZone={selectedZone}
        onSelectZone={handleSelectZone}
        availableZones={availableZones}
        selectedRack={selectedRack}
        onSelectRack={setSelectedRack}
        availableRacksInZone={availableRacksInZone}
        isXRayMode={isXRayMode}
        onToggleXRayMode={() => setIsXRayMode((prev) => !prev)}
        isMoveRackMode={isMoveRackMode}
        onToggleMoveRackMode={() => {
          setIsMoveRackMode((prev) => {
            const next = !prev;
            if (next) {
              if (layout.racks.length > 0 && !selectedMoveRackId) {
                setSelectedMoveRackId(layout.racks[0].id);
              }
            } else {
              if (pickedRackIdRef.current) {
                handleCancelPickRack();
              }
              setSelectedMoveRackId(null);
            }
            return next;
          });
        }}
        hasAiLayout={!!aiLayout}
        onSaveLayout={() => setIsSaveModalOpen(true)}
        onRevertLayout={handleRevertLayout}
      />

      {/* AI Blueprint Scanning Overlay Radar Effect */}
      {isScanningBlueprint && (
        <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center gap-4 text-white animate-in fade-in duration-300">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-purple-500/30 border-t-purple-400 animate-spin" />
            <Sparkles className="w-8 h-8 text-amber-300 absolute inset-0 m-auto animate-pulse" />
          </div>
          <div className="text-center space-y-2 max-w-md px-6">
            <h4 className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-300 to-blue-400">
              Google Gemini 3.5 Flash-Lite
            </h4>
            <p className="text-xs text-slate-300 font-medium">
              {aiScanStatus || 'กำลังถอดลายเส้นกำแพง ประตู และแถวชั้นวางสินค้าจากภาพพิมพ์เขียว...'}
            </p>
            <span className="inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-purple-900/50 text-purple-300 border border-purple-700">
              ประหยัด Token สูงสุด • ความเร็วสูง
            </span>
          </div>
        </div>
      )}

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
        onClose={() => {
          setSelectedBin(null);
          setActiveNavRoute(null);
        }}
        theme={theme}
        onOpenEditBin={onOpenEditBin}
        onDeleteBin={onDeleteBin}
        allBins={binsList}
        onRelocateStock={onRelocateStock}
      />

      {/* Interactive Sketch Pad Modal (Draw warehouse & let AI generate 3D) */}
      <WarehouseSketchPadModal
        isOpen={isSketchPadOpen}
        onClose={() => setIsSketchPadOpen(false)}
        onGenerateFromSketch={handleGenerateFromSketch}
        initialSketch={savedSketchDataUrl}
        onClearSavedSketch={handleClearSavedSketch}
      />

      {/* Active AI Autonomous Navigation Route Banner */}
      {activeNavRoute && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-2xl bg-slate-950/90 border border-emerald-500/50 shadow-2xl backdrop-blur-md flex items-center gap-3 text-white text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-emerald-300 font-bold">🛣️ AI Autonomous Route:</span>
          <span>ระยะทาง <strong className="text-white">{activeNavRoute.totalDistanceMeters}m</strong></span>
          <span className="text-slate-500">•</span>
          <span>เวลาเดินทาง Forklift <strong className="text-emerald-300">~{activeNavRoute.estimatedTimeSeconds}s</strong></span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300">{activeNavRoute.targetLabel}</span>
          <button
            onClick={() => setActiveNavRoute(null)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition ml-1 cursor-pointer"
            title="ปิดเส้นทางนำทาง"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Save & Merge AI Layout Modal Dialog */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Save className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">บันทึกผังคลังสินค้าจากการสแกน AI</h3>
                  <p className="text-xs text-slate-400">เลือกรูปแบบการบันทึกผัง {generatedBins?.length || 0} ช่องเก็บ (Bins)</p>
                </div>
              </div>
              <button
                onClick={() => setIsSaveModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Option 1: Overwrite */}
              <label
                onClick={() => setSaveMode('overwrite')}
                className={`p-4 rounded-2xl border flex items-start gap-3 cursor-pointer transition ${
                  saveMode === 'overwrite'
                    ? 'bg-emerald-950/40 border-emerald-500/80 ring-1 ring-emerald-500/50'
                    : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800'
                }`}
              >
                <input
                  type="radio"
                  name="saveMode"
                  checked={saveMode === 'overwrite'}
                  onChange={() => setSaveMode('overwrite')}
                  className="mt-1 accent-emerald-500"
                />
                <div className="space-y-1">
                  <div className="font-bold text-xs text-slate-200 flex items-center gap-2">
                    <span>บันทึกผังใหม่ทับทั้งหมด (Overwrite)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold">แนะนำ</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    ล้างช่องเก็บเดิมของคลังนี้ แล้วสร้างช่องเก็บใหม่ <b>{generatedBins?.length || 0} Bins</b> ตามตำแหน่งแปลนพิมพ์เขียวใหม่อย่างสมบูรณ์ (รีเฟรชหน้าจอผังก็ยังคงอยู่ถาวร)
                  </p>
                </div>
              </label>

              {/* Option 2: Merge */}
              <label
                onClick={() => setSaveMode('merge')}
                className={`p-4 rounded-2xl border flex items-start gap-3 cursor-pointer transition ${
                  saveMode === 'merge'
                    ? 'bg-emerald-950/40 border-emerald-500/80 ring-1 ring-emerald-500/50'
                    : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800'
                }`}
              >
                <input
                  type="radio"
                  name="saveMode"
                  checked={saveMode === 'merge'}
                  onChange={() => setSaveMode('merge')}
                  className="mt-1 accent-emerald-500"
                />
                <div className="space-y-1">
                  <div className="font-bold text-xs text-slate-200">ผสานรวมกับของเดิม (Merge)</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    รักษาช่องเก็บเดิมที่มีสินค้าอยู่ และเพิ่มเฉพาะช่องเก็บใหม่ตามตำแหน่งแปลนที่ยังไม่มีในระบบ
                  </p>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsSaveModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmSaveLayout}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 active:scale-95"
              >
                <Save className="w-3.5 h-3.5" />
                <span>ยืนยันบันทึกผังนี้</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Interactive Setup Wizard Dialog */}
      {isAiWizardOpen && scannedResult && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 text-slate-100 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center font-bold shadow-lg shadow-purple-500/30">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">AI Warehouse Setup Wizard</h3>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      GEMINI 3.5
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    ตรวจพบ {scannedResult.racks.length} แถวชั้นวาง • {scannedResult.doors.length} ประตูขนถ่าย • {Object.keys(zoneConfigs).length} โซน
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAiWizardOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Switcher: Global vs Per-Zone */}
            <div className="p-1 rounded-2xl bg-slate-950 border border-slate-800 flex items-center shrink-0">
              <button
                type="button"
                onClick={() => setWizardMode('global')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  wizardMode === 'global'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>ใช้สเปคเดียวกันทั้งโกดัง (Quick Preset)</span>
              </button>
              <button
                type="button"
                onClick={() => setWizardMode('per_zone')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  wizardMode === 'per_zone'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>กำหนดแยกรายโซนอิสระ ({Object.keys(zoneConfigs).length} โซน)</span>
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4">
              {wizardMode === 'global' ? (
                <>
                  {/* Question 1: Shelves Levels */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 flex items-center justify-between mb-2">
                      <span>1. จำนวนระดับชั้นวางต่อแถว (Shelves Levels)</span>
                      <span className="text-[11px] text-purple-400 font-normal">ความสูง ~{(wizardShelves * 1.35 + 0.5).toFixed(1)} เมตร</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { count: 2, label: '2 ชั้น', desc: 'เตี้ย (~3.2m)' },
                        { count: 3, label: '3 ชั้น', desc: 'มาตรฐาน ★', isRecommended: true },
                        { count: 4, label: '4 ชั้น', desc: 'สูง (~5.9m)' },
                        { count: 5, label: '5 ชั้น', desc: 'High-Bay (~7.2m)' },
                      ].map((item) => (
                        <button
                          key={item.count}
                          type="button"
                          onClick={() => setWizardShelves(item.count)}
                          className={`p-2.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                            wizardShelves === item.count
                              ? 'bg-purple-600/30 border-purple-500 text-white ring-1 ring-purple-500 shadow-md'
                              : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <div className="font-bold text-xs flex items-center justify-between">
                            <span>{item.label}</span>
                            {item.isRecommended && <span className="text-[9px] text-amber-300">★</span>}
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1">{item.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Question 2: Slots per Shelf */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 flex items-center justify-between mb-2">
                      <span>2. จำนวนช่องเก็บสินค้า/พาเลทต่อชั้น (Slots per Level)</span>
                      <span className="text-[11px] text-purple-400 font-normal">
                        {wizardSlotsPerShelf * wizardShelves} ช่องต่อแถว
                      </span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {[
                        { count: 2, label: '2 ช่อง', desc: '~6.7m สั้น' },
                        { count: 4, label: '4 ช่อง', desc: '~13.4m สั้น' },
                        { count: 5, label: '5 ช่อง', desc: '~16.8m กลาง' },
                        { count: 6, label: '6 ช่อง', desc: '~20.2m ยาว ★', isRecommended: true },
                        { count: 8, label: '8 ช่อง', desc: '~26.9m ยาวพิเศษ' },
                      ].map((item) => (
                        <button
                          key={item.count}
                          type="button"
                          onClick={() => setWizardSlotsPerShelf(item.count)}
                          className={`p-2.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                            wizardSlotsPerShelf === item.count
                              ? 'bg-purple-600/30 border-purple-500 text-white ring-1 ring-purple-500 shadow-md'
                              : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <div className="font-bold text-xs flex items-center justify-between">
                            <span>{item.label}</span>
                            {item.isRecommended && <span className="text-[9px] text-amber-300">★</span>}
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1">{item.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Question 3: Max Load Capacity */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 mb-2 block">
                      3. ความจุรับน้ำหนักสูงสุดต่อช่อง (Max Load Capacity)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { kg: 250, label: '250 kg', desc: 'สินค้าเบา / กล่องเล็ก' },
                        { kg: 500, label: '500 kg', desc: 'มาตรฐาน 1 พาเลท ★', isRecommended: true },
                        { kg: 1000, label: '1,000 kg', desc: 'Heavy Duty พาเลทหนัก' },
                      ].map((item) => (
                        <button
                          key={item.kg}
                          type="button"
                          onClick={() => setWizardCapacityKg(item.kg)}
                          className={`p-2.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                            wizardCapacityKg === item.kg
                              ? 'bg-purple-600/30 border-purple-500 text-white ring-1 ring-purple-500 shadow-md'
                              : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <div className="font-bold text-xs flex items-center justify-between">
                            <span>{item.label}</span>
                            {item.isRecommended && <span className="text-[9px] text-amber-300">★</span>}
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1">{item.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                /* Per-Zone Configuration Cards */
                <div className="space-y-3">
                  {Object.entries(zoneConfigs).map(([rawZoneName, cfg]) => {
                    const zoneRacksCount = scannedResult.racks.filter((r) => r.zone === rawZoneName).length;
                    const zoneBinsCount = zoneRacksCount * (cfg.shelvesCount || 3) * (cfg.slotsPerShelf || 4);

                    return (
                      <div
                        key={rawZoneName}
                        className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-3 hover:border-purple-500/50 transition"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 flex-1">
                            <Package className="w-4 h-4 text-purple-400 shrink-0" />
                            <input
                              type="text"
                              value={cfg.zoneName || rawZoneName}
                              onChange={(e) => {
                                const newName = e.target.value;
                                setZoneConfigs((prev) => ({
                                  ...prev,
                                  [rawZoneName]: { ...prev[rawZoneName], zoneName: newName },
                                }));
                              }}
                              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-white outline-none focus:border-purple-500 w-48"
                              placeholder="ชื่อโซน..."
                            />
                            <span className="text-[11px] text-slate-400">({zoneRacksCount} แถว)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-lg">
                              {zoneBinsCount} Bins
                            </span>
                            {Object.keys(zoneConfigs).length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleDeleteCustomZone(rawZoneName)}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                                title="ลบโซนนี้"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* AI Detection Insight Note for this Zone */}
                        {scannedResult?.zoneSpecs?.[rawZoneName]?.notes && (
                          <div className="flex items-center gap-1.5 text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-xl w-fit font-medium">
                            <Sparkles className="w-3 h-3 text-amber-300 shrink-0 animate-pulse" />
                            <span>{scannedResult.zoneSpecs[rawZoneName].notes}</span>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                          {/* Shelves for this zone */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[10px] font-bold text-slate-400">ระดับชั้นวาง:</label>
                              <span className="text-[9px] font-semibold text-purple-300">✨ AI คำนวณแล้ว</span>
                            </div>
                            <select
                              value={cfg.shelvesCount || 3}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setZoneConfigs((prev) => ({
                                  ...prev,
                                  [rawZoneName]: { ...prev[rawZoneName], shelvesCount: val, heightMeters: val * 1.35 + 0.5 },
                                }));
                              }}
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none cursor-pointer"
                            >
                              <option value={2}>2 ชั้น (~3.2m)</option>
                              <option value={3}>3 ชั้น (~4.5m มาตรฐาน)</option>
                              <option value={4}>4 ชั้น (~5.9m)</option>
                              <option value={5}>5 ชั้น (~7.2m High-Bay)</option>
                            </select>
                          </div>

                          {/* Slots per shelf for this zone */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[10px] font-bold text-slate-400">ช่องต่อชั้น:</label>
                              <span className="text-[9px] font-semibold text-purple-300">✨ AI ตรวจนับแล้ว</span>
                            </div>
                            <select
                              value={cfg.slotsPerShelf || 4}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setZoneConfigs((prev) => ({
                                  ...prev,
                                  [rawZoneName]: { ...prev[rawZoneName], slotsPerShelf: val },
                                }));
                              }}
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none cursor-pointer"
                            >
                              <option value={2}>2 ช่อง (~6.7m สั้นพิเศษ)</option>
                              <option value={3}>3 ช่อง (~10.1m สั้น)</option>
                              <option value={4}>4 ช่อง (~13.4m - Zone C สั้น)</option>
                              <option value={5}>5 ช่อง (~16.8m - Zone B ปานกลาง)</option>
                              <option value={6}>6 ช่อง (~20.2m - Zone A ยาวเต็ม)</option>
                              <option value={8}>8 ช่อง (~26.9m ยาวพิเศษ)</option>
                            </select>
                          </div>

                          {/* Capacity for this zone */}
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 mb-1 block">รับน้ำหนัก/ช่อง:</label>
                            <select
                              value={cfg.capacityKg || 500}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setZoneConfigs((prev) => ({
                                  ...prev,
                                  [rawZoneName]: { ...prev[rawZoneName], capacityKg: val },
                                }));
                              }}
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none cursor-pointer"
                            >
                              <option value={250}>250 kg (สินค้าเบา)</option>
                              <option value={500}>500 kg (มาตรฐาน)</option>
                              <option value={1000}>1,000 kg (Heavy Duty)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add New Custom Zone Button */}
                  <button
                    type="button"
                    onClick={handleAddCustomZone}
                    className="w-full py-2.5 border-2 border-dashed border-purple-500/40 hover:border-purple-400 hover:bg-purple-500/10 rounded-2xl text-xs font-bold text-purple-300 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>เพิ่มโซนใหม่ (Add Custom Zone)</span>
                  </button>
                </div>
              )}

              {/* Live Preview Summary Calculation */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    จำนวนช่องเก็บทั้งหมดที่จะถูกสร้าง
                  </div>
                  <div className="text-base font-black text-emerald-400 mt-0.5">
                    {wizardMode === 'global'
                      ? scannedResult.racks.length * wizardShelves * wizardSlotsPerShelf
                      : Object.entries(zoneConfigs).reduce((sum, [z, c]) => {
                          const rCount = scannedResult.racks.filter((r) => r.zone === z).length;
                          return sum + rCount * (c.shelvesCount || 3) * (c.slotsPerShelf || 4);
                        }, 0)}{' '}
                    ช่องเก็บ (Bins)
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  <span>ตัวอย่างรหัส: </span>
                  <code className="px-1.5 py-0.5 rounded bg-slate-800 text-blue-300 font-mono text-[10px]">
                    {wizardMode === 'per_zone' && Object.values(zoneConfigs)[0]?.zoneName
                      ? `${Object.values(zoneConfigs)[0].zoneName}-01-A-01`
                      : 'ZoneA-A01-A-01'}
                  </code>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => setIsAiWizardOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleApplyAiWizard}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-black text-xs transition cursor-pointer shadow-lg shadow-purple-600/30 flex items-center gap-1.5 active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>สร้างผัง 3D ดิจิทัลทวินทันที</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
