const swaggerUi = require('swagger-ui-express');
const config = require('../core/config');

const successResponseExample = {
  success: true,
  message: 'Success',
  data: {},
  timestamp: new Date().toISOString(),
  requestId: 'REQ_12345678-1234-1234-1234-123456789abc',
};

const errorResponseExample = {
  success: false,
  message: 'Validation failed',
  errorCode: 'VALIDATION_ERROR',
  errors: [{ field: 'email', message: 'email is required' }],
  timestamp: new Date().toISOString(),
  requestId: 'REQ_12345678-1234-1234-1234-123456789abc',
};

const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Canteen Food Order System API',
    version: '1.0.0',
    description: 'Stabilized backend API documentation for current endpoints.',
  },
  servers: [{ url: `http://localhost:${config.app.port}${config.app.apiPrefix}` }],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      StandardSuccess: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Success' },
          data: { type: 'object', additionalProperties: true },
          timestamp: { type: 'string', format: 'date-time' },
          requestId: { type: 'string', example: 'REQ_xxx' },
        },
      },
      StandardError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Validation failed' },
          errorCode: { type: 'string', example: 'VALIDATION_ERROR' },
          errors: { type: 'array', items: { type: 'object', additionalProperties: true } },
          timestamp: { type: 'string', format: 'date-time' },
          requestId: { type: 'string', example: 'REQ_xxx' },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          password: { type: 'string', example: 'StrongPass#123' },
          phone: { type: 'string', example: '9999999999' },
          role: { type: 'string', example: 'CUSTOMER' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          password: { type: 'string', example: 'StrongPass#123' },
        },
      },
      RefreshRequest: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string', example: 'jwt_refresh_token' },
        },
      },
      CreateFoodRequest: {
        type: 'object',
        required: ['name', 'category', 'price'],
        properties: {
          name: { type: 'string', example: 'Masala Dosa' },
          description: { type: 'string', example: 'Crispy dosa with potato masala' },
          category: { type: 'string', example: 'Breakfast' },
          price: { type: 'number', example: 60 },
          imageUrl: { type: 'string', example: 'https://example.com/image.jpg' },
          available: { type: 'boolean', example: true },
          preparationTime: { type: 'integer', example: 10 },
        },
      },
      AddCartItemRequest: {
        type: 'object',
        required: ['foodId', 'quantity'],
        properties: {
          foodId: { type: 'string', example: 'FOOD_123' },
          quantity: { type: 'integer', example: 2 },
        },
      },
      UpdateCartQuantityRequest: {
        type: 'object',
        required: ['quantity'],
        properties: {
          quantity: { type: 'integer', example: 3 },
        },
      },
      PlaceOrderRequest: {
        type: 'object',
        properties: {
          pickupTime: { type: 'string', format: 'date-time', example: '2026-07-01T12:30:00Z' },
        },
      },
      UpdateOrderStatusRequest: {
        type: 'object',
        required: ['orderStatus'],
        properties: {
          orderStatus: {
            type: 'string',
            enum: ['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'],
          },
        },
      },
      CreatePaymentRequest: {
        type: 'object',
        required: ['orderId'],
        properties: {
          orderId: { type: 'string', example: 'ORDER_123' },
          paymentMethod: {
            type: 'string',
            enum: ['CARD', 'UPI', 'WALLET', 'CASH', 'DUMMY'],
            example: 'UPI',
          },
        },
      },
      ConfirmPaymentRequest: {
        type: 'object',
        properties: {
          transactionId: { type: 'string', example: 'TXN_123' },
        },
      },
      OptionalReasonRequest: {
        type: 'object',
        properties: {
          reason: { type: 'string', example: 'Customer request' },
        },
      },

      CreateInventoryRequest: {
        type: 'object',
        required: ['foodId', 'currentStock', 'minimumStock', 'unit'],
        properties: {
          foodId: { type: 'string', example: 'FOOD_123' },
          currentStock: { type: 'integer', example: 10 },
          minimumStock: { type: 'integer', example: 3 },
          unit: { type: 'string', example: 'PCS' },
        },
      },

      UpdateInventoryRequest: {
        type: 'object',
        required: ['currentStock', 'minimumStock', 'unit'],
        properties: {
          currentStock: { type: 'integer', example: 8 },
          minimumStock: { type: 'integer', example: 3 },
          unit: { type: 'string', example: 'PCS' },
        },
      },

      IncreaseStockRequest: {
        type: 'object',
        required: ['amount'],
        properties: {
          amount: { type: 'integer', example: 5 },
          unit: { type: 'string', example: 'PCS' },
        },
      },

      DecreaseStockRequest: {
        type: 'object',
        required: ['amount'],
        properties: {
          amount: { type: 'integer', example: 2 },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Health check',
        responses: {
          200: {
            description: 'Service healthy',
            content: { 'application/json': { example: successResponseExample } },
          },
        },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register customer account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Account created',
            content: { 'application/json': { example: successResponseExample } },
          },
          422: {
            description: 'Validation failed',
            content: { 'application/json': { example: errorResponseExample } },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Login success',
            content: { 'application/json': { example: successResponseExample } },
          },
        },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh access token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RefreshRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Token refreshed',
            content: { 'application/json': { example: successResponseExample } },
          },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current profile',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Profile data',
            content: { 'application/json': { example: successResponseExample } },
          },
          401: {
            description: 'Unauthorized',
            content: { 'application/json': { example: errorResponseExample } },
          },
        },
      },
    },
    '/food': {
      get: {
        tags: ['Menu'],
        summary: 'List food items',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100 } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Food list', content: { 'application/json': { example: successResponseExample } } },
        },
      },
      post: {
        tags: ['Menu'],
        summary: 'Create food item',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateFoodRequest' } } },
        },
        responses: {
          201: { description: 'Created', content: { 'application/json': { example: successResponseExample } } },
        },
      },
    },
    '/food/search': {
      get: {
        tags: ['Menu'],
        summary: 'Search food items',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'q', in: 'query', required: true, schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100 } },
        ],
        responses: {
          200: { description: 'Search results', content: { 'application/json': { example: successResponseExample } } },
        },
      },
    },
    '/food/{id}': {
      get: {
        tags: ['Menu'],
        summary: 'Get food item by id',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Food item', content: { 'application/json': { example: successResponseExample } } },
        },
      },
      put: {
        tags: ['Menu'],
        summary: 'Update food item',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateFoodRequest' } } },
        },
        responses: {
          200: { description: 'Updated', content: { 'application/json': { example: successResponseExample } } },
        },
      },
      delete: {
        tags: ['Menu'],
        summary: 'Delete food item',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Deleted', content: { 'application/json': { example: successResponseExample } } },
        },
      },
    },
    '/food/{id}/availability': {
      patch: {
        tags: ['Menu'],
        summary: 'Set food availability',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['available'],
                properties: { available: { type: 'boolean' } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Availability updated', content: { 'application/json': { example: successResponseExample } } },
        },
      },
    },
    '/cart': {
      get: {
        tags: ['Cart'],
        summary: 'Get my cart',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Cart data', content: { 'application/json': { example: successResponseExample } } },
        },
      },
      delete: {
        tags: ['Cart'],
        summary: 'Clear my cart',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Cart cleared', content: { 'application/json': { example: successResponseExample } } },
        },
      },
    },
    '/cart/items': {
      post: {
        tags: ['Cart'],
        summary: 'Add item to cart',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/AddCartItemRequest' } } },
        },
        responses: {
          201: { description: 'Item added', content: { 'application/json': { example: successResponseExample } } },
        },
      },
    },
    '/cart/items/{foodId}': {
      put: {
        tags: ['Cart'],
        summary: 'Update cart item quantity',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'foodId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateCartQuantityRequest' },
            },
          },
        },
        responses: {
          200: { description: 'Quantity updated', content: { 'application/json': { example: successResponseExample } } },
        },
      },
      delete: {
        tags: ['Cart'],
        summary: 'Remove item from cart',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'foodId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Item removed', content: { 'application/json': { example: successResponseExample } } },
        },
      },
    },
    '/orders': {
      post: {
        tags: ['Orders'],
        summary: 'Place order from current cart',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PlaceOrderRequest' },
            },
          },
        },
        responses: {
          201: { description: 'Order created', content: { 'application/json': { example: successResponseExample } } },
        },
      },
      get: {
        tags: ['Orders'],
        summary: 'Get my orders',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100 } },
          {
            name: 'orderStatus',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'],
            },
          },
        ],
        responses: {
          200: { description: 'Orders fetched', content: { 'application/json': { example: successResponseExample } } },
        },
      },
    },
    '/orders/admin/all': {
      get: {
        tags: ['Orders'],
        summary: 'Admin/staff: list all orders',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100 } },
          {
            name: 'orderStatus',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'],
            },
          },
        ],
        responses: {
          200: { description: 'All orders fetched', content: { 'application/json': { example: successResponseExample } } },
        },
      },
    },
    '/orders/{id}': {
      get: {
        tags: ['Orders'],
        summary: 'Get order by id',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Order fetched', content: { 'application/json': { example: successResponseExample } } },
        },
      },
    },
    '/orders/{id}/track': {
      get: {
        tags: ['Orders'],
        summary: 'Track order status',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Order tracking data', content: { 'application/json': { example: successResponseExample } } },
        },
      },
    },
    '/orders/{id}/status': {
      patch: {
        tags: ['Orders'],
        summary: 'Admin/staff: update order status',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateOrderStatusRequest' },
            },
          },
        },
        responses: {
          200: { description: 'Order status updated', content: { 'application/json': { example: successResponseExample } } },
        },
      },
    },
    '/orders/{id}/cancel': {
      post: {
        tags: ['Orders'],
        summary: 'Cancel an order',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Order cancelled', content: { 'application/json': { example: successResponseExample } } },
        },
      },
    },
    '/payments': {
      post: {
        tags: ['Payments'],
        summary: 'Create payment request',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreatePaymentRequest' },
            },
          },
        },
        responses: {
          201: { description: 'Payment request created', content: { 'application/json': { example: successResponseExample } } },
        },
      },
    },
    '/payments/{id}/confirm': {
      patch: {
        tags: ['Payments'],
        summary: 'Confirm payment',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ConfirmPaymentRequest' },
            },
          },
        },
        responses: {
          200: { description: 'Payment confirmed', content: { 'application/json': { example: successResponseExample } } },
        },
      },
    },
    '/payments/{id}/fail': {
      patch: {
        tags: ['Payments'],
        summary: 'Mark payment as failed',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/OptionalReasonRequest' },
            },
          },
        },
        responses: {
          200: { description: 'Payment failed', content: { 'application/json': { example: successResponseExample } } },
        },
      },
    },
    '/payments/{id}/refund': {
      patch: {
        tags: ['Payments'],
        summary: 'Refund payment',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/OptionalReasonRequest' },
            },
          },
        },
        responses: {
          200: { description: 'Payment refunded', content: { 'application/json': { example: successResponseExample } } },
        },
      },
    },
    '/payments/order/{orderId}': {
      get: {
        tags: ['Payments'],
        summary: 'Get latest payment by order id',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'orderId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Payment status fetched', content: { 'application/json': { example: successResponseExample } } },
        },
      },
    },

    '/inventory': {
      get: {
        tags: ['Inventory'],
        summary: 'Admin/staff: list inventory',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100 } },
        ],
        responses: {
          200: { description: 'Inventory list fetched', content: { 'application/json': { example: successResponseExample } } },
        },
      },
      post: {
        tags: ['Inventory'],
        summary: 'Admin/staff: create inventory for a food item',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateInventoryRequest' },
            },
          },
        },
        responses: {
          201: { description: 'Inventory created', content: { 'application/json': { example: successResponseExample } } },
        },
      },
    },

    '/inventory/{foodId}': {
      get: {
        tags: ['Inventory'],
        summary: 'Admin/staff: get inventory by foodId',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'foodId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Inventory fetched', content: { 'application/json': { example: successResponseExample } } },
        },
      },
      put: {
        tags: ['Inventory'],
        summary: 'Admin/staff: update inventory for a food item',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'foodId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateInventoryRequest' },
            },
          },
        },
        responses: {
          200: { description: 'Inventory updated', content: { 'application/json': { example: successResponseExample } } },
        },
      },
    },

    '/inventory/{foodId}/increase': {
      patch: {
        tags: ['Inventory'],
        summary: 'Admin/staff: increase stock for a food item',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'foodId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/IncreaseStockRequest' },
            },
          },
        },
        responses: {
          200: { description: 'Stock increased', content: { 'application/json': { example: successResponseExample } } },
        },
      },
    },

    '/inventory/{foodId}/decrease': {
      patch: {
        tags: ['Inventory'],
        summary: 'Admin/staff: decrease stock for a food item',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'foodId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/DecreaseStockRequest' },
            },
          },
        },
        responses: {
          200: { description: 'Stock decreased', content: { 'application/json': { example: successResponseExample } } },
        },
      },
    },

    '/inventory/alerts/low-stock': {
      get: {
        tags: ['Inventory'],
        summary: 'Admin/staff: get low-stock alerts',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Low stock alerts fetched', content: { 'application/json': { example: successResponseExample } } },
        },
      },
    },
  },
};

module.exports = { swaggerUi, swaggerSpec };
