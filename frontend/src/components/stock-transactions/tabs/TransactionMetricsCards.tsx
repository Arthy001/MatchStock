import React from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  SlidersHorizontal,
  Plus,
  BookOpen,
  FileText,
  CheckCircle2,
  Banknote,
  Warehouse,
  Boxes,
} from 'lucide-react';
import { ThemeMode } from '../../../types';

interface TransactionMetricsCardsProps {
  theme: ThemeMode;
  t: any;
  activeSubTab: 'all' | 'receive' | 'issue' | 'transfer' | 'adjustment';
  totalReceives: number;
  totalIssues: number;
  activeTransfers: number;
  totalAdjustments: number;
  receiveDocCount?: number;
  receiveCompletedCount?: number;
  receiveTotalValue?: number;
  issueDocCount?: number;
  issueCompletedCount?: number;
  issueTotalValue?: number;
  transferWarehouseCount?: number;
  transferBinCount?: number;
  transferCompletedCount?: number;
  adjIncreaseCount?: number;
  adjDecreaseCount?: number;
  onOpenCreateModal: () => void;
  onOpenHowToModal?: () => void;
}

export const TransactionMetricsCards: React.FC<TransactionMetricsCardsProps> = ({
  theme,
  t,
  activeSubTab,
  totalReceives,
  totalIssues,
  activeTransfers,
  totalAdjustments,
  receiveDocCount = 0,
  receiveCompletedCount = 0,
  receiveTotalValue = 0,
  issueDocCount = 0,
  issueCompletedCount = 0,
  issueTotalValue = 0,
  transferWarehouseCount = 0,
  transferBinCount = 0,
  transferCompletedCount = 0,
  adjIncreaseCount = 0,
  adjDecreaseCount = 0,
  onOpenCreateModal,
  onOpenHowToModal,
}) => {
  const getHeaderInfo = () => {
    switch (activeSubTab) {
      case 'receive':
        return {
          title: t.grTitle || 'บันทึกการรับสินค้าเข้าคลัง',
          subtitle: t.grSubtitle || 'รับสินค้าเข้าคลัง ระบุหมายเลข Lot/Batch, วันผลิต (MFG) และวันหมดอายุ (EXP) พร้อมเลือกคลังและตำแหน่ง Bin ปลายทาง',
        };
      case 'issue':
        return {
          title: t.giTitle || 'สร้างใบเบิก/จ่ายสินค้า',
          subtitle: t.giSubtitle || 'เบิกจ่ายสินค้าออกจากคลัง อ้างอิงคำสั่งซื้อ (SO) หรือวัตถุประสงค์การใช้งาน',
        };
      case 'transfer':
        return {
          title: t.transferTitle || 'โอนย้ายสินค้าระหว่างคลัง/ชั้นวาง',
          subtitle: t.transferSubtitle || 'โอนย้ายสต็อกระหว่างคลังสินค้า หรือย้ายระหว่างตำแหน่ง Bin ภายในคลัง',
        };
      case 'adjustment':
        return {
          title: t.adjTitle || 'ปรับปรุงยอดสต็อก (Stock Adjustment)',
          subtitle: t.adjSubtitle || 'ปรับปรุงยอดสต็อกให้ตรงกับความเป็นจริงหลังการตรวจนับ (Cycle Count)',
        };
      default:
        return {
          title: t.transTitle || 'ประวัติธุรกรรมคลังสินค้าทั้งหมด',
          subtitle: t.transSubtitle || 'ติดตามประวัติการรับเข้า, เบิกจ่าย, โอนย้าย และปรับยอดสต็อกทั้งหมด',
        };
    }
  };

  const headerInfo = getHeaderInfo();

  const getButtonLabel = () => {
    switch (activeSubTab) {
      case 'receive':
        return '+ บันทึกรับสินค้าเข้าคลัง (GR)';
      case 'issue':
        return '+ สร้างใบเบิก/จ่ายสินค้า (GI)';
      case 'transfer':
        return '+ สร้างใบโอนย้ายสินค้า (TR)';
      case 'adjustment':
        return '+ สร้างใบปรับปรุงสต็อก (ADJ)';
      default:
        return t.newTransactionBtn || '+ สร้างรายการธุรกรรมใหม่';
    }
  };

  const renderContextCards = () => {
    // 1. INBOUND RECEIVING (หน้ารับสินค้าเข้าคลัง)
    if (activeSubTab === 'receive') {
      return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: ยอดรับสินค้าเข้าทั้งหมด */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between transition ${
              theme === 'dark' ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white border-zinc-200/80 shadow-xs'
            }`}
          >
            <div>
              <p className={`text-xs font-semibold ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                ยอดรับสินค้าเข้าทั้งหมด
              </p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                +{totalReceives.toLocaleString()} <span className="text-xs font-normal text-zinc-500">ชิ้น</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: ใบรับสินค้าทั้งหมด */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between transition ${
              theme === 'dark' ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white border-zinc-200/80 shadow-xs'
            }`}
          >
            <div>
              <p className={`text-xs font-semibold ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                ใบรับสินค้าทั้งหมด (GR)
              </p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                {receiveDocCount} <span className="text-xs font-normal text-zinc-500">ใบ</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: รับเข้าเสร็จสมบูรณ์ */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between transition ${
              theme === 'dark' ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white border-zinc-200/80 shadow-xs'
            }`}
          >
            <div>
              <p className={`text-xs font-semibold ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                สถานะเสร็จสมบูรณ์
              </p>
              <p className="text-xl font-bold text-teal-600 dark:text-teal-400 mt-1">
                {receiveCompletedCount} <span className="text-xs font-normal text-zinc-500">ใบ</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          {/* Card 4: มูลค่าสินค้ารับเข้ารวม */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between transition ${
              theme === 'dark' ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white border-zinc-200/80 shadow-xs'
            }`}
          >
            <div>
              <p className={`text-xs font-semibold ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                มูลค่าสินค้ารับเข้ารวม
              </p>
              <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                ฿{receiveTotalValue.toLocaleString()}{' '}
                <span className="text-xs font-normal text-zinc-500">บาท</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Banknote className="w-5 h-5" />
            </div>
          </div>
        </div>
      );
    }

    // 2. OUTBOUND ISSUING (หน้าเบิกจ่ายสินค้า)
    if (activeSubTab === 'issue') {
      return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            className={`p-4 rounded-xl border flex items-center justify-between transition ${
              theme === 'dark' ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white border-zinc-200/80 shadow-xs'
            }`}
          >
            <div>
              <p className={`text-xs font-semibold ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                ยอดเบิกจ่ายสินค้าทั้งหมด
              </p>
              <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                -{totalIssues.toLocaleString()} <span className="text-xs font-normal text-zinc-500">ชิ้น</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>

          <div
            className={`p-4 rounded-xl border flex items-center justify-between transition ${
              theme === 'dark' ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white border-zinc-200/80 shadow-xs'
            }`}
          >
            <div>
              <p className={`text-xs font-semibold ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                ใบเบิกจ่ายทั้งหมด (GI)
              </p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                {issueDocCount} <span className="text-xs font-normal text-zinc-500">ใบ</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          <div
            className={`p-4 rounded-xl border flex items-center justify-between transition ${
              theme === 'dark' ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white border-zinc-200/80 shadow-xs'
            }`}
          >
            <div>
              <p className={`text-xs font-semibold ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                จ่ายของเสร็จสมบูรณ์
              </p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {issueCompletedCount} <span className="text-xs font-normal text-zinc-500">ใบ</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div
            className={`p-4 rounded-xl border flex items-center justify-between transition ${
              theme === 'dark' ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white border-zinc-200/80 shadow-xs'
            }`}
          >
            <div>
              <p className={`text-xs font-semibold ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                มูลค่าสินค้าที่เบิกจ่าย
              </p>
              <p className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                ฿{issueTotalValue.toLocaleString()}{' '}
                <span className="text-xs font-normal text-zinc-500">บาท</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Banknote className="w-5 h-5" />
            </div>
          </div>
        </div>
      );
    }

    // 3. TRANSFERS (หน้าโอนย้ายสินค้า)
    if (activeSubTab === 'transfer') {
      return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            className={`p-4 rounded-xl border flex items-center justify-between transition ${
              theme === 'dark' ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white border-zinc-200/80 shadow-xs'
            }`}
          >
            <div>
              <p className={`text-xs font-semibold ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                รายการโอนย้ายทั้งหมด
              </p>
              <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                {activeTransfers} <span className="text-xs font-normal text-zinc-500">docs</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
          </div>

          <div
            className={`p-4 rounded-xl border flex items-center justify-between transition ${
              theme === 'dark' ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white border-zinc-200/80 shadow-xs'
            }`}
          >
            <div>
              <p className={`text-xs font-semibold ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                โอนระหว่างคลัง (Inter-WH)
              </p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                {transferWarehouseCount} <span className="text-xs font-normal text-zinc-500">docs</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Warehouse className="w-5 h-5" />
            </div>
          </div>

          <div
            className={`p-4 rounded-xl border flex items-center justify-between transition ${
              theme === 'dark' ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white border-zinc-200/80 shadow-xs'
            }`}
          >
            <div>
              <p className={`text-xs font-semibold ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                โอนระหว่างชั้น (Bin-to-Bin)
              </p>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                {transferBinCount} <span className="text-xs font-normal text-zinc-500">docs</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
          </div>

          <div
            className={`p-4 rounded-xl border flex items-center justify-between transition ${
              theme === 'dark' ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white border-zinc-200/80 shadow-xs'
            }`}
          >
            <div>
              <p className={`text-xs font-semibold ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                โอนย้ายสำเร็จแล้ว
              </p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {transferCompletedCount} <span className="text-xs font-normal text-zinc-500">docs</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>
      );
    }

    // 4. ADJUSTMENTS (หน้าปรับยอดสต็อก)
    if (activeSubTab === 'adjustment') {
      return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            className={`p-4 rounded-xl border flex items-center justify-between transition ${
              theme === 'dark' ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white border-zinc-200/80 shadow-xs'
            }`}
          >
            <div>
              <p className={`text-xs font-semibold ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                รายการปรับยอดทั้งหมด
              </p>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                {totalAdjustments} <span className="text-xs font-normal text-zinc-500">audits</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
          </div>

          <div
            className={`p-4 rounded-xl border flex items-center justify-between transition ${
              theme === 'dark' ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white border-zinc-200/80 shadow-xs'
            }`}
          >
            <div>
              <p className={`text-xs font-semibold ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                ปรับยอดเพิ่ม (+Stock)
              </p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                +{adjIncreaseCount} <span className="text-xs font-normal text-zinc-500">docs</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>

          <div
            className={`p-4 rounded-xl border flex items-center justify-between transition ${
              theme === 'dark' ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white border-zinc-200/80 shadow-xs'
            }`}
          >
            <div>
              <p className={`text-xs font-semibold ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                ปรับยอดลด (-Stock)
              </p>
              <p className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                -{adjDecreaseCount} <span className="text-xs font-normal text-zinc-500">docs</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>

          <div
            className={`p-4 rounded-xl border flex items-center justify-between transition ${
              theme === 'dark' ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white border-zinc-200/80 shadow-xs'
            }`}
          >
            <div>
              <p className={`text-xs font-semibold ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                ตรวจสอบครบถ้วนแล้ว
              </p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                {totalAdjustments} <span className="text-xs font-normal text-zinc-500">audits</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>
      );
    }

    // 5. ALL TRANSACTIONS (ภาพรวมทุกธุรกรรม)
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className={`p-4 rounded-xl border flex items-center justify-between transition ${
            theme === 'dark' ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white border-zinc-200/80 shadow-xs'
          }`}
        >
          <div>
            <p className={`text-xs font-semibold ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {t.statTodayReceive || 'ยอดรับเข้าวันนี้'}
            </p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              +{totalReceives.toLocaleString()} <span className="text-xs font-normal text-zinc-500">items</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </div>

        <div
          className={`p-4 rounded-xl border flex items-center justify-between transition ${
            theme === 'dark' ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white border-zinc-200/80 shadow-xs'
          }`}
        >
          <div>
            <p className={`text-xs font-semibold ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {t.statTodayIssue || 'ยอดเบิกจ่ายวันนี้'}
            </p>
            <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              -{totalIssues.toLocaleString()} <span className="text-xs font-normal text-zinc-500">items</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div
          className={`p-4 rounded-xl border flex items-center justify-between transition ${
            theme === 'dark' ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white border-zinc-200/80 shadow-xs'
          }`}
        >
          <div>
            <p className={`text-xs font-semibold ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {t.statActiveTransfers || 'รายการโอนย้ายระหว่างทาง'}
            </p>
            <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
              {activeTransfers} <span className="text-xs font-normal text-zinc-500">docs</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
        </div>

        <div
          className={`p-4 rounded-xl border flex items-center justify-between transition ${
            theme === 'dark' ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white border-zinc-200/80 shadow-xs'
          }`}
        >
          <div>
            <p className={`text-xs font-semibold ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {t.statTotalAdjustments || 'รายการปรับยอดเดือนนี้'}
            </p>
            <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">
              {totalAdjustments} <span className="text-xs font-normal text-zinc-500">audits</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Enterprise Title & Actions Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div>
          <h2 className={`text-xl font-bold tracking-tight ${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'}`}>
            {headerInfo.title}
          </h2>
          <p className={`text-[15px] font-normal mt-0.5 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
            {headerInfo.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeSubTab === 'receive' && onOpenHowToModal && (
            <button
              onClick={onOpenHowToModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-[14px] font-semibold shadow-2xs transition cursor-pointer active:scale-[0.99]"
            >
              <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>📖 คู่มือการรับสินค้า (How-To)</span>
            </button>
          )}

          <button
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-[14px] font-semibold shadow-xs shadow-blue-600/30 transition cursor-pointer active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" />
            <span>{getButtonLabel()}</span>
          </button>
        </div>
      </div>

      {/* Dynamic Context-Aware KPI Summary Cards */}
      {renderContextCards()}
    </div>
  );
};
