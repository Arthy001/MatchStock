import React from 'react';
import { createPortal } from 'react-dom';
import { X, Plus } from 'lucide-react';
import { ThemeMode, MasterDataSubTab, UserRole } from '../../../types';

interface AddMasterDataModalProps {
  theme: ThemeMode;
  t: any;
  isOpen: boolean;
  onClose: () => void;
  activeSubTab: MasterDataSubTab;
  onSubmit: (e: React.FormEvent) => void;

  // Generic / Product states
  addName: string;
  setAddName: (val: string) => void;
  addCode: string;
  setAddCode: (val: string) => void;
  addSku: string;
  setAddSku: (val: string) => void;
  addBrand: string;
  setAddBrand: (val: string) => void;
  addBarcode: string;
  setAddBarcode: (val: string) => void;
  addPrice: string;
  setAddPrice: (val: string) => void;
  addStock: string;
  setAddStock: (val: string) => void;
  addUom: string;
  setAddUom: (val: string) => void;
  addWeightKg: string;
  setAddWeightKg: (val: string) => void;
  addWidthCm: string;
  setAddWidthCm: (val: string) => void;
  addLengthCm: string;
  setAddLengthCm: (val: string) => void;
  addHeightCm: string;
  setAddHeightCm: (val: string) => void;
  addReorderPoint: string;
  setAddReorderPoint: (val: string) => void;
  addMinReorderQty: string;
  setAddMinReorderQty: (val: string) => void;
  addIsLotControl: boolean;
  setAddIsLotControl: (val: boolean) => void;
  addDescription: string;
  setAddDescription: (val: string) => void;

  // Company states
  addCompanyCode: string;
  setAddCompanyCode: (val: string) => void;
  addCompanyName: string;
  setAddCompanyName: (val: string) => void;
  addCompanyTaxId: string;
  setAddCompanyTaxId: (val: string) => void;
  addCompanyBranchCode: string;
  setAddCompanyBranchCode: (val: string) => void;
  addCompanyBranchName: string;
  setAddCompanyBranchName: (val: string) => void;
  addCompanyPhone: string;
  setAddCompanyPhone: (val: string) => void;
  addCompanyEmail: string;
  setAddCompanyEmail: (val: string) => void;
  addCompanyAddress: string;
  setAddCompanyAddress: (val: string) => void;
  addCompanyIsHq: boolean;
  setAddCompanyIsHq: (val: boolean) => void;

  // RBAC states
  addEmail: string;
  setAddEmail: (val: string) => void;
  addRole: UserRole;
  setAddRole: (val: UserRole) => void;

  // Warehouse states
  addWarehouseName: string;
  setAddWarehouseName: (val: string) => void;
  addBinCode: string;
  setAddBinCode: (val: string) => void;
  addZone: string;
  setAddZone: (val: string) => void;
  addRack: string;
  setAddRack: (val: string) => void;
  addCapacityKg: string;
  setAddCapacityKg: (val: string) => void;

  // Supplier states
  addSupplierName: string;
  setAddSupplierName: (val: string) => void;
  addContactPerson: string;
  setAddContactPerson: (val: string) => void;
  addPhone: string;
  setAddPhone: (val: string) => void;
  addTaxId: string;
  setAddTaxId: (val: string) => void;
}

