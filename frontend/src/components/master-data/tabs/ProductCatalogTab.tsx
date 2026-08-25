import React, { useState } from 'react';
import {
  Filter,
  QrCode,
  Edit2,
  Trash2,
  SlidersHorizontal,
  ChevronDown,
  ArrowUpDown,
  ExternalLink,
  Layers,
  Package,
} from 'lucide-react';
import { ThemeMode, ProductItem } from '../../../types';

interface ProductCatalogTabProps {
  theme: ThemeMode;
  t: any;
  products: ProductItem[];
  onOpenDrawer: (prod: ProductItem) => void;
  onSelectBarcode: (prod: ProductItem) => void;
  onDeleteProduct: (prod: ProductItem) => void;
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
  t,
  products = [],
  onOpenDrawer,
  onSelectBarcode,
  onDeleteProduct,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'LOW' | 'OUT'>('ALL');

  const isDark = theme === 'dark';
  const safeProducts = Array.isArray(products) ? products : [];

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
    const stock = Number(p.stockOnHand || 0);
    const rop = Number(p.reorderLevel || 10);
    if (statusFilter === 'OUT') return stock === 0;
    if (statusFilter === 'LOW') return stock > 0 && stock <= rop;
    if (statusFilter === 'ACTIVE') return stock > rop;
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
      {/* Precision Enterprise Toolbar */}
      <div
        className={`px-4 py-2.5 border-b flex flex-wrap items-center justify-between gap-3 ${
          isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-zinc-200/90 bg-zinc-50/50'
        }`}
      >
        {/* Status Segment Tabs */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer ${
              statusFilter === 'ALL'
                ? isDark
                  ? 'bg-zinc-800 text-white font-semibold shadow-xs'
                  : 'bg-white text-zinc-900 border border-zinc-300 shadow-xs font-semibold'
                : isDark
                ? 'text-zinc-400 hover:text-zinc-200'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            All Items ({safeProducts.length})
          </button>
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'ACTIVE'
                ? isDark
                  ? 'bg-zinc-800 text-emerald-400 font-semibold shadow-xs'
                  : 'bg-white text-emerald-700 border border-zinc-300 shadow-xs font-semibold'
                : isDark
                ? 'text-zinc-400 hover:text-emerald-400'
                : 'text-zinc-600 hover:text-emerald-600'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            In Stock
          </button>
          <button
            onClick={() => setStatusFilter('LOW')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'LOW'
                ? isDark
                  ? 'bg-zinc-800 text-amber-400 font-semibold shadow-xs'
                  : 'bg-white text-amber-700 border border-zinc-300 shadow-xs font-semibold'
                : isDark
                ? 'text-zinc-400 hover:text-amber-400'
                : 'text-zinc-600 hover:text-amber-600'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Low Stock
          </button>
          <button
            onClick={() => setStatusFilter('OUT')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'OUT'
                ? isDark
                  ? 'bg-zinc-800 text-rose-400 font-semibold shadow-xs'
                  : 'bg-white text-rose-700 border border-zinc-300 shadow-xs font-semibold'
                : isDark
                ? 'text-zinc-400 hover:text-rose-400'
                : 'text-zinc-600 hover:text-rose-600'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Out of Stock
          </button>
        </div>

        {/* View Controls & Selection Info */}
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
              {selectedIds.length} selected
            </span>
          )}

          <button
            className={`px-2.5 py-1 rounded text-xs font-medium border flex items-center gap-1.5 transition ${
              isDark
                ? 'border-zinc-700 text-zinc-300 bg-zinc-800/80 hover:bg-zinc-700'
                : 'border-zinc-300 text-zinc-700 bg-white hover:bg-zinc-50 shadow-xs'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-500" />
            <span>Customize Columns</span>
          </button>
        </div>
      </div>

      {/* High-Density Data Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr
              className={`text-[11px] font-semibold tracking-wider uppercase border-b select-none ${
                isDark
                  ? 'bg-zinc-900/90 text-zinc-400 border-zinc-800'
                  : 'bg-zinc-100/70 text-zinc-500 border-zinc-200'
              }`}
            >
              <th className="py-2.5 px-3 w-9 text-center">
                <input
                  type="checkbox"
                  checked={safeProducts.length > 0 && selectedIds.length === safeProducts.length}
                  onChange={toggleSelectAll}
                  className="rounded border-zinc-300 dark:border-zinc-700 text-blue-600 focus:ring-0 cursor-pointer"
                />
              </th>
              <th className="py-2.5 px-3 min-w-[280px]">Item / Description</th>
              <th className="py-2.5 px-3 min-w-[140px]">SKU & Barcode</th>
              <th className="py-2.5 px-3 min-w-[110px]">Brand</th>
              <th className="py-2.5 px-3 min-w-[130px] text-right">Physical Dim</th>
              <th className="py-2.5 px-3 min-w-[140px] text-right">Inventory / ROP</th>
              <th className="py-2.5 px-3 min-w-[110px] text-right">Unit Price</th>
              <th className="py-2.5 px-3 w-24 text-right pr-4">Actions</th>
            </tr>
          </thead>

          <tbody
            className={`divide-y text-xs ${
              isDark ? 'divide-zinc-800/80' : 'divide-zinc-200/80'
            }`}
          >
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-zinc-400">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="font-medium text-xs">No matching products found</p>
                </td>
              </tr>
            ) : (
              filtered.map((prod) => {
                const stock = Number(prod.stockOnHand || 0);
                const rop = Number(prod.reorderLevel || 10);
                const isSelected = selectedIds.includes(prod.id);
                const priceNum = Number(prod.price || 0);
                const weightNum = Number(prod.weightKg || 0);
                const prodName = renderText(prod.name);
                const prodCode = renderText(prod.code);
                const prodCategory = renderText(prod.category) || 'General';
                const prodSku = renderText(prod.sku) || prodCode || '-';
                const prodBarcode = renderText(prod.barcodeValue);
                const prodBrand = renderText(prod.brand) || 'General';
                const prodUom = renderText(prod.uom) || 'PCS';

                return (
                  <tr
                    key={prod.id}
                    onClick={() => onOpenDrawer(prod)}
                    className={`group transition-colors cursor-pointer ${
                      isSelected
                        ? isDark
                          ? 'bg-blue-950/30 hover:bg-blue-950/40'
                          : 'bg-blue-50/70 hover:bg-blue-50'
                        : isDark
                        ? 'hover:bg-zinc-800/50'
                        : 'hover:bg-zinc-50/80'
                    }`}
                  >
                    {/* Checkbox */}
                    <td
                      className="py-2.5 px-3 text-center"
                      onClick={(e) => toggleSelectOne(prod.id, e)}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded border-zinc-300 dark:border-zinc-700 text-blue-600 focus:ring-0 cursor-pointer"
                      />
                    </td>

                    {/* Item Name & Details */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={
                            prod.imageUrl ||
                            'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&auto=format&fit=crop&q=60'
                          }
                          alt=""
                          className={`w-8 h-8 rounded-md object-cover border shrink-0 ${
                            isDark ? 'border-zinc-700 bg-zinc-800' : 'border-zinc-200 bg-zinc-100'
                          }`}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`font-semibold text-xs truncate ${
                                isDark ? 'text-zinc-100' : 'text-zinc-900'
                              }`}
                            >
                              {prodName}
                            </span>
                            {prod.isLotControl && (
                              <span className="shrink-0 px-1 py-0.2 rounded text-[10px] font-mono font-medium bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                LOT
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-[11px] font-normal truncate mt-0.5 ${
                              isDark ? 'text-zinc-400' : 'text-zinc-500'
                            }`}
                          >
                            <span className="font-mono text-zinc-400">{prodCode}</span> •{' '}
                            {prodCategory}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* SKU & Barcode */}
                    <td className="py-2.5 px-3">
                      <div className="font-mono text-xs">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded font-medium border ${
                            isDark
                              ? 'bg-zinc-800 text-zinc-200 border-zinc-700'
                              : 'bg-zinc-100 text-zinc-800 border-zinc-200'
                          }`}
                        >
                          {prodSku}
                        </span>
                        {prodBarcode && (
                          <p
                            className={`text-[10px] font-normal mt-0.5 truncate ${
                              isDark ? 'text-zinc-500' : 'text-zinc-400'
                            }`}
                          >
                            {prodBarcode}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Brand */}
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-xs font-medium ${
                          isDark ? 'text-zinc-300' : 'text-zinc-700'
                        }`}
                      >
                        {prodBrand}
                      </span>
                    </td>

