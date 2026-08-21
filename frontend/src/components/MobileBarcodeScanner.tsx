import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  CameraOff,
  Scan,
  Barcode,
  Search,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  VolumeX,
  History,
  ArrowRight,
  PlusCircle,
  MinusCircle,
  ArrowLeftRight,
  Sliders,
  Sparkles,
  Package,
  Layers,
  MapPin,
  Tag,
  Copy,
  Trash2,
  RotateCcw,
  Check,
} from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Language, ThemeMode, ProductItem, ScanHistoryItem, TransactionType } from '../types';
import { getTranslation } from '../i18n';
import { productService } from '../services/product.service';

interface MobileBarcodeScannerProps {
  lang: Language;
  theme: ThemeMode;
  searchQuery?: string;
  onSelectAction?: (type: TransactionType, product: ProductItem) => void;
}

// Audio Feedback Generator using Web Audio API
const playBeep = (type: 'success' | 'error') => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.12); // A6
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.15);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(280, audioCtx.currentTime);
      osc.frequency.setValueAtTime(180, audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.25);
    }
  } catch (e) {
    console.warn('Web Audio API not supported or user gesture required', e);
  }
};

export const MobileBarcodeScanner: React.FC<MobileBarcodeScannerProps> = ({
  lang,
  theme,
  searchQuery = '',
  onSelectAction,
}) => {
  const t = getTranslation(lang);

  // States
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualBarcode, setManualBarcode] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [hapticEnabled, setHapticEnabled] = useState<boolean>(true);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [matchedProduct, setMatchedProduct] = useState<ProductItem | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [isLoadingProduct, setIsLoadingProduct] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');

  // Products Cache
  const [allProducts, setAllProducts] = useState<ProductItem[]>([]);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'reader-element';

  // Load products from API on mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await productService.getProducts({ limit: 100 });
        const list = res.data || res.items || (Array.isArray(res) ? res : []);
        const mapped: ProductItem[] = list.map((p: any) => ({
          id: p.id,
          code: p.code || p.sku || 'N/A',
          sku: p.sku || p.code || 'N/A',
          slug: p.slug || p.code?.toLowerCase() || '',
          name: p.name || 'Unnamed Product',
          category: p.category?.name || p.categoryName || 'General',
          brand: p.brand?.name || p.brandName || 'MatchStock',
          manufacturer: p.manufacturer || 'Standard Supplies',
          uom: p.baseUnit?.name || p.uom || 'Unit',
          weightKg: p.weightKg || 0,
          widthCm: p.widthCm || 0,
          lengthCm: p.lengthCm || 0,
          heightCm: p.heightCm || 0,
          price: p.price || 0,
          stockOnHand: p.stockOnHand ?? 120,
          reorderLevel: p.reorderPoint || p.reorderLevel || 20,
          maxLevel: p.maxLevel || 500,
          barcodeType: p.barcodeType || 'CODE128',
          barcodeValue: p.barcode || p.barcodeValue || p.sku || p.code,
          status: p.status || 'active',
          imageUrl: p.imageUrl || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=300&q=80',
          createdAt: p.createdAt || new Date().toISOString(),
        }));
        setAllProducts(mapped);
      } catch (err) {
        console.error('Failed to load products for scanner:', err);
      }
    };

    loadProducts();
  }, []);

  // Fetch available camera devices
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length) {
          setCameras(devices);
          // Prefer back/environment camera
          const backCam = devices.find((d) => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('rear') || d.label.toLowerCase().includes('environment'));
          setSelectedCameraId(backCam ? backCam.id : devices[0].id);
        }
      })
      .catch((err) => {
        console.warn('Could not enumerate camera devices:', err);
      });
  }, []);

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop().catch((e) => console.warn('Error stopping scanner:', e));
        }
        scannerRef.current.clear();
      }
    };
  }, []);

  // Process barcode scan
  const handleBarcodeDetected = (rawCode: string, scanType: 'BARCODE' | 'QR_CODE' | 'MANUAL' = 'BARCODE') => {
    const trimmed = rawCode.trim();
    if (!trimmed) return;

    setLastScannedCode(trimmed);
    setIsLoadingProduct(true);

    // Vibrate if supported
    if (hapticEnabled && navigator.vibrate) {
      navigator.vibrate(100);
    }

    // Match in product database
    const matched = allProducts.find(
      (p) =>
        p.barcodeValue?.toLowerCase() === trimmed.toLowerCase() ||
        p.sku?.toLowerCase() === trimmed.toLowerCase() ||
        p.code?.toLowerCase() === trimmed.toLowerCase()
    );

    if (matched) {
      if (soundEnabled) playBeep('success');
      setMatchedProduct(matched);
      setCameraError(null);

      // Add to session history
      const newHistoryItem: ScanHistoryItem = {
        id: `scan-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        barcode: trimmed,
        timestamp: new Date().toLocaleTimeString(lang === 'th' ? 'th-TH' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        product: matched,
        scanType,
        status: 'FOUND',
      };
      setScanHistory((prev) => [newHistoryItem, ...prev.slice(0, 49)]);
    } else {
      if (soundEnabled) playBeep('error');
      setMatchedProduct(null);
      setCameraError(
        lang === 'th'
          ? `ไม่พบรหัสสินค้า "${trimmed}" ในฐานข้อมูลระบบ`
          : `Item code "${trimmed}" not found in database`
      );

      // Add not-found history
      const newHistoryItem: ScanHistoryItem = {
        id: `scan-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        barcode: trimmed,
        timestamp: new Date().toLocaleTimeString(lang === 'th' ? 'th-TH' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        scanType,
        status: 'NOT_FOUND',
      };
      setScanHistory((prev) => [newHistoryItem, ...prev.slice(0, 49)]);
    }

    setIsLoadingProduct(false);
  };

  // Start Camera Scanning
  const startCameraScanner = async () => {
    setCameraError(null);
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(scannerContainerId, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
          ],
          verbose: false,
        });
      }

      const cameraIdOrConfig = selectedCameraId
        ? { deviceId: { exact: selectedCameraId } }
        : { facingMode: 'environment' };

      await scannerRef.current.start(
        cameraIdOrConfig,
        {
          fps: 15,
          qrbox: { width: 280, height: 180 },
          aspectRatio: 1.3333,
        },
        (decodedText, decodedResult) => {
          const type = decodedResult?.result?.format?.formatName?.includes('QR') ? 'QR_CODE' : 'BARCODE';
          handleBarcodeDetected(decodedText, type);
        },
        (errorMessage) => {
          // Ignored per frame frame scan miss
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      console.error('Camera start error:', err);
      setIsScanning(false);
      setCameraError(
        lang === 'th'
          ? 'ไม่สามารถเปิดกล้องได้ กรุณาตรวจสอบสิทธิ์การเข้าถึงกล้องบนเบราว์เซอร์ของคุณ'
          : 'Unable to start camera. Please verify camera permissions in your browser.'
      );
    }
  };

  // Stop Camera Scanning
  const stopCameraScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        console.warn('Error during camera stop:', err);
      }
    }
    setIsScanning(false);
  };

  // Toggle Camera
  const toggleCamera = () => {
    if (isScanning) {
      stopCameraScanner();
    } else {
      startCameraScanner();
    }
  };

  // Handle Manual Input Submit
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      handleBarcodeDetected(manualBarcode.trim(), 'MANUAL');
      setManualBarcode('');
    }
  };

  // Copy to clipboard helper
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Clear scan history
  const handleClearHistory = () => {
    setScanHistory([]);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div
        className={`p-6 rounded-2xl border transition-all ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
                <Barcode className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                  {t.scannerTitle}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                  {t.scannerSubtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Sound/Haptic Controls & Camera Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            {cameras.length > 1 && (
              <select
                value={selectedCameraId}
                onChange={(e) => {
                  setSelectedCameraId(e.target.value);
                  if (isScanning) {
                    stopCameraScanner().then(() => startCameraScanner());
                  }
                }}
                className={`text-xs px-3 py-2 rounded-xl border font-medium focus:ring-2 focus:ring-blue-500 transition ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-slate-200'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                {cameras.map((cam) => (
                  <option key={cam.id} value={cam.id}>
                    📷 {cam.label || `Camera ${cam.id.slice(0, 5)}`}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => setSoundEnabled((prev) => !prev)}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                soundEnabled
                  ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300'
                  : 'bg-slate-100 border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
              }`}
              title={soundEnabled ? 'Audio Feedback: ON' : 'Audio Feedback: OFF'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">{soundEnabled ? 'Beep ON' : 'Beep OFF'}</span>
            </button>

            <button
              onClick={toggleCamera}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-sm ${
                isScanning
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
              }`}
            >
              {isScanning ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
              <span>{isScanning ? 'ปิดกล้องสแกน' : 'เปิดกล้องสแกน (Start Scanner)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Scanner Viewport & Product Lookup Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Camera Box & Manual Input */}
        <div className="lg:col-span-5 space-y-6">
          {/* Scanner Viewport Card */}
          <div
            className={`p-6 rounded-2xl border transition-all ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isScanning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                  }`}
                />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {isScanning ? 'กำลังสแกนผ่านกล้อง...' : 'หน้าต่างสแกนเนอร์ (Camera Viewport)'}
                </h3>
              </div>
              {isScanning && (
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Live Stream Active
                </span>
              )}
            </div>

            {/* Html5Qrcode Mounting Point */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 min-h-[280px] flex items-center justify-center border border-slate-800">
              <div id={scannerContainerId} className="w-full h-full" />

              {!isScanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-900/90 backdrop-blur-xs">
                  <div className="w-16 h-16 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-3 border border-blue-500/30">
                    <Scan className="w-8 h-8 animate-pulse" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-200 mb-1">กล้องยังไม่ได้เปิดทำงาน</h4>
                  <p className="text-xs text-slate-400 max-w-xs leading-relaxed mb-4">
                    กดปุ่มเปิดกล้องเพื่อสแกน QR Code หรือ Barcode สากล (CODE128, EAN13, EAN8) ผ่านอุปกรณ์
                  </p>
                  <button
                    onClick={startCameraScanner}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 transition shadow-md shadow-blue-600/30"
                  >
                    <Camera className="w-4 h-4" />
                    เปิดกล้องทันที
                  </button>
                </div>
              )}

              {/* Scanning Target Overlay */}
              {isScanning && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
                  <div className="w-64 h-40 border-2 border-blue-400/70 rounded-xl relative shadow-lg shadow-blue-500/20">
                    {/* Laser scanning beam */}
                    <div className="w-full h-0.5 bg-rose-500 shadow-sm shadow-rose-400 absolute top-0 animate-bounce" />
                    {/* Corner Reticles */}
                    <span className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-blue-400" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-blue-400" />
                    <span className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-blue-400" />
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-blue-400" />
                  </div>
                  <p className="text-[11px] text-white/80 font-medium mt-3 bg-slate-900/80 px-3 py-1 rounded-full backdrop-blur-xs border border-white/10">
                    เล็งกล้องให้อยู่ในกรอบบาร์โค้ด
                  </p>
                </div>
              )}
            </div>

            {/* Camera Error Message */}
            {cameraError && (
              <div className="mt-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span className="leading-relaxed font-medium">{cameraError}</span>
              </div>
            )}

            {/* Manual Barcode / USB Scanner Input */}
            <form onSubmit={handleManualSubmit} className="mt-5 space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>หรือระบุรหัส Barcode / SKU / Serial ด้วยตนเอง:</span>
                <span className="text-[10px] text-slate-400 font-normal">รองรับปืนยิงบาร์โค้ด USB</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Barcode className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={manualBarcode}
                    onChange={(e) => setManualBarcode(e.target.value)}
                    placeholder="เช่น 8851234567890 หรือ SKU-901..."
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs font-mono font-medium focus:ring-2 focus:ring-blue-500 transition ${
                      theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500'
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!manualBarcode.trim()}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
                >
                  <Search className="w-4 h-4" />
                  <span>ค้นหา</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Scanned Product Details & Action Buttons */}
        <div className="lg:col-span-7 space-y-6">
          {/* Matched Product Card */}
          <div
            className={`p-6 rounded-2xl border transition-all ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  ข้อมูลสินค้าที่ตรวจพบ (Matched Product Details)
                </h3>
              </div>
              {lastScannedCode && (
                <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  Code: {lastScannedCode}
                </span>
              )}
            </div>

            {matchedProduct ? (
              <div className="mt-5 space-y-6">
                {/* Product Main Specs */}
                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 flex items-center justify-center p-2">
                    <img
                      src={matchedProduct.imageUrl}
                      alt={matchedProduct.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as any).src = 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=300&q=80';
                      }}
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {matchedProduct.category}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {matchedProduct.brand}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                          matchedProduct.stockOnHand > matchedProduct.reorderLevel
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                            : 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                        }`}
                      >
                        {matchedProduct.stockOnHand > matchedProduct.reorderLevel
                          ? 'สต็อกปกติ (In Stock)'
                          : 'สต็อกใกล้หมด (Low Stock)'}
                      </span>
                    </div>

                    <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50 leading-relaxed">
                      {matchedProduct.name}
                    </h2>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1">
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                        <p className="text-[10px] font-medium text-slate-500">รหัส SKU</p>
                        <p className="font-mono font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {matchedProduct.sku}
                        </p>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                        <p className="text-[10px] font-medium text-slate-500">บาร์โค้ด</p>
                        <p className="font-mono font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {matchedProduct.barcodeValue}
                        </p>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                        <p className="text-[10px] font-medium text-slate-500">หน่วยนับ (UOM)</p>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {matchedProduct.uom}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stock On Hand & Value Highlight Bento */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
                    <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400">คงเหลือในคลัง (On Hand)</p>
                    <p className="text-xl font-extrabold text-blue-900 dark:text-blue-100 mt-0.5">
                      {matchedProduct.stockOnHand.toLocaleString()}{' '}
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-300">
                        {matchedProduct.uom}
                      </span>
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">ราคาต่อหน่วย</p>
                    <p className="text-xl font-extrabold text-slate-900 dark:text-slate-50 mt-0.5">
                      ฿{matchedProduct.price.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
                    <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">มูลค่าสต็อกรวม</p>
                    <p className="text-xl font-extrabold text-emerald-900 dark:text-emerald-100 mt-0.5">
                      ฿{(matchedProduct.stockOnHand * matchedProduct.price).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Direct Action Routing Buttons */}
                <div className="pt-2">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    <span>เลือกทำรายการต่อสำหรับสินค้านี้ (Quick Actions):</span>
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <button
                      onClick={() => onSelectAction && onSelectAction('RECEIVE', matchedProduct)}
                      className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition shadow-sm"
                    >
                      <PlusCircle className="w-5 h-5" />
                      <span>1. รับเข้า (GR)</span>
                    </button>

                    <button
                      onClick={() => onSelectAction && onSelectAction('ISSUE', matchedProduct)}
                      className="p-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition shadow-sm"
                    >
                      <MinusCircle className="w-5 h-5" />
                      <span>2. เบิกจ่าย (GI)</span>
                    </button>

                    <button
                      onClick={() => onSelectAction && onSelectAction('TRANSFER', matchedProduct)}
                      className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition shadow-sm"
                    >
                      <ArrowLeftRight className="w-5 h-5" />
                      <span>3. โอนย้ายคลัง</span>
                    </button>

                    <button
                      onClick={() => onSelectAction && onSelectAction('ADJUSTMENT', matchedProduct)}
                      className="p-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition shadow-sm"
                    >
                      <Sliders className="w-5 h-5" />
                      <span>4. ปรับยอดสต็อก</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Empty / Standby State */
              <div className="py-12 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                  <Scan className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  พร้อมสำหรับการสแกน
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  สแกนบาร์โค้ดผ่านกล้อง หรือพิมพ์รหัสในช่องค้นหาด้านซ้ายเพื่อดูข้อมูลสินค้าและสต็อกคงเหลือ
                </p>
              </div>
            )}
          </div>

          {/* Session Scan History Table */}
          <div
            className={`p-6 rounded-2xl border transition-all ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-slate-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  ประวัติการสแกนรอบนี้ ({scanHistory.length} รายการ)
                </h3>
              </div>

              {scanHistory.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  ล้างประวัติ
                </button>
              )}
            </div>

            {scanHistory.length > 0 ? (
              <div className="overflow-x-auto max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead
                    className={`sticky top-0 ${
                      theme === 'dark' ? 'bg-slate-800/90 text-slate-400' : 'bg-slate-50 text-slate-600'
                    }`}
                  >
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">เวลา</th>
                      <th className="py-2.5 px-3 font-semibold">รหัสบาร์โค้ด</th>
                      <th className="py-2.5 px-3 font-semibold">ชื่อสินค้า</th>
                      <th className="py-2.5 px-3 font-semibold">ประเภทสแกน</th>
                      <th className="py-2.5 px-3 font-semibold text-right">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {scanHistory.map((item) => (
                      <tr
                        key={item.id}
                        className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition cursor-pointer ${
                          matchedProduct?.id === item.product?.id ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''
                        }`}
                        onClick={() => item.product && setMatchedProduct(item.product)}
                      >
                        <td className="py-2.5 px-3 text-slate-500 font-mono">{item.timestamp}</td>
                        <td className="py-2.5 px-3 font-mono font-medium text-slate-900 dark:text-slate-100">
                          {item.barcode}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                          {item.product ? item.product.name : <span className="text-rose-500">ไม่พบในระบบ</span>}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {item.scanType}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(item.barcode);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                            title="Copy Barcode"
                          >
                            {copiedText === item.barcode ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">ยังไม่มีประวัติการสแกนใน Session นี้</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