export const AddMasterDataModal: React.FC<AddMasterDataModalProps> = ({
  theme,
  t,
  isOpen,
  onClose,
  activeSubTab,
  onSubmit,
  addName,
  setAddName,
  addCode,
  setAddCode,
  addSku,
  setAddSku,
  addBrand,
  setAddBrand,
  addBarcode,
  setAddBarcode,
  addPrice,
  setAddPrice,
  addStock,
  setAddStock,
  addUom,
  setAddUom,
  addWeightKg,
  setAddWeightKg,
  addWidthCm,
  setAddWidthCm,
  addLengthCm,
  setAddLengthCm,
  addHeightCm,
  setAddHeightCm,
  addReorderPoint,
  setAddReorderPoint,
  addMinReorderQty,
  setAddMinReorderQty,
  addIsLotControl,
  setAddIsLotControl,
  addDescription,
  setAddDescription,
  addCompanyCode,
  setAddCompanyCode,
  addCompanyName,
  setAddCompanyName,
  addCompanyTaxId,
  setAddCompanyTaxId,
  addCompanyBranchCode,
  setAddCompanyBranchCode,
  addCompanyBranchName,
  setAddCompanyBranchName,
  addCompanyPhone,
  setAddCompanyPhone,
  addCompanyEmail,
  setAddCompanyEmail,
  addCompanyAddress,
  setAddCompanyAddress,
  addCompanyIsHq,
  setAddCompanyIsHq,
  addEmail,
  setAddEmail,
  addRole,
  setAddRole,
  addWarehouseName,
  setAddWarehouseName,
  addBinCode,
  setAddBinCode,
  addZone,
  setAddZone,
  addRack,
  setAddRack,
  addCapacityKg,
  setAddCapacityKg,
  addSupplierName,
  setAddSupplierName,
  addContactPerson,
  setAddContactPerson,
  addPhone,
  setAddPhone,
  addTaxId,
  setAddTaxId,
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div
        className={`w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 ${
          theme === 'dark'
            ? 'bg-slate-900 border-slate-800 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="p-5 sm:p-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
              +
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-50">
                {t.modalAddTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                {activeSubTab === 'products' && 'เพิ่มรายการสินค้าใหม่ลงในแคตตาล็อก'}
                {activeSubTab === 'companies' &&
                  'เพิ่มบริษัทในเครือ, กำหนดสาขา และเลขประจำตัวผู้เสียภาษี'}
                {activeSubTab === 'rbac' && 'เพิ่มบัญชีผู้ใช้และกำหนดบทบาทสิทธิ์ (RBAC)'}
                {activeSubTab === 'units' && 'เพิ่มหน่วยนับสินค้าและมิติกายภาพ'}
                {activeSubTab === 'barcodes' && 'ผูกบาร์โค้ดสากลและป้ายติดสินค้า'}
                {activeSubTab === 'warehouses' &&
                  'เพิ่มคลังสินค้าและตำแหน่งจัดเก็บย่อย (Bin)'}
                {activeSubTab === 'suppliers' &&
                  'เพิ่มข้อมูลผู้จัดจำหน่ายและข้อมูลภาษี'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition shrink-0"
            title="ปิดหน้าต่าง (Close)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          className="flex-1 flex flex-col min-h-0 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-sm">
            {/* Company Form Fields (1 Tenant : N Companies) */}
            {activeSubTab === 'companies' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                      รหัสบริษัท (Company Code)
                    </label>
                    <input
                      type="text"
                      value={addCompanyCode}
                      onChange={(e) => setAddCompanyCode(e.target.value)}
                      placeholder="COMP-001"
                      className={`w-full px-3 py-2 rounded-xl border font-mono font-medium outline-hidden ${
                        theme === 'dark'
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                      ชื่อบริษัท / นิติบุคคล *
                    </label>
                    <input
                      type="text"
                      required
                      value={addCompanyName}
                      onChange={(e) => setAddCompanyName(e.target.value)}
                      placeholder="MatchStock Trading Co., Ltd."
                      className={`w-full px-3 py-2 rounded-xl border font-semibold outline-hidden ${
                        theme === 'dark'
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                      เลขประจำตัวผู้เสียภาษี (Tax ID)
                    </label>
                    <input
                      type="text"
                      value={addCompanyTaxId}
                      onChange={(e) => setAddCompanyTaxId(e.target.value)}
                      placeholder="0105559012345"
                      className={`w-full px-3 py-2 rounded-xl border font-mono font-medium outline-hidden ${
                        theme === 'dark'
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                      รหัสสาขา (Branch Code) *
                    </label>
                    <input
                      type="text"
                      required
                      value={addCompanyBranchCode}
                      onChange={(e) => setAddCompanyBranchCode(e.target.value)}
                      placeholder="00000 (สนง.ใหญ่)"
                      className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                        theme === 'dark'
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                      ชื่อสาขา (Branch Name)
                    </label>
                    <input
                      type="text"
                      value={addCompanyBranchName}
                      onChange={(e) => setAddCompanyBranchName(e.target.value)}
                      placeholder="สำนักงานใหญ่ (Headquarters)"
                      className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                        theme === 'dark'
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                      เบอร์โทรศัพท์ (Phone)
                    </label>
                    <input
                      type="text"
                      value={addCompanyPhone}
                      onChange={(e) => setAddCompanyPhone(e.target.value)}
                      placeholder="+66 2 555 0100"
                      className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                        theme === 'dark'
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                    อีเมลติดต่อ (Email)
                  </label>
                  <input
                    type="email"
                    value={addCompanyEmail}
                    onChange={(e) => setAddCompanyEmail(e.target.value)}
                    placeholder="contact@company.com"
                    className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                      theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                    ที่อยู่สถานประกอบการ (Legal Address)
                  </label>
                  <textarea
                    rows={2}
                    value={addCompanyAddress}
                    onChange={(e) => setAddCompanyAddress(e.target.value)}
                    placeholder="เลขที่ อาคาร ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์"
                    className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                      theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>

                <div className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <input
                    type="checkbox"
                    id="companyIsHqCheckboxModal"
                    checked={addCompanyIsHq}
                    onChange={(e) => setAddCompanyIsHq(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label
                    htmlFor="companyIsHqCheckboxModal"
                    className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
                  >
                    กำหนดเป็นสำนักงานใหญ่ (Headquarters Entity)
                  </label>
                </div>
              </>
            )}

            {/* Unit Form Fields */}
            {activeSubTab === 'units' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                      รหัสหน่วยนับ (UOM Code) *
                    </label>
                    <input
                      type="text"
                      required
                      value={addCode}
                      onChange={(e) => setAddCode(e.target.value)}
                      placeholder="เช่น PCS, BOX, DRUM, KG"
                      className={`w-full px-3 py-2 rounded-xl border font-mono font-bold outline-hidden ${
                        theme === 'dark'
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                      ชื่อหน่วยนับภาษาไทย/อังกฤษ *
                    </label>
                    <input
                      type="text"
                      required
                      value={addName}
                      onChange={(e) => setAddName(e.target.value)}
                      placeholder="เช่น ชิ้น, กล่อง, ถัง, กิโลกรัม"
                      className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                        theme === 'dark'
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                      }`}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Product Form Fields */}
            {(activeSubTab === 'products' || activeSubTab === 'barcodes') && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                      {t.productName} *
                    </label>
                    <input
                      type="text"
                      required
                      value={addName}
                      onChange={(e) => setAddName(e.target.value)}
                      placeholder="เช่น Nike Air Max 2026"
                      className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                        theme === 'dark'
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                      {t.brand}
                    </label>
                    <input
                      type="text"
                      value={addBrand}
                      onChange={(e) => setAddBrand(e.target.value)}
                      placeholder="Nike, Adidas..."
                      className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                        theme === 'dark'
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                      {t.code}
                    </label>
                    <input
                      type="text"
                      value={addCode}
                      onChange={(e) => setAddCode(e.target.value)}
                      placeholder="PRD-1005 (สร้างอัตโนมัติถ้าว่าง)"
                      className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                        theme === 'dark'
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                      {t.sku}
                    </label>
                    <input
                      type="text"
                      value={addSku}
                      onChange={(e) => setAddSku(e.target.value)}
                      placeholder="SKU-889911 (สร้างอัตโนมัติถ้าว่าง)"
                      className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                        theme === 'dark'
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                    รหัสบาร์โค้ด (Barcode EAN-13 / CODE128)
                  </label>
                  <input
                    type="text"
                    value={addBarcode}
                    onChange={(e) => setAddBarcode(e.target.value)}
                    placeholder="8851234567890 (สร้างอัตโนมัติถ้าว่าง)"
                    className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                      theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                      {t.price} (฿ / $)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={addPrice}
                      onChange={(e) => setAddPrice(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                        theme === 'dark'
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                      {t.stockOnHand}
                    </label>
                    <input
                      type="number"
                      value={addStock}
                      onChange={(e) => setAddStock(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                        theme === 'dark'
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                      หน่วยนับ (UOM)
                    </label>
                    <select
                      value={addUom}
                      onChange={(e) => setAddUom(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                        theme === 'dark'
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                      }`}
                    >
                      <option value="PCS">PCS (ชิ้น)</option>
                      <option value="PAIR">PAIR (คู่)</option>
                      <option value="BOX">BOX (กล่อง)</option>
                      <option value="PACK">PACK (แพ็ค)</option>
                      <option value="SET">SET (ชุด)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                      น้ำหนัก (kg)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={addWeightKg}
                      onChange={(e) => setAddWeightKg(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                        theme === 'dark'
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                      กว้าง (cm)
                    </label>
                    <input
                      type="number"
                      value={addWidthCm}
                      onChange={(e) => setAddWidthCm(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                        theme === 'dark'
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                      ยาว (cm)
                    </label>
                    <input
                      type="number"
                      value={addLengthCm}
                      onChange={(e) => setAddLengthCm(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                        theme === 'dark'
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                      สูง (cm)
                    </label>
                    <input
                      type="number"
                      value={addHeightCm}
                      onChange={(e) => setAddHeightCm(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                        theme === 'dark'
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                      จุดสั่งซื้อซ้ำ (Reorder Point)
                    </label>
                    <input
                      type="number"
                      value={addReorderPoint}
                      onChange={(e) => setAddReorderPoint(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                        theme === 'dark'
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                      จำนวนสั่งซื้อขั้นต่ำ (Min Order Qty)
                    </label>
                    <input
                      type="number"
                      value={addMinReorderQty}
                      onChange={(e) => setAddMinReorderQty(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                        theme === 'dark'
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <input
                    type="checkbox"
                    id="lotControlCheckboxModal"
                    checked={addIsLotControl}
                    onChange={(e) => setAddIsLotControl(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label
                    htmlFor="lotControlCheckboxModal"
                    className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
                  >
                    เปิดใช้งานการควบคุมแบบ Lot / Batch Number (Lot Control)
                  </label>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                    รายละเอียดสินค้า (Description)
                  </label>
                  <textarea
                    rows={2}
                    value={addDescription}
                    onChange={(e) => setAddDescription(e.target.value)}
                    placeholder="ระบุคุณสมบัติหรือรายละเอียดเพิ่มเติมของสินค้า..."
                    className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                      theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>
              </>
            )}

            {/* RBAC Form Fields */}
            {activeSubTab === 'rbac' && (
              <>
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                    ชื่อ-นามสกุล ผู้ใช้ *
                  </label>
                  <input
                    type="text"
                    required
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    placeholder="เช่น สมชาย ใจดี"
                    className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                      theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                    อีเมลผู้ใช้งาน *
                  </label>
                  <input
                    type="email"
                    required
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    placeholder="user@matchstock.com"
                    className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                      theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                    บทบาทสิทธิ์ใช้งาน (Role)
                  </label>
                  <select
                    value={addRole}
                    onChange={(e) => setAddRole(e.target.value as UserRole)}
                    className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                      theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                    }`}
                  >
                    <option value="admin">Admin (ผู้ดูแลระบบสูงสุด)</option>
                    <option value="manager">Manager (ผู้จัดการคลังสินค้า)</option>
                    <option value="warehouse_staff">Warehouse Staff (เจ้าหน้าที่คลัง)</option>
                    <option value="purchasing_staff">Purchasing Staff (เจ้าหน้าที่จัดซื้อ)</option>
                  </select>
                </div>
              </>
            )}

            {/* Warehouse & Bins Form Fields */}
            {activeSubTab === 'warehouses' && (
              <>
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                    {t.warehouseName} *
                  </label>
                  <input
                    type="text"
                    required
                    value={addWarehouseName}
                    onChange={(e) => setAddWarehouseName(e.target.value)}
                    placeholder="WH-Bangkok Main Center"
                    className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                      theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                      {t.zone}
                    </label>
                    <input
                      type="text"
                      value={addZone}
                      onChange={(e) => setAddZone(e.target.value)}
                      placeholder="Zone-A"
                      className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                        theme === 'dark'
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                      {t.rack}
                    </label>
                    <input
                      type="text"
                      value={addRack}
                      onChange={(e) => setAddRack(e.target.value)}
                      placeholder="R-01"
                      className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                        theme === 'dark'
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                      {t.binCode}
                    </label>
                    <input
                      type="text"
                      value={addBinCode}
                      onChange={(e) => setAddBinCode(e.target.value)}
                      placeholder="BIN-A-01-01 (สุ่มถ้าว่าง)"
                      className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                        theme === 'dark'
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                      }`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                    ความจุสูงสุด ({t.capacityKg})
                  </label>
                  <input
                    type="number"
                    value={addCapacityKg}
                    onChange={(e) => setAddCapacityKg(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                      theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>
              </>
            )}

            {/* Suppliers Form Fields */}
            {activeSubTab === 'suppliers' && (
              <>
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                    {t.supplierName} *
                  </label>
                  <input
                    type="text"
                    required
                    value={addSupplierName}
                    onChange={(e) => setAddSupplierName(e.target.value)}
                    placeholder="เช่น Siam Logistics & Supply Co., Ltd."
                    className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                      theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                      ผู้ติดต่อ (Contact Person)
                    </label>
                    <input
                      type="text"
                      value={addContactPerson}
                      onChange={(e) => setAddContactPerson(e.target.value)}
                      placeholder="คุณวิชัย ฝ่ายขาย"
                      className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                        theme === 'dark'
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                      เบอร์โทรศัพท์
                    </label>
                    <input
                      type="text"
                      value={addPhone}
                      onChange={(e) => setAddPhone(e.target.value)}
                      placeholder="+66 2 123 4567"
                      className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                        theme === 'dark'
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                      }`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                      อีเมลติดต่อ
                    </label>
                    <input
                      type="email"
                      value={addEmail}
                      onChange={(e) => setAddEmail(e.target.value)}
                      placeholder="contact@supplier.co.th"
                      className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                        theme === 'dark'
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                      เลขประจำตัวผู้เสียภาษี (Tax ID)
                    </label>
                    <input
                      type="text"
                      value={addTaxId}
                      onChange={(e) => setAddTaxId(e.target.value)}
                      placeholder="0105562099887"
                      className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                        theme === 'dark'
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                      }`}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Pinned Modal Actions */}
          <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs shadow-md shadow-blue-600/30 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t.save}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
