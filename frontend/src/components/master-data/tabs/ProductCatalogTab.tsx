import React from 'react';
import {
  Filter,
  QrCode,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
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

export const ProductCatalogTab: React.FC<ProductCatalogTabProps> = ({
  theme,
  t,
  products,
  onOpenDrawer,
  onSelectBarcode,
  onDeleteProduct,
}) => {
  return (
    <div
      className={`rounded-2xl border shadow-sm transition-colors overflow-hidden ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      {/* Table Control Bar */}
      <div
        className={`p-3.5 border-b flex items-center justify-between ${
          theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
        }`}
      >
        <div className="flex items-center gap-2">
          <h3 className={`font-semibold text-sm ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
            Active Items Catalog
          </h3>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
              theme === 'dark'
                ? 'bg-slate-800 text-slate-300 border-slate-700'
                : 'bg-slate-100 text-slate-600 border-slate-300'
            }`}
          >
            {products.length} items
          </span>
        </div>

        <button
          className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 ${
            theme === 'dark'
              ? 'border-slate-700 text-slate-300 bg-slate-800'
              : 'border-slate-300 text-slate-700 bg-slate-50 hover:bg-slate-100'
          }`}
        >
          <Filter className="w-3.5 h-3.5 text-blue-600" />
          <span>Filter</span>
        </button>
      </div>

      {/* Unified Harmonious Table Typography */}
      <div className="overflow-x-auto max-h-[650px]">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10">
            <tr
              className={`text-xs font-semibold uppercase tracking-wider border-b ${
                theme === 'dark'
                  ? 'bg-slate-800 text-slate-300 border-slate-700'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              <th className="p-3.5 w-10">
                <input type="checkbox" className="rounded text-blue-600" />
              </th>
              <th className="p-3.5">{t.productName}</th>
              <th className="p-3.5">{t.sku}</th>
              <th className="p-3.5">{t.brand}</th>
              <th className="p-3.5">{t.stockOnHand}</th>
              <th className="p-3.5">{t.reorderLevel}</th>
              <th className="p-3.5">{t.price}</th>
              <th className="p-3.5 text-right">{t.actions}</th>
            </tr>
          </thead>

          <tbody
            className={`divide-y text-xs ${
              theme === 'dark' ? 'divide-slate-800' : 'divide-slate-200'
            }`}
          >
            {products.map((prod) => (
              <tr
                key={prod.id}
                className={`transition cursor-pointer ${
                  theme === 'dark' ? 'hover:bg-slate-800/60' : 'hover:bg-blue-50/40'
                }`}
                onClick={() => onOpenDrawer(prod)}
              >
                <td className="p-3.5" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" className="rounded text-blue-600" />
                </td>

                {/* Product Name */}
                <td className="p-3.5">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        prod.imageUrl ||
                        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&auto=format&fit=crop&q=60'
                      }
                      alt={prod.name}
                      className={`w-9 h-9 rounded-xl object-cover border shrink-0 ${
                        theme === 'dark' ? 'border-slate-700' : 'border-slate-200'
                      }`}
                    />
                    <div>
                      <p
                        className={`font-semibold text-sm ${
                          theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
                        }`}
                      >
                        {prod.name}
                      </p>
                      <p
                        className={`text-xs font-normal mt-0.5 ${
                          theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        Code: {prod.code} • {prod.category || 'General'}
                      </p>
                    </div>
                  </div>
                </td>

                {/* SKU Badge */}
                <td className="p-3.5">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-mono font-medium border ${
                      theme === 'dark'
                        ? 'bg-slate-800 text-slate-300 border-slate-700'
                        : 'bg-slate-100 text-slate-600 border-slate-300'
                    }`}
                  >
                    {prod.sku || prod.code || '-'}
                  </span>
                </td>

                {/* Brand Column */}
                <td
                  className={`p-3.5 font-medium ${
                    theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                  }`}
                >
                  {prod.brand || 'General'}
                </td>

                {/* Status Badge */}
                <td className="p-3.5">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                      (prod.stockOnHand || 0) === 0
                        ? theme === 'dark'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                        : (prod.stockOnHand || 0) <= (prod.reorderLevel || 10)
                        ? theme === 'dark'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                        : theme === 'dark'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}
                  >
                    {(prod.stockOnHand || 0) === 0 ? (
                      <XCircle className="w-3.5 h-3.5" />
                    ) : (prod.stockOnHand || 0) <= (prod.reorderLevel || 10) ? (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {prod.stockOnHand || 0} {prod.uom || 'PCS'}
                    </span>
                  </span>
                </td>

                {/* Reorder Level Gauge */}
                <td className="p-3.5">
                  <div
                    className={`flex items-center gap-1.5 text-xs font-medium ${
                      theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                    }`}
                  >
                    <span>
                      {prod.stockOnHand || 0}/{prod.reorderLevel || 10}
                    </span>
                    <div
                      className={`w-12 h-1.5 rounded-full overflow-hidden ${
                        theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'
                      }`}
                    >
                      <div
                        className={`h-full rounded-full ${
                          (prod.stockOnHand || 0) <= (prod.reorderLevel || 10)
                            ? 'bg-amber-500'
                            : 'bg-blue-600'
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            ((prod.stockOnHand || 0) / ((prod.reorderLevel || 10) * 3)) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </td>

                {/* Price Column */}
                <td
                  className={`p-3.5 font-semibold text-sm ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-700'
                  }`}
                >
                  ${Number(prod.price || 0).toFixed(2)}
                </td>

                {/* Action Icons */}
                <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onSelectBarcode(prod)}
                      className={`p-1.5 rounded-lg transition cursor-pointer ${
                        theme === 'dark'
                          ? 'text-slate-400 hover:text-blue-400 hover:bg-slate-800'
                          : 'text-slate-500 hover:text-blue-600 hover:bg-slate-100'
                      }`}
                      title={t.previewBarcode}
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onOpenDrawer(prod)}
                      className={`p-1.5 rounded-lg transition cursor-pointer ${
                        theme === 'dark'
                          ? 'text-slate-400 hover:text-blue-400 hover:bg-slate-800'
                          : 'text-slate-500 hover:text-blue-600 hover:bg-slate-100'
                      }`}
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteProduct(prod)}
                      className={`p-1.5 rounded-lg transition cursor-pointer ${
                        theme === 'dark'
                          ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
                          : 'text-slate-500 hover:text-rose-600 hover:bg-slate-100'
                      }`}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
