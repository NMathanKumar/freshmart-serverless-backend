const createServiceApp = require('@freshmart/service-shared').createServiceApp;
const routes = require('./routes');
const categoryRoutes = require('./routes/category.routes');
const customerCategoryRoutes = require('./routes/customer-category.routes');
const reviewRoutes = require('./routes/review.routes');
const supplierRoutes = require('./routes/supplier.routes');
const purchaseOrderRoutes = require('./routes/purchase-order.routes');
const vendorInvoiceRoutes = require('./routes/vendor-invoice.routes');
const vendorReturnRoutes = require('./routes/vendor-return.routes');
const deliveryRoutes = require('./routes/delivery.routes');

module.exports = createServiceApp({
  mountRoutes(app) {
    app.use('/admin', routes);
    app.use('/v1/admin', routes);

    app.use('/admin/categories', categoryRoutes);
    app.use('/v1/admin/categories', categoryRoutes);
    app.use('/api/v1/categories', customerCategoryRoutes);
    app.use('/api/v1/customer/categories', customerCategoryRoutes);


    app.use('/admin/reviews', reviewRoutes);
    app.use('/v1/admin/reviews', reviewRoutes);

    app.use('/admin/suppliers', supplierRoutes);
    app.use('/v1/admin/suppliers', supplierRoutes);

    app.use('/admin/purchase-orders', purchaseOrderRoutes);
    app.use('/v1/admin/purchase-orders', purchaseOrderRoutes);

    app.use('/admin/deliveries', deliveryRoutes);
    app.use('/v1/admin/deliveries', deliveryRoutes);

    app.use('/admin/vendor-invoices', vendorInvoiceRoutes);
    app.use('/v1/admin/vendor-invoices', vendorInvoiceRoutes);

    app.use('/admin/vendor-returns', vendorReturnRoutes);
    app.use('/v1/admin/vendor-returns', vendorReturnRoutes);
  },
});
