import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  BookOpen,
  Barcode,
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  PlusCircle,
  Warehouse,
  Boxes,
  Zap,
  Smartphone,
  Scan,
  ChevronRight,
  HelpCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { ThemeMode, Language } from '../../../types';

interface ReceiveHowToModalProps {
  theme: ThemeMode;
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateGRModal: () => void;
}

export const ReceiveHowToModal: React.FC<ReceiveHowToModalProps> = ({
  theme,
  lang,
  isOpen,
  onClose,
  onOpenCreateGRModal,
}) => {
  if (!isOpen) return null;

  const isDark = theme === 'dark';
  const isEn = lang === 'en';

  const [activeStep, setActiveStep] = useState<number>(1);

  const guideSteps = [
    {
      id: 1,
      title: isEn ? '1. Scanner Setup & Device Choice' : '1. เตรียมอุปกรณ์สแกนเนอร์ & การเชื่อมต่อ',
      subtitle: isEn ? 'Hardware Gun vs Mobile Handheld' : 'เลือกใช้ปืนสแกนเนอร์ หรือกล้องมือถือ/แท็บเล็ต',
      icon: Barcode,
      badge: isEn ? 'Step 1: Setup' : 'ขั้นตอนที่ 1',
      badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      content: {
        intro: isEn
          ? 'MatchStock supports 2 flexible barcode scanning methods for warehouse receiving:'
          : 'ระบบ MatchStock รองรับการสแกนบาร์โค้ดหน้างานได้ 2 รูปแบบตามความสะดวกของพื้นที่คลัง:',
        points: [
          {
            title: isEn ? 'Hardware Barcode Gun (USB / Bluetooth / PDA)' : 'ปืนยิงบาร์โค้ดฮาร์ดแวร์ (USB / Bluetooth / PDA Gun)',
            desc: isEn
              ? 'Acts like a high-speed keyboard input (HID). Place your cursor in the search input or open the form, then pull the trigger on carton barcodes. Product data is matched instantly.'
              : 'ทำงานเสมือนคีย์บอร์ดพิมพ์เร็ว (Keyboard HID) เพียงวางเคอร์เซอร์ที่ช่องค้นหาหรือเปิดฟอร์มรับเข้า แล้วกดยิงบาร์โค้ดที่กล่องสินค้า ข้อมูลจะถูกดึงขึ้นมาทันทีโดยไม่ต้องแตะหน้าจอ',
            icon: Zap,
          },
          {
            title: isEn ? 'Handheld Mobile / Tablet Camera Scanner' : 'กล้องโทรศัพท์มือถือ / แท็บเล็ต (Mobile Camera)',
            desc: isEn
              ? 'Open the Barcode Scanner tab via mobile browser. Features auto-focus, laser crosshair overlay, audio chime (Beep), and vibration feedback.'
              : 'เปิดผ่านกล้องมือถือในเมนู "สแกนบาร์โค้ด" พร้อมเส้นเล็งเลเซอร์ มีเสียงบี๊บ (Beep) และระบบสั่นเตือนเมื่ออ่านรหัสติด รองรับทั้ง 1D (Code128, EAN-13) และ 2D QR Code',
            icon: Smartphone,
          },
        ],
        tip: isEn
          ? 'Pro-Tip: Bluetooth wireless barcode rings or guns paired with an iPad or Android tablet provide maximum mobility for warehouse receiving.'
          : 'เทคนิคหน้างาน: ใช้ปืนยิงบาร์โค้ด Bluetooth ไร้สายจับคู่กับแท็บเล็ต เพื่อเดินตรวจรับสินค้าที่หน้าตู้คอนเทนเนอร์ได้อย่างคล่องตัวโดยไม่ต้องลากสาย',
      },
    },
    {
      id: 2,
      title: isEn ? '2. Instant Lookup & Goods Receipt' : '2. การเปิดใบรับสินค้า & สแกนบาร์โค้ด',
      subtitle: isEn ? 'Auto-match SKU, name & stock' : 'ดึงรหัสสินค้า, ชื่อ และยอดคงเหลืออัตโนมัติ',
      icon: Scan,
      badge: isEn ? 'Step 2: Document' : 'ขั้นตอนที่ 2',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      content: {
        intro: isEn
          ? 'Create a Goods Receipt (GR) document to establish full traceability for incoming items:'
          : 'สร้างเอกสารใบรับสินค้า (Goods Receipt - GR) เพื่อบันทึกประวัติการนำเข้าและอ้างอิงเอกสารคู่ค้า:',
        points: [
          {
            title: isEn ? 'Header & Reference Info' : 'กรอกข้อมูลส่วนหัวเอกสาร (Header)',
            desc: isEn
              ? 'Select destination warehouse and supplier. Enter Purchase Order (PO) number or Supplier Delivery Note / Invoice number. Attach photos of shipping documents.'
              : 'เลือกคลังสินค้าปลายทาง, ผู้จัดจำหน่าย (Supplier), ระบุเลขที่ PO หรือเลขที่ใบส่งของ (Invoice No.) และแนบรูปถ่ายใบเสร็จ/สภาพกล่องเพื่อใช้เป็นหลักฐาน',
            icon: CheckCircle2,
          },
          {
            title: isEn ? 'Barcode Item Scanning' : 'ยิงบาร์โค้ดเพิ่มรายการสินค้า (Line Items)',
            desc: isEn
              ? 'Scan product barcodes to automatically populate item name, SKU, category, unit of measure (UOM), and current Stock on Hand.'
              : 'สแกนบาร์โค้ดสินค้าเพื่อดึงชื่อ, SKU, หมวดหมู่, หน่วยนับ (UOM) และสต็อกคงเหลือปัจจุบันขึ้นมาอัตโนมัติโดยไม่ต้องพิมพ์ค้นหา',
            icon: PlusCircle,
          },
        ],
        tip: isEn
          ? 'Pro-Tip: If a product barcode is new, you can link it directly in Master Data -> Barcode Management.'
          : 'เทคนิค: หากสแกนแล้วไม่พบสินค้า สามารถเพิ่มบาร์โค้ดใหม่เข้ากับรายการสินค้าได้ที่เมนู "ข้อมูลหลัก -> บาร์โค้ด"',
      },
    },
    {
      id: 3,
      title: isEn ? '3. Lot Control, Expiry & QC Damaged' : '3. คุม Lot / วันหมดอายุ & บันทึกชำรุด (QC)',
      subtitle: isEn ? 'Strict tracking & vendor claims' : 'ควบคุมคุณภาพและแยกยอดเคลมคู่ค้า',
      icon: Calendar,
      badge: isEn ? 'Step 3: Quality' : 'ขั้นตอนที่ 3',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      content: {
        intro: isEn
          ? 'Enforce quality control and expiry compliance during inbound verification:'
          : 'ควบคุมคุณภาพและการตรวจสอบย้อนกลับ (Traceability) สำหรับสินค้าที่มีอายุการเก็บรักษา:',
        points: [
          {
            title: isEn ? 'Lot Number, MFG & EXP Dates' : 'ระบุเลขล็อต (Lot No.), วันผลิต และวันหมดอายุ',
            desc: isEn
              ? 'Specify manufacturing date (MFG) and expiration date (EXP) to enable FIFO (First-In, First-Out) and FEFO (First-Expired, First-Out) picking rules.'
              : 'ระบุเลข Lot และวันหมดอายุ (EXP) เพื่อให้ระบบรองรับการจัดลำดับการหยิบสินค้าแบบ FEFO (หมดอายุก่อนหยิบก่อน) ป้องกันสินค้าค้างสต็อกจนหมดอายุ',
            icon: Clock,
          },
          {
            title: isEn ? 'Damaged Quantity (QC Claim)' : 'แยกจำนวนสินค้าชำรุด (Damaged Qty)',
            desc: isEn
              ? 'If boxes are damaged or crushed upon arrival, record damaged quantity. It is tracked for vendor credit note claims and excluded from sellable stock.'
              : 'หากพบสินค้าแตกหักหรือกล่องบุบตอนตรวจรับ ให้ระบุยอดในช่อง "ชำรุด" ระบบจะไม่นำยอดนี้ไปรวมในสต็อกพร้อมขาย แต่จะบันทึกประวัติไว้สำหรับฝ่ายจัดซื้อใช้เคลมลดหนี้กับคู่ค้า',
            icon: AlertTriangle,
          },
        ],
        tip: isEn
          ? 'Pro-Tip: Recording damaged goods immediately upon receiving ensures 100% accounting accuracy for supplier credit claims.'
          : 'เทคนิค: การแยกยอดชำรุดทันทีตอนรับเข้า ช่วยให้ฝ่ายจัดซื้อมีหลักฐานและตัวเลขที่ถูกต้องในการขอเคลมเงินคืนหรือขอเปลี่ยนสินค้าใหม่',
      },
    },
    {
      id: 4,
      title: isEn ? '4. Flexible Putaway & Confirm Stock' : '4. การจัดเก็บเข้าชั้นวาง (Putaway) & ยืนยันสต็อก',
      subtitle: isEn ? '1-Step Direct Bin vs 2-Step Staging Dock' : 'เลือกรับเข้าชั้นวางทันที หรือพักไว้จุด Dock รับของ',
      icon: Layers,
      badge: isEn ? 'Step 4: Putaway' : 'ขั้นตอนที่ 4',
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      content: {
        intro: isEn
          ? 'MatchStock offers 2 putaway workflows to match your warehouse operations:'
          : 'ระบบรองรับการจัดเก็บ 2 รูปแบบตามขนาดพื้นที่และการทำงานของคลังสินค้า:',
        points: [
          {
            title: isEn ? '1-Step Direct Receiving (ระบุชั้นวางทันที)' : 'แบบขั้นตอนเดียว (1-Step Direct Bin Location)',
            desc: isEn
              ? 'Specify destination Bin Location (e.g. A-01-01) during receiving. Inventory updates instantly and items are ready for sales picking immediately.'
              : 'ระบุตำแหน่งชั้นวาง (เช่น A-01-01) ทันทีในใบรับ เหมาะสำหรับคลังขนาดเล็ก หรือสินค้าที่มีช่องวางประจำ สต็อกจะพร้อมขายทันที',
            icon: Warehouse,
          },
          {
            title: isEn ? '2-Step Receiving & Putaway (พัก Staging Dock)' : 'แบบสองขั้นตอน (2-Step Staging & Forklift Putaway)',
            desc: isEn
              ? 'Leave Bin empty -> Items stay in Receiving Staging Dock queue. Warehouse staff can scan physical bin barcodes later via the Putaway screen.'
              : 'ไม่ระบุชั้นวาง -> สินค้าจะเข้าพักที่จุดรับ (Staging Dock) ก่อน แล้วให้ทีม Forklift ไปเปิดหน้าจอ "จัดเก็บเข้าชั้น (Putaway)" เพื่อยิงบาร์โค้ดชั้นวางจริงภายหลัง',
            icon: Boxes,
          },
        ],
        tip: isEn
          ? 'Pro-Tip: When confirmed, inventory balances (ACID transactions) update in real-time across all warehouses.'
          : 'เทคนิค: เมื่อกดยืนยัน ยอดคงเหลือในคลัง (Stock Balance) และประวัติธุรกรรมจะอัปเดตลงฐานข้อมูลจริงแบบ Real-time ทันที',
      },
    },
  ];

  const currentStep = guideSteps.find((s) => s.id === activeStep) || guideSteps[0];

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-all ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Header */}
        <div className="p-4 sm:px-6 py-4 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-blue-600/10 via-indigo-600/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight">
                  {isEn ? 'Goods Receiving & Barcode Scanner How-To Guide' : 'คู่มือการรับสินค้าเข้าคลัง & การใช้งานร่วมกับ Barcode Scanner'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {isEn ? 'Interactive Guide' : 'คู่มือแนะนำ'}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {isEn
                  ? 'Step-by-step instructions for receiving inbound goods with barcode guns or mobile cameras.'
                  : 'ขั้นตอนและเทคนิคการตรวจรับสินค้า, การสแกนบาร์โค้ด, การคุม Lot/วันหมดอายุ, และการนำเข้าชั้นวาง'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition cursor-pointer"
            title="Close Guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Left Step Navigation & Right Content */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-zinc-200 dark:divide-zinc-800">
          {/* Left Column: 4 Step Navigation Cards (4 Cols) */}
          <div className="md:col-span-4 p-4 sm:p-5 space-y-2.5 bg-zinc-50/50 dark:bg-zinc-900/40">
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
              {isEn ? '4 Workflow Steps' : '4 ขั้นตอนการทำงาน'}
            </p>

            {guideSteps.map((s) => {
              const Icon = s.icon;
              const isSelected = activeStep === s.id;

              return (
                <button
                  key={s.id}
                  onClick={() => setActiveStep(s.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? isDark
                        ? 'bg-blue-950/40 border-blue-500/60 ring-2 ring-blue-500/20 text-white'
                        : 'bg-white border-blue-400 ring-2 ring-blue-400/20 shadow-xs text-zinc-900'
                      : isDark
                      ? 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-800/60 text-slate-300'
                      : 'bg-white/60 border-slate-200/80 hover:bg-white text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : isDark
                          ? 'bg-slate-800 text-slate-400'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold leading-snug truncate">{s.title}</p>
                      <p className="text-[10px] text-zinc-500 truncate">{s.subtitle}</p>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 shrink-0 transition ${
                      isSelected ? 'text-blue-500 translate-x-0.5' : 'text-zinc-400 opacity-40'
                    }`}
                  />
                </button>
              );
            })}

            {/* Quick Action Button in Left Column */}
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                {isEn ? 'Ready to receive?' : 'พร้อมทำรายการรับเข้า'}
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenCreateGRModal();
                }}
                className="w-full py-2.5 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer active:scale-98"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isEn ? '+ Open Goods Receipt Form' : '+ เปิดฟอร์มสร้างใบรับสินค้า'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Step Deep Dive & Explanations (8 Cols) */}
          <div className="md:col-span-8 p-5 sm:p-6 space-y-5">
            {/* Step Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="space-y-0.5">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${currentStep.badgeColor}`}>
                  {currentStep.badge}
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {currentStep.title}
                </h4>
              </div>
              <span className="text-xs font-semibold text-zinc-400">
                {isEn ? `Step ${currentStep.id} of 4` : `ขั้นตอนที่ ${currentStep.id} จาก 4`}
              </span>
            </div>

            {/* Intro paragraph */}
            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {currentStep.content.intro}
            </p>

            {/* 2 Detail Points Bento Cards */}
            <div className="grid grid-cols-1 gap-3">
              {currentStep.content.points.map((pt, idx) => {
                const PtIcon = pt.icon;
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border transition ${
                      isDark ? 'bg-slate-800/50 border-slate-700/60' : 'bg-slate-50/80 border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                        <PtIcon className="w-4 h-4" />
                      </div>
                      <div className="space-y-1 flex-1">
                        <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {pt.title}
                        </h5>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          {pt.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pro-Tip Box */}
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs ${
                isDark
                  ? 'bg-amber-950/20 border-amber-900/40 text-amber-200'
                  : 'bg-amber-50/80 border-amber-200 text-amber-900'
              }`}
            >
              <Sparkles className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
              <p className="leading-relaxed font-medium">{currentStep.content.tip}</p>
            </div>

            {/* Navigation Stepper Bottom Bar */}
            <div className="pt-2 flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800">
              <button
                disabled={activeStep === 1}
                onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
                className="py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                {isEn ? '← Previous Step' : '← ขั้นตอนก่อนหน้า'}
              </button>

              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((i) => (
                  <button
                    key={i}
                    onClick={() => setActiveStep(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                      activeStep === i ? 'w-6 bg-blue-600' : isDark ? 'bg-slate-700' : 'bg-slate-300'
                    }`}
                    title={`Step ${i}`}
                  />
                ))}
              </div>

              {activeStep < 4 ? (
                <button
                  onClick={() => setActiveStep((prev) => Math.min(4, prev + 1))}
                  className="py-1.5 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                >
                  {isEn ? 'Next Step →' : 'ขั้นตอนถัดไป →'}
                </button>
              ) : (
                <button
                  onClick={() => {
                    onClose();
                    onOpenCreateGRModal();
                  }}
                  className="py-1.5 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                >
                  {isEn ? '🚀 Open GR Form' : '🚀 เริ่มสร้างใบรับสินค้า'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
