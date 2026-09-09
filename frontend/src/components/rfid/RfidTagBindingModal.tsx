import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Radio,
  X,
  Search,
  CheckCircle2,
  AlertCircle,
  Link2,
  Unlink,
  Package,
  Barcode,
  Sparkles,
  RefreshCw,
  Trash2,
  Filter,
  Layers,
  Check,
} from 'lucide-react';
import { ThemeMode, Language } from '../../types';
import { rfidService, RfidTagItem } from '../../services/rfid.service';
import { productService } from '../../services/product.service';

interface RfidTagBindingModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
  lang?: Language;
  initialProductId?: string;
  showToast?: (msg: string) => void;
}

export const RfidTagBindingModal: React.FC<RfidTagBindingModalProps> = ({
  isOpen,
  onClose,
  theme,
  lang = 'th',
  initialProductId,
  showToast,
}) => {
  if (!isOpen) return null;
  const isEn = lang === 'en';
  const isDark = theme === 'dark';

  // Tabs: 'bind' | 'registry'
  const [activeTab, setActiveTab] = useState<'bind' | 'registry'>('bind');

  // Products & Tags List
  const [products, setProducts] = useState<any[]>([]);
  const [tagsList, setTagsList] = useState<RfidTagItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Binding Form States
  const [selectedProductId, setSelectedProductId] = useState<string>(initialProductId || '');
  const [productSearch, setProductSearch] = useState('');
  const [tagEpc, setTagEpc] = useState('');
  const [receivedAt, setReceivedAt] = useState(new Date().toISOString().split('T')[0]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Registry Filters
  const [registrySearch, setRegistrySearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'bound' | 'unbound'>('ALL');

  const tagInputRef = useRef<HTMLInputElement>(null);

  // Load Products & Tags
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prodRes, tagsRes] = await Promise.all([
        productService.getProducts({ limit: 100 }),
        rfidService.getTags(),
      ]);

      const pList = prodRes.data || prodRes.items || (Array.isArray(prodRes) ? prodRes : []);
      setProducts(pList);

      const tList = Array.isArray(tagsRes) ? tagsRes : [];
      setTagsList(tList);
    } catch (err) {
      console.error('Failed to load RFID data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (initialProductId) {
      setSelectedProductId(initialProductId);
    }
  }, [initialProductId]);

  // Selected Product Object
  const selectedProduct = products.find((p) => p.id === selectedProductId);

  // Filtered Products for Picker
  const filteredProducts = products.filter((p) => {
    if (!productSearch) return true;
    const q = productSearch.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.code?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q) ||
      p.barcode?.toLowerCase().includes(q)
    );
  });

  // Handle Bind Tag
  const handleBind = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEpc = tagEpc.trim().toUpperCase();
    if (!cleanEpc) {
      setErrorMessage(isEn ? 'Please scan or enter RFID Tag EPC' : 'กรุณาสแกนหรือระบุรหัส RFID EPC');
      return;
    }
    if (!selectedProductId) {
      setErrorMessage(isEn ? 'Please select a product to bind' : 'กรุณาเลือกสินค้าที่ต้องการผูกแท็ก');
      return;
    }

    setIsSubmitting(true);
    try {
      await rfidService.bindTag(cleanEpc, {
        productId: selectedProductId,
        receivedAt: receivedAt || undefined,
      });

      const pName = selectedProduct?.name || selectedProductId;
      const successText = isEn
        ? `Successfully bound Tag [${cleanEpc}] to ${pName}`
        : `ผูกแท็ก [${cleanEpc}] เข้ากับ "${pName}" สำเร็จ`;

      setSuccessMessage(successText);
      showToast?.(successText);

      // Optimistic Update
      setTagsList((prev) => [
        {
          id: cleanEpc,
          tagId: cleanEpc,
          tenantId: 'current',
          productId: selectedProductId,
          status: 'bound',
          boundAt: new Date().toISOString(),
          product: selectedProduct,
        },
        ...prev.filter((t) => t.tagId !== cleanEpc),
      ]);

      // Reset Tag input for next scan
      setTagEpc('');
      tagInputRef.current?.focus();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'เกิดข้อผิดพลาดในการผูกแท็ก RFID';
      setErrorMessage(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Unbind Tag
  const handleUnbind = async (tag: RfidTagItem) => {
    const confirmMsg = isEn
      ? `Are you sure you want to unbind RFID Tag "${tag.tagId}"?`
      : `คุณแน่ใจหรือไม่ว่าต้องการปลดการผูกแท็ก RFID "${tag.tagId}"?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await rfidService.unbindTag(tag.tagId);
      showToast?.(isEn ? `Unbound Tag [${tag.tagId}]` : `ปลดการผูกแท็ก [${tag.tagId}] สำเร็จ`);

      setTagsList((prev) =>
        prev.map((t) => (t.tagId === tag.tagId ? { ...t, status: 'unbound', productId: null, product: undefined } : t))
      );
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'เกิดข้อผิดพลาดในการปลดแท็ก';
      alert(msg);
    }
  };

  // Filtered Registry Tags
  const filteredTags = tagsList.filter((tag) => {
    if (statusFilter !== 'ALL' && tag.status !== statusFilter) return false;
    if (!registrySearch) return true;
    const q = registrySearch.toLowerCase();
    const epcMatch = tag.tagId?.toLowerCase().includes(q);
    const prodMatch = tag.product?.name?.toLowerCase().includes(q) || tag.product?.sku?.toLowerCase().includes(q);
    return epcMatch || prodMatch;
  });

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="fixed inset-0 -z-10" onClick={onClose} />
      <div
        className={`w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${
          isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-xs">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100">
                  {isEn ? 'RFID Tag Management & Binding' : 'ระบบจัดการและผูกแท็ก RFID (Tag Binding)'}
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  Ultra Feature
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isEn
                  ? 'Pair physical RFID EPC tags to inventory products for real-time tracking.'
                  : 'จับคู่ชิป RFID EPC เข้ากับสินค้าในระบบเพื่อตรวจจับและอ่านค่าสต็อกอัตโนมัติ'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-3 pb-0 border-b border-slate-200 dark:border-slate-800 flex gap-4 shrink-0 bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('bind')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'bind'
                ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Link2 className="w-4 h-4" />
            <span>{isEn ? 'Fast Tag Binding' : 'สแกนผูกแท็ก (Quick Bind)'}</span>
          </button>
          <button
            onClick={() => setActiveTab('registry')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'registry'
                ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{isEn ? 'Tag Registry' : 'ทะเบียนแท็กทั้งหมด (Registry)'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
              {tagsList.length}
            </span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto grow">
          {activeTab === 'bind' ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column: Product Selection */}
              <div className="md:col-span-6 space-y-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-purple-500" />
                  <span>{isEn ? '1. Select Product (SKU / Barcode)' : '1. เลือกสินค้าที่จะผูกแท็ก (SKU / Barcode)'}</span>
                </label>

                {/* Product Search Filter */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder={isEn ? 'Search by name, SKU, or barcode...' : 'ค้นหาชื่อสินค้า, SKU หรือสแกนบาร์โค้ด...'}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-hidden"
                  />
                </div>

                {/* Product Quick List */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40">
                  {filteredProducts.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      {isEn ? 'No products found' : 'ไม่พบรายการสินค้า'}
                    </div>
                  ) : (
                    filteredProducts.map((p) => {
                      const isSelected = p.id === selectedProductId;
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            setSelectedProductId(p.id);
                            tagInputRef.current?.focus();
                          }}
                          className={`p-2.5 transition cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="min-w-0 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-500 text-xs font-bold">
                              {p.sku?.substring(0, 3) || 'SKU'}
                            </div>
                            <div className="truncate">
                              <p className="text-xs truncate font-medium">{p.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">
                                SKU: {p.sku || p.code} {p.barcode ? `| Barcode: ${p.barcode}` : ''}
                              </p>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Scan RFID Tag & Confirm */}
              <div className="md:col-span-6 space-y-4">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-purple-500" />
                  <span>{isEn ? '2. Scan RFID Tag (EPC Hex Code)' : '2. สแกนชิป RFID Tag (รหัส EPC)'}</span>
                </label>

                {/* RFID Scan Input */}
                <div>
                  <div className="relative">
                    <Radio className="w-4 h-4 absolute left-3.5 top-3 text-purple-500 animate-pulse" />
                    <input
                      ref={tagInputRef}
                      type="text"
                      value={tagEpc}
                      onChange={(e) => setTagEpc(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleBind();
                        }
                      }}
                      placeholder="e.g. 686E14141E13194568471D7F"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-purple-300 dark:border-purple-700/80 bg-purple-50/20 dark:bg-purple-950/20 text-sm font-mono tracking-wider focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-hidden"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {isEn ? 'Press Enter or trigger handheld RFID reader to bind.' : 'กด Enter หรือยิงเครื่องอ่าน RFID เพื่อบันทึก'}
                  </p>
                </div>

                {/* Optional Received Date */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    {isEn ? 'Received Date (Lot Arrival)' : 'วันที่สินค้าเข้าคลัง (Received Date)'}
                  </label>
                  <input
                    type="date"
                    value={receivedAt}
                    onChange={(e) => setReceivedAt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-hidden"
                  />
                </div>

                {/* Status Feedback Banners */}
                {successMessage && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span className="truncate">{successMessage}</span>
                  </div>
                )}
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Submit Action */}
                <button
                  type="button"
                  onClick={() => handleBind()}
                  disabled={isSubmitting || !selectedProductId || !tagEpc.trim()}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-purple-600/20"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Link2 className="w-4 h-4" />
                  )}
                  <span>{isSubmitting ? (isEn ? 'Binding Tag...' : 'กำลังผูกแท็ก...') : (isEn ? 'Bind Tag to Product' : 'ผูกแท็กเข้ากับสินค้านี้')}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Registry Tab */
            <div className="space-y-4">
              {/* Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={registrySearch}
                    onChange={(e) => setRegistrySearch(e.target.value)}
                    placeholder={isEn ? 'Filter EPC or Product...' : 'ค้นหา EPC หรือชื่อสินค้า...'}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-hidden"
                  />
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <select
                    value={statusFilter}
                    onChange={(e: any) => setStatusFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                  >
                    <option value="ALL">{isEn ? 'All Status' : 'สถานะทั้งหมด'}</option>
                    <option value="bound">{isEn ? 'Bound Only' : 'เฉพาะที่ผูกสินค้าแล้ว'}</option>
                    <option value="unbound">{isEn ? 'Unbound Only' : 'เฉพาะที่ยังไม่ผูก'}</option>
                  </select>

                  <button
                    onClick={loadData}
                    className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    title="Reload Tags"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Tags Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                      <tr>
                        <th className="py-2.5 px-3">RFID EPC Tag ID</th>
                        <th className="py-2.5 px-3">Bound Product</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Bound Date</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {filteredTags.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400">
                            {isEn ? 'No RFID tags registered in system' : 'ยังไม่มีแท็ก RFID ในระบบ'}
                          </td>
                        </tr>
                      ) : (
                        filteredTags.map((tag) => {
                          const isBound = tag.status === 'bound';
                          return (
                            <tr key={tag.tagId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                              <td className="py-2.5 px-3 font-mono font-bold text-slate-800 dark:text-slate-200 select-all">
                                {tag.tagId}
                              </td>
                              <td className="py-2.5 px-3">
                                {tag.product ? (
                                  <div>
                                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                                      {tag.product.name}
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-mono">
                                      SKU: {tag.product.sku || tag.product.code}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-slate-400 italic">{isEn ? 'Unassigned' : 'ยังไม่ได้ระบุ'}</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                    isBound
                                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                  }`}
                                >
                                  {isBound ? 'Bound' : 'Unbound'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                                {tag.boundAt ? new Date(tag.boundAt).toLocaleDateString() : '-'}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                {isBound && (
                                  <button
                                    onClick={() => handleUnbind(tag)}
                                    className="px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-[11px] font-semibold transition cursor-pointer"
                                  >
                                    <Unlink className="w-3 h-3 inline-block mr-1" />
                                    <span>Unbind</span>
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
