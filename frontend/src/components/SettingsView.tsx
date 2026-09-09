import React, { useState, useEffect } from 'react';
import {
  Building2,
  Sliders,
  Bell,
  ShieldCheck,
  Download,
  Save,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Barcode,
  Layers,
  Key,
  Database,
  RefreshCw,
  Lock,
  Sparkles,
  CreditCard,
  Printer,
  Volume2,
  BellRing,
  Truck,
  PackageCheck,
  PackagePlus,
  Box,
  Check,
  ArrowRight,
} from 'lucide-react';
import { Language, ThemeMode, TenantSettings } from '../types';
import { getTranslation } from '../i18n';
import { productService } from '../services/product.service';
import { warehouseService } from '../services/warehouse.service';
import { masterDataService } from '../services/masterData.service';
import { BillingTab } from './settings/tabs/BillingTab';

interface SettingsViewProps {
  lang: Language;
  theme: ThemeMode;
  searchQuery?: string;
  initialSubTab?: 'profile' | 'inventory' | 'alerts' | 'security' | 'billing';
}

const DEFAULT_SETTINGS: TenantSettings = {
  companyName: 'WH-Bangkok Center Co., Ltd.',
  taxId: '0105558099887',
  phone: '+66 2 888 9999',
  email: 'admin@matchstock.com',
  address: '888 Sukhumvit Road, Khlong Toei, Bangkok 10110 Thailand',
  currency: 'THB',
  defaultVatRate: 7,
  defaultStockMethod: 'FIFO',
  defaultUom: 'PCS',
  defaultBarcodeSymbology: 'CODE128',
  alertExpiryDays: 60,
  enableRopAlerts: true,
  enableSoundFeedback: true,
  autoPrintBarcodeOnReceive: false,
  outboundStations: {
    enablePickStation: true,
    enablePackStation: true,
    enableStagingDock: true,
    enableGateDispatch: true,
  },
  defaultOutboundWorkflow: 'FOUR_STEP_STAGE',
};

