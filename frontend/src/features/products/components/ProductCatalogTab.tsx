import React, { useState, useEffect } from 'react';
import {
  Filter,
  QrCode,
  Edit2,
  Trash2,
  Eye,
  SlidersHorizontal,
  ChevronDown,
  ArrowUpDown,
  ExternalLink,
  Layers,
  Package,
} from 'lucide-react';
import { ThemeMode, Language, ProductItem, CategoryItem, BrandItem, Supplier, BarcodeSymbologyItem, TaxTypeItem } from '../../../types';
import { resolveImageUrl } from '../../../services/product.service';
import { useProducts } from '../hooks/useProducts';
import { ProductDrawer } from './ProductDrawer';
import { BarcodeModal } from '../../../components/master-data/modals/BarcodeModal';
import { ConfirmDeleteModal } from '../../../components/master-data/modals/ConfirmDeleteModal';
import { UnitItem } from '../../../components/master-data/hooks/useMasterDataLoader';

interface ProductCatalogTabProps {
  theme: ThemeMode;
  lang?: Language;
  t?: any;
  searchQuery?: string;
  products?: ProductItem[];
  categoriesList?: CategoryItem[];
  brandsList?: BrandItem[];
  unitsList?: UnitItem[];
  suppliersList?: Supplier[];
  barcodeSymbologiesList?: BarcodeSymbologyItem[];
  taxTypesList?: TaxTypeItem[];
  onOpenDrawer?: (prod: ProductItem) => void;
  onSelectBarcode?: (prod: ProductItem) => void;
  onDeleteProduct?: (prod: ProductItem) => void;
  showToast?: (msg: string) => void;
}

const renderText = (val: any): string => {
  if (val == null) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  if (typeof val === 'object') return val.name || val.title || val.code || val.label || '';
  return String(val);
};

