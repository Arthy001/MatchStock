import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { Language, ThemeMode } from '../types';
import { getTranslation } from '../i18n';

// Modular Hooks, Tabs & Modals
import { useStockTransactions } from './stock-transactions/hooks/useStockTransactions';
import { TransactionMetricsCards } from './stock-transactions/tabs/TransactionMetricsCards';
import { TransactionHistoryTable } from './stock-transactions/tabs/TransactionHistoryTable';
import { TransactionDetailDrawer } from './stock-transactions/modals/TransactionDetailDrawer';
import { CreateTransactionModal } from './stock-transactions/modals/CreateTransactionModal';
import { CreateGoodsReceiptModal } from './stock-transactions/modals/CreateGoodsReceiptModal';
import { ReceiveHowToModal } from './stock-transactions/modals/ReceiveHowToModal';

interface StockTransactionsProps {
  lang: Language;
  theme: ThemeMode;
  searchQuery?: string;
  activeSubTab?: 'all' | 'receive' | 'issue' | 'transfer' | 'adjustment';
  onSubTabChange?: (subTab: 'all' | 'receive' | 'issue' | 'transfer' | 'adjustment') => void;
}

export const StockTransactions: React.FC<StockTransactionsProps> = ({
  lang,
  theme,
  searchQuery = '',
  activeSubTab = 'all',
  onSubTabChange,
}) => {
  const t = getTranslation(lang);

  const {
    productsList,
    warehousesList,
    suppliersList,
    isSubmitting,
    feedback,
    setFeedback,
    localSearch,
    setLocalSearch,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    selectedTransaction,
    isDrawerOpen,
    setIsDrawerOpen,
    isModalOpen,
    setIsModalOpen,
    formType,
    setFormType,
    formReferenceNo,
    setFormReferenceNo,
    formSupplierId,
    setFormSupplierId,
    formRecipient,
    setFormRecipient,
    formIssueReason,
    setFormIssueReason,
    formTransferType,
    setFormTransferType,
    formAdjReason,
    setFormAdjReason,
    formAdjDirection,
    setFormAdjDirection,
    formNotes,
    setFormNotes,
    selectedProductId,
    setSelectedProductId,
    formQty,
    setFormQty,
    formLotNumber,
    setFormLotNumber,
    formMfgDate,
    setFormMfgDate,
    formExpDate,
    setFormExpDate,
    fromBinId,
    setFromBinId,
    toBinId,
    setToBinId,
    totalReceives,
    totalIssues,
    activeTransfers,
    totalAdjustments,
    receiveDocCount,
    receiveCompletedCount,
    receiveTotalValue,
    issueDocCount,
    issueCompletedCount,
    issueTotalValue,
    transferWarehouseCount,
    transferBinCount,
    transferCompletedCount,
    adjIncreaseCount,
    adjDecreaseCount,
    filteredTransactions,
    handleOpenDetail,
    handleOpenCreateModal,
    handleCreateTransaction,
    loadLiveData,
  } = useStockTransactions(searchQuery, activeSubTab);

  const [isGrModalOpen, setIsGrModalOpen] = useState<boolean>(false);
  const [isHowToModalOpen, setIsHowToModalOpen] = useState<boolean>(false);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Feedback Alert Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold animate-in fade-in slide-in-from-top duration-200 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="p-1 hover:opacity-75 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header & Dynamic Context-Aware KPI Summary Cards */}
      <TransactionMetricsCards
        theme={theme}
        t={t}
        activeSubTab={activeSubTab}
        totalReceives={totalReceives}
        totalIssues={totalIssues}
        activeTransfers={activeTransfers}
        totalAdjustments={totalAdjustments}
        receiveDocCount={receiveDocCount}
        receiveCompletedCount={receiveCompletedCount}
        receiveTotalValue={receiveTotalValue}
        issueDocCount={issueDocCount}
        issueCompletedCount={issueCompletedCount}
        issueTotalValue={issueTotalValue}
        transferWarehouseCount={transferWarehouseCount}
        transferBinCount={transferBinCount}
        transferCompletedCount={transferCompletedCount}
        adjIncreaseCount={adjIncreaseCount}
        adjDecreaseCount={adjDecreaseCount}
        onOpenCreateModal={() => {
          if (activeSubTab === 'receive') {
            setIsGrModalOpen(true);
          } else {
            handleOpenCreateModal();
          }
        }}
        onOpenHowToModal={() => setIsHowToModalOpen(true)}
      />

      {/* Transactions Data Table & Filters */}
      <TransactionHistoryTable
        theme={theme}
        t={t}
        activeSubTab={activeSubTab}
        localSearch={localSearch}
        setLocalSearch={setLocalSearch}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        filteredTransactions={filteredTransactions}
        onOpenDetail={handleOpenDetail}
      />

      {/* Interactive Step-by-Step How-To Guide Popup Modal */}
      <ReceiveHowToModal
        theme={theme}
        lang={lang}
        isOpen={isHowToModalOpen}
        onClose={() => setIsHowToModalOpen(false)}
        onOpenCreateGRModal={() => {
          setIsHowToModalOpen(false);
          setIsGrModalOpen(true);
        }}
      />

      {/* Slide-Over Drawer for Transaction Details */}
      <TransactionDetailDrawer
        theme={theme}
        t={t}
        isOpen={isDrawerOpen}
        transaction={selectedTransaction}
        onClose={() => setIsDrawerOpen(false)}
      />

      {/* Phase 5 Multi-line Goods Receipt Modal */}
      <CreateGoodsReceiptModal
        theme={theme}
        lang={lang}
        t={t}
        isOpen={isGrModalOpen}
        onClose={() => setIsGrModalOpen(false)}
        onSuccess={(receipt) => {
          setFeedback({
            type: 'success',
            message: lang === 'th' ? `สร้างใบรับสินค้า ${receipt?.receiptNumber || ''} เรียบร้อยแล้ว` : 'Goods Receipt created successfully',
          });
          loadLiveData();
        }}
        productsList={productsList}
        warehousesList={warehousesList}
        suppliersList={suppliersList}
      />

      {/* Creation Modal for Other Stock Transactions (GI, TR, ADJ) */}
      <CreateTransactionModal
        theme={theme}
        lang={lang}
        t={t}
        isOpen={isModalOpen}
        activeSubTab={activeSubTab}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTransaction}
        isSubmitting={isSubmitting}
        formType={formType}
        setFormType={setFormType}
        formReferenceNo={formReferenceNo}
        setFormReferenceNo={setFormReferenceNo}
        formSupplierId={formSupplierId}
        setFormSupplierId={setFormSupplierId}
        formRecipient={formRecipient}
        setFormRecipient={setFormRecipient}
        formIssueReason={formIssueReason}
        setFormIssueReason={setFormIssueReason}
        formTransferType={formTransferType}
        setFormTransferType={setFormTransferType}
        formAdjReason={formAdjReason}
        setFormAdjReason={setFormAdjReason}
        formAdjDirection={formAdjDirection}
        setFormAdjDirection={setFormAdjDirection}
        formNotes={formNotes}
        setFormNotes={setFormNotes}
        selectedProductId={selectedProductId}
        setSelectedProductId={setSelectedProductId}
        formQty={formQty}
        setFormQty={setFormQty}
        formLotNumber={formLotNumber}
        setFormLotNumber={setFormLotNumber}
        formMfgDate={formMfgDate}
        setFormMfgDate={setFormMfgDate}
        formExpDate={formExpDate}
        setFormExpDate={setFormExpDate}
        fromBinId={fromBinId}
        setFromBinId={setFromBinId}
        toBinId={toBinId}
        setToBinId={setToBinId}
        productsList={productsList}
        warehousesList={warehousesList}
        suppliersList={suppliersList}
      />
    </div>
  );
};
export default StockTransactions;
