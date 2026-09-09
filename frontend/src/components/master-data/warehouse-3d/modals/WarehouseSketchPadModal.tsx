import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  X,
  Sparkles,
  PenTool,
  Square,
  Undo2,
  Redo2,
  RotateCcw,
  HelpCircle,
  Eraser,
  History,
  Save,
  Trash2,
  Clock,
} from 'lucide-react';

export interface SketchDraftItem {
  id: string;
  name: string;
  timestamp: number;
  dataUrl: string;
}

interface WarehouseSketchPadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateFromSketch: (imageBlob: Blob, dataUrl: string) => void;
  initialSketch?: string | null;
  onClearSavedSketch?: () => void;
}

type DrawTool = 'pen' | 'rect' | 'eraser';

export const WarehouseSketchPadModal: React.FC<WarehouseSketchPadModalProps> = ({
  isOpen,
  onClose,
  onGenerateFromSketch,
  initialSketch,
  onClearSavedSketch,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tool, setTool] = useState<DrawTool>('pen');
  const [color, setColor] = useState<string>('#38bdf8'); // Default blueprint cyan
  const [strokeWidth, setStrokeWidth] = useState<number>(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [snapshot, setSnapshot] = useState<ImageData | null>(null);

  // Undo / Redo History Stack
  const historyRef = useRef<ImageData[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Saved Drafts History (persists across sessions in localStorage)
  const [drafts, setDrafts] = useState<SketchDraftItem[]>(() => {
    try {
      const raw = localStorage.getItem('matchstock_sketch_drafts_history');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Helper to draw blueprint background and graph grid
  const drawBlueprintGrid = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = '#0b1329'; // Deep Navy Blueprint
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    const gridSize = 30;

    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

  }, []);

  // Redraw subtle blueprint grid lines in local erased area
  const redrawGridNear = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
    const gridSize = 30;
    const startX = Math.floor((x - radius) / gridSize) * gridSize;
    const endX = Math.ceil((x + radius) / gridSize) * gridSize;
    const startY = Math.floor((y - radius) / gridSize) * gridSize;
    const endY = Math.ceil((y + radius) / gridSize) * gridSize;

    ctx.save();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let gx = startX; gx <= endX; gx += gridSize) {
      ctx.beginPath();
      ctx.moveTo(gx, Math.max(0, y - radius));
      ctx.lineTo(gx, Math.min(ctx.canvas.height, y + radius));
      ctx.stroke();
    }
    for (let gy = startY; gy <= endY; gy += gridSize) {
      ctx.beginPath();
      ctx.moveTo(Math.max(0, x - radius), gy);
      ctx.lineTo(Math.min(ctx.canvas.width, x + radius), gy);
      ctx.stroke();
    }
    ctx.restore();
  }, []);

  // Initialize Canvas with 1:1 Pixel-Perfect Resolution & Load Existing Sketch Draft
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.round(rect.width) || 960;
      canvas.height = Math.round(rect.height) || 480;

      if (initialSketch) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const snap = ctx.getImageData(0, 0, canvas.width, canvas.height);
          historyRef.current = [snap];
          historyIndexRef.current = 0;
          setCanUndo(false);
          setCanRedo(false);
        };
        img.src = initialSketch;
      } else {
        drawBlueprintGrid(ctx, canvas.width, canvas.height);
        const initialSnap = ctx.getImageData(0, 0, canvas.width, canvas.height);
        historyRef.current = [initialSnap];
        historyIndexRef.current = 0;
        setCanUndo(false);
        setCanRedo(false);
      }
    }, 60);

    return () => clearTimeout(timer);
  }, [isOpen, initialSketch, drawBlueprintGrid]);

  // Undo Handler
  const handleUndo = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (historyIndexRef.current > 0) {
      historyIndexRef.current--;
      ctx.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
    }
  }, []);

  // Redo Handler
  const handleRedo = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++;
      ctx.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
    }
  }, []);

  // Keyboard Shortcuts: Esc to close, Ctrl+Z to Undo, Ctrl+Y to Redo
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleUndo, handleRedo]);

  if (!isOpen) return null;

  // Clear Canvas
  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawBlueprintGrid(ctx, canvas.width, canvas.height);

    if (onClearSavedSketch) {
      onClearSavedSketch();
    }

    // Add clear action to history
    const snap = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    newHistory.push(snap);
    historyRef.current = newHistory;
    historyIndexRef.current = newHistory.length - 1;
    setCanUndo(true);
    setCanRedo(false);
  };

  // Exact 1:1 Pixel Alignment Under Cursor (Zero Offset)
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && (e as React.TouchEvent).touches.length > 0) {
      clientX = (e as React.TouchEvent).touches[0].clientX;
      clientY = (e as React.TouchEvent).touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: Math.round(clientX - rect.left),
      y: Math.round(clientY - rect.top),
    };
  };

  // Pointer Down
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCanvasCoords(e);

    setIsDrawing(true);
    setStartPos(coords);
    setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));

    if (tool === 'pen') {
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    } else if (tool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
      ctx.strokeStyle = '#0b1329';
      ctx.lineWidth = Math.max(18, strokeWidth * 5);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      redrawGridNear(ctx, coords.x, coords.y, strokeWidth * 4);
    }
  };

  // Pointer Move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCanvasCoords(e);

    if (tool === 'pen') {
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    } else if (tool === 'eraser') {
      ctx.lineTo(coords.x, coords.y);
      ctx.strokeStyle = '#0b1329';
      ctx.lineWidth = Math.max(18, strokeWidth * 5);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      redrawGridNear(ctx, coords.x, coords.y, strokeWidth * 4);
    } else if (tool === 'rect' && startPos && snapshot) {
      ctx.putImageData(snapshot, 0, 0);
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
      ctx.fillStyle = color + '22'; // 14% translucent fill
      const w = coords.x - startPos.x;
      const h = coords.y - startPos.y;
      ctx.strokeRect(startPos.x, startPos.y, w, h);
      ctx.fillRect(startPos.x, startPos.y, w, h);
    }
  };

  // Pointer Up: Commit stroke to history stack
  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setStartPos(null);
    setSnapshot(null);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Save stroke to undo history stack (max 30 steps)
    const snap = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    newHistory.push(snap);
    if (newHistory.length > 30) newHistory.shift();

    historyRef.current = newHistory;
    historyIndexRef.current = newHistory.length - 1;
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(false);
  };

  // Save Current Drawing as a Draft in History
  const handleSaveCurrentDraft = (customTitle?: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const newDraft: SketchDraftItem = {
      id: `draft-${Date.now()}`,
      name: customTitle || `แบบร่าง ${new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}`,
      timestamp: Date.now(),
      dataUrl,
    };
    const updated = [newDraft, ...drafts.filter((d) => d.dataUrl !== dataUrl).slice(0, 9)];
    setDrafts(updated);
    try {
      localStorage.setItem('matchstock_sketch_drafts_history', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save draft:', e);
    }
    return newDraft;
  };

  const handleLoadDraft = (draft: SketchDraftItem) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const snap = ctx.getImageData(0, 0, canvas.width, canvas.height);
      historyRef.current.push(snap);
      historyIndexRef.current = historyRef.current.length - 1;
      setCanUndo(true);
      setCanRedo(false);
    };
    img.src = draft.dataUrl;
    setIsHistoryOpen(false);
  };

  const handleDeleteDraft = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = drafts.filter((d) => d.id !== id);
    setDrafts(updated);
    try {
      localStorage.setItem('matchstock_sketch_drafts_history', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to update drafts:', e);
    }
  };

  // Generate 3D Trigger
  const handleGenerate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Automatically archive current sketch into history before generating!
    handleSaveCurrentDraft(`ผัง ${new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}`);

    const dataUrl = canvas.toDataURL('image/png');
    canvas.toBlob((blob) => {
      if (!blob) return;
      onGenerateFromSketch(blob, dataUrl);
      onClose();
    }, 'image/png');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl max-w-5xl w-full h-[92vh] max-h-[860px] p-4 sm:p-5 shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Header (Sticky, always visible) */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>กระดานวาดผังคลังสินค้า (AI Sketch Pad)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-900/60 text-cyan-300 border border-cyan-600/40">
                  Sketch to 3D
                </span>
              </h3>
              <p className="text-xs text-slate-400 hidden sm:block">
                ใช้ปากกาวาดโครงสร้าง หรือเขียนลายมือ Zone A, WC, Office แล้วกดให้ AI เสกเป็นคลัง 3D
              </p>
            </div>
          </div>

          {/* Close Button - Always visible with Esc hint */}
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/50 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            title="ปิดหน้าต่าง (กด Esc ได้)"
          >
            <X className="w-4 h-4 text-rose-400" />
            <span>ปิด (Esc)</span>
          </button>
        </div>

        {/* Toolbar (Sticky, always visible) */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800 my-2 flex-shrink-0">
          {/* Drawing Tools & Undo/Redo */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setTool('pen')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                tool === 'pen' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800'
              }`}
              title="ปากกาวาดอิสระ / เส้นโค้ง / เขียนตัวหนังสือลายมือ"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>ปากกาวาด & เขียน</span>
            </button>

            <button
              onClick={() => setTool('rect')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                tool === 'rect' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800'
              }`}
              title="วาดกรอบสี่เหลี่ยม (แร็ค/ห้อง)"
            >
              <Square className="w-3.5 h-3.5" />
              <span>กล่องสี่เหลี่ยม</span>
            </button>

            {/* Eraser Tool */}
            <button
              onClick={() => setTool('eraser')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                tool === 'eraser' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800'
              }`}
              title="ยางลบ (ลากผ่านเส้นเพื่อลบเฉพาะจุด)"
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>ยางลบ</span>
            </button>

            <div className="w-[1px] h-5 bg-slate-800 mx-1" />

            {/* Save Draft Button */}
            <button
              onClick={() => handleSaveCurrentDraft()}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title="บันทึกแบบร่างนี้เก็บเข้าประวัติทันที"
            >
              <Save className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">เซฟแบบร่าง</span>
            </button>

            {/* History of Saved Drafts */}
            <div className="relative">
              <button
                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  isHistoryOpen
                    ? 'bg-purple-950/70 border-purple-500/80 text-purple-200 ring-1 ring-purple-500/40'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
                title="เปิดดูประวัติภาพผังที่เคยวาดไว้"
              >
                <History className="w-3.5 h-3.5 text-purple-400" />
                <span>ประวัติ ({drafts.length})</span>
              </button>

              {/* History Dropdown Popover */}
              {isHistoryOpen && (
                <div className="absolute top-full mt-2 left-0 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-3 z-50 space-y-2 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-purple-400" />
                      ประวัติภาพร่าง ({drafts.length})
                    </span>
                    <button
                      onClick={() => setIsHistoryOpen(false)}
                      className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>

                  {drafts.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 text-xs">
                      ยังไม่มีประวัติแบบร่างที่บันทึกไว้
                    </div>
                  ) : (
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                      {drafts.map((d) => (
                        <div
                          key={d.id}
                          onClick={() => handleLoadDraft(d)}
                          className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-purple-500/50 cursor-pointer transition group"
                        >
                          <img
                            src={d.dataUrl}
                            alt={d.name}
                            className="w-12 h-9 object-cover rounded-lg border border-slate-700 shrink-0 bg-[#0b1329]"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-slate-200 truncate group-hover:text-purple-300">
                              {d.name}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {new Date(d.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} • {new Date(d.timestamp).toLocaleDateString('th-TH')}
                            </div>
                          </div>
                          <button
                            onClick={(e) => handleDeleteDraft(d.id, e)}
                            className="p-1.5 rounded-lg hover:bg-rose-950/60 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition shrink-0"
                            title="ลบแบบร่างนี้"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="w-[1px] h-5 bg-slate-800 mx-1" />

            {/* Undo Button */}
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                canUndo
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-500'
                  : 'text-slate-600 bg-slate-900/50 cursor-not-allowed border border-transparent'
              }`}
              title="ย้อนกลับการวาด (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>ย้อนกลับ (Undo)</span>
            </button>

            {/* Redo Button */}
            <button
              onClick={handleRedo}
              disabled={!canRedo}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                canRedo
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-500'
                  : 'text-slate-600 bg-slate-900/50 cursor-not-allowed border border-transparent'
              }`}
              title="ทำซ้ำ (Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
              <span>ทำซ้ำ</span>
            </button>
          </div>

          {/* Color & Size Controls */}
          <div className="flex items-center gap-3">
            {/* Palette */}
            <div className="flex items-center gap-1.5">
              {['#38bdf8', '#f59e0b', '#10b981', '#a855f7', '#ffffff'].map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-5 h-5 rounded-full border-2 transition cursor-pointer ${
                    color === c ? 'scale-110 border-white shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                  title={`เลือกสี ${c}`}
                />
              ))}
            </div>

            {/* Stroke Width */}
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <span>ขนาด:</span>
              {[2, 4, 8].map((w) => (
                <button
                  key={w}
                  onClick={() => setStrokeWidth(w)}
                  className={`px-2 py-0.5 rounded-lg border font-bold cursor-pointer ${
                    strokeWidth === w
                      ? 'bg-cyan-600 text-white border-cyan-400'
                      : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                >
                  {w}px
                </button>
              ))}
            </div>

            <button
              onClick={handleClear}
              className="px-2.5 py-1 rounded-xl hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition cursor-pointer flex items-center gap-1 text-xs border border-transparent hover:border-rose-900/50"
              title="ล้างหน้ากระดาษทั้งหมด"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ล้าง</span>
            </button>
          </div>
        </div>

        {/* Canvas Drawing Area (Flex-1, dynamically fills screen with zero overflow) */}
        <div className="flex-1 min-h-[280px] relative border-2 border-dashed border-cyan-500/40 rounded-2xl overflow-hidden shadow-inner bg-[#0b1329]">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleMouseDown as any}
            onTouchMove={handleMouseMove as any}
            onTouchEnd={handleMouseUp}
            className="cursor-crosshair block w-full h-full touch-none"
          />
        </div>

        {/* Footer (Sticky, always visible) */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 flex-shrink-0">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-cyan-400 hidden sm:block" />
            <span>
              💡 แนะนำ: เขียนตัวหนังสือเช่น &quot;Zone A&quot;, &quot;WC&quot;, &quot;Office&quot; และกด Undo (Ctrl+Z) ได้ตลอดเวลา
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleGenerate}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/30 active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>✨ AI วิเคราะห์ภาพวาด & เสกเป็นคลัง 3D</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
