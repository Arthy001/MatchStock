import React, { useEffect, useState, useRef } from 'react';
import {
  Package,
  ArrowRight,
  Layers,
  Box,
  FileText,
  CreditCard,
  Settings,
  ScanBarcode,
  ArrowDownLeft,
  Truck,
  Building2,
  Users,
  Compass,
  Search,
} from 'lucide-react';
import { ThemeMode, Language } from '../../types';
import { productService } from '../../services/product.service';

export interface SearchResultItem {
  id: string;
  type: 'navigation' | 'product' | 'transaction' | 'warehouse';
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: string;
  icon: React.ElementType;
  route: {
    tab: string;
    subTab?: string;
    targetId?: string;
  };
}

interface GlobalSearchPaletteProps {
  query: string;
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
  lang: Language;
  onNavigate: (tab: string, subTab?: string, targetId?: string) => void;
}

const STATIC_NAVIGATION_ROUTES: Array<{
  keywords: string[];
  titleTh: string;
  titleEn: string;
  subtitleTh: string;
  subtitleEn: string;
  badge: string;
  badgeColor: string;
  icon: React.ElementType;
  tab: string;
  subTab?: string;
}> = [
  {
    keywords: ['สินค้า', 'sku', 'product', 'catalog', 'บาร์โค้ด'],
    titleTh: 'แคตตาล็อกสินค้า (Products & SKUs)',
    titleEn: 'Products & SKU Catalog',
    subtitleTh: 'ค้นหา จัดการสต็อก รหัสบาร์โค้ด และมิติกายภาพ',
    subtitleEn: 'Product definitions, barcodes, and inventory parameters',
    badge: 'Master Data',
    badgeColor: 'blue',
    icon: Package,
    tab: 'masterData',
    subTab: 'products',
  },
  {
    keywords: ['คลัง', 'แร็ค', 'เชลฟ์', 'bin', 'warehouse', '3d', '2d'],
    titleTh: 'ผังคลังสินค้า 3D & ตำแหน่ง Bins',
    titleEn: 'Warehouses, Racks & 3D Bins',
    subtitleTh: 'Digital Twin โกดัง 3 มิติ, พิมพ์เขียว 2D และสลับชั้นวาง',
    subtitleEn: '3D Digital Twin, 2D blueprint layout & visual relocation',
    badge: 'Digital Twin',
    badgeColor: 'emerald',
    icon: Box,
    tab: 'masterData',
    subTab: 'warehouses',
  },
  {
    keywords: ['คิวจัดเก็บ', 'putaway', 'inbound', 'dock', 'จัดเก็บ'],
    titleTh: 'คิวจัดเก็บเข้าชั้นวาง (Putaway Queue)',
    titleEn: 'Putaway Inbound Queue',
    subtitleTh: 'จัดเก็บสินค้ารอเข้าเชลฟ์ พร้อมระบบ AI Suggest Bin',
    subtitleEn: 'Staged items queue with smart bin slot suggestions',
    badge: 'New Feature',
    badgeColor: 'purple',
    icon: ArrowDownLeft,
    tab: 'inventory',
    subTab: 'putaway',
  },
  {
    keywords: ['ยอดสต็อก', 'คงเหลือ', 'stock', 'balance', 'real-time'],
    titleTh: 'ยอดสต็อกคงเหลือจริง (Stock Balances)',
    titleEn: 'Stock Balances & Real-Time Lookups',
    subtitleTh: 'ตรวจสอบยอดจริงราย Bin พร้อมสแกนเนอร์บาร์โค้ด/RFID',
    subtitleEn: 'Real-time bin balances with universal scanner lookup',
    badge: 'Live',
    badgeColor: 'amber',
    icon: Layers,
    tab: 'inventory',
    subTab: 'balances',
  },
  {
    keywords: ['รับเข้า', 'goods receive', 'gr', 'inbound'],
    titleTh: 'รับสินค้าเข้าคลัง (Goods Receive)',
    titleEn: 'Goods Receive (GR)',
    subtitleTh: 'บันทึกรับสินค้า รองรับ 1-Step และ 2-Step Docks',
    subtitleEn: 'Receive PO goods with 1-Step and 2-Step putaway',
    badge: 'Inbound',
    badgeColor: 'blue',
    icon: Truck,
    tab: 'inventory',
    subTab: 'receive',
  },
  {
    keywords: ['ตรวจนับ', 'cycle count', 'audit', 'กระทบยอด'],
    titleTh: 'ตรวจนับสต็อก & กระทบยอด (Cycle Count)',
    titleEn: 'Cycle Count & Stock Audit',
    subtitleTh: 'วางแผนตรวจนับสต็อก ยิงบาร์โค้ดนับจริง ปรับยอดอัตโนมัติ',
    subtitleEn: 'Inventory count plans, variance check, and reconciliation',
    badge: 'Audit',
    badgeColor: 'teal',
    icon: FileText,
    tab: 'inventory',
    subTab: 'cycleCount',
  },
  {
    keywords: ['สแกนเนอร์', 'บาร์โค้ด', 'barcode', 'scanner', 'ยิงบาร์โค้ด'],
    titleTh: 'เครื่องสแกนบาร์โค้ด (Universal Scanner)',
    titleEn: 'Universal Barcode Scanner',
    subtitleTh: 'ยิงบาร์โค้ดค้นหาข้อมูลด่วนและตรวจนับ',
    subtitleEn: 'Mobile camera & hardware scanner integration',
    badge: 'Tools',
    badgeColor: 'indigo',
    icon: ScanBarcode,
    tab: 'inventory',
    subTab: 'scanner',
  },
  {
    keywords: ['แพ็กเกจ', 'billing', 'subscription', 'แผน', 'ราคา', 'โควตา'],
    titleTh: 'แพ็กเกจ & บิลลิ่ง (Subscription & Billing)',
    titleEn: 'Subscription & Billing Plans',
    subtitleTh: 'Free, Pro, Ultra, ตรวจสอบโควตา และประวัติใบแจ้งหนี้',
    subtitleEn: 'Manage tiers, quota limits, and invoice history',
    badge: 'Billing',
    badgeColor: 'purple',
    icon: CreditCard,
    tab: 'settings',
    subTab: 'billing',
  },
  {
    keywords: ['บริษัท', 'company', 'subsidiary', 'สาขา', 'tax'],
    titleTh: 'บริษัทในเครือ (Subsidiary Companies)',
    titleEn: 'Subsidiary Companies & Branches',
    subtitleTh: 'จัดการนิติบุคคล เลขผู้เสียภาษี และสาขา',
    subtitleEn: 'Manage multi-entity companies, branches, and tax IDs',
    badge: 'Master Data',
    badgeColor: 'blue',
    icon: Building2,
    tab: 'masterData',
    subTab: 'companies',
  },
  {
    keywords: ['ผู้ใช้', 'สิทธิ์', 'user', 'rbac', 'permission', 'admin'],
    titleTh: 'ผู้ใช้งานและสิทธิ์การเข้าถึง (RBAC)',
    titleEn: 'User Permissions & RBAC',
    subtitleTh: 'จัดการบทบาทพนักงาน Admin, Manager, Staff',
    subtitleEn: 'Multi-tenant role boundaries and staff assignments',
    badge: 'Security',
    badgeColor: 'rose',
    icon: Users,
    tab: 'masterData',
    subTab: 'rbac',
  },
  {
    keywords: ['ตั้งค่า', 'settings', 'ระบบ', 'config'],
    titleTh: 'การตั้งค่าระบบ (System Settings)',
    titleEn: 'System Settings & Company Profile',
    subtitleTh: 'ข้อมูลบริษัท ค่าเริ่มต้นระบบคลัง และภาษา',
    subtitleEn: 'Tenant profile, warehouse defaults, and localization',
    badge: 'System',
    badgeColor: 'slate',
    icon: Settings,
    tab: 'settings',
    subTab: 'profile',
  },
];

