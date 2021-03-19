export default {
  orders: {
    permission: 'icommerce.orders.manage',
    activated: true,
    path: '/store/orders',
    name: 'qcommerce.panel.shipping.orders.index',
    crud: import('@imagina/qcommerce/_crud/orders'),
    page: () => import('@imagina/qcrud/_pages/admin/crudPage'),
    layout: () => import('@imagina/qsite/_layouts/master'),
    title: 'qcommerce.sidebar.panelOrders',
    icon: 'fas fa-shopping-bag',
    authenticated: true,
    subHeader: {
      refresh: true,
    }
  },
  order: {
    permission: 'icommerce.orders.index',
    activated: true,
    path: '/store/orders/:id',
    name: 'qcommerce.shipping.orders.show',
    page: () => import('@imagina/qcommerce/_pages/admin/order/show'),
    layout: () => import('@imagina/qsite/_layouts/master'),
    title: 'qcommerce.sidebar.orderIndex',
    icon: 'fas fa-box-open',
    authenticated: true,
    subHeader: {
      refresh: true,
      breadcrumb: ['qcommerce.orders']
    }
  },
}
