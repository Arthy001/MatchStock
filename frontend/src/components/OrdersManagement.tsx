import React from 'react';
import { Language, ThemeMode, Order, OrderType } from '../types';
import { getTranslation } from '../i18n';

// Modular Hooks, Tabs & Modals
import { useOrdersManagement } from './orders/hooks/useOrdersManagement';
import { OrderMetricsCards } from './orders/tabs/OrderMetricsCards';
import { OrdersTable } from './orders/tabs/OrdersTable';
import { OrderDetailDrawer } from './orders/modals/OrderDetailDrawer';
import { CreateOrderModal } from './orders/modals/CreateOrderModal';

interface OrdersManagementProps {
  type: OrderType;
  lang: Language;
  theme: ThemeMode;
  searchQuery?: string;
  onNavigateToStockAction?: (actionType: 'RECEIVE' | 'ISSUE', order: Order) => void;
}

export const OrdersManagement: React.FC<OrdersManagementProps> = ({
  type,
  lang,
  theme,
  searchQuery = '',
  onNavigateToStockAction,
}) => {
  const t = getTranslation(lang);

  const {
    isSales,
    selectedOrder,
    statusFilter,
    setStatusFilter,
    isDrawerOpen,
    setIsDrawerOpen,
    isCreateModalOpen,
    setIsCreateModalOpen,
    products,
    warehouses,
    formPartyName,
    setFormPartyName,
    formContactPerson,
    setFormContactPerson,
    formOrderDate,
    setFormOrderDate,
    formExpectedDate,
    setFormExpectedDate,
    formWarehouseId,
    setFormWarehouseId,
    formItems,
    calculatedTotal,
    filteredOrders,
    metrics,
    handleAddItem,
    handleUpdateItemQty,
    handleUpdateItemPrice,
    handleRemoveItem,
    handleOpenCreateModal,
    handleSaveOrder,
    handleOpenDetail,
    handleUpdateOrderStatus,
  } = useOrdersManagement(type, searchQuery);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & KPI Summary Cards */}
      <OrderMetricsCards
        theme={theme}
        t={t}
        type={type}
        isSales={isSales}
        metrics={metrics}
        onOpenCreateModal={handleOpenCreateModal}
      />

      {/* Orders Data Table & Status Filters */}
      <OrdersTable
        theme={theme}
        t={t}
        isSales={isSales}
        filteredOrders={filteredOrders}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onOpenDetail={handleOpenDetail}
      />

      {/* 480px Slide-Over Detail Drawer */}
      <OrderDetailDrawer
        theme={theme}
        t={t}
        isSales={isSales}
        isOpen={isDrawerOpen}
        order={selectedOrder}
        onClose={() => setIsDrawerOpen(false)}
        onUpdateStatus={handleUpdateOrderStatus}
        onNavigateToStockAction={onNavigateToStockAction}
      />

      {/* Create Order Modal */}
      <CreateOrderModal
        theme={theme}
        t={t}
        isSales={isSales}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleSaveOrder}
        formPartyName={formPartyName}
        setFormPartyName={setFormPartyName}
        formContactPerson={formContactPerson}
        setFormContactPerson={setFormContactPerson}
        formOrderDate={formOrderDate}
        setFormOrderDate={setFormOrderDate}
        formExpectedDate={formExpectedDate}
        setFormExpectedDate={setFormExpectedDate}
        formWarehouseId={formWarehouseId}
        setFormWarehouseId={setFormWarehouseId}
        formItems={formItems}
        products={products}
        warehouses={warehouses}
        calculatedTotal={calculatedTotal}
        onAddItem={() => {
          if (products.length > 0) handleAddItem(products[0].id);
        }}
        onUpdateItemQty={handleUpdateItemQty}
        onUpdateItemPrice={handleUpdateItemPrice}
        onRemoveItem={handleRemoveItem}
      />
    </div>
  );
};
export default OrdersManagement;