                    {/* Physical Dimension */}
                    <td className="py-2.5 px-3 text-right">
                      <div className="text-xs">
                        <span
                          className={`font-mono tabular-nums ${
                            isDark ? 'text-zinc-300' : 'text-zinc-700'
                          }`}
                        >
                          {weightNum > 0 ? `${weightNum.toFixed(2)} kg` : '-'}
                        </span>
                        {prod.widthCm && prod.lengthCm && prod.heightCm ? (
                          <p
                            className={`text-[10px] font-mono tabular-nums ${
                              isDark ? 'text-zinc-500' : 'text-zinc-400'
                            }`}
                          >
                            {prod.widthCm}×{prod.lengthCm}×{prod.heightCm} cm
                          </p>
                        ) : null}
                      </div>
                    </td>

                    {/* Inventory Status with Precision Dot */}
                    <td className="py-2.5 px-3 text-right">
                      <div className="inline-flex flex-col items-end">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              stock === 0
                                ? 'bg-rose-500'
                                : stock <= rop
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                          />
                          <span
                            className={`font-mono font-semibold tabular-nums ${
                              stock === 0
                                ? 'text-rose-600 dark:text-rose-400'
                                : stock <= rop
                                ? 'text-amber-600 dark:text-amber-400'
                                : isDark
                                ? 'text-zinc-100'
                                : 'text-zinc-900'
                            }`}
                          >
                            {stock} {prodUom}
                          </span>
                        </div>
                        <p
                          className={`text-[10px] font-mono tabular-nums mt-0.5 ${
                            isDark ? 'text-zinc-500' : 'text-zinc-400'
                          }`}
                        >
                          ROP: {rop} {stock <= rop && stock > 0 ? '⚠️ Reorder' : ''}
                        </p>
                      </div>
                    </td>

