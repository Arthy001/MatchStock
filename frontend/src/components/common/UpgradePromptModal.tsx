import React from 'react';
import { createPortal } from 'react-dom';
import {
  Crown,
  AlertTriangle,
  X,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { ThemeMode } from '../../types';

export interface UpgradePromptModalProps {
  theme: ThemeMode;
  isOpen: boolean;
  onClose: () => void;
  type: 'FEATURE_NOT_INCLUDED' | 'QUOTA_EXCEEDED';
  featureCode?: string;
  resourceName?: string;
  currentUsage?: number;
  maxAllowed?: number;
  customMessage?: string;
  onNavigateToBilling: () => void;
}

export const UpgradePromptModal: React.FC<UpgradePromptModalProps> = ({
  theme,
  isOpen,
  onClose,
  type,
  featureCode,
  resourceName,
  currentUsage,
  maxAllowed,
  customMessage,
  onNavigateToBilling,
}) => {
  if (!isOpen) return null;

  const isDark = theme === 'dark';
  const isFeature = type === 'FEATURE_NOT_INCLUDED';

  const formatFeatureName = (code?: string) => {
    if (!code) return 'ฟีเจอร์ระดับสูง (Enterprise Feature)';
    switch (code) {
      case 'stock.fefo':
        return 'ระบบตัดสต็อกตามวันหมดอายุ (FEFO Dispatch)';
      case 'stock.lot_expiry':
        return 'การติดตาม Lot & วันหมดอายุสินค้า';
      case 'warehouse.bins':
        return 'ระบบจัดเก็บแยกตามชั้นวาง (Bin Locations)';
      case 'cycle_count.barcode':
        return 'ระบบตรวจนับสต็อกด้วยบาร์โค้ด';
      case 'sales_orders.manage':
        return 'ระบบจัดการใบสั่งขายและใบสั่งซื้อ (SO/PO)';
      case 'reports.valuation':
        return 'รายงานมูลค่าสต็อกเชิงลึก (Stock Valuation)';
      case 'rfid.reader':
        return 'ระบบสแกนเนอร์ RFID Automation';
      default:
        return code;
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[10000] overflow-hidden bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div
        className={`w-full max-w-lg rounded-3xl shadow-2xl border overflow-hidden relative z-10 transition animate-in zoom-in-95 duration-200 ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Decorative Top Accent Banner */}
        <div
          className={`h-2.5 w-full bg-linear-to-r ${
            isFeature
              ? 'from-amber-400 via-purple-500 to-indigo-600'
              : 'from-rose-500 via-amber-500 to-orange-500'
          }`}
        />

        {/* Header */}
        <div className="p-6 pb-4 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs shrink-0 ${
                isFeature
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                  : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
              }`}
            >
              {isFeature ? <Crown className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isFeature
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                      : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                  }`}
                >
                  {isFeature ? 'Plan Upgrade Required' : 'Quota Limit Exceeded'}
                </span>
              </div>
              <h3 className="text-lg font-extrabold mt-1 text-slate-900 dark:text-white">
                {isFeature
                  ? 'ปลดล็อคฟีเจอร์ด้วยแพ็กเกจ Pro / Ultra'
                  : 'โควตาการใช้งานในระบบของคุณเต็มแล้ว'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="px-6 py-2 space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {customMessage ||
              (isFeature
                ? `คุณกำลังพยายามเข้าใช้งาน "${formatFeatureName(
                    featureCode
                  )}" ซึ่งจำเป็นต้องมีสิทธิ์ในแพ็กเกจระดับ Pro ขึ้นไป`
                : `ทรัพยากร ${resourceName || 'ของระบบ'} ใช้งานครบตามขีดจำกัดของแพ็กเกจปัจจุบันแล้ว (${currentUsage || 0} / ${maxAllowed || 0})`)}
          </p>

          {/* Highlight Benefit Card */}
          <div
            className={`p-4 rounded-2xl border space-y-2.5 ${
              isDark ? 'bg-slate-800/50 border-slate-700/60' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>ประโยชน์ที่ได้รับเมื่ออัปเกรดเป็น MatchStock Pro / Ultra:</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>เพิ่มจำนวนคลังสินค้าได้สูงสุด 3 - ไม่จำกัดแห่ง</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>รองรับผู้ใช้งาน 10 - ไม่จำกัดคน พร้อมระบบสิทธิ์ RBAC</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>ปลดล็อคระบบ Bins, FEFO, Lot & Expiry, SO/PO และ Putaway</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-4 flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/80 mt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            ไว้คราวหลัง
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigateToBilling();
            }}
            className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/25 flex items-center gap-2 transition transform active:scale-98 cursor-pointer"
          >
            <span>ดูแผนแพ็กเกจ & อัปเกรด</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
