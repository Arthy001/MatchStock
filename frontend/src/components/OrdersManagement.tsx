import React, { useState } from 'react';
import { Language, ThemeMode, Order, OrderType } from '../types';
import { getTranslation } from '../i18n';

// Modular Hooks, Tabs & Modals
import { useOrdersManagement } from './orders/hooks/useOrdersManagement';
import { OrderMetricsCards } from './orders/tabs/OrderMetricsCards';
import { OrdersTable } from './orders/tabs/OrdersTable';
import { OrderDetailDrawer } from './orders/modals/OrderDetailDrawer';
import { CreateOrderModal } from './orders/modals/CreateOrderModal';
import { OutboundFulfillmentModal } from './stock-transactions/modals/OutboundFulfillmentModal';

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

  const [isFulfillmentModalOpen, setIsFulfillmentModalOpen] = useState(false);
  const [fulfillmentOrder, setFulfillmentOrder] = useState<Order | null>(null);

  const handleOpenFulfillment = (order: Order) => {
    setFulfillmentOrder(order);
    setIsFulfillmentModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & KPI Summary Cards */}
      <OrderMetricsCards
        theme={theme}
        lang={lang}
        t={t}
        type={type}
        isSales={isSales}
        metrics={metrics}
        onOpenCreateModal={handleOpenCreateModal}
      />

      {/* Orders Data Table & Status Filters */}
      <OrdersTable
        theme={theme}
        lang={lang}
        t={t}
        isSales={isSales}
        filteredOrders={filteredOrders}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onOpenDetail={handleOpenDetail}
        onOpenFulfillment={handleOpenFulfillment}
      />

      {/* 480px Slide-Over Detail Drawer */}
      <OrderDetailDrawer
        theme={theme}
        lang={lang}
        t={t}
        isSales={isSales}
        isOpen={isDrawerOpen}
        order={selectedOrder}
        onClose={() => setIsDrawerOpen(false)}
        onUpdateStatus={handleUpdateOrderStatus}
        onNavigateToStockAction={onNavigateToStockAction}
        onOpenFulfillment={handleOpenFulfillment}
      />

      {/* Create Order Modal */}
      <CreateOrderModal
        theme={theme}
        lang={lang}
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
        onAddItem={(prodId) => {
          if (prodId) {
            handleAddItem(prodId);
          } else if (products.length > 0) {
            handleAddItem(products[0].id);
          }
        }}
        onUpdateItemQty={handleUpdateItemQty}
        onUpdateItemPrice={handleUpdateItemPrice}
        onRemoveItem={handleRemoveItem}
      />

      {/* Outbound Multi-Step Fulfillment Modal (Priority 1) */}
      <OutboundFulfillmentModal
        theme={theme}
        lang={lang}
        isOpen={isFulfillmentModalOpen}
        order={fulfillmentOrder}
        onClose={() => {
          setIsFulfillmentModalOpen(false);
          setFulfillmentOrder(null);
        }}
        onComplete={() => {
          if (fulfillmentOrder) {
            handleUpdateOrderStatus(fulfillmentOrder.id, 'COMPLETED');
          }
        }}
      />
    </div>
  );
};
export default OrdersManagement;