                    {/* Unit Price */}
                    <td className="py-2.5 px-3 text-right">
                      <span
                        className={`font-mono font-semibold tabular-nums text-xs ${
                          isDark ? 'text-zinc-100' : 'text-zinc-900'
                        }`}
                      >
                        ${priceNum.toFixed(2)}
                      </span>
                    </td>

                    {/* Actions Toolbar */}
                    <td
                      className="py-2.5 px-3 text-right pr-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onSelectBarcode(prod)}
                          className={`p-1 rounded transition cursor-pointer ${
                            isDark
                              ? 'text-zinc-400 hover:text-blue-400 hover:bg-zinc-800'
                              : 'text-zinc-500 hover:text-blue-600 hover:bg-zinc-200/60'
                          }`}
                          title="Preview & Print Barcode"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenDrawer(prod)}
                          className={`p-1 rounded transition cursor-pointer ${
                            isDark
                              ? 'text-zinc-400 hover:text-blue-400 hover:bg-zinc-800'
                              : 'text-zinc-500 hover:text-blue-600 hover:bg-zinc-200/60'
                          }`}
                          title="Quick Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteProduct(prod)}
                          className={`p-1 rounded transition cursor-pointer ${
                            isDark
                              ? 'text-zinc-400 hover:text-rose-400 hover:bg-zinc-800'
                              : 'text-zinc-500 hover:text-rose-600 hover:bg-zinc-200/60'
                          }`}
                          title="Delete"
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
          <strong className="font-mono text-zinc-700 dark:text-zinc-300">{products.length}</strong> products
        </span>
        <span className="font-mono text-[10px] opacity-70">Press ⌘K or / to search catalog</span>
      </div>
    </div>
  );
};
