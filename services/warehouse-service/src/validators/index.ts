import { z } from 'zod';

export const warehouseStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'CLOSED']),
});

export const warehouseSchema = z.object({
  warehouseCode: z.string().min(3).max(50),
  warehouseName: z.string().min(3).max(100),
  address: z.object({
    line1: z.string().optional(),
    line2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
  }).optional(),
  contactPerson: z.string().optional(),
  contactNumber: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  operatingHours: z.string().optional(),
  capacity: z.object({
    maxStorageCapacity: z.number().min(0).default(0),
    currentUtilization: z.number().min(0).default(0),
    storageUnit: z.string().default('units'),
  }).optional(),
  zones: z.array(z.object({
    zoneId: z.string(),
    zoneName: z.string(),
    type: z.string().optional(),
  })).optional(),
  defaultReceivingZone: z.string().optional(),
  defaultDispatchZone: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'CLOSED']).default('ACTIVE'),
  integrationHooks: z.object({
    supportedOrderTypes: z.array(z.string()).optional(),
    pickupEnabled: z.boolean().optional(),
    deliveryEnabled: z.boolean().optional(),
    refrigerationAvailable: z.boolean().optional(),
    priority: z.number().optional(),
  }).optional(),
});

export const poReceiveSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1)
  })).min(1),
  notes: z.string().optional()
});