export const ProductCatalogTab: React.FC<ProductCatalogTabProps> = ({
  theme,
  lang = 'th',
  t,
  searchQuery = '',
  products: externalProducts,
  categoriesList = [],
  brandsList = [],
  unitsList = [],
  suppliersList = [],
  barcodeSymbologiesList = [],
  taxTypesList = [],
  onOpenDrawer: externalOpenDrawer,
  onSelectBarcode: externalSelectBarcode,
  onDeleteProduct: externalDeleteProduct,
  showToast,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'IN_STOCK' | 'LOW' | 'OUT' | 'INACTIVE'>('ALL');

  const isDark = theme === 'dark';
  const isEn = lang === 'en';

  const hook = useProducts(showToast);

  useEffect(() => {
    if (!externalProducts) {
      hook.fetchProducts();
    }
  }, [externalProducts]);

  const products = externalProducts || hook.productsList;
  const safeProducts = Array.isArray(products) ? products : [];

  const activeProducts = safeProducts.filter((p) => p && p.isActive !== false);
  const inactiveProducts = safeProducts.filter((p) => p && p.isActive === false);
  const inStockProducts = safeProducts.filter((p) => p && Number(p.stockOnHand || 0) > Number(p.reorderLevel || 10));
  const lowStockProducts = safeProducts.filter((p) => {
    if (!p) return false;
    const s = Number(p.stockOnHand || 0);
    const rop = Number(p.reorderLevel || 10);
    return s > 0 && s <= rop;
  });
  const outStockProducts = safeProducts.filter((p) => p && Number(p.stockOnHand || 0) === 0);

  const toggleSelectAll = () => {
    if (selectedIds.length === safeProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(safeProducts.map((p) => p?.id).filter(Boolean));
    }
  };

  const toggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const filtered = safeProducts.filter((p) => {
    if (!p) return false;

    // Search query filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        (p.name || '').toLowerCase().includes(q) ||
        (p.code || '').toLowerCase().includes(q) ||
        (p.sku || '').toLowerCase().includes(q) ||
        (p.barcodeValue || '').toLowerCase().includes(q) ||
        renderText(p.category).toLowerCase().includes(q) ||
        renderText(p.brand).toLowerCase().includes(q);
      if (!match) return false;
    }

    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'ACTIVE') return p.isActive !== false;
    if (statusFilter === 'INACTIVE') return p.isActive === false;

    const stock = Number(p.stockOnHand || 0);
    const rop = Number(p.reorderLevel || 10);
    if (statusFilter === 'OUT') return stock === 0;
    if (statusFilter === 'LOW') return stock > 0 && stock <= rop;
    if (statusFilter === 'IN_STOCK') return stock > rop;
    return true;
  });

  return (
    <div
      className={`rounded-lg border transition-colors overflow-hidden ${
        isDark
          ? 'bg-zinc-900/90 border-zinc-800 text-zinc-100 shadow-sm'
          : 'bg-white border-zinc-200 text-zinc-900 shadow-xs'
      }`}
    >
      {/* Table Filter Tabs Toolbar */}
      <div
        className={`px-4 py-2.5 border-b flex flex-col md:flex-row md:items-center justify-between gap-3 ${
          isDark ? 'border-zinc-800 bg-zinc-900/70' : 'border-zinc-200 bg-zinc-50/70'
        }`}
      >
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              statusFilter === 'ALL'
                ? 'bg-blue-600 text-white shadow-xs'
                : isDark
                ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
            }`}
          >
            <span>{isEn ? 'All Items' : 'ทั้งหมด'}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              statusFilter === 'ALL' ? 'bg-blue-700/80 text-white' : isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-200 text-zinc-700'
            }`}>
              {safeProducts.length}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              statusFilter === 'ACTIVE'
                ? 'bg-emerald-600 text-white shadow-xs'
                : isDark
                ? 'text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800'
                : 'text-zinc-600 hover:text-emerald-700 hover:bg-zinc-200/60'
            }`}
          >
            <span>{isEn ? 'Active' : 'เปิดใช้งาน'}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              statusFilter === 'ACTIVE' ? 'bg-emerald-700/80 text-white' : isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-200 text-zinc-700'
            }`}>
              {activeProducts.length}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('IN_STOCK')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              statusFilter === 'IN_STOCK'
                ? 'bg-teal-600 text-white shadow-xs'
                : isDark
                ? 'text-zinc-400 hover:text-teal-400 hover:bg-zinc-800'
                : 'text-zinc-600 hover:text-teal-700 hover:bg-zinc-200/60'
            }`}
          >
            <span>{isEn ? 'In Stock' : 'สต็อกปกติ'}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              statusFilter === 'IN_STOCK' ? 'bg-teal-700/80 text-white' : isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-200 text-zinc-700'
            }`}>
              {inStockProducts.length}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('LOW')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              statusFilter === 'LOW'
                ? 'bg-amber-600 text-white shadow-xs'
                : isDark
                ? 'text-zinc-400 hover:text-amber-400 hover:bg-zinc-800'
                : 'text-zinc-600 hover:text-amber-700 hover:bg-zinc-200/60'
            }`}
          >
            <span>{isEn ? 'Low Stock' : 'สต็อกใกล้หมด'}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              statusFilter === 'LOW' ? 'bg-amber-700/80 text-white' : isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-200 text-zinc-700'
            }`}>
              {lowStockProducts.length}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('OUT')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              statusFilter === 'OUT'
                ? 'bg-rose-600 text-white shadow-xs'
                : isDark
                ? 'text-zinc-400 hover:text-rose-400 hover:bg-zinc-800'
                : 'text-zinc-600 hover:text-rose-700 hover:bg-zinc-200/60'
            }`}
          >
            <span>{isEn ? 'Out of Stock' : 'สินค้าหมด'}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              statusFilter === 'OUT' ? 'bg-rose-700/80 text-white' : isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-200 text-zinc-700'
            }`}>
              {outStockProducts.length}
            </span>
          </button>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-blue-500 font-mono">{selectedIds.length} selected</span>
            <button
              onClick={() => setSelectedIds([])}
              className="text-zinc-400 hover:text-zinc-200 underline cursor-pointer"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Enterprise Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr
              className={`border-b font-semibold tracking-wider text-[11px] select-none ${
                isDark
                  ? 'border-zinc-800 bg-zinc-950/60 text-zinc-400'
                  : 'border-zinc-200 bg-zinc-50 text-zinc-600'
              }`}
            >
              <th className="py-2.5 px-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={selectedIds.length === safeProducts.length && safeProducts.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-zinc-400 text-blue-600 focus:ring-blue-500/20 w-3.5 h-3.5 cursor-pointer"
                />
              </th>
              <th className="py-2.5 px-3">{isEn ? 'Product / Code' : 'สินค้า / รหัส'}</th>
              <th className="py-2.5 px-3">{isEn ? 'SKU & Barcode' : 'SKU & บาร์โค้ด'}</th>
              <th className="py-2.5 px-3">{isEn ? 'Category & Brand' : 'หมวดหมู่ & แบรนด์'}</th>
              <th className="py-2.5 px-3">{isEn ? 'Status' : 'สถานะ'}</th>
              <th className="py-2.5 px-3 text-right">{isEn ? 'Stock Balance' : 'สต็อกคงเหลือ'}</th>
              <th className="py-2.5 px-3 text-right">{isEn ? 'Price' : 'ราคาขาย'}</th>
              <th className="py-2.5 px-3 text-right pr-4">{isEn ? 'Actions' : 'จัดการ'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-zinc-400">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="font-semibold text-xs">{isEn ? 'No products match your criteria.' : 'ไม่พบรายการสินค้าที่ค้นหา'}</p>
                </td>
              </tr>
            ) : (
              filtered.map((prod) => {
                const isSelected = selectedIds.includes(prod.id);
                const stock = Number(prod.stockOnHand || 0);
                const rop = Number(prod.reorderLevel || 10);
                const priceNum = Number(prod.price || 0);
                const isInactive = prod.isActive === false;

                const categoryText = renderText(prod.category);
                const brandText = renderText(prod.brand);

                return (
                  <tr
                    key={prod.id}
                    onClick={() => {
                      if (externalOpenDrawer) externalOpenDrawer(prod);
                      else hook.openDrawerForProduct(prod);
                    }}
                    className={`group transition cursor-pointer ${
                      isSelected
                        ? isDark
                          ? 'bg-blue-950/30 hover:bg-blue-950/40'
                          : 'bg-blue-50/60 hover:bg-blue-50/80'
                        : isDark
                        ? 'hover:bg-zinc-800/40'
                        : 'hover:bg-zinc-50'
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center" onClick={(e) => toggleSelectOne(prod.id, e)}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded border-zinc-400 text-blue-600 focus:ring-blue-500/20 w-3.5 h-3.5 cursor-pointer"
                      />
                    </td>

                    {/* Product Name & Code */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-lg border flex items-center justify-center overflow-hidden shrink-0 ${
                            isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-100 border-zinc-200'
                          }`}
                        >
                          {prod.imageUrl ? (
                            <img
                              src={resolveImageUrl(prod.imageUrl)}
                              alt={prod.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <Package className="w-4 h-4 text-zinc-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p
                            className={`font-semibold truncate max-w-[200px] text-xs ${
                              isDark ? 'text-zinc-100 group-hover:text-blue-400' : 'text-zinc-900 group-hover:text-blue-600'
                            } transition-colors`}
                          >
                            {prod.name}
                          </p>
                          <p className="text-[11px] font-mono text-zinc-400 truncate max-w-[140px]">
                            {prod.code}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* SKU & Barcode */}
                    <td className="py-2.5 px-3">
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-xs text-zinc-700 dark:text-zinc-300">
                          {prod.sku}
                        </span>
                        <span className="font-mono text-[10px] text-zinc-400 truncate max-w-[120px]">
                          {prod.barcodeValue || '-'}
                        </span>
                      </div>
                    </td>

                    {/* Category & Brand */}
                    <td className="py-2.5 px-3">
                      <div className="flex flex-col">
                        <span className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                          {categoryText || '-'}
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          {brandText || '-'}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3">
                      {isInactive ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700">
                          {isEn ? 'Inactive' : 'ปิดใช้งาน'}
                        </span>
                      ) : stock === 0 ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40">
                          {isEn ? 'Out of Stock' : 'สินค้าหมด'}
                        </span>
                      ) : stock <= rop ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40">
                          {isEn ? 'Low Stock' : 'สต็อกต่ำ'}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40">
                          {isEn ? 'Active' : 'พร้อมจำหน่าย'}
                        </span>
                      )}
                    </td>

                    {/* Stock Balance */}
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex flex-col items-end">
                        <span
                          className={`font-mono font-bold text-xs tabular-nums ${
                            stock === 0
                              ? 'text-rose-500'
                              : stock <= rop
                              ? 'text-amber-500'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {stock.toLocaleString()}
                        </span>
                        <p className="text-[10px] font-mono tabular-nums text-zinc-400">
                          ROP: {rop}
                        </p>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-2.5 px-3 text-right">
                      <span className="font-mono font-semibold tabular-nums text-xs text-zinc-900 dark:text-zinc-100">
                        ${priceNum.toFixed(2)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td
                      className="py-2.5 px-3 text-right pr-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            if (externalOpenDrawer) externalOpenDrawer(prod);
                            else hook.openDrawerForProduct(prod);
                          }}
                          className="p-1 rounded text-zinc-400 hover:text-blue-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                          title={isEn ? 'View Product Details' : 'ดูรายละเอียดสินค้า'}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (externalSelectBarcode) externalSelectBarcode(prod);
                            else hook.setSelectedProductForBarcode(prod);
                          }}
                          className="p-1 rounded text-zinc-400 hover:text-blue-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                          title={isEn ? 'Preview & Print Barcode' : 'ดูและพิมพ์บาร์โค้ด'}
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (externalOpenDrawer) externalOpenDrawer(prod);
                            else hook.openDrawerForProduct(prod);
                          }}
                          className="p-1 rounded text-zinc-400 hover:text-blue-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                          title={isEn ? 'Edit Product' : 'แก้ไขสินค้า'}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (externalDeleteProduct) externalDeleteProduct(prod);
                            else hook.handleDeleteProduct(prod);
                          }}
                          className="p-1 rounded text-zinc-400 hover:text-rose-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                          title={isEn ? 'Delete Product' : 'ลบสินค้า'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Grid Footer Bar */}
      <div
        className={`px-4 py-2 border-t flex items-center justify-between text-[11px] ${
          isDark ? 'border-zinc-800 bg-zinc-900/60 text-zinc-400' : 'border-zinc-200 bg-zinc-50 text-zinc-500'
        }`}
      >
        <span>
          Showing <strong className="font-mono text-zinc-700 dark:text-zinc-300">{filtered.length}</strong> of{' '}
          <strong className="font-mono text-zinc-700 dark:text-zinc-300">{safeProducts.length}</strong> products
        </span>
        <span className="font-mono text-[10px] opacity-70">Press ⌘K or / to search catalog</span>
      </div>

      {/* Self-contained Product Drawer & Modals */}
      <ProductDrawer
        theme={theme}
        lang={lang}
        t={t}
        product={hook.drawerProduct}
        categoriesList={categoriesList}
        brandsList={brandsList}
        unitsList={unitsList}
        suppliersList={suppliersList}
        barcodeSymbologiesList={barcodeSymbologiesList}
        taxTypesList={taxTypesList}
        onClose={() => hook.setDrawerProduct(null)}
        onSave={hook.handleSaveEditProduct}
        onDelete={hook.handleDeleteProduct}
        isSaving={hook.isSaving}
        editName={hook.editName}
        setEditName={hook.setEditName}
        editCode={hook.editCode}
        setEditCode={hook.setEditCode}
        editSku={hook.editSku}
        setEditSku={hook.setEditSku}
        editBrand={hook.editBrand}
        setEditBrand={hook.setEditBrand}
        editBrandId={hook.editBrandId}
        setEditBrandId={hook.setEditBrandId}
        editCategoryId={hook.editCategoryId}
        setEditCategoryId={hook.setEditCategoryId}
        editUnitId={hook.editUnitId}
        setEditUnitId={hook.setEditUnitId}
        editSupplierId={hook.editSupplierId}
        setEditSupplierId={hook.setEditSupplierId}
        editBarcodeSymbologyId={hook.editBarcodeSymbologyId}
        setEditBarcodeSymbologyId={hook.setEditBarcodeSymbologyId}
        editTaxTypeId={hook.editTaxTypeId}
        setEditTaxTypeId={hook.setEditTaxTypeId}
        editBarcode={hook.editBarcode}
        setEditBarcode={hook.setEditBarcode}
        editPrice={hook.editPrice}
        setEditPrice={hook.setEditPrice}
        editCostPrice={hook.editCostPrice}
        setEditCostPrice={hook.setEditCostPrice}
        editWeightKg={hook.editWeightKg}
        setEditWeightKg={hook.setEditWeightKg}
        editWidthCm={hook.editWidthCm}
        setEditWidthCm={hook.setEditWidthCm}
        editLengthCm={hook.editLengthCm}
        setEditLengthCm={hook.setEditLengthCm}
        editHeightCm={hook.editHeightCm}
        setEditHeightCm={hook.setEditHeightCm}
        editReorderLevel={hook.editReorderLevel}
        setEditReorderLevel={hook.setEditReorderLevel}
        editMinReorderQty={hook.editMinReorderQty}
        setEditMinReorderQty={hook.setEditMinReorderQty}
        editIsLotControl={hook.editIsLotControl}
        setEditIsLotControl={hook.setEditIsLotControl}
        editIsReturnable={hook.editIsReturnable}
        setEditIsReturnable={hook.setEditIsReturnable}
        editIsActive={hook.editIsActive}
        setEditIsActive={hook.setEditIsActive}
        editWarrantyDays={hook.editWarrantyDays}
        setEditWarrantyDays={hook.setEditWarrantyDays}
        editDescription={hook.editDescription}
        setEditDescription={hook.setEditDescription}
      />

      <BarcodeModal
        theme={theme}
        lang={lang}
        product={hook.selectedProductForBarcode}
        onClose={() => hook.setSelectedProductForBarcode(null)}
      />

      <ConfirmDeleteModal
        theme={theme}
        lang={lang}
        isOpen={Boolean(hook.deleteConfirmData)}
        isDeleting={hook.isDeleting}
        data={hook.deleteConfirmData}
        onClose={() => hook.setDeleteConfirmData(null)}
      />
    </div>
  );
};
export default ProductCatalogTab;