export const GlobalSearchPalette: React.FC<GlobalSearchPaletteProps> = ({
  query,
  isOpen,
  onClose,
  theme,
  lang,
  onNavigate,
}) => {
  const isEn = lang === 'en';
  const isDark = theme === 'dark';
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Live Products Loaded
  const [liveProducts, setLiveProducts] = useState<any[]>([]);

  // Load sample/initial products for instant instant-response search
  useEffect(() => {
    let isMounted = true;
    productService
      .getProducts({ limit: 40 })
      .then((res) => {
        if (!isMounted) return;
        const list = res.data || res.items || (Array.isArray(res) ? res : []);
        setLiveProducts(list);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute Search Results
  const results: SearchResultItem[] = React.useMemo(() => {
    const q = (query || '').trim().toLowerCase();
    const items: SearchResultItem[] = [];

    // 1. Matched Navigation Shortcuts
    STATIC_NAVIGATION_ROUTES.forEach((nav) => {
      const matchKeywords = nav.keywords.some((k) => k.toLowerCase().includes(q));
      const matchTitle = (isEn ? nav.titleEn : nav.titleTh).toLowerCase().includes(q);
      if (!q || matchKeywords || matchTitle) {
        items.push({
          id: `nav-${nav.tab}-${nav.subTab || ''}`,
          type: 'navigation',
          title: isEn ? nav.titleEn : nav.titleTh,
          subtitle: isEn ? nav.subtitleEn : nav.subtitleTh,
          badge: nav.badge,
          badgeColor: nav.badgeColor,
          icon: nav.icon,
          route: { tab: nav.tab, subTab: nav.subTab },
        });
      }
    });

    // 2. Matched Live Products (by SKU, Name, Barcode, Brand)
    if (q) {
      liveProducts.forEach((p) => {
        const name = (p.name || '').toLowerCase();
        const sku = (p.sku || p.code || '').toLowerCase();
        const barcode = (p.barcodeValue || p.barcode || '').toLowerCase();
        const brand = (p.brand || '').toLowerCase();

        if (name.includes(q) || sku.includes(q) || barcode.includes(q) || brand.includes(q)) {
          items.push({
            id: `prod-${p.id}`,
            type: 'product',
            title: p.name || 'Product',
            subtitle: `SKU: ${p.sku || p.code || '-'} • ฿${Number(p.price || 0).toLocaleString()} • คงเหลือ ${p.stockOnHand || 0} ${p.uom || 'pcs'}`,
            badge: p.brand || 'Product',
            badgeColor: 'blue',
            icon: Package,
            route: {
              tab: 'masterData',
              subTab: 'products',
              targetId: p.id,
            },
          });
        }
      });

      // 3. Matched Warehouse Bins Simulation
      if (q.startsWith('a-') || q.startsWith('b-') || q.startsWith('wh') || q.includes('bin') || q.includes('คลัง')) {
        items.push({
          id: 'wh-main-twin',
          type: 'warehouse',
          title: isEn ? 'Bangkok Main Hub — 3D Digital Twin' : 'คลังสินค้าหลักกรุงเทพ (ผัง 3D Digital Twin)',
          subtitle: isEn ? `Pinpoint matching storage bins for query "${query}"` : `ชี้เป้าช่องเก็บสินค้าที่ตรงกับ "${query}" บนโมเดล 3D`,
          badge: '3D Visualizer',
          badgeColor: 'emerald',
          icon: Box,
          route: { tab: 'masterData', subTab: 'warehouses' },
        });
      }
    }

    return items.slice(0, 10);
  }, [query, isEn, liveProducts]);

  // Reset selectedIndex when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results.length, query]);

  // Handle Keyboard Navigation (ArrowUp, ArrowDown, Enter, Esc)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1 < results.length ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : results.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          const item = results[selectedIndex];
          onNavigate(item.route.tab, item.route.subTab, item.route.targetId);
          onClose();
        } else if (query.trim()) {
          // If no result highlighted, default to Products & SKUs with this query
          onNavigate('masterData', 'products');
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, query, onNavigate, onClose]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className={`absolute top-full left-0 mt-2 w-[480px] sm:w-[540px] max-w-[95vw] rounded-2xl border shadow-2xl backdrop-blur-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 ${
        isDark
          ? 'bg-slate-900/95 border-slate-700/80 text-slate-100 shadow-slate-950/80'
          : 'bg-white/95 border-slate-200 text-slate-900 shadow-xl'
      }`}
    >
      {/* Search Header Banner */}
      <div
        className={`px-4 py-2.5 border-b text-[11px] font-bold flex items-center justify-between ${
          isDark ? 'bg-slate-950/50 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'
        }`}
      >
        <span className="flex items-center gap-1.5 uppercase tracking-wider">
          <Compass className="w-3.5 h-3.5 text-blue-500" />
          {query.trim()
            ? (isEn ? `Matching results for "${query}"` : `ผลการค้นหาสำหรับ "${query}"`)
            : (isEn ? 'Quick Navigation & Shortcuts' : 'เมนูลัดและหมวดหมู่ยอดนิยม')}
        </span>
        <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
          <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">↑</kbd>
          <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">↓</kbd>
          <span>เลื่อน</span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 ml-1">Enter</kbd>
          <span>เลือก</span>
        </span>
      </div>

      {/* Results List */}
      <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
        {results.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
            <p className="text-xs font-semibold">
              {isEn ? `No matches found for "${query}"` : `ไม่พบข้อมูลที่ตรงกับ "${query}"`}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              {isEn ? 'Press Enter to search in Products Catalog' : 'กด Enter เพื่อค้นหาต่อในหน้าแคตตาล็อกสินค้า'}
            </p>
          </div>
        ) : (
          results.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                onMouseEnter={() => setSelectedIndex(idx)}
                onClick={() => {
                  onNavigate(item.route.tab, item.route.subTab, item.route.targetId);
                  onClose();
                }}
                className={`px-3 py-2.5 rounded-xl cursor-pointer transition flex items-center justify-between gap-3 ${
                  isSelected
                    ? isDark
                      ? 'bg-blue-600/20 text-white border border-blue-500/40 shadow-xs'
                      : 'bg-blue-50 text-blue-900 border border-blue-200 shadow-xs'
                    : isDark
                    ? 'hover:bg-slate-800/60 text-slate-300'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/40'
                        : isDark
                        ? 'bg-slate-800 text-slate-400'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs truncate">{item.title}</span>
                      {item.badge && (
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded shrink-0 ${
                            item.badgeColor === 'purple'
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                              : item.badgeColor === 'emerald'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : item.badgeColor === 'amber'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.subtitle}</p>
                  </div>
                </div>

                {/* Right Action Indicator */}
                <div className="shrink-0 flex items-center text-slate-400">
                  <ArrowRight
                    className={`w-4 h-4 transition duration-150 ${
                      isSelected
                        ? 'text-blue-500 translate-x-0.5'
                        : isDark
                        ? 'text-slate-600'
                        : 'text-slate-400'
                    }`}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Helper */}
      <div
        className={`px-4 py-2 border-t text-[11px] flex items-center justify-between ${
          isDark ? 'bg-slate-950/70 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'
        }`}
      >
        <span>
          {isEn ? 'Press Enter to jump to selected item' : 'กด Enter เพื่อกระโดดไปที่รายการที่เลือก'}
        </span>
        <span className="font-mono text-[10px]">ESC ปิด</span>
      </div>
    </div>
  );
};