export const SettingsView: React.FC<SettingsViewProps> = ({
  lang,
  theme,
  initialSubTab,
}) => {
  const t = getTranslation(lang);
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<'profile' | 'inventory' | 'alerts' | 'security' | 'billing'>(
    initialSubTab || 'profile'
  );

  useEffect(() => {
    if (initialSubTab) {
      setActiveTab(initialSubTab);
    }
  }, [initialSubTab]);

  const [settings, setSettings] = useState<TenantSettings>(DEFAULT_SETTINGS);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Scope Settings by active Tenant ID
  const getTenantStorageKey = () => {
    try {
      const authUser = localStorage.getItem('matchstock_current_user');
      if (authUser) {
        const parsed = JSON.parse(authUser);
        if (parsed.tenantId) return `matchstock_tenant_settings_${parsed.tenantId}`;
      }
    } catch {}
    const explicitTenant = localStorage.getItem('matchstock_tenant_id');
    if (explicitTenant) return `matchstock_tenant_settings_${explicitTenant}`;
    return 'matchstock_tenant_settings_default';
  };

  // Load Settings from Storage per Tenant
  useEffect(() => {
    const key = getTenantStorageKey();
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    }
  }, []);

  const handleSaveSettings = () => {
    const key = getTenantStorageKey();
    localStorage.setItem(key, JSON.stringify(settings));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Export Master Data Backup
  const handleExportBackup = async () => {
    setIsExporting(true);
    try {
      const [prodRes, whRes, supRes, userRes] = await Promise.allSettled([
        productService.getProducts({ limit: 500 }),
        warehouseService.getWarehouses(),
        masterDataService.getSuppliers(),
        masterDataService.getUsers(),
      ]);

      const backupData = {
        exportedAt: new Date().toISOString(),
        tenant: settings.companyName,
        version: '1.0.0',
        settings,
        products: prodRes.status === 'fulfilled' ? prodRes.value?.data : [],
        warehouses: whRes.status === 'fulfilled' ? whRes.value?.data : [],
        suppliers: supRes.status === 'fulfilled' ? supRes.value?.data : [],
        users: userRes.status === 'fulfilled' ? userRes.value?.data : [],
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `MatchStock_MasterData_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export backup failed:', e);
    } finally {
      setIsExporting(false);
    }
  };

  const isEn = lang === 'en';
  const savedMessage = isSaved ? t.saveSettingsSuccess : null;

  return (
    <div className="space-y-6">
      {/* Enterprise Title & Actions Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div>
          <h2 className={`text-xl font-bold tracking-tight ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
            {isEn ? 'System Settings & Enterprise Configuration' : 'การตั้งค่าระบบและองค์กร (System Settings)'}
          </h2>
          <p className={`text-[15px] font-normal mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            {isEn
              ? 'Manage organization profile, invoice tax rules, inventory engine policies, and security backups.'
              : 'จัดการข้อมูลองค์กร, การคิดภาษีหัวบิล, นโยบายการตัดสต็อก, และความปลอดภัยของระบบ'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedMessage && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 animate-in fade-in">
              {savedMessage}
            </span>
          )}
          <button
            onClick={handleSaveSettings}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-[14px] font-semibold shadow-xs shadow-blue-600/30 transition cursor-pointer active:scale-[0.99]"
          >
            <Save className="w-4 h-4" />
            <span>{t.save}</span>
          </button>
        </div>
      </div>

      {/* Settings Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>{t.tabOrgProfile}</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'inventory'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>{t.tabInventoryDefaults}</span>
        </button>

        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'alerts'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>{t.tabAlertRules}</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'security'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{t.tabSecurityBackup}</span>
        </button>

        <button
          onClick={() => setActiveTab('billing')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'billing'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>{t.tabBilling || (isEn ? 'Subscription & Billing' : 'แผนแพ็กเกจ & บิลชำระเงิน')}</span>
        </button>
      </div>

      {/* TAB 1: Organization & Tax Profile */}
      {activeTab === 'profile' && (
        <div
          className={`p-6 rounded-2xl border space-y-6 transition-colors ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div>
            <h3 className={`font-semibold text-base ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
              {isEn ? 'Organization & Invoice Header' : 'ข้อมูลองค์กรและหัวเอกสาร (Company & Invoice Header)'}
            </h3>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {isEn
                ? 'This information will appear on Purchase Orders (PO), Sales Orders (SO), Goods Receipt (GR), and reports.'
                : 'ข้อมูลนี้จะแสดงบนหัวเอกสารใบสั่งซื้อ (PO), ใบเสร็จ (SO), ใบรับเข้า (GR), และรายงาน'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">{t.companyName}</label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 outline-hidden font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                {isEn ? 'Tax Identification Number (Tax ID)' : 'เลขประจำตัวผู้เสียภาษี (Tax ID)'}
              </label>
              <input
                type="text"
                value={settings.taxId}
                onChange={(e) => setSettings({ ...settings, taxId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 outline-hidden font-medium font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                {isEn ? 'Contact Phone Number' : 'เบอร์โทรศัพท์ติดต่อ'}
              </label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 outline-hidden font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                {isEn ? 'Official Email' : 'อีเมลทางการ'}
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 outline-hidden font-medium"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                {isEn ? 'Head Office / Warehouse Address' : 'ที่อยู่สำนักงาน / คลังสินค้าหลัก'}
              </label>
              <textarea
                rows={2}
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 outline-hidden font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">{t.currency}</label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 outline-hidden font-medium"
              >
                <option value="THB">THB (฿) - Thai Baht</option>
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="JPY">JPY (¥) - Japanese Yen</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">{t.defaultVat}</label>
              <input
                type="number"
                value={settings.defaultVatRate}
                onChange={(e) => setSettings({ ...settings, defaultVatRate: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 outline-hidden font-medium"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Inventory & System Defaults */}
      {activeTab === 'inventory' && (
        <div
          className={`p-6 rounded-2xl border space-y-6 transition-colors ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div>
            <h3 className={`font-semibold text-base ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
              {isEn ? 'Inventory Policy & Engine Defaults' : 'นโยบายการตัดสต็อกและค่าเริ่มต้น (Inventory Engine Defaults)'}
            </h3>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {isEn
                ? 'Configure stock picking logic, default units of measure, and standard barcode symbologies.'
                : 'กำหนดวิธีการตัดสินค้าออกจากคลังและชนิดบาร์โค้ดมาตรฐาน'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-2">
              <label className="font-semibold text-slate-700 dark:text-slate-300">{t.stockPolicy}</label>
              <div className="space-y-2">
                {[
                  {
                    value: 'FIFO',
                    title: 'FIFO (First-In, First-Out)',
                    desc: isEn
                      ? 'Deduct oldest received lots first (Recommended for general goods)'
                      : 'ตัดล็อตที่นำเข้าก่อนเป็นลำดับแรก (แนะนำสำหรับสินค้าทั่วไป)',
                  },
                  {
                    value: 'FEFO',
                    title: 'FEFO (First-Expired, First-Out)',
                    desc: isEn
                      ? 'Deduct earliest expiring lots first (Recommended for pharma/food)'
                      : 'ตัดล็อตที่หมดอายุก่อนเป็นลำดับแรก (สำหรับยา/อาหาร)',
                  },
                  {
                    value: 'MANUAL',
                    title: 'Manual Selection',
                    desc: isEn
                      ? 'Allow warehouse operator to select Lot/Bin manually'
                      : 'ให้เจ้าหน้าที่เลือกหมายเลข Lot/Bin ด้วยตนเอง',
                  },
                ].map((item) => (
                  <label
                    key={item.value}
                    className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
                      settings.defaultStockMethod === item.value
                        ? 'border-blue-600 bg-blue-500/10'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="stockMethod"
                      checked={settings.defaultStockMethod === item.value}
                      onChange={() => setSettings({ ...settings, defaultStockMethod: item.value as any })}
                      className="mt-0.5 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <p className={`font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{item.title}</p>
                      <p className={`text-[11px] font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  {isEn ? 'Default Unit of Measure (UOM)' : 'หน่วยนับเริ่มต้น (Default UOM)'}
                </label>
                <input
                  type="text"
                  value={settings.defaultUom}
                  onChange={(e) => setSettings({ ...settings, defaultUom: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 outline-hidden font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  {isEn ? 'Primary Barcode Symbology' : 'มาตรฐานบาร์โค้ดหลัก'}
                </label>
                <select
                  value={settings.defaultBarcodeSymbology}
                  onChange={(e) => setSettings({ ...settings, defaultBarcodeSymbology: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 outline-hidden font-medium"
                >
                  <option value="CODE128">{isEn ? 'CODE128 (Alphanumeric - Global Standard)' : 'CODE128 (รองรับตัวอักษรและตัวเลข - สากล)'}</option>
                  <option value="EAN13">{isEn ? 'EAN13 (13-digit Retail Code)' : 'EAN13 (รหัสสินค้า 13 หลัก)'}</option>
                  <option value="QR_CODE">{isEn ? 'QR CODE (2D Matrix Code)' : 'QR CODE (2D Matrix Code)'}</option>
                </select>
              </div>

              {/* Auto Print Barcode Toggle Card */}
              <div
                onClick={() => setSettings({ ...settings, autoPrintBarcodeOnReceive: !settings.autoPrintBarcodeOnReceive })}
                className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer select-none flex items-center justify-between gap-3 ${
                  settings.autoPrintBarcodeOnReceive
                    ? isDark
                      ? 'bg-blue-950/40 border-blue-500/60 shadow-xs shadow-blue-500/10'
                      : 'bg-blue-50/80 border-blue-400 shadow-xs shadow-blue-500/10'
                    : isDark
                    ? 'bg-slate-800/40 border-slate-700/80 hover:bg-slate-800/70 hover:border-slate-600'
                    : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition ${
                      settings.autoPrintBarcodeOnReceive
                        ? 'bg-blue-600 text-white shadow-xs shadow-blue-600/30'
                        : isDark
                        ? 'bg-slate-800 text-slate-400 border border-slate-700'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    <Printer className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span
                      className={`block text-xs font-bold leading-tight ${
                        settings.autoPrintBarcodeOnReceive
                          ? isDark ? 'text-blue-300' : 'text-blue-900'
                          : isDark ? 'text-slate-200' : 'text-slate-800'
                      }`}
                    >
                      {isEn
                        ? 'Auto-Print Barcode on Goods Receipt'
                        : 'พิมพ์สติกเกอร์บาร์โค้ดอัตโนมัติเมื่อรับสินค้า (GR)'}
                    </span>
                    <span className="block text-[11px] text-slate-400 mt-0.5 truncate">
                      {isEn
                        ? 'Open barcode print modal immediately after receiving confirmation'
                        : 'เปิดหน้าต่างพิมพ์บาร์โค้ดทันทีที่บันทึกรับเข้าคลังสำเร็จ'}
                    </span>
                  </div>
                </div>

                {/* Smooth Toggle Switch Knob */}
                <div
                  className={`w-11 h-6 rounded-full transition-colors duration-200 p-0.5 shrink-0 flex items-center ${
                    settings.autoPrintBarcodeOnReceive ? 'bg-blue-600' : isDark ? 'bg-slate-700' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                      settings.autoPrintBarcodeOnReceive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Outbound Workflow & Granular Station Checklist */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
              <div>
                <h4 className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                  <Sliders className="w-4 h-4 text-blue-500" />
                  {isEn ? 'Outbound Stations & Workflow Policy' : 'กำหนดสถานีและขั้นตอนการเบิกจ่ายสินค้า (Outbound Station Checklist)'}
                </h4>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {isEn
                    ? 'Toggle which outbound fulfillment stations are active in your warehouse. Turning a station OFF skips it and auto-completes orders.'
                    : 'เปิด/ปิด ด่านการทำงานที่คลังของคุณใช้งานจริง (หากปิดด่านใด เมื่อทำขั้นตอนก่อนหน้าเสร็จระบบจะข้ามและ Auto-Complete ให้อัตโนมัติ)'}
                </p>
              </div>

              {/* Station Toggles Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Station 1: Picking */}
                <div
                  className={`p-4 rounded-xl border flex items-center justify-between ${
                    isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
                      <PackageCheck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                        1. สถานีเดินหยิบสินค้า (Picking)
                      </span>
                      <span className="block text-[11px] text-slate-400 truncate">
                        สแกนหยิบตามชั้นวาง Bin (บังคับเปิดเสมอ)
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                    REQUIRED
                  </span>
                </div>

                {/* Station 2: Packing */}
                <div
                  onClick={() => {
                    const current = settings.outboundStations?.enablePackStation ?? true;
                    setSettings({
                      ...settings,
                      outboundStations: {
                        ...(settings.outboundStations || {
                          enablePickStation: true,
                          enablePackStation: true,
                          enableStagingDock: true,
                          enableGateDispatch: true,
                        }),
                        enablePackStation: !current,
                      },
                    });
                  }}
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    (settings.outboundStations?.enablePackStation ?? true)
                      ? isDark
                        ? 'bg-amber-500/5 border-amber-500/30'
                        : 'bg-amber-50/50 border-amber-200'
                      : isDark
                      ? 'bg-slate-950 border-slate-800 opacity-60'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20">
                      <Box className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                        2. โต๊ะแพ็ค & ตรวจ QC (Packing)
                      </span>
                      <span className="block text-[11px] text-slate-400 truncate">
                        สแกนตรวจซ้ำ + บาร์โค้ดกล่องพัสดุ
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-11 h-6 rounded-full transition-colors duration-200 p-0.5 shrink-0 flex items-center ${
                      (settings.outboundStations?.enablePackStation ?? true) ? 'bg-amber-500' : isDark ? 'bg-slate-700' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                        (settings.outboundStations?.enablePackStation ?? true) ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>

                {/* Station 3: Staging Dock */}
                <div
                  onClick={() => {
                    const current = settings.outboundStations?.enableStagingDock ?? true;
                    setSettings({
                      ...settings,
                      outboundStations: {
                        ...(settings.outboundStations || {
                          enablePickStation: true,
                          enablePackStation: true,
                          enableStagingDock: true,
                          enableGateDispatch: true,
                        }),
                        enableStagingDock: !current,
                      },
                    });
                  }}
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    (settings.outboundStations?.enableStagingDock ?? true)
                      ? isDark
                        ? 'bg-purple-500/5 border-purple-500/30'
                        : 'bg-purple-50/50 border-purple-200'
                      : isDark
                      ? 'bg-slate-950 border-slate-800 opacity-60'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                        3. ลานพักโหลดสินค้า (Dock Staging)
                      </span>
                      <span className="block text-[11px] text-slate-400 truncate">
                        พักกล่องที่เบย์ชานชาลารอขึ้นรถ
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-11 h-6 rounded-full transition-colors duration-200 p-0.5 shrink-0 flex items-center ${
                      (settings.outboundStations?.enableStagingDock ?? true) ? 'bg-purple-600' : isDark ? 'bg-slate-700' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                        (settings.outboundStations?.enableStagingDock ?? true) ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>

                {/* Station 4: Gate Dispatch (User Question!) */}
                <div
                  onClick={() => {
                    const current = settings.outboundStations?.enableGateDispatch ?? true;
                    setSettings({
                      ...settings,
                      outboundStations: {
                        ...(settings.outboundStations || {
                          enablePickStation: true,
                          enablePackStation: true,
                          enableStagingDock: true,
                          enableGateDispatch: true,
                        }),
                        enableGateDispatch: !current,
                      },
                    });
                  }}
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    (settings.outboundStations?.enableGateDispatch ?? true)
                      ? isDark
                        ? 'bg-emerald-500/5 border-emerald-500/30'
                        : 'bg-emerald-50/50 border-emerald-200'
                      : isDark
                      ? 'bg-slate-950 border-slate-800 opacity-60'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/20">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                        4. ด่านประตูปล่อยรถ (Gate Dispatch)
                      </span>
                      <span className="block text-[11px] text-slate-400 truncate">
                        {(settings.outboundStations?.enableGateDispatch ?? true)
                          ? 'ตรวจยืนยันปล่อยรถที่ประตูคลัง'
                          : '⚡ ปิดใช้งาน: Auto-Complete ปิดงานทันทีเมื่อแพ็คเสร็จ'}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-11 h-6 rounded-full transition-colors duration-200 p-0.5 shrink-0 flex items-center ${
                      (settings.outboundStations?.enableGateDispatch ?? true) ? 'bg-emerald-600' : isDark ? 'bg-slate-700' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                        (settings.outboundStations?.enableGateDispatch ?? true) ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Visual Pipeline Preview */}
              <div
                className={`p-4 rounded-xl border text-xs space-y-2.5 ${
                  isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-blue-50/40 border-blue-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    🔄 แผนภาพสายพานการทำงานจริงของคลังคุณ (Active Pipeline):
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {!(settings.outboundStations?.enableGateDispatch ?? true) ? '⚡ Direct Auto-Complete' : '🛡️ Full Audit Gate'}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap pt-1 font-medium">
                  {/* Pick */}
                  <div className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    <span>1. สแกนหยิบ (Pick)</span>
                  </div>

                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

                  {/* Pack */}
                  <div
                    className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition ${
                      (settings.outboundStations?.enablePackStation ?? true)
                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                        : 'bg-slate-800/40 text-slate-500 border-slate-700/50 line-through'
                    }`}
                  >
                    {(settings.outboundStations?.enablePackStation ?? true) && <Check className="w-3.5 h-3.5" />}
                    <span>2. โต๊ะแพ็ค (Pack)</span>
                    {!(settings.outboundStations?.enablePackStation ?? true) && <span className="text-[10px] font-bold text-slate-400">(ข้าม)</span>}
                  </div>

                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

                  {/* Staging */}
                  <div
                    className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition ${
                      (settings.outboundStations?.enableStagingDock ?? true)
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                        : 'bg-slate-800/40 text-slate-500 border-slate-700/50 line-through'
                    }`}
                  >
                    {(settings.outboundStations?.enableStagingDock ?? true) && <Check className="w-3.5 h-3.5" />}
                    <span>3. ลานพัก (Stage)</span>
                    {!(settings.outboundStations?.enableStagingDock ?? true) && <span className="text-[10px] font-bold text-slate-400">(ข้าม)</span>}
                  </div>

                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

                  {/* Gate */}
                  <div
                    className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition ${
                      (settings.outboundStations?.enableGateDispatch ?? true)
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                        : 'bg-slate-800/40 text-slate-500 border-slate-700/50 line-through'
                    }`}
                  >
                    {(settings.outboundStations?.enableGateDispatch ?? true) && <Check className="w-3.5 h-3.5" />}
                    <span>4. ปล่อยรถ (Gate)</span>
                    {!(settings.outboundStations?.enableGateDispatch ?? true) && <span className="text-[10px] font-bold text-slate-400">(ข้าม)</span>}
                  </div>

                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

                  {/* Completed */}
                  <div className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold shadow-xs">
                    ✅ สำเร็จ (Completed)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Alert & Expiry Rules */}
      {activeTab === 'alerts' && (
        <div
          className={`p-6 rounded-2xl border space-y-6 transition-colors ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div>
            <h3 className={`font-semibold text-base ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
              {isEn ? 'Alert Thresholds & Safety Rules' : 'กฎการแจ้งเตือนและความปลอดภัยของสินค้า (Alert Thresholds)'}
            </h3>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {isEn
                ? 'Configure threshold limits for near-expiry alerts and Reorder Point (ROP) triggers.'
                : 'ตั้งค่าเกณฑ์การแจ้งเตือนสินค้าใกล้หมดอายุ และสินค้าต่ำกว่าจุดสั่งซื้อซ้ำ (ROP)'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">{t.expiryAlertDays}</label>
                <input
                  type="number"
                  value={settings.alertExpiryDays}
                  onChange={(e) => setSettings({ ...settings, alertExpiryDays: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 outline-hidden font-medium"
                />
                <p className="text-[11px] text-slate-400 font-normal">
                  {isEn
                    ? 'System will display orange warning icon when product remaining shelf-life is less than this value'
                    : 'ระบบจะขึ้นไอคอนเตือนสีส้มเมื่อสินค้ามีวันหมดอายุเหลือน้อยกว่าค่านี้'}
                </p>
              </div>

              <div className="space-y-3">
                {/* ROP Alerts Toggle Card */}
                <div
                  onClick={() => setSettings({ ...settings, enableRopAlerts: !settings.enableRopAlerts })}
                  className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer select-none flex items-center justify-between gap-3 ${
                    settings.enableRopAlerts
                      ? isDark
                        ? 'bg-blue-950/40 border-blue-500/60 shadow-xs shadow-blue-500/10'
                        : 'bg-blue-50/80 border-blue-400 shadow-xs shadow-blue-500/10'
                      : isDark
                      ? 'bg-slate-800/40 border-slate-700/80 hover:bg-slate-800/70 hover:border-slate-600'
                      : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition ${
                        settings.enableRopAlerts
                          ? 'bg-blue-600 text-white shadow-xs shadow-blue-600/30'
                          : isDark
                          ? 'bg-slate-800 text-slate-400 border border-slate-700'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      <BellRing className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span
                        className={`block text-xs font-bold leading-tight ${
                          settings.enableRopAlerts
                            ? isDark ? 'text-blue-300' : 'text-blue-900'
                            : isDark ? 'text-slate-200' : 'text-slate-800'
                        }`}
                      >
                        {isEn
                          ? 'Reorder Point (ROP) Alerts on Dashboard'
                          : 'เปิดใช้งานการแจ้งเตือนจุดสั่งซื้อซ้ำ (ROP) บน Dashboard'}
                      </span>
                      <span className="block text-[11px] text-slate-400 mt-0.5 truncate">
                        {isEn
                          ? 'Display critical low stock badges when inventory drops below ROP'
                          : 'แสดงป้ายเตือนสต็อกวิกฤตเมื่อสินค้าลดต่ำกว่าระดับสั่งซื้อซ้ำ'}
                      </span>
                    </div>
                  </div>

                  {/* Smooth Toggle Switch Knob */}
                  <div
                    className={`w-11 h-6 rounded-full transition-colors duration-200 p-0.5 shrink-0 flex items-center ${
                      settings.enableRopAlerts ? 'bg-blue-600' : isDark ? 'bg-slate-700' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                        settings.enableRopAlerts ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>

                {/* Sound Feedback Toggle Card */}
                <div
                  onClick={() => setSettings({ ...settings, enableSoundFeedback: !settings.enableSoundFeedback })}
                  className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer select-none flex items-center justify-between gap-3 ${
                    settings.enableSoundFeedback
                      ? isDark
                        ? 'bg-blue-950/40 border-blue-500/60 shadow-xs shadow-blue-500/10'
                        : 'bg-blue-50/80 border-blue-400 shadow-xs shadow-blue-500/10'
                      : isDark
                      ? 'bg-slate-800/40 border-slate-700/80 hover:bg-slate-800/70 hover:border-slate-600'
                      : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition ${
                        settings.enableSoundFeedback
                          ? 'bg-blue-600 text-white shadow-xs shadow-blue-600/30'
                          : isDark
                          ? 'bg-slate-800 text-slate-400 border border-slate-700'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      <Volume2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span
                        className={`block text-xs font-bold leading-tight ${
                          settings.enableSoundFeedback
                            ? isDark ? 'text-blue-300' : 'text-blue-900'
                            : isDark ? 'text-slate-200' : 'text-slate-800'
                        }`}
                      >
                        {isEn
                          ? 'Audio Beep Feedback on Barcode Scan'
                          : 'เปิดเสียงสังเคราะห์เมื่อสแกนบาร์โค้ด'}
                      </span>
                      <span className="block text-[11px] text-slate-400 mt-0.5 truncate">
                        {isEn
                          ? 'Synthesize audio beeps upon barcode scan success or error'
                          : 'ส่งเสียง Beep แจ้งสถานะเมื่อยิงสแกนบาร์โค้ดสำเร็จหรือล้มเหลว'}
                      </span>
                    </div>
                  </div>

                  {/* Smooth Toggle Switch Knob */}
                  <div
                    className={`w-11 h-6 rounded-full transition-colors duration-200 p-0.5 shrink-0 flex items-center ${
                      settings.enableSoundFeedback ? 'bg-blue-600' : isDark ? 'bg-slate-700' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                        settings.enableSoundFeedback ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Security & Data Backup */}
      {activeTab === 'security' && (
        <div
          className={`p-6 rounded-2xl border space-y-6 transition-colors ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div>
            <h3 className={`font-semibold text-base ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
              {isEn ? 'Security & Master Data Backup' : 'ความปลอดภัยและการสำรองข้อมูล (Security & Master Data Backup)'}
            </h3>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {isEn
                ? 'Verify Multi-Tenant isolation status and export complete JSON backup of master data.'
                : 'ตรวจสอบสถานะ Multi-Tenant Isolation และดาวน์โหลดสำรองข้อมูลคลังสินค้า'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Multi-Tenant Status Card */}
            <div className={`p-5 rounded-2xl border space-y-3 ${isDark ? 'border-slate-800 bg-slate-800/40' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h4 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Multi-Tenant Data Isolation</h4>
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {isEn
                  ? 'Every API request is intercepted by JWT Auth and tagged with `x-tenant-id` to guarantee zero data leakage across branches or organizations.'
                  : 'ทุกการเรียก API จะถูกคั่นกลางด้วย JWT Auth และแนบ `x-tenant-id` เพื่อรับประกันว่าข้อมูลจะไม่รั่วไหลข้ามสาขาหรือองค์กรอื่น'}
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                  <Lock className="w-3.5 h-3.5" /> Isolated & Encrypted
                </span>
              </div>
            </div>

            {/* Master Data Backup */}
            <div className={`p-5 rounded-2xl border space-y-3 ${isDark ? 'border-slate-800 bg-slate-800/40' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                <h4 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Master Data Backup (JSON)</h4>
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {isEn
                  ? 'Download a full JSON archive of Products, Warehouses, Bins, Suppliers, and Users for disaster recovery backup.'
                  : 'ดาวน์โหลดสำเนาข้อมูลสินค้า, คลังสินค้า, ตำแหน่ง Bin, ผู้จัดจำหน่าย, และผู้ใช้งาน ทั้งหมดเป็นไฟล์ JSON เพื่อสำรองข้อมูล'}
              </p>
              <button
                onClick={handleExportBackup}
                disabled={isExporting}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? (isEn ? 'Exporting...' : 'กำลังส่งออก...') : t.exportBackup}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Subscription & Billing Management */}
      {activeTab === 'billing' && (
        <BillingTab theme={theme} lang={lang} t={t} />
      )}
    </div>
  );
};
